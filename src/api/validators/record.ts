import { Page, TestInfo } from "@playwright/test"
import { RestHandler } from "api/rest-handler"
import { SalesforcePage } from "common/pages/SalesforcePage"
import { SalesforceNavigator } from "common/SalesforceNavigator"

type Layout = {
    sections: any
}

type LayoutModes = {
    create?: Layout | boolean,
    edit?: Layout | boolean,
    view?: Layout | boolean
}

type LayoutTypes = {
	compact?: LayoutModes, 
	full?: LayoutModes
}

type TestContext = {
    ui: Page, 
    testInfo: TestInfo
}

type ValidatorConfig = {
	types?: LayoutTypes,
	evidence?: TestContext
}

export class RecordLayout {
    Compact?: LayoutModes;
    Full?: LayoutModes;

    constructor(data: LayoutTypes){
        this.Compact = data.compact;
        this.Full = data.full;
    }
}

export class RecordValidator {
    private readonly api: RestHandler

    constructor(api: RestHandler){
        this.api = api
    }

	private snapshotFormat(data: Object){
        return JSON.stringify(data, null, 3)
    }

    private filterRecordData(layoutData: ValidatorConfig): RecordLayout {
		const matching = {
			etags: /[a-zA-Z0-9]{32}/gm,
			longIds: /[a-zA-Z0-9]{18}/gm,
			filters: /"filter":.+",/gm,
			placeholders: /"placeholder":.+",/gm
		}
		return JSON.parse(JSON.stringify(layoutData)
			.replace(matching.etags, "")
			.replace(matching.longIds, "")
			.replace(matching.filters, "")
			.replace(matching.placeholders, "")
		) as RecordLayout
	}

	private parseLayoutTypes (types: LayoutTypes): string[] {
		const layoutTypes: string[] = []
		if (types.compact) {
			layoutTypes.push('Compact')
		}
		if (types.full) {
			layoutTypes.push('Full')
		}
		return layoutTypes
	}

	private parseLayoutModes (modes: LayoutModes): string[] {
		const layoutModes: string[] = []
		if (modes.create) {
			layoutModes.push('Create')
		}
		if (modes.edit) {
			layoutModes.push('Edit')
		}
		if (modes.view) {
			layoutModes.push('View')
		}
		return layoutModes
	}

	private getPathnameForLayoutRecord(id: string, config?: ValidatorConfig): string {
		const pathname = `/ui-api/record-ui/${id}`
		if (!config.types) {
			return pathname
		}

		const types = this.parseLayoutTypes(config.types)
		const modes = new Set<string>()
		types.forEach(type => this.parseLayoutModes(config.types[type])
			.forEach(mode => modes.add(mode)))
		if (!modes.size) {
			throw new Error(`missing layout modes in record validation pathname:\n${JSON.stringify(config)}`)
		}

		const uri = new URL(pathname, SalesforceNavigator.SANDBOX_LOGIN_URL)
		uri.searchParams.append('layoutTypes', types.toString())
		uri.searchParams.append('modes', [...modes].toString())
		return uri.pathname
	}

    private async fetchLayoutForRecord(id: string, config?: ValidatorConfig): Promise<RecordLayout> {
		const pathname = this.getPathnameForLayoutRecord(id, config)
		try {
			const response = await this.api.conn.request({ method: 'GET', url: pathname })
			return this.filterRecordData(((response as any).layouts)[0])
		} catch (error) {
			throw new Error(`unable to retrieve ${pathname} due to:\n${error}`)
		}
	}

	private async catpureScreenshotForRecord(id: string, context: TestContext){
		await SalesforceNavigator.openResource(id, context.ui)
		const currentPage = new SalesforcePage(context.ui)
    	await currentPage.attachScreenshotToTestInfo(
            await currentPage.captureFullPageScreenshot(), 
            context.testInfo)
	}

    async validateLayoutForRecord(id: string, config?: ValidatorConfig) {
		const fetchedLayouts = this.fetchLayoutForRecord(id, config)
		const testEvidence = config.evidence ? this.catpureScreenshotForRecord(id, config.evidence) : null
		try {
			await Promise.all([fetchedLayouts, testEvidence])
			expect(this.snapshotFormat(fetchedLayouts)).toMatchSnapshot()
		} catch (error) {
			throw new Error(`layouts validation via Salesforce ui-api failed due to:\n${error}`)
		}
	}
}
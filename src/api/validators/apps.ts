import { Page, TestInfo } from "@playwright/test"
import { RestHandler } from "api/rest-handler"
import { SalesforcePage } from "common/pages/SalesforcePage"
import { SalesforceNavigator } from "common/SalesforceNavigator"

type AppsConfig = {
    formFactor: 'Large' | 'Medium' | 'Small',
    userCustomizations: boolean
}

type TestContext = {
    ui: Page, 
    testInfo: TestInfo
}

type ValidatorConfig = {
    apps?: AppsConfig,
    evidence?: TestContext
}

export class AppsValidator {
    private readonly api: RestHandler

    constructor(api: RestHandler){
        this.api = api
    }

    private snapshotFormat(data: Object){
        return JSON.stringify(data, null, 3)
    }

    private filterRecordData(appsData: any): unknown{
        const matching = {
            etags: /[a-zA-Z0-9]{32}/gm,
            longIds: /[a-zA-Z0-9]{18}/gm,
            urls: /^.*\bhttps\b.*$/gm,
        }
        return JSON.parse(JSON.stringify(appsData)
            .replace(matching.etags, "")
            .replace(matching.longIds, "")
            .replace(matching.urls, ""))
    }

    private getAppsPathname(config: AppsConfig): string {
        const pathname = '/ui-api/apps'
        const uri = new URL(pathname, SalesforceNavigator.SANDBOX_LOGIN_URL)

        if (config.formFactor){
            uri.searchParams.append('formFactor', config.formFactor)
        }
        if (config.userCustomizations){
            uri.searchParams.append('userCustomizations', 'true')
        }
        return uri.pathname
    }

    private async fetchApps(config?: AppsConfig): Promise<unknown> {
		const pathname = this.getAppsPathname(config)
		try {
			const result = await this.api.conn.request({ method: 'GET', url: pathname })
			return this.filterRecordData(result)
		} catch (error) {
			throw new Error(`unable to fetch available Apps due to:\n${error}`)
		}
	}

    private async captureAppLauncherScreenshot(context: TestContext){
        const appLauncher = context.ui.getByRole('button', { name: 'App Launcher' })
        const contextHandler = new SalesforcePage(context.ui)
        await SalesforceNavigator.openHome(context.ui)
        await appLauncher.click()
        await contextHandler.attachScreenshotToTestInfo(
            await contextHandler.captureScreenshot({fullPage: false}),
            context.testInfo
        )
    }

    async validateAppsAndTabs(config?: ValidatorConfig) {
        const fetchedApps = this.fetchApps(config.apps)
        const testEvidence = config.evidence ? this.captureAppLauncherScreenshot(config.evidence) : null
		try {
            await Promise.all([fetchedApps, testEvidence])
            expect(this.snapshotFormat(fetchedApps)).toMatchSnapshot()
		} catch (error) {
			throw new Error(`apps validation via Salesforce ui-api failed due to:\n${error}`)
		}
	}
}
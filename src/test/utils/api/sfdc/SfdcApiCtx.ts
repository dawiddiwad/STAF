import { expect } from "@playwright/test";
import {
	Connection,
	ExecuteAnonymousResult,
	QueryResult,
	Record,
	RecordResult,
	SalesforceId,
	MetadataInfo
} from "jsforce";
import { SfdcCtx } from "../../common/context/SfdcCtx";
import { User } from "../../common/User";
import { writeFile } from "fs/promises"
import { RecordUiData, UiLayout } from "./UiLayout";

export class NoRecordsReturnedError extends Error {
	constructor(msg: string) {
		super(msg);
	}
}

export class SfdcApiCtx extends SfdcCtx {
	private conn: Connection;
	public Ready: Promise<this>;

	constructor(user: User) {
		super(user);
		this.Ready = new Promise<this>((connect) => {
			try {
				if (this.user.credentials.sessionId) {
					this.conn = new Connection({
						instanceUrl: this.user.credentials.instanceUrl,
						sessionId: this.user.credentials.sessionId,
						version: "54.0"
					});
				} else if (this.user.credentials.accessToken) {
					this.conn = new Connection({
						instanceUrl: this.user.credentials.instanceUrl,
						accessToken: this.user.credentials.accessToken,
						version: "54.0"
					});
				} else throw new Error(`missing user credentials - sessionId or accessToken is requeired to intialize sfdx api context.
            these are credentails received:\n${JSON.stringify(this.user.credentials)}`);
				connect(this);
			} catch (error) {
				throw new Error(`unable to initialize SFDC API due to:\n${error}`);
			}
		});
	}

	private objectsCompare(data1: UiLayout, data2: UiLayout): void {
		try {
			expect.soft(data1).toEqual(data2);
		} catch (error) {
			throw new Error(`Objects do not match due to:\n${error}`);
		}
	}

	private parseLayoutFromLayoutResponse(layoutData: RecordUiData): UiLayout {
		const sfdcEtag = /[a-zA-Z0-9]{32}/gm;
		const sfdcLongId = /[a-zA-Z0-9]{18}/gm;
		const filter = /"filter":.+",/gm;
		const placeholder = /"placeholder":.+",/gm;
		return JSON.parse(JSON.stringify(layoutData, null, 3)
			.replace(sfdcEtag, "")
			.replace(sfdcLongId, "")
			.replace(filter, "")
			.replace(placeholder, "")
		) as UiLayout;
	}

	public async create(sobject: string, data: object | object[]): Promise<RecordResult | RecordResult[]> {
		try {
			return await this.conn.create(sobject, data, { allOrNone: true });
		} catch (error) {
			throw new Error(`unable to create ${sobject} due to:\n${error}`);
		}
	}

	public async update(sobject: string, data: object | object[]): Promise<RecordResult | RecordResult[]> {
		try {
			return await this.conn.update(sobject, data, { allOrNone: true });
		} catch (error) {
			throw new Error(`unable to update ${sobject} with data:\n${JSON.stringify(data, null, 3)}\ndue to:\n${error}`);
		}
	}

	public async delete(sobject: string, id: SalesforceId | SalesforceId[]): Promise<RecordResult | RecordResult[]> {
		try {
			return await this.conn.delete(sobject, id);
		} catch (error) {
			throw new Error(`unable to delete ${sobject} record ${id} due to:\n${error}`);
		}
	}

	public async read(sobject: string, id: SalesforceId | SalesforceId[]): Promise<Record | Record[]> {
		try {
			return await this.conn.retrieve(sobject, id);
		} catch (error) {
			throw new Error(`unable to read ${sobject} record ${id} due to:\n${error}`);
		}
	}

	public async query(soql: string): Promise<QueryResult<unknown>> {
		let result: QueryResult<unknown>;
		try {
			result = await this.conn.query(soql);
		} catch (error) {
			throw new Error(`unable to execute soql:\n${soql}\ndue to:\n$\n${error}`);
		}
		if (!result.records.length) {
			throw new NoRecordsReturnedError(`no records returned by soql:\n${soql}}`);
		} else return result;
	}

	public async executeApex(apexBody: string): Promise<ExecuteAnonymousResult> {
		let result: ExecuteAnonymousResult;
		try {
			result = await this.conn.tooling.executeAnonymous(apexBody);
		} catch (error) {
			throw new Error(`unable to execute anonymous apex:\n${apexBody}\ndue to:\n${error}`);
		}
		if (!result.success) {
			throw new Error(`exception running anonymous apex:\n${apexBody}\ndue to:\n${result.exceptionMessage}\n${result.exceptionStackTrace}`);
		} else return result;
	}

	public async readRecordUi(recordId: string, options?: RecordUiData): Promise<MetadataInfo | MetadataInfo[]> {
		options = options ? options : {
			Full: { Edit: true, Create: true, View: true },
			Compact: { Edit: true, Create: true, View: true }
		};
		const types = () => {
			let types = '';
			options?.Full ? types += 'Full' : null;
			options?.Compact ? types ? types += ',Compact' : types += 'Compact' : null;
			if (!types) throw new Error(`missing layout types for ui-record request:\n${JSON.stringify(options)}`);
			else return types;
		}

		const modes = () => {
			let modes = '';
			options?.Full ? null : (options as any).Full = options?.Compact;
			options?.Full?.Create ? modes += 'Create' : null;
			options?.Full?.Edit ? modes ? modes += ',Edit' : modes += 'Edit' : null;
			options?.Full?.View ? modes ? modes += ',View' : modes += 'View' : null;
			if (!modes) throw new Error(`missing layout modes for ui-record request:\n${JSON.stringify(options)}`);
			else return modes;
		};

		const resource = `/ui-api/record-ui/${recordId}?layoutTypes=${types()}&modes=${modes()}`;
		try {
			return this.conn.request({ method: 'Get', url: resource });
		} catch (error) {
			throw new Error(`unable to retrieve ${resource} due to:\n${error}`);
		}
	}

	public async readApps(formFactor?: 'Large' | 'Medium' | 'Small', userCustomizations?: boolean): Promise<MetadataInfo | MetadataInfo[]> {
		const formFactorParam = formFactor ? `?formFactor=${formFactor}` : `?formFactor=Large`;
		const userCustomizationsParam = userCustomizations ? `&userCustomizations=${userCustomizations}` : '';
		const resource = `/ui-api/apps${formFactorParam}${userCustomizationsParam}`;
		try {
			let result = await this.conn.request({ method: 'Get', url: resource });
			const sfdcEtag = /[a-zA-Z0-9]{32}/gm;
			const sfdcLongId = /[a-zA-Z0-9]{18}/gm;
			const url = /^.*\bhttps\b.*$/gm;
			return JSON.parse(JSON.stringify(result, null, 3)
				.replace(sfdcEtag, "")
				.replace(sfdcLongId, "")
				.replace(url, ""));
		} catch (error) {
			throw new Error(`unable to fetch available Apps due to:\n${error}`);
		}
	}

	public async readRelatedListsUi(object: string, recordTypeId?: string): Promise<MetadataInfo | MetadataInfo[]> {
		recordTypeId = recordTypeId ? `?recordTypeId=${recordTypeId}` : '';
		const resource = `/ui-api/related-list-info/${object}${recordTypeId}`;
		try {
			return this.conn.request({ method: 'Get', url: resource });
		} catch (error) {
			throw new Error(`unable to retrieve ${resource} due to:\n${error}`);
		}
	}

	public async readLayoutsFromOrg(recordId: string, options?: RecordUiData): Promise<UiLayout> {
		try {
			let data = Object.values((await this.readRecordUi(recordId, options) as any).layouts)[0];
			data = this.parseLayoutFromLayoutResponse(data as RecordUiData);
			return new UiLayout(Object.values(data as unknown[])[0] as UiLayout);
		} catch (error) {
			throw new Error(`Unable to read Layout data from org due to:\n${error}`)
		}
	}

	public async writeLayoutSectionsToFileFromOrg(filePath: string, recordId: string, dataToFetch: RecordUiData): Promise<void> {
		try {
			const layoutData = await this.readLayoutsFromOrg(recordId, dataToFetch);
			await writeFile(filePath, JSON.stringify(layoutData, null, 1));
		} catch (error) {
			throw new Error(`Unable to write Layout data to file due to:\n${error}`);
		}
	}

	public async validateVisibleRecordLayouts(recordId: string, options?: RecordUiData): Promise<void> {
		try {
			const orgLayouts = this.readLayoutsFromOrg(recordId, options);
			await Promise.allSettled([
				orgLayouts,
				this.user.ui.navigateToResource(recordId)
					.then(() => this.user.ui.page.waitForLoadState('networkidle'))
			]);
			expect(JSON.stringify(await orgLayouts, null, 3)).toMatchSnapshot();
		} catch (error) {
			throw new Error(`Layouts validation via UI-API failed for user ${this.user.credentials.id} ${this.user.credentials.username} due to:\n${error}`);
		}
	}

	public async validateAvailableApps(): Promise<void> {
		try {
			const orgApps = this.readApps();
			await Promise.allSettled([
				orgApps,
				this.user.ui.page.click('.appLauncher button')
					.then(() => this.user.ui.page.waitForResponse(/getAppLauncherMenuData/gm)
						.then((response) => response.ok()))
			])
			expect(JSON.stringify(await orgApps, null, 3)).toMatchSnapshot();
		} catch (error) {
			throw new Error(`Apps validation via UI-API failed for user ${this.user.credentials.id} ${this.user.credentials.username} due to:\n${error}`);
		}
	}

	public async writeAppsToFileFromOrg(filePath: string): Promise<void> {
		try {
			const appsData = await this.readApps();
			await writeFile(filePath, JSON.stringify(appsData, null, 1));
		} catch (error) {
			throw new Error(`Unable to write Apps data to file due to:\n${error}`);
		}
	}
}

import { expect } from "@playwright/test";
import { Connection, ExecuteAnonymousResult, MetadataInfo, QueryResult, Record, RecordResult, SalesforceId } from "jsforce"
import { writeFile } from "fs/promises"
import { RecordUiData, UiLayout } from "test/utils/api/sfdc/UiLayout";
import { SalesforceFrontdoorData } from "test/utils/auth/Types";
import { Api } from "../Api";

export class NoRecordsReturnedError extends Error {
	constructor(msg: string) {
		super(msg)
	}
}

export class SalesforceApi extends Api {
	private version: string
	private conn: Connection;
	Ready: Promise<this>;

	constructor(frontdoorData: SalesforceFrontdoorData, version?: string) {
		super()
        version ? this.version = version : this.version = '57.0'
		this.Ready = new Promise<this>((connect) => {
			try {
                this.conn = new Connection({			
                    instanceUrl: frontdoorData.instance,
                    sessionId: frontdoorData.sessionId,
                    version: this.version
                });
				connect(this);
			} catch (error) {
				throw new Error(`unable to initialize SFDC API due to:\n${error}`);
			}
		});
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

	async create(sobject: string, data: object | object[]): Promise<RecordResult | RecordResult[]> {
		try {
			return await this.conn.create(sobject, data, { allOrNone: true });
		} catch (error) {
			throw new Error(`unable to create ${sobject} due to:\n${error}`);
		}
	}

	async update(sobject: string, data: object | object[]): Promise<RecordResult | RecordResult[]> {
		try {
			return await this.conn.update(sobject, data, { allOrNone: true });
		} catch (error) {
			throw new Error(`unable to update ${sobject} with data:\n${JSON.stringify(data, null, 3)}\ndue to:\n${error}`);
		}
	}

	async delete(sobject: string, id: SalesforceId | SalesforceId[]): Promise<RecordResult | RecordResult[]> {
		try {
			return await this.conn.delete(sobject, id);
		} catch (error) {
			throw new Error(`unable to delete ${sobject} record ${id} due to:\n${error}`);
		}
	}

	async read(sobject: string, id: SalesforceId | SalesforceId[]): Promise<Record | Record[]> {
		try {
			return await this.conn.retrieve(sobject, id);
		} catch (error) {
			throw new Error(`unable to read ${sobject} record ${id} due to:\n${error}`);
		}
	}

	async query(soql: string): Promise<QueryResult<unknown>> {
		let result: QueryResult<unknown>;
		try {
			result = await this.conn.query(soql);
		} catch (error) {
			throw new Error(`unable to execute soql:\n${soql}\ndue to:\n$\n${error}`);
		}
		if (!result.records.length) {
			throw new NoRecordsReturnedError(`no records returned by soql:\n${soql}`);
		} else return result;
	}

	async executeApex(apexBody: string): Promise<ExecuteAnonymousResult> {
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

	async readRecordUi(recordId: string, options?: RecordUiData): Promise<MetadataInfo | MetadataInfo[]> {
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
			if (options && options.Full) {
				if (!(options as any).Full) {
					(options as any).Full = options.Compact;
				}

				if (options.Full.Create) {
					modes += 'Create';
				}

				if (options.Full.Edit) {
					modes += modes ? ',Edit' : 'Edit';
				}

				if (options.Full.View) {
					modes += modes ? ',View' : 'View';
				}
			}
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

	async readApps(formFactor?: 'Large' | 'Medium' | 'Small', userCustomizations?: boolean): Promise<MetadataInfo | MetadataInfo[]> {
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

	async readRelatedListsUi(object: string, recordTypeId?: string): Promise<MetadataInfo | MetadataInfo[]> {
		recordTypeId = recordTypeId ? `?recordTypeId=${recordTypeId}` : '';
		const resource = `/ui-api/related-list-info/${object}${recordTypeId}`;
		try {
			return this.conn.request({ method: 'Get', url: resource });
		} catch (error) {
			throw new Error(`unable to retrieve ${resource} due to:\n${error}`);
		}
	}

	async readLayoutsFromOrg(recordId: string, options?: RecordUiData): Promise<UiLayout> {
		try {
			let data = Object.values((await this.readRecordUi(recordId, options) as any).layouts)[0];
			data = this.parseLayoutFromLayoutResponse(data as RecordUiData);
			return new UiLayout(Object.values(data as unknown[])[0] as UiLayout);
		} catch (error) {
			throw new Error(`Unable to read Layout data from org due to:\n${error}`)
		}
	}

	async writeLayoutSectionsToFileFromOrg(filePath: string, recordId: string, dataToFetch: RecordUiData): Promise<void> {
		try {
			const layoutData = await this.readLayoutsFromOrg(recordId, dataToFetch);
			await writeFile(filePath, JSON.stringify(layoutData, null, 1));
		} catch (error) {
			throw new Error(`Unable to write Layout data to file due to:\n${error}`);
		}
	}

	async validateVisibleRecordLayouts(recordId: string, options?: RecordUiData): Promise<void> {
		try {
			const orgLayouts = this.readLayoutsFromOrg(recordId, options);
			expect(JSON.stringify(await orgLayouts, null, 3)).toMatchSnapshot();
		} catch (error) {
			throw new Error(`Layouts validation via UI-API failed due to:\n${error}`);
		}
	}

	async validateAvailableApps(): Promise<void> {
		try {
			const orgApps = this.readApps();
			expect(JSON.stringify(await orgApps, null, 3)).toMatchSnapshot();
		} catch (error) {
			throw new Error(`Apps validation via UI-API failed due to:\n${error}`);
		}
	}

	async writeAppsToFileFromOrg(filePath: string): Promise<void> {
		try {
			const appsData = await this.readApps();
			await writeFile(filePath, JSON.stringify(appsData, null, 1));
		} catch (error) {
			throw new Error(`Unable to write Apps data to file due to:\n${error}`);
		}
	}
}

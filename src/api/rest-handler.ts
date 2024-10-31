import { TestInfo } from "@playwright/test"
import { Connection, QueryResult, Record, SaveResult, SObjectUpdateRecord } from "jsforce"
import { SalesforceFrontdoorData } from "auth/AuthorizationTypes"
import { ExecuteAnonymousResult } from "jsforce/lib/api/tooling"

export class NoRecordsReturnedError extends Error {
	constructor(msg: string) {
		super(msg)
	}
}

export class RestHandler {
	readonly apiVersion: string = "57.0"
    readonly ready: Promise<this>
	conn: Connection
    testInfo: TestInfo

	constructor(frontdoorData: SalesforceFrontdoorData, apiVersion?: string) {
        if (apiVersion){
            this.apiVersion = apiVersion
        }
		this.ready = new Promise<this>((authenticate) => {
			try {
                this.conn = new Connection({			
                    instanceUrl: frontdoorData.instance,
                    sessionId: frontdoorData.sessionId,
                    version: this.apiVersion
                })
				authenticate(this)
			} catch (error) {
				throw new Error(`unable to authenticate Salesforce Rest API due to:\n${error}`)
			}
		})
	}

	async create(sobject: string, data: object | object[]): Promise<SaveResult> {
		try {
			return await this.conn.create(sobject, data, { allOrNone: true })
		} catch (error) {
			throw new Error(`unable to create ${sobject} due to:\n${error}`)
		}
	}

	async update(sobject: string, data: SObjectUpdateRecord<any, any>): Promise<SaveResult> {
		try {
			return await this.conn.update(sobject, data, { allOrNone: true })
		} catch (error) {
			throw new Error(`unable to update ${sobject} with data:\n${JSON.stringify(data, null, 3)}\ndue to:\n${error}`)
		}
	}

	async delete(sobject: string, ids: string[]): Promise<SaveResult[]> {
		try {
			return await this.conn.delete(sobject, ids)
		} catch (error) {
			throw new Error(`unable to delete ${sobject} record ${ids} due to:\n${error}`)
		}
	}

	async read(sobject: string, ids: string[]): Promise<Record[]> {
		try {
			return await this.conn.retrieve(sobject, ids)
		} catch (error) {
			throw new Error(`unable to read ${sobject} record ${ids} due to:\n${error}`)
		}
	}

	async query(soql: string): Promise<QueryResult<unknown>> {
		let result: QueryResult<unknown>
		try {
			result = await this.conn.query(soql)
		} catch (error) {
			throw new Error(`unable to execute soql:\n${soql}\ndue to:\n${error}`)
		}
		if (!result.records.length) {
			throw new NoRecordsReturnedError(`no records returned by soql:\n${soql}`)
		} else return result
	}

	async executeApex(apexBody: string): Promise<ExecuteAnonymousResult> {
		let result: ExecuteAnonymousResult
		try {
			result = await this.conn.tooling.executeAnonymous(apexBody)
		} catch (error) {
			throw new Error(`unable to execute anonymous apex:\n${apexBody}\ndue to:\n${error}`)
		}
		if (!result.success) {
			throw new Error(`exception running anonymous apex:\n${apexBody}\ndue to:\n${result.exceptionMessage}\n${result.exceptionStackTrace}`)
		} else return result
	}
}
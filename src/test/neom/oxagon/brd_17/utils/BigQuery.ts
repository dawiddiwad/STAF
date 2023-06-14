import { expect } from "@playwright/test";
import { User } from "../../../../utils/common/User";
import { ExecuteAnonymousResult } from "jsforce";

export class BigQuery {
    public static async importAfternoonLeadsAs(user: User): Promise<ExecuteAnonymousResult> {
        return user.api.executeApex(`
            List<BigQuerySelect__mdt> lstBQS = [SELECT Id, Query__c FROM BigQuerySelect__mdt WHERE DeveloperName = 'Afternoon_Lead_Query'];
            BigQueryCallouts.synchronizeLeads(lstBQS[0].Query__c);
        `);
    }

    public static async findLeadWith(data: any, user: User) {
        const soql = `SELECT Id FROM Lead WHERE Name = '${data.FirstName} ${data.LastName}' ORDER BY CreatedDate DESC`;
        return expect.poll(async () => {
            try {
                const queryResult = await user.api.query(soql);
                data.Id = queryResult.records[0].Id
            } catch (NoRecordsReturnedError) { } finally { return data.Id; }
        },
            {
                timeout: 240_000,
                intervals: [5_000],
                message: `unable to find Lead using soql: ${soql}`
            }).not.toBeNull();
    }
}
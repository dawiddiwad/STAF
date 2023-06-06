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
        return expect.poll(async () => {
            try {
                const leadInSf = await user.api.query(`SELECT Id FROM Lead WHERE Name = '${data.FirstName} ${data.LastName}' ORDER BY CreatedDate DESC`);
                data.Id = leadInSf.records[0].Id
            } catch (error) {
            } finally {
                return data.Id;
            }
        },
            {
                intervals: [5_000],
                timeout: 20000
            }).not.toBeNull();
    }
}
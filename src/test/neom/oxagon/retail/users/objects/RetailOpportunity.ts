import { faker } from "@faker-js/faker";
import { RetailUser } from "../User";
import { SuccessResult } from "jsforce/record-result";
import { IsCreatableViaApi, SalesforceObject } from "test/utils/common/SalesforceObject";

export class RetailOpportunity extends SalesforceObject implements IsCreatableViaApi {
    constructor(user: RetailUser){
        super(user)
    }
    async createViaApi(): Promise<string>{
        const data = {
            Name: faker.random.word(),
            Description: 'Record created via automation',
            AccountId: await (this.user as RetailUser).account.createViaApi(),
            CompanyHeadquarterLocation__c: 'GCC',
            Amount: '150000',
            CloseDate: '2023-08-31',
            Category__c: 'Apparel and Sports',
        }
        return (await this.user.api.create("Opportunity", data) as SuccessResult).id;
    }
}
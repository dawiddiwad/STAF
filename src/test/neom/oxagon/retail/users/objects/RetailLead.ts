import { IsCreatableViaApi, SalesforceObject } from "test/utils/common/SalesforceObject";
import { RetailUser } from "../User";
import { faker } from "@faker-js/faker";
import { SuccessResult } from "jsforce";

export class RetailLead extends SalesforceObject implements IsCreatableViaApi {
    constructor(user: RetailUser){
        super(user)
    }
    async createViaApi(): Promise<string>{
        const data = {
            FirstName: faker.name.firstName(),
            LastName: faker.name.lastName(),
            LeadSource: 'Customer',
            Company: `${faker.company.catchPhraseNoun()} ${faker.company.catchPhraseAdjective()} ${faker.company.name()}`,
            Website: faker.internet.domainName(),
            Email: faker.internet.email(),
            Category__c: 'Apparel and Sports',
            SubCategory__c: 'Eyewear store',
            CompanySize__c: '1-49'
        }
        return (await this.user.api.create("Lead", data) as SuccessResult).id;
    }
}
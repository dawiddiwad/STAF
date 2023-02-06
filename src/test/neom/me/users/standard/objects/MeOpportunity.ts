import { faker } from "@faker-js/faker";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";
import { MeUser } from "../User";

export class MeOpportunity extends Sobject implements IsCreatableViaApi{
    constructor(user: MeUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const recordTypeId = (await this.user.api.query("select id from recordtype where name = 'Media & Entertainment'") as QueryResult<any>).records[0].Id;
        const data = {
            AccountId: await (this.user as MeUser).account.createViaApi(),
            CurrencyIsoCode: 'SAR',
            CloseDate: '2050-11-24',
            RecordTypeId: recordTypeId,
            Mode_of_Engagement__c: 'TBD',
            StageName: 'Pre-Qualification',
            Primary_Pillar__c: 'Operations',
            Name: `${faker.commerce.productName()} ${faker.commerce.price()}`
        }
        return (await this.user.api.create("Opportunity", data) as RecordResult).id;
    }
}
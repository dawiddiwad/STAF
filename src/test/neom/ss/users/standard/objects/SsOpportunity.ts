import { faker } from "@faker-js/faker";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";
import { SsStandardUser } from "../User";

export class SsOpportunity extends Sobject implements IsCreatableViaApi{
    constructor(user: SsStandardUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const recordTypeId = (await this.user.api.query("select id from recordtype where name = 'Shared Services'") as QueryResult<any>).records[0].Id;
        const data = {
            AccountId: await (this.user as SsStandardUser).account.createViaApi(),
            CurrencyIsoCode: 'SAR',
            CloseDate: '2050-11-24',
            RecordTypeId: recordTypeId,
            StageName: 'Pre-Qualification',
            Name: `${faker.commerce.productName()} ${faker.commerce.price()}`
        }
        return (await this.user.api.create("Opportunity", data) as RecordResult).id;
    }
}
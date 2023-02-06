import { WaterUser } from "../User"
import { faker } from "@faker-js/faker";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class WaterOpportunity extends Sobject implements IsCreatableViaApi{
    constructor(user: WaterUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const recordTypeId = (await this.user.api.query("select id from recordtype where name = 'Water Opportunity'") as QueryResult<any>).records[0].Id;
        const data = {
            AccountId: await (this.user as WaterUser).account.createViaApi(),
            CloseDate: '2050-11-24',
            StageName: 'Qualification',
            RecordTypeId: recordTypeId,
            Name: `${faker.commerce.productName()} ${faker.commerce.price()}`
        }
        return (await this.user.api.create("Opportunity", data) as RecordResult).id;
    }
}
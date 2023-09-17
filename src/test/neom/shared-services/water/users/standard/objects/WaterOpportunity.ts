import { WaterUser } from "../User"
import { faker } from "@faker-js/faker";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";

export class WaterOpportunity extends Sobject implements IsCreatableViaApi{
    constructor(user: WaterUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            AccountId: await (this.user as WaterUser).account.createViaApi(),
            CloseDate: '2050-11-24',
            StageName: 'Qualification',
            Name: `${faker.commerce.productName()} ${faker.commerce.price()}`
        }
        return (await this.user.api.create("Opportunity", data) as RecordResult).id;
    }
}
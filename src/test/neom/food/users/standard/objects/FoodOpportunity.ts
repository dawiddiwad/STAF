import { faker } from "@faker-js/faker";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { FoodAccount } from "./FoodAccount";
import { FoodUser } from "../User";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class FoodOpportunity extends Sobject implements IsCreatableViaApi{
    constructor(user: FoodUser){
        super(user);
    }
    
    public async createViaApi(accountId?: string, recordTypeId?: string): Promise<string>{
        const data = {
            AccountId: accountId ? accountId : await (this.user as FoodUser).account.createViaApi(),
            CloseDate: '2050-11-24',
            StageName: 'Qualification',
            Primary_Pillar__c: 'Agriculture',
            Name: `${faker.commerce.productName()} ${faker.commerce.price()}`,
            RecordTypeId: recordTypeId ? recordTypeId : (await this.user.api.query("select id from recordtype where name = 'Food Opportunity'") as QueryResult<any>).records[0].Id
        }
        return (await this.user.api.create("Opportunity", data) as RecordResult).id;
    } 
}
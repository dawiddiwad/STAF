import { faker } from "@faker-js/faker";
import { FoodUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class FoodContact extends Sobject implements IsCreatableViaApi{
    constructor(user: FoodUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            AccountId: await (this.user as FoodUser).account.createViaApi(),
            LastName: faker.name.lastName(),
            Pillars__c: 'Agriculture;Aquaculture;Corporate'
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }
}
import { faker } from "@faker-js/faker";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { FoodUser } from "../User";

export class FoodAccount extends Sobject implements IsCreatableViaApi{
    constructor(user: FoodUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            Name: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        return (await this.user.api.create("Account", data) as RecordResult).id;
    }
}
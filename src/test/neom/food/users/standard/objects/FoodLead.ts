import { faker } from "@faker-js/faker";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";
import { FoodUser } from "../User";

export class FoodLead extends Sobject implements IsCreatableViaApi{
    constructor(user: FoodUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            Status: "New",
            LastName: faker.name.lastName(),
            Company: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        return (await this.user.api.create("Lead", data) as RecordResult).id;
    }
}
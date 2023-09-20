import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { RetailUser } from "../User";
import { faker } from "@faker-js/faker";
import { SuccessResult } from "jsforce/record-result";

export class RetailAccount extends Sobject implements IsCreatableViaApi{
    constructor(user: RetailUser){
        super(user)
    }

    public async createViaApi(): Promise<string>{
        const data = {
            Name: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        return (await this.user.api.create("Account", data) as SuccessResult).id;
    }
}
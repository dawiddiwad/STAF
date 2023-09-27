import { RetailUser } from "../User";
import { faker } from "@faker-js/faker";
import { SuccessResult } from "jsforce/record-result";
import { IsCreatableViaApi, SalesforceObject } from "test/utils/common/SalesforceObject";

export class RetailAccount extends SalesforceObject implements IsCreatableViaApi{
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
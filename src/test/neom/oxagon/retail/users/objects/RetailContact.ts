import { IsCreatableViaApi, SalesforceObject } from "test/utils/common/SalesforceObject";
import { RetailUser } from "../User";
import { faker } from "@faker-js/faker";
import { SuccessResult } from "jsforce";

export class RetailContact extends SalesforceObject implements IsCreatableViaApi {
    constructor(user: RetailUser){
        super(user)
    }
    async createViaApi(): Promise<string>{
        const data = {
            FirstName: faker.name.firstName(),
            LastName: faker.name.lastName(),
            AccountId: await (this.user as RetailUser).account.createViaApi(),
            CurrencyIsoCode: 'SAR',
            Email: faker.internet.email(),
        }
        return (await this.user.api.create("Contact", data) as SuccessResult).id;
    }
}
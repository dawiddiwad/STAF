import { faker } from "@faker-js/faker";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { EnvironmentUser } from "../User";

export class EnvironmentAccount extends Sobject implements IsCreatableViaApi{
    constructor(user: EnvironmentUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            Name: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        return (await this.user.api.create("Account", data) as RecordResult).id;
    }
}
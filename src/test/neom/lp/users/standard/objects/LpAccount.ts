import { faker } from "@faker-js/faker";
import { LpStandardUser } from "../User"
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class LpAccount extends Sobject implements IsCreatableViaApi{
    constructor(user: LpStandardUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const accData = {
            Name: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        return (await this.user.api.create("Account", accData) as RecordResult).id;
    }
}

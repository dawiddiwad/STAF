import { faker } from "@faker-js/faker";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../../utils/common/Sobject";
import { LandMobilityUser } from "../User";

export class LandMobilityAccount extends Sobject implements IsCreatableViaApi{
    constructor(user: LandMobilityUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            Name: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        return (await this.user.api.create("Account", data) as RecordResult).id;
    }
}
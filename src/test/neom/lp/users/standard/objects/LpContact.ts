import { faker } from "@faker-js/faker";
import { LpStandardUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class LpContact extends Sobject implements IsCreatableViaApi{
    constructor(user: LpStandardUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const conData = {
            LastName: faker.name.lastName(),
            AccountId: await (this.user as LpStandardUser).account.createViaApi()
        }
        return (await this.user.api.create("Contact", conData) as RecordResult).id;
    }
}
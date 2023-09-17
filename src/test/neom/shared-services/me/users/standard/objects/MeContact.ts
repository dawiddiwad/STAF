import { faker } from "@faker-js/faker";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { MeUser } from "../User";

export class MeContact extends Sobject implements IsCreatableViaApi{
    constructor(user: MeUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            AccountId: await (this.user as MeUser).account.createViaApi(),
            LastName: faker.name.lastName()
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }
}
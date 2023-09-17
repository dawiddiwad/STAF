import { WaterUser } from "../User"
import { faker } from "@faker-js/faker";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";

export class WaterContact extends Sobject implements IsCreatableViaApi{
    constructor(user: WaterUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            AccountId: await (this.user as WaterUser).account.createViaApi(),
            LastName: faker.name.lastName()
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }
}
import { SsStandardUser } from "../User";
import { faker } from "@faker-js/faker";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class SsContact extends Sobject implements IsCreatableViaApi{
    constructor(user: SsStandardUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            AccountId: await (this.user as SsStandardUser).account.createViaApi(),
            Type__c: 'Operational',
            LastName: faker.name.lastName()
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }
}
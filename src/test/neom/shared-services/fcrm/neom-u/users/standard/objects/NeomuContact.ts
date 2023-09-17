import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { NeomuUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { faker } from "@faker-js/faker";

export class NeomuContact extends Sobject implements IsCreatableViaApi {
    constructor(user: NeomuUser){
        super(user);
    }
    
    public async createViaApi(accountId?: string): Promise<string>{
        const data = {
            LastName: faker.name.lastName(),
            AccountId: accountId ? accountId : await (this.user as NeomuUser).account.createViaApi()       
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }  
}
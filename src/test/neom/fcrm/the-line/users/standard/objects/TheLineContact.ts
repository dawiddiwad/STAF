import { IsCreatableViaApi, Sobject } from "../../../../../../utils/common/Sobject";
import { TheLineUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { faker } from "@faker-js/faker";

export class TheLineContact extends Sobject implements IsCreatableViaApi {
    constructor(user: TheLineUser){
        super(user);
    }
    
    public async createViaApi(accountId?: string): Promise<string>{
        const data = {
            LastName: faker.name.lastName(),
            AccountId: accountId ? accountId : await (this.user as TheLineUser).account.createViaApi()       
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }  
}
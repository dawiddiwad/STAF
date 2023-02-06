import { IsCreatableViaApi, Sobject } from "../../../../../../utils/common/Sobject";
import { EnvironmentUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { faker } from "@faker-js/faker";

export class EnvironmentContact extends Sobject implements IsCreatableViaApi {
    constructor(user: EnvironmentUser){
        super(user);
    }
    
    public async createViaApi(accountId?: string): Promise<string>{
        const data = {
            LastName: faker.name.lastName(),
            AccountId: accountId ? accountId : await (this.user as EnvironmentUser).account.createViaApi()       
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }  
}
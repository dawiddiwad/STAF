import { IsCreatableViaApi, Sobject } from "../../../../../../utils/common/Sobject";
import { SportsUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { faker } from "@faker-js/faker";

export class SportsContact extends Sobject implements IsCreatableViaApi {
    constructor(user: SportsUser){
        super(user);
    }
    
    public async createViaApi(accountId?: string): Promise<string>{
        const data = {
            LastName: faker.name.lastName(),
            AccountId: accountId ? accountId : await (this.user as SportsUser).account.createViaApi()       
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }  
}
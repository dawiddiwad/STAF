import { IsCreatableViaApi, Sobject } from "../../../../../../utils/common/Sobject";
import { AirlineUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { faker } from "@faker-js/faker";

export class AirlineContact extends Sobject implements IsCreatableViaApi {
    constructor(user: AirlineUser){
        super(user);
    }
    
    public async createViaApi(accountId?: string): Promise<string>{
        const data = {
            LastName: faker.name.lastName(),
            AccountId: accountId ? accountId : await (this.user as AirlineUser).account.createViaApi()       
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }  
}
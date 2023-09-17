import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { AirportUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { faker } from "@faker-js/faker";

export class AirportContact extends Sobject implements IsCreatableViaApi {
    constructor(user: AirportUser){
        super(user);
    }
    
    public async createViaApi(accountId?: string): Promise<string>{
        const data = {
            LastName: faker.name.lastName(),
            AccountId: accountId ? accountId : await (this.user as AirportUser).account.createViaApi()       
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }  
}
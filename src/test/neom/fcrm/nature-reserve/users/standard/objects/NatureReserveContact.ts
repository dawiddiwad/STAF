import { IsCreatableViaApi, Sobject } from "../../../../../../utils/common/Sobject";
import { NatureReserveUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { faker } from "@faker-js/faker";

export class NatureReserveContact extends Sobject implements IsCreatableViaApi {
    constructor(user: NatureReserveUser){
        super(user);
    }
    
    public async createViaApi(accountId?: string): Promise<string>{
        const data = {
            LastName: faker.name.lastName(),
            AccountId: accountId ? accountId : await (this.user as NatureReserveUser).account.createViaApi()       
        }
        return (await this.user.api.create("Contact", data) as RecordResult).id;
    }  
}
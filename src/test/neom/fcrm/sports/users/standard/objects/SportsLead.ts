import { faker } from "@faker-js/faker";
import { IsCreatableViaApi, Sobject } from "../../../../../../utils/common/Sobject";
import { SportsUser } from "../User";
import { SuccessResult as RecordResult, QueryResult } from "jsforce";

export class SportsLead extends Sobject implements IsCreatableViaApi {
    constructor (user: SportsUser){
        super(user);
    }
    
    public async createViaApi(data?: object): Promise<string>{
        const mandatoryData = {
            Status: "New",
            LastName: faker.name.lastName(),
            Company: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        data = {...mandatoryData, ...data};
        return (await this.user.api.create("Lead", data) as RecordResult).id;
    }
}
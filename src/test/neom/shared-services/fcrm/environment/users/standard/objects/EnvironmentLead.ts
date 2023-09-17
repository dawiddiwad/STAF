import { faker } from "@faker-js/faker";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { EnvironmentUser } from "../User";
import { SuccessResult as RecordResult, QueryResult } from "jsforce";

export class EnvironmentLead extends Sobject implements IsCreatableViaApi {
    constructor (user: EnvironmentUser){
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
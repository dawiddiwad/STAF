import { faker } from "@faker-js/faker";
import { IsCreatableViaApi, Sobject } from "../../../../../../utils/common/Sobject";
import { AirlineUser } from "../User";
import { SuccessResult as RecordResult, QueryResult } from "jsforce";

export class AirlineLead extends Sobject implements IsCreatableViaApi {
    constructor (user: AirlineUser){
        super(user);
    }
    
    public async createViaApi(data?: object): Promise<string>{
        const recordTypeId = (await this.user.api.query("select id from recordtype where name = 'NEOM Airline Lead'") as QueryResult<any>).records[0].Id;
        const mandatoryData = {
            Status: "New",
            RecordTypeId: recordTypeId,
            LastName: faker.name.lastName(),
            Company: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        data = {...mandatoryData, ...data};
        return (await this.user.api.create("Lead", data) as RecordResult).id;
    }
}
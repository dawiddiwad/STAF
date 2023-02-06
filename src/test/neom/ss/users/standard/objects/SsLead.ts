import { SsStandardUser } from "../User";
import { faker } from "@faker-js/faker";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class SsLead extends Sobject implements IsCreatableViaApi{
    constructor(user: SsStandardUser){
        super(user)
    }

    public async createViaApi(): Promise<string>{
        const recordTypeId = (await this.user.api.query("select id from recordtype where name = 'Shared Service Lead'") as QueryResult<any>).records[0].Id;
        const data = {
            Status: "Unqualified",
            RecordTypeId: recordTypeId,
            LastName: faker.name.lastName(),
            Pillars__c: 'Agriculture;Corporate;Novel Foods',
            Company: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        return (await this.user.api.create("Lead", data) as RecordResult).id;
    }
}
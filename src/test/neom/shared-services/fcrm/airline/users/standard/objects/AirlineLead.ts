import { faker } from "@faker-js/faker";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { AirlineUser } from "../User";
import { SuccessResult as RecordResult, QueryResult } from "jsforce";

export class AirlineLead extends Sobject implements IsCreatableViaApi {
    constructor(user: AirlineUser) {
        super(user);
    }

    public async createViaApi(data?: object): Promise<string> {
        const mandatoryData = {
            Status: "New",
            LastName: faker.name.lastName(),
            Company: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        data = { ...mandatoryData, ...data };
        return (await this.user.api.create("Lead", data) as RecordResult).id;
    }
}
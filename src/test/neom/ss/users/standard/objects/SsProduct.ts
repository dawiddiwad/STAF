import { SsStandardUser } from "../User";
import { faker } from "@faker-js/faker";
import { SuccessResult as RecordResult } from "jsforce";
import { AdminUser } from "../../../../common/users/AdminUser";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class SsProduct extends Sobject implements IsCreatableViaApi{
    constructor(user: SsStandardUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const admin: AdminUser = new AdminUser();
        await admin.Ready;
        const data = {
            CurrencyIsoCode: 'SAR',
            Name: faker.commerce.product()
        }
        return (await admin.api.create("Product2", data) as RecordResult).id;
    }
}
import { faker } from "@faker-js/faker";
import { MeUser } from "../User"
import { SuccessResult as RecordResult } from "jsforce";
import { AdminUser } from "test/neom/common/users/AdminUser";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";

export class MeProduct extends Sobject implements IsCreatableViaApi{
    constructor(user: MeUser){
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
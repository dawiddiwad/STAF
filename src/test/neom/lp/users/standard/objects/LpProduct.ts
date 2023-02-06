import { LpStandardUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { AdminUser } from "../../../../common/users/AdminUser";
import { faker } from "@faker-js/faker";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class LpProduct  extends Sobject implements IsCreatableViaApi{
    constructor(user: LpStandardUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const admin: AdminUser = new AdminUser();
        await admin.Ready;
        const prodData = {
            Name: faker.commerce.productName()
        }
        return (await admin.api.create("Product2", prodData) as RecordResult).id;
    }
}
import { SsStandardUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";
export class SsOrder extends Sobject implements IsCreatableViaApi{
    constructor(user: SsStandardUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            Status: 'Draft',
            AccountId: await (this.user as SsStandardUser).account.createViaApi(),
            EffectiveDate: '2050-12-12'
        }
        return (await this.user.api.create("Order", data) as RecordResult).id;
    }
}
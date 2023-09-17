import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { SsStandardUser } from "../User";

export class SsContract extends Sobject implements IsCreatableViaApi{
    constructor(user: SsStandardUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            Status: 'Draft',
            ContractTerm: '12',
            AccountId: await (this.user as SsStandardUser).account.createViaApi(),
            StartDate: '2050-12-12'
        }
        return (await this.user.api.create("Contract", data) as RecordResult).id;
    }
}
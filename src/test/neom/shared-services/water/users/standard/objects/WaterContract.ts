import { WaterUser } from "../User"
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";

export class WaterContract extends Sobject implements IsCreatableViaApi{
    constructor(user: WaterUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const recordTypeId = (await this.user.api.query("select id from recordtype where name = 'Water Contract'") as QueryResult<any>).records[0].Id;
        const data = {
            Status: 'Draft',
            Type__c: 'MOU',
            AccountId: await (this.user as WaterUser).account.createViaApi(),
            StartDate: '2050-12-12',
            EndDate: '2051-12-12',
            RecordTypeId: recordTypeId
        }
        return (await this.user.api.create("Contract", data) as RecordResult).id;
    }
}
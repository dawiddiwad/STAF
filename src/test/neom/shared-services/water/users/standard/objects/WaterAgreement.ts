import { WaterUser } from "../User"
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";

export class WaterAgreement extends Sobject implements IsCreatableViaApi{
    constructor(user: WaterUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const recordTypeId = (await this.user.api.query("select id from recordtype where name = 'Water Agreement'") as QueryResult<any>).records[0].Id;
        const data = {
            Type__c: 'NDA',
            Status__c: 'New',
            Account__c: await (this.user as WaterUser).account.createViaApi(),
            RecordTypeId: recordTypeId
        }
        return (await this.user.api.create("Agreement__c", data) as RecordResult).id;
    }
}
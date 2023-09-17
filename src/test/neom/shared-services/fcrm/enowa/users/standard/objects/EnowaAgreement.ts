import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { EnowaUser } from "../User";

export class EnowaAgreement extends Sobject implements IsCreatableViaApi{
    constructor(user: EnowaUser){
        super(user);
    }

    public async createViaApi(accountId?: string, recordTypeId?: string, type?: string, status?: string): Promise<string>{
        const data = {
            Type__c: (type ? type : 'NDA'),
            Status__c: (status ? status : 'New'),
            Account__c: accountId ? accountId : await (this.user as EnowaUser).account.createViaApi(),
            RecordTypeId: recordTypeId ? recordTypeId : (await this.user.api.query("select id from recordtype where name = 'ENOWA Agreement'") as QueryResult<any>).records[0].Id
        }
        return (await this.user.api.create("Agreement__c", data) as RecordResult).id;
    }  
}
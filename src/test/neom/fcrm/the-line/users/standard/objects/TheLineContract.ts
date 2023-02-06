import { TheLineUser } from "../User";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../../utils/common/Sobject";

export class TheLineContract extends Sobject implements IsCreatableViaApi{
    constructor(user: TheLineUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const recordTypeId = (await this.user.api.query("select id from recordtype where name = 'The Line Contract'") as QueryResult<any>).records[0].Id;
        const data = {
            Status: 'Draft',
            Type__c: 'MOU',
            ContractTerm: '12',
            AccountId: await (this.user as TheLineUser).account.createViaApi(),
            StartDate: '2050-12-12',
            RecordTypeId: recordTypeId
        }
        return (await this.user.api.create("Contract", data) as RecordResult).id;
    }
}
import { LpStandardUser } from "../User";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class LpCase extends Sobject implements IsCreatableViaApi{
    constructor(user: LpStandardUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const caseRecordId = (await this.user.api.query("select id from recordtype where name = 'LP Case'") as QueryResult<any>).records[0].Id;
        const caseData = {
            Status: "New",
            Origin: "Email",
            RecordTypeId: caseRecordId
        }
        return (await this.user.api.create("Case", caseData) as RecordResult).id;
    }
}
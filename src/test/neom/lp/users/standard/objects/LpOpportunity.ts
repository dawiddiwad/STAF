import { LpStandardUser } from "../User";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";

export class LpOpportunity extends Sobject implements IsCreatableViaApi{
  constructor(user: LpStandardUser){
      super(user);
  }

  public async createViaApi(): Promise<string>{
    const oppRecordTypeId = (await this.user.api.query("select id from recordtype where name = 'LP - Application'") as QueryResult<any>).records[0].Id;
    const oppData = {
        RecordTypeId: oppRecordTypeId,
        Name: "test-automation-via-api",
        StageName: "New",
        CloseDate: "2030-10-07"
    }
    return (await this.user.api.create("Opportunity", oppData) as RecordResult).id;
  }
}
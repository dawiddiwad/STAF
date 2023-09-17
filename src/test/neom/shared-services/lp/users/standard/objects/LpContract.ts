import { LpStandardUser } from "../User";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";


export class LpContract extends Sobject implements IsCreatableViaApi{
  constructor(user: LpStandardUser){
    super(user);
  }
  
  public async createViaApi(): Promise<string>{
    const conRecordTypeId = (await this.user.api.query("select id from recordtype where name = 'LP Contract'") as QueryResult<any>).records[0].Id;
    const conData = {
        RecordTypeId: conRecordTypeId,
        AccountId: await (this.user as LpStandardUser).account.createViaApi(),
        Status: 'Draft',
        StartDate: '2049-01-01'
    }
    return (await this.user.api.create("Contract", conData) as RecordResult).id;
  }
}
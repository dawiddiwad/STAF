import { SalesforceStandardUser } from "common/SalesforceUsers";

export abstract class SalesforceObject {
    public readonly user: SalesforceStandardUser;

    constructor (user: SalesforceStandardUser){
        this.user = user;
    }
}

export interface IsCreatableViaApi {
    createViaApi: (data?) => Promise<string>
}

export interface IsCreatableViaUi {
    createViaUI: (data?) => Promise<void>
}

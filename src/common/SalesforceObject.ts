import { SalesforceStandardUsers } from "common/SalesforceUsers";

export abstract class SalesforceObject {
    public readonly user: SalesforceStandardUsers;

    constructor (user: SalesforceStandardUsers){
        this.user = user;
    }
}

export interface IsCreatableViaApi {
    createViaApi: (data?) => Promise<string>
}

export interface IsCreatableViaUi {
    createViaUI: (data?) => Promise<void>
}

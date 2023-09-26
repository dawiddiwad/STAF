import { SfdcCtx } from "./context/SfdcCtx";
import { User } from "./User";

/**
 * @deprecated use SalesforceObject
 */
export abstract class Sobject {
    public readonly user: User;

    constructor (user: User){
        this.user = user;
    }
}

export interface IsCreatableViaApi {
    createViaApi: (data?) => Promise<string>
}

export interface IsCreatableViaUi {
    createViaUI: (data?) => Promise<void>
}

export interface IsPathEditOptions {
    status: string, 
    using: SfdcCtx
}
export interface IsHavingPath {
    changePathStageTo: (IsPathEditOptions) => Promise<void>
}

export interface IsConvertableOptions {
    status: string, 
    using: SfdcCtx
}
export interface IsConvertable {
    convertAs: (IsConvertableOptions) => Promise<void>
}

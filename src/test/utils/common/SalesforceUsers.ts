import { Page, chromium, expect } from "@playwright/test";
import { DefaultCliUserInfo, StorageState } from "../auth/Types";
import { SalesforceAuthenticator } from "../auth/SalesforceAuthenticator";
import { SalesforceCliHandler } from "../ci/SalesforceCli";
import { SalesforceNavigator } from "../salesforce/Navigator";
import { SalesforceApi } from "../api/sfdc/SalesforceApi";

export interface SalesforceUserDefinition {
    userData: {}
    permissionSets?: string[]
    arPermissionSets?: string[]
    permissionSetGroups?: string[]
    permissionSetLicenses?: string[]
    lightningDataPurchases?: string[]
    personalGroups?: string[]
    publicGroups?: string[]
    queues?: string[]
}

export class SalesforceDefaultCliUser {
    static _instance: Promise<SalesforceDefaultCliUser>
    authorizationState: StorageState
    info: DefaultCliUserInfo
    ui: Page
    api: SalesforceApi
    Ready: Promise<this>

    private constructor(authenticator: SalesforceAuthenticator){
        this.Ready = new Promise(async (makeReady) => {
            const handler = authenticator.usingCli(new SalesforceCliHandler())
            this.info = await handler.defaultUserData
            this.api = await handler.loginToApi()
            this.ui = await (await (await chromium.launch({headless: true})).newContext()).newPage()
            this.authorizationState = await handler.loginToUi(this.ui);
            makeReady(this)
        })
    }

    static get instance(){
        if(!SalesforceDefaultCliUser._instance){
            return SalesforceDefaultCliUser._instance = 
                new SalesforceDefaultCliUser(new SalesforceAuthenticator()).Ready
        } else return SalesforceDefaultCliUser._instance
    }


    async impersonateCrmUser(salesforceUserId: string): Promise<StorageState> {
        const impersonationUrl = SalesforceNavigator.buildImpersonationUrl({
            instanceUrl: new URL(this.info.result.url).origin,
            orgId: this.info.result.orgId,
            targetUserId: salesforceUserId
        }).toString()
        await this.ui.goto(impersonationUrl, {waitUntil: 'commit'})
        const otherCrmUserStorageData = await this.ui.context().storageState()
        const errorMsg = `something went wrong during impersonation of user ${salesforceUserId}`
        expect(this.authorizationState, errorMsg).not.toEqual(otherCrmUserStorageData)
        return otherCrmUserStorageData
    }
}

export abstract class SalesforceUser {
    static pool: SalesforceUser[]
    authorizationState: StorageState
    ui: Page
    api: SalesforceApi
    Ready: Promise<this>

    constructor(definition: SalesforceUserDefinition){
        this.Ready = new Promise(async (makeReady) => {
            //TODO
        })
    }
}

export class EndUser extends SalesforceUser {
    constructor(){
        const definition = {
            userData: {}
        }
        super(definition)
    }
}

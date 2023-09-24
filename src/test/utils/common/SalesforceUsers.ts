import { Browser, Page, chromium, expect } from "@playwright/test";
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
    private browser: Browser
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
            this.browser = await chromium.launch({headless: true})
            this.ui = await this.browser.newContext().then(context => context.newPage())
            this.authorizationState = await handler.loginToUi(this.ui)
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
        const isolatedPage = await this.browser.newContext().then(context => context.newPage())
        await isolatedPage.context().addCookies(this.authorizationState.cookies)
        await isolatedPage.goto(impersonationUrl, {waitUntil: 'commit'})
        const otherCrmUserStorageData = await isolatedPage.context().storageState()
        await isolatedPage.context().close()
        expect(this.authorizationState, `error impersonating user ${salesforceUserId}`)
            .not.toEqual(otherCrmUserStorageData)
        return otherCrmUserStorageData
    }
}

export abstract class SalesforceUser {
    private static cached: Promise<StorageState>
    ui: Page
    api: SalesforceApi
    Ready: Promise<this>

    constructor(definition: SalesforceUserDefinition){
        this.Ready = new Promise(async (makeReady) => {
            //TODO
        })
    }

    async use(page: Page){
        this.ui = page
        await this.ui.context().addCookies((await SalesforceUser.cached).cookies)
    }
}

export class EndUserExample extends SalesforceUser {
    constructor(definition: SalesforceUserDefinition){
        super(definition)
    }
}

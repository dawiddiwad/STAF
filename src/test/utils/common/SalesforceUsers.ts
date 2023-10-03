import { Browser, Page, chromium } from "@playwright/test";
import { DefaultCliUserInfo, StorageState } from "../auth/Types";
import { SalesforceAuthenticator } from "../auth/SalesforceAuthenticator";
import { SalesforceCliHandler } from "../ci/SalesforceCli";
import { SalesforceNavigator } from "../salesforce/Navigator";
import { SalesforceApi } from "../api/sfdc/SalesforceApi";
import { SOQLBuilder } from "../salesforce/SOQLBuilder";
import { QueryResult } from "jsforce";

export interface SalesforceUserDefinition {
    details?: {}
    permissionSets?: string[]
    unique?: false
    strictPermissions?: false
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
        return otherCrmUserStorageData
    }
}

export abstract class SalesforceStandardUsers {
    private static uniquePool: Set<SalesforceStandardUsers> = new Set()
    private static _cached: Map<string, Promise<StorageState>> = new Map()
    abstract config: SalesforceUserDefinition
    ui: Page
    api: SalesforceApi
    Ready: Promise<this>

    constructor(mods?: SalesforceUserDefinition){
        this.Ready = new Promise(async (makeReady) => {
            const config = {...this.config, ...mods}
            const frontdoor = await SalesforceDefaultCliUser.instance
                .then(instance => instance.info.result.url)
            if (config.strictPermissions){
                //TODO
                throw new Error('strict permissions flow not implementd yet')
            } else if (config.unique){
                //TODO
                throw new Error('unique flow not implemented yet')
            } else {
                const sessionId = (await this.cached).cookies
                    .filter(cookie => cookie.name === 'sid' && 
                        frontdoor.includes(cookie.domain)
                    )[0].value
                const instance = new URL(frontdoor).origin
                const frontDoor = {instance: instance, sessionId: sessionId}
                this.api = await new SalesforceApi(frontDoor).Ready
            }
            makeReady(this)
        })
    }

    get cached() {
        if (!SalesforceStandardUsers._cached.get(this.constructor.name)){
            return SalesforceDefaultCliUser.instance.then(cliUser => {
                const users = new SOQLBuilder().crmUsersMatching(this.config)
                return cliUser.api.query(users).then(result => {
                    const selected = (result as QueryResult<any>).records[0].Id
                    SalesforceStandardUsers.uniquePool.add(selected)
                    SalesforceStandardUsers._cached.set(this.constructor.name, cliUser.impersonateCrmUser(selected))
                    return SalesforceStandardUsers._cached.get(this.constructor.name)
                })
            })
        } else return SalesforceStandardUsers._cached.get(this.constructor.name)
    }

    async use(browser: Browser): Promise<this> {
        const context = await browser.newContext()
        await context.addCookies((await this.cached).cookies)
        this.ui = await context.newPage()
        return this
    }
}

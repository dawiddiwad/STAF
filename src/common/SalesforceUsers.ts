import { Browser, Page, chromium, expect } from "@playwright/test";
import { DefaultCliUserInfo, StorageState } from "auth/AuthorizationTypes";
import { SalesforceAuthenticator } from "auth/SalesforceAuthenticator";
import { SalesforceCliHandler } from "cli/SalesforceCli";
import { SalesforceNavigator } from "common/SalesforceNavigator";
import { SalesforceApi } from "api/SalesforceApi";
import { SOQLBuilder } from "common/SOQLBuilder";
import { SalesforceId } from "jsforce";

export interface PermissionSetAssignment {
    Assignee: {
        Id: string
        Name: string
    }
    PermissionSet: {
        Name: string
    }
}
export interface SalesforceUserDefinition {
    details?: {}
    permissionSets?: string[]
    strictPermissionSets?: boolean
}

export class SalesforceDefaultCliUser {
    static _instance: Promise<SalesforceDefaultCliUser>
    private browser: Browser
    private Ready: Promise<this>
    authorizationState: StorageState
    info: DefaultCliUserInfo
    ui: Page
    api: SalesforceApi

    private constructor(authenticator: SalesforceAuthenticator){
        this.Ready = new Promise(async (makeReady) => {
            try {
                const handler = authenticator.usingCli(new SalesforceCliHandler())
                this.api = await handler.loginToApi()
                this.browser = await chromium.launch({headless: true})
                this.ui = await this.browser.newContext().then(context => context.newPage())
                this.authorizationState = await handler.loginToUi(this.ui)
                this.info = await handler.defaultUserData
                makeReady(this)
            } catch (error) {
                throw new Error(`unable to initialize default cli user\ndue to:\n${error}`)
            }
        })
    }

    static get instance(){
        if(!SalesforceDefaultCliUser._instance){
            return SalesforceDefaultCliUser._instance = 
                new SalesforceDefaultCliUser(new SalesforceAuthenticator()).Ready
        } else return SalesforceDefaultCliUser._instance
    }


    async impersonateCrmUser(salesforceUserId: string): Promise<StorageState> {
        if (!salesforceUserId){
            throw new Error('salesforceUserId must be defined for impersonation')
        }
        const impersonationUrl = SalesforceNavigator.buildImpersonationUrl({
            instanceUrl: new URL(this.info.result.url).origin,
            orgId: this.info.result.orgId,
            targetUserId: salesforceUserId
        }).toString()
        const isolatedPage = await this.browser.newContext().then(context => context.newPage())
        await isolatedPage.context().addCookies(this.authorizationState.cookies)
        await isolatedPage.goto(impersonationUrl, {waitUntil: 'commit'})
        await expect(isolatedPage.getByText('Logged in as'), {message: 'sucesfully logged in as other user'}).toBeVisible()
        const otherCrmUserStorageData = await isolatedPage.context().storageState()
        await isolatedPage.context().close()
        return otherCrmUserStorageData
    }
}

export abstract class SalesforceStandardUser {
    private static _cached: Map<string, Promise<StorageState>> = new Map()
    abstract config: SalesforceUserDefinition
    ui: Page
    api: SalesforceApi
    Ready: Promise<this>

    constructor(mods?: SalesforceUserDefinition){
        this.Ready = new Promise(async (makeReady) => {
            try {
                this.config = {...this.config, ...mods}
                const frontdoor = await SalesforceDefaultCliUser.instance
                    .then(instance => instance.info.result.url)
                const sessionId = (await this.cached).cookies
                    .filter(cookie => cookie.name === 'sid' && 
                        frontdoor.includes(cookie.domain)
                    )[0].value
                const instance = new URL(frontdoor).origin
                const frontDoor = {instance: instance, sessionId: sessionId}
                this.api = await new SalesforceApi(frontDoor).Ready
                makeReady(this)
            } catch (error) {
                throw new Error(`unable to initialize salesforce user type '${this.constructor.name}' with following configuration:
                    \n${JSON.stringify(this.config, null, 3)}
                    \ndue to:\n${error}`)
            }
        })
    }

    get cached() {
        if (!SalesforceStandardUser._cached.get(this.constructor.name)){
            return SalesforceDefaultCliUser.instance.then(cliUser => {
                return this.getUserIdMatchingConfig().then(userId => {
                    SalesforceStandardUser._cached.set(this.constructor.name, cliUser.impersonateCrmUser(userId))
                    return SalesforceStandardUser._cached.get(this.constructor.name)
                })
            })
        } else return SalesforceStandardUser._cached.get(this.constructor.name)
    }

    async use(browser: Browser): Promise<this> {
        const context = await browser.newContext()
        await context.addCookies((await this.cached).cookies)
        this.ui = await context.newPage()
        return this
    }

    private async getUserIdMatchingConfig(): Promise<SalesforceId> {
        const queryResults = await SalesforceDefaultCliUser.instance
            .then(cliUser => cliUser.api.query(new SOQLBuilder().crmUsersMatching(this.config))
                .then(results => results.records as unknown as PermissionSetAssignment[]))

        const matchingUsers = new Set<string>()

        queryResults.forEach(candidate => {
            const candidateAssignment = queryResults
                .filter(target => target.Assignee.Id === candidate.Assignee.Id)
                .map(target => target.PermissionSet.Name)

            const matchesUserConfig = (assignment: string[]) => {
                const includesAll = (source: string[], matching: string[]) =>
                    matching.every(value => source.includes(value))
                const defaultProfileAssignment = 1
                const noPermissionSets = (!this.config.permissionSets && !this.config.strictPermissionSets)
                const noPermissionSetsStrict = (!this.config.permissionSets && this.config.strictPermissionSets
                    && assignment.length === defaultProfileAssignment)
                const permissionSetsDefined = (this.config.permissionSets && !this.config.strictPermissionSets
                    && includesAll(assignment, this.config.permissionSets)
                    && assignment.length >= this.config.permissionSets.length + defaultProfileAssignment)
                const permissionSetsDefinedAndStrict = (this.config.permissionSets && this.config.strictPermissionSets
                    && includesAll(assignment, this.config.permissionSets)
                    && assignment.length === this.config.permissionSets.length + defaultProfileAssignment)
                return noPermissionSets || noPermissionSetsStrict || permissionSetsDefined || permissionSetsDefinedAndStrict
            }

            if (matchesUserConfig(candidateAssignment)) {
                matchingUsers.add(candidate.Assignee.Id)
            }
        })

        if (!matchingUsers.size) {
            throw new Error(`could not find any matching users`)
        } else {
            return [...matchingUsers][0]
        }
    }
}

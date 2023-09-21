import { Page } from "@playwright/test"
import { SalesforceCliHandler } from "../ci/SalesforceCli"
import { SalesforceNavigator } from "../salesforce/Navigator"
import { SalesforceApi } from "../api/sfdc/SalesforceApi"

class CliDefaultUserHandler implements UiGateway, ApiGateway{
    private cliHandler: SalesforceCliHandler
    private frontdoorData: SalesforceFrontdoorData
    private _defaultUserData: Promise<DefaultCliUserInfo>
    constructor(cliHandler: SalesforceCliHandler){
        this.cliHandler = cliHandler
    }
    storageState: StorageState

    private get defaultUserData() {
        try {
            if (!this._defaultUserData){
                this._defaultUserData = this.cliHandler.exec({
                    cmd: 'org open',
                    f: ['--json', '-r']
                }) as unknown as Promise<DefaultCliUserInfo>
            }
        } catch (error) {
            throw new Error(`unable to parse data for default cli user\ndata recieved: ${JSON.stringify(this.defaultUserData)}\ndue to:\n${error}`);
        } finally {
            return this._defaultUserData
        }
    }
    

    private async parseFrontDoorData(): Promise<SalesforceFrontdoorData> {
        const loginUrl = new URL((await this.defaultUserData).result.url)
        return {
            instance: new URL(loginUrl.origin),
            sessionId: loginUrl.searchParams.get(SalesforceNavigator.SESSIONID_PARAM)
        }
    }

    async loginToUi(page: Page): Promise<StorageState> {
        await page.goto((await this.defaultUserData).result.url)
        return await page.context().storageState()
    }

    async loginToApi(): Promise<SalesforceApi> {
        return await new SalesforceApi(await this.parseFrontDoorData()).Ready
    }
}

class CredentialsHandler implements UiGateway, ApiGateway{
    private credentials: UsernamePassword
    instance: URL
    constructor(credentials: UsernamePassword, instance: SalesforceInstance){
        this.credentials = credentials
        switch (instance) {
            case 'PRODUCTION':
                this.instance = SalesforceNavigator.PRODUCTION_LOGIN_URL
                break;
            case 'SANDBOX':
                this.instance = SalesforceNavigator.SANDBOX_LOGIN_URL
                break;
            default:
                this.instance = instance
        }
    }
  storageState: StorageState

    async loginToUi(): Promise<StorageState> {
        throw new Error("Method not implemented.")
    }
    async loginToApi() {
        throw new Error("Method not implemented.")
    }
}

class SessionIdHandler implements UiGateway, ApiGateway{
    private frontdoorData: SalesforceFrontdoorData
    constructor(frontdoorData: SalesforceFrontdoorData){
        this.frontdoorData = frontdoorData
    }

    async loginToUi(page: Page): Promise<StorageState> {
        const loginUrl = SalesforceNavigator.buildLoginUrl(this.frontdoorData)
        await page.goto(loginUrl.toString())
        return await page.context().storageState()
    }
    async loginToApi() {
        throw new Error("Method not implemented.")
    }
}

export class SalesforceAuthenticator {
    usingSessionId = (data: SalesforceFrontdoorData) => new SessionIdHandler(data)
    usingCli = (handler: SalesforceCliHandler) => new CliDefaultUserHandler(handler)
    usingCredentials = (credentials: UsernamePassword, instance: SalesforceInstance) => new CredentialsHandler(credentials, instance)
}

export type SalesforceInstance = 
    'SANDBOX' | 'PRODUCTION' | URL

export type UsernamePassword = {
    username: string,
    password: string
}

export type StorageState = {
  cookies: { 
    name: string; 
    value: string; 
    url?: string; 
    domain?: string; 
    path?: string; 
    expires?: number; 
    httpOnly?: boolean; 
    secure?: boolean; 
    sameSite?: "Strict" | "Lax" | "None"; }[],
  origins: {}[]
}

export type DefaultCliUserInfo = {
    status: number,
    result: {
        orgId: string,
        url: string,
        username: string
    },
    warnings: string[]
}

export type SalesforceFrontdoorData = {
    sessionId: string,
    instance: URL
}

export type UiGateway = {
    loginToUi(page: Page): Promise<StorageState>
}

export type ApiGateway = {
    loginToApi()
}
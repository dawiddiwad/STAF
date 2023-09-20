import { Page } from "@playwright/test"
import { SalesforceCliHandler } from "../ci/SfdxExecutor"
import { SalesforceNavigator } from "../salesforce/Navigator"

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

export type SalesforceFrontdoorData = {
    sessionId: string,
    instance: URL
}

export type FrontendAuthenticator = {
    loginToFrontend(page: Page): Promise<StorageState>
}

export type BackendAuthenticator = {
    loginToBackend(): Promise<void>
}

export class SalesforceCli implements FrontendAuthenticator, BackendAuthenticator{
    private cliHandler: SalesforceCliHandler
    private frontdoorData: SalesforceFrontdoorData
    constructor(cliHandler: SalesforceCliHandler){
        this.cliHandler = cliHandler
    }
  storageState: StorageState

    async loginToFrontend(): Promise<StorageState> {
        throw new Error("Method not implemented.")
    }
    async loginToBackend() {
        throw new Error("Method not implemented.")
    }
}

export class Credentials implements FrontendAuthenticator, BackendAuthenticator{
    private credentials: UsernamePassword
    instance: URL
    constructor(credentials: {username: string, password: string}, instance: 'SANDBOX' | 'PRODUCTION' | URL){
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

    async loginToFrontend(): Promise<StorageState> {
        throw new Error("Method not implemented.")
    }
    async loginToBackend() {
        throw new Error("Method not implemented.")
    }
}

export class SessionId implements FrontendAuthenticator, BackendAuthenticator{
    private frontdoorData: SalesforceFrontdoorData
    constructor(frontdoorData: {sessionId: string, instance: URL}){
        this.frontdoorData = frontdoorData
    }

    async loginToFrontend(page: Page): Promise<StorageState> {
        const loginUrl = SalesforceNavigator.buildLoginUrl(this.frontdoorData)
        await page.goto(loginUrl.toString())
        return await page.context().storageState()
    }
    async loginToBackend() {
        throw new Error("Method not implemented.")
    }
}

export class SalesforceAuthenticator {
    storageState: StorageState

    async loginToFrontendBy(authorizationMethod: FrontendAuthenticator, page: Page){
      this.storageState = await authorizationMethod.loginToFrontend(page);
    }
    async loginToBackendBy(authorizationMethod: BackendAuthenticator){
      await authorizationMethod.loginToBackend()
    }
}
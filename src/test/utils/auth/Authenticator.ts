import { Page } from "@playwright/test"
import { SfdxExecutor } from "../ci/SfdxExecutor"
import { SalesforceNavigator } from "../salesforce/Navigator"

export type UsernamePassword = {
    username: string,
    password: string
}

export type SalesforceFrontdoorData = {
    sessionId: string,
    instance: URL
}

export type FrontendAuthenticator = {
    loginToFrontend(page: Page): Promise<void>
}

export type BackendAuthenticator = {
    loginToBackend(args: any): Promise<void>
}

export class BySfdx implements FrontendAuthenticator, BackendAuthenticator{
    private sfdxExecutor: SfdxExecutor
    private frontdoorData: SalesforceFrontdoorData
    constructor(sfdxExecutor: SfdxExecutor){
        this.sfdxExecutor = sfdxExecutor
    }

    async loginToFrontend() {
        throw new Error("Method not implemented.")
    }
    async loginToBackend() {
        throw new Error("Method not implemented.")
    }
}

export class ByUsernamePassword implements FrontendAuthenticator, BackendAuthenticator{
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

    async loginToFrontend() {
        throw new Error("Method not implemented.")
    }
    async loginToBackend() {
        throw new Error("Method not implemented.")
    }
}

export class BySessionId implements FrontendAuthenticator, BackendAuthenticator{
    private frontdoorData: SalesforceFrontdoorData
    constructor(frontdoorData: {sessionId: string, instance: URL}){
        this.frontdoorData = frontdoorData
    }

    async loginToFrontend(page: Page) {
        const loginUrl = SalesforceNavigator.buildLoginUrl(this.frontdoorData)
        await page.goto(loginUrl.toString())
    }
    async loginToBackend() {
        throw new Error("Method not implemented.")
    }
}

export class SalesforceAuthenticator {
    handler: BySfdx | BySessionId | ByUsernamePassword

    constructor(method: BySfdx | BySessionId | ByUsernamePassword){
        this.handler = method
    }
}
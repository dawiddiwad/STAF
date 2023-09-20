import { SfdxExecutor } from "../ci/SfdxExecutor"

export type UsernamePassword = {
    username: string,
    password: string
}

export type SalesforceFrontdoorData = {
    sessionId: string,
    instance: URL
}

export type FrontendAuthenticator = {
    loginToFrontend(): Promise<void>
}

export type BackendAuthenticator = {
    loginToBackend(): Promise<void>
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
                this.instance = new URL('https://login.salesforce.com/')
                break;
            case 'SANDBOX':
                this.instance = new URL('https://test.salesforce.com/')
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

    async loginToFrontend() {
        throw new Error("Method not implemented.")
    }
    async loginToBackend() {
        throw new Error("Method not implemented.")
    }
}

export class SalesforceAuthenticator {
    authMethod: BySfdx | BySessionId | ByUsernamePassword

    constructor(authMethod: BySfdx | BySessionId | ByUsernamePassword){
        this.authMethod = authMethod
    }
}
import { SfdxExecutor } from "../ci/SfdxExecutor"

export type UsernamePassword = {
    usenrname: string,
    password: string
}

export type UiAuthenticator = {
    loginToApi(): Promise<void>
}

export type ApiAuthenticator = {
    loginToApi(): Promise<void>
}

export class BySfdx{
    sfdxExecutor: SfdxExecutor 
    constructor(sfdxExecutor: SfdxExecutor){
        this.sfdxExecutor = sfdxExecutor
    }
}

export class ByUsernamePassword{
    credentials: UsernamePassword
    constructor(credentials: UsernamePassword){
        this.credentials = credentials
    }
}

export class BySessionId{
    sessionId: string
    constructor(sessionId: string){
        this.sessionId = sessionId
    }
}

export class SalesforceAuthenticator implements UiAuthenticator, ApiAuthenticator {
    authMethod: BySfdx | BySessionId | ByUsernamePassword
    sessionId: string
    Ready: Promise<this>

    constructor(authMethod: BySfdx | BySessionId | ByUsernamePassword){
        this.authMethod = authMethod
        this.Ready = new Promise(async (makeReady) => {
            if (this.authMethod instanceof BySfdx){
                this.sessionId = await this.getSessionIdBySFDX(this.authMethod.sfdxExecutor)
            } else if (this.authMethod instanceof ByUsernamePassword){
                this.sessionId = await this.getSessionIdBySOAP(this.authMethod.credentials)
            } else {
                this.sessionId = await this.authMethod.sessionId
            }
            makeReady(this);
        })
    }

    async loginToUi() {
        throw new Error("Method not implemented.")
    }
    async loginToApi() {
        throw new Error("Method not implemented.")
    }

    private getSessionIdBySFDX(sfdxExecutor: SfdxExecutor): Promise<string> {
        throw new Error('method not implemented!')
    }

    private getSessionIdBySOAP(credentials: UsernamePassword): Promise<string> {
        throw new Error('method not implemented!')
    }
}
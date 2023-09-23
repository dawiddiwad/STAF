import { Page } from "@playwright/test"
import { SalesforceCliHandler } from "../ci/SalesforceCli"
import { SalesforceNavigator } from "../salesforce/Navigator"
import { SalesforceApi } from "../api/sfdc/SalesforceApi"
import { ApiGateway, DefaultCliUserInfo, SalesforceFrontdoorData, SalesforceInstance, StorageState, UiGateway, UsernamePassword } from "./Types"
import { SalesforceLoginPage } from "../common/pages/SalesforceLogin"

class storageStateHandler implements UiGateway {
    private storageState: StorageState

    constructor(storageState: StorageState){
        this.storageState = storageState
    }

    async loginToUi(page: Page): Promise<StorageState> {
        await page.context().addCookies(this.storageState.cookies)
        return this.storageState
    }
}

class DefaultCliUserHandler implements UiGateway, ApiGateway{
    private cli: SalesforceCliHandler
    _defaultUserData: Promise<DefaultCliUserInfo>

    constructor(cliHandler: SalesforceCliHandler){
        this.cli = cliHandler
    }

    get defaultUserData() {
        try {
            if (!this._defaultUserData){
                this._defaultUserData = this.cli.exec({
                    cmd: 'org open',
                    f: ['--json', '-r']
                }) as unknown as Promise<DefaultCliUserInfo>
            }
        } catch (error) {
            throw new Error(`unable to parse data for default cli user
                \ndata recieved: ${JSON.stringify(this.defaultUserData)}
                \ndue to:
                \n${error}`);
        }
        return this._defaultUserData
    }
    

    private async parseFrontDoorData(): Promise<SalesforceFrontdoorData> {
        const loginUrl = new URL((await this.defaultUserData).result.url)
        return {
            instance: new URL(loginUrl.origin),
            sessionId: loginUrl.searchParams.get(SalesforceNavigator.SESSIONID_PARAM)
        }
    }

    async loginToUi(page: Page): Promise<StorageState> {
        await page.goto((await this.defaultUserData).result.url, {waitUntil: 'commit'})
        return await page.context().storageState()
    }

    async loginToApi(): Promise<SalesforceApi> {
        return await new SalesforceApi(await this.parseFrontDoorData()).Ready
    }
}

class CredentialsHandler implements UiGateway {
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

    async loginToUi(page: Page): Promise<StorageState> {
        return new SalesforceLoginPage(page, this.instance)
            .loginUsing(this.credentials)
    }
}

class SessionIdHandler implements UiGateway, ApiGateway{
    private frontDoor: SalesforceFrontdoorData

    constructor(frontDoor: SalesforceFrontdoorData){
        this.frontDoor = frontDoor
    }

    async loginToUi(page: Page): Promise<StorageState> {
        const loginUrl = SalesforceNavigator.buildLoginUrl(this.frontDoor)
        await page.goto(loginUrl.toString())
        return await page.context().storageState()
    }
    
    async loginToApi(): Promise<SalesforceApi> {
        return await new SalesforceApi(this.frontDoor).Ready
    }
}

export class SalesforceAuthenticator {
    usingStorageState = (data: StorageState) => 
        new storageStateHandler(data)
    usingSessionId = (data: SalesforceFrontdoorData) => 
        new SessionIdHandler(data)
    usingCli = (handler: SalesforceCliHandler) => 
        new DefaultCliUserHandler(handler)
    usingCredentials = (credentials: UsernamePassword, instance: SalesforceInstance) => 
        new CredentialsHandler(credentials, instance)
}

import { Page } from "@playwright/test"
import { SalesforceCliHandler } from "cli/SalesforceCli"
import { SalesforceNavigator } from "common/SalesforceNavigator"
import { ApiGateway, DefaultCliUserInfo, SalesforceFrontdoorData, SalesforceInstance, StorageState, UiGateway, UsernamePassword } from "auth/AuthorizationTypes"
import { SalesforceLoginPage } from "common/pages/SalesforceLoginPage"
import { RestHandler } from "api/rest-handler"

class DefaultCliUserHandler implements UiGateway, ApiGateway{
    private cli: SalesforceCliHandler
    _defaultUserData: Promise<DefaultCliUserInfo>

    constructor(cliHandler: SalesforceCliHandler){
        this.cli = cliHandler
    }

    get defaultUserData() {
        if (!this._defaultUserData){
            this._defaultUserData = this.cli.exec({
                cmd: 'org open',
                f: ['--json', '-r']
            }) as unknown as Promise<DefaultCliUserInfo>
        }
        return this._defaultUserData
    }
    

    private async parseFrontDoorData(): Promise<SalesforceFrontdoorData> {
        const loginUrl = new URL((await this.defaultUserData).result.url)
        return {
            instance: loginUrl.origin,
            sessionId: loginUrl.searchParams.get(SalesforceNavigator.SESSIONID_PARAM)
        }
    }

    async loginToUi(page: Page): Promise<StorageState> {
        await page.goto((await this.defaultUserData).result.url, {waitUntil: 'commit'})
        return page.context().storageState()
    }

    async loginToApi(): Promise<RestHandler> {
        return new RestHandler(await this.parseFrontDoorData()).ready
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

export class SalesforceAuthenticator {
    usingCli = (handler: SalesforceCliHandler) => 
        new DefaultCliUserHandler(handler)
    usingCredentials = (credentials: UsernamePassword, instance: SalesforceInstance) => 
        new CredentialsHandler(credentials, instance)
}

import { Page } from "@playwright/test";
import { StorageState, UsernamePassword } from "auth/AuthorizationTypes";
import { SalesforcePage } from "./SalesforcePage";

export class SalesforceLoginPage extends SalesforcePage {
    readonly instance: URL
    readonly username = this.ui.getByLabel('Username')
    readonly password = this.ui.getByLabel('Password')
    readonly loginButton = this.ui.getByRole('button').getByText('Log In')

    constructor(page: Page, instance: URL){
        super(page)
        this.instance = instance
    }

    async loginUsing(credentials: UsernamePassword): Promise<StorageState> {
        await this.ui.goto(this.instance.toString())
        await this.username.fill(credentials.username)
        await this.password.fill(credentials.password)
        await this.loginButton.click()
        return this.ui.context().storageState()
    }
}
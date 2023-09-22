import { Page } from "@playwright/test";
import { AbstractPage } from "./Abstract";
import { StorageState, UsernamePassword } from "test/utils/auth/Types";

export class SalesforceLoginPage extends AbstractPage {
    readonly instance: URL
    readonly username = this.page.getByLabel('Username')
    readonly password = this.page.getByLabel('Password')
    readonly loginButton = this.page.getByRole('button').getByText('Log In')

    constructor(page: Page, instance: URL){
        super(page)
        this.instance = instance
    }

    async loginUsing(credentials: UsernamePassword): Promise<StorageState> {
        await this.page.goto(this.instance.toString())
        await this.username.fill(credentials.username)
        await this.password.fill(credentials.password)
        await this.loginButton.click()
        return this.page.context().storageState()
    }
}
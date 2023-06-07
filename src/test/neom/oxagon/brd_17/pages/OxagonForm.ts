import { APIResponse, Page, expect } from "@playwright/test";
export abstract class OxagonForm {
    private authUrl: string;
    protected page: Page;
    protected baseUrl: string;
    protected abstract readonly path: string;
    constructor(page: Page) {
        this.page = page;
        this.baseUrl = 'https://staging.neom.com/en-us/oxagon-form';
        this.authUrl = 'https://staging.neom.com/libs/granite/core/content/login.html?resource=%2Fcontent%2Fneom%2Fen-us%2Foxagon-form&$$login$$=%24%24login%24%24&j_reason=unknown&j_reason_code=unknown';
    }

    public async login() {
        await this.page.goto(this.authUrl);
        await this.page.getByText('Sign in locally (admin tasks only)').click();
        await this.page.getByPlaceholder('User name').fill('generic-user');
        await this.page.getByPlaceholder('Password', { exact: true }).fill('l9tE=0');
        await this.page.getByRole('button', { name: 'Sign In', exact: true }).click();
    }

    public async openForm() {
        await this.page.goto(`${this.baseUrl}/${this.path}`);
    }
}
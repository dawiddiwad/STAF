import { APIResponse, Page, expect } from "@playwright/test";
export abstract class OxagonForm {
    private authUrl: string;
    protected page: Page;
    protected baseUrl: string;
    protected abstract readonly path: string;
    constructor(page: Page) {
        this.page = page;
        this.baseUrl = 'https://staging.neom.com/en-us/oxagon-form';
        this.authUrl = 'https://staging.neom.com/libs/granite/core/content/login.html/j_security_check';
    }

    public async login() {
        expect((await this.page.request.post(this.authUrl, {
            params: {
                _charset_: 'utf-8',
                j_username: 'generic-user',
                j_password: 'l9tE=0',
                j_validate: true
            }
        }) as APIResponse).status()).toBe(200);
    }

    public async openForm() {
        await this.page.goto(`${this.baseUrl}/${this.path}`);
    }
}
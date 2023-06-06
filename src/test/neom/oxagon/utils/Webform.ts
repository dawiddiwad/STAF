import { APIResponse, Page, expect } from "@playwright/test";
export class Webform {
    private page: Page;
    private baseUrl = 'https://staging.neom.com/en-us/oxagon-form';
    private researchUrl = `${this.baseUrl}/research`;
    constructor(page: Page) {
        this.page = page;
    }

    public async login() {
        expect((await this.page.request.post('https://staging.neom.com/libs/granite/core/content/login.html/j_security_check', {
            params: {
                _charset_: 'utf-8',
                j_username: 'generic-user',
                j_password: 'l9tE=0',
                j_validate: true
            }
        }) as APIResponse).status()).toBe(200);
    }

    public async openForm(form: 'research & innovation') {
        switch (form) {
            case 'research & innovation':
                await this.page.goto(this.researchUrl);
                break;
        }
    }
}
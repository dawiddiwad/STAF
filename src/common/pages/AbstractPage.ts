import { Page } from "@playwright/test";

export abstract class AbstractPage {
    public ui: Page

    constructor(page: Page) {
        this.ui = page
    }

    public async scrollPageBottomTop(){
        await this.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await this.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
    }

    public async scrollPageTopBottom(){
        await this.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
        await this.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    }
}
import { Page, TestInfo } from "@playwright/test";

export abstract class AbstractPage {
    public ui: Page

    constructor(page: Page) {
        this.ui = page
    }

    public async attachScreenshotToTestInfo(screenshot: Buffer, testInfo: TestInfo){
        await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' })
    }

    public async captureScreenshot(options: {fullPage?: boolean}): Promise<Buffer>{
        await this.ui.waitForLoadState('networkidle')
        return this.ui.screenshot({fullPage: options.fullPage});
    }

    public async captureFullPageScreenshot(): Promise<Buffer>{
        await this.ui.waitForLoadState('networkidle')
        await this.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await this.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
        return this.captureScreenshot({fullPage: true})
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
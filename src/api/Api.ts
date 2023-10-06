import { Page, TestInfo } from "@playwright/test"

export abstract class Api {
    testInfo: TestInfo
    abstract Ready: Promise<Api>

    protected async captureScreenshot(options: {page: Page, fullPage?: boolean}){
        await options.page.waitForLoadState('networkidle')
        const screenshot = await options.page.screenshot({fullPage: options.fullPage});
        await this.testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' })
    }

    protected async captureFullPageScreenshot(page: Page){
        await page.waitForLoadState('networkidle')
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
        await this.captureScreenshot({page: page, fullPage: true})
    }
}
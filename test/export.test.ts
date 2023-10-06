import { chromium } from "@playwright/test";
import { SalesforceLoginPage } from "../dist/index";

test('export / import works correctly', async () => {
    const page = await chromium.launch({headless: true})
        .then(chrome => chrome.newContext()
            .then(context => context.newPage()))
    const url = new URL('https://test.com')        
    expect(new SalesforceLoginPage(page, url).loginButton).not.toBeNull()
    await page.context().browser().close()
})
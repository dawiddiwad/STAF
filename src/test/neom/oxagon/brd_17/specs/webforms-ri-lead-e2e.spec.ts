import test, { expect } from "@playwright/test";
import { AdminUser } from "../../../common/users/AdminUser";
import { ResearchAndInnovationPage } from "../pages/ResearchAndInnovationPage";

test.use({ video: 'on', screenshot: 'off' });
test.describe('@ui @e2e @oxagon @brd17 @webform @rilead', () => {
    test('create Research & Innovation Lead via Webform', async ({ page }) => {
        const admin = await (new AdminUser()).Ready
        const webform = new ResearchAndInnovationPage(page);
        await test.step('login to webform', async () => {
            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.FIRST_NAME.fill(webform.data.FirstName);
            await webform.LAST_NAME.fill(webform.data.LastName);
            await webform.EMAIL.fill(webform.data.Email);
            await webform.PHONE.fill(webform.data.Phone);
            await webform.LOCATION.selectOption(webform.data.GlobalHQLocation__c);
            await webform.COMPANY_NAME.fill(webform.data.Company);
            await webform.COMPANY_WEBSITE.fill(webform.data.Website);
            await webform.JOB_TITLE.selectOption(webform.data.JobTitle__c);
            await webform.CONSENT_YES_CHECKBOX.click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Company Type page', async () => {
            await webform.COMPANY_TYPES.filter({ hasText: webform.data.CompanyType__c }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Areas Of Interest page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: webform.data.SingleInterest__c.replace(/and/gm, '&') }).click();
        });

        await test.step('submit contact form', async () => {
            await webform.SUBMIT_BUTTON.click();
            await expect(webform.THANK_YOU_MESSAGE).toBeVisible();
        });

        await test.step('run BigQuery import and find a Lead in Salesforce', async () => {
            await webform.importLeadFromBigQueryAs(admin);
        });

        await test.step('assert that Lead was imported correctly', async () => {
            const importedLead = await admin.api.read('Lead', webform.data.Id);
            expect(webform.data).toMatchObject(importedLead);
        });
    })
});
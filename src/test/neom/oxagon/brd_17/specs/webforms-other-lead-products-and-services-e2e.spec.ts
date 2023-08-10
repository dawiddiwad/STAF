import test, { expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { AdminUser } from "../../../common/users/AdminUser";
import { ProdcutsAndServicesPage } from "../pages/ProdcutsAndServicesPage";

test.use({ video: 'on', screenshot: 'off' });
test.describe.parallel('@ui @e2e @oxagon @brd17 @webform @otherlead @products @services', () => {
    test('create Other Lead via \'Products and Services\' webform - \'Other\' investment', async ({ page }) => {
        const admin = await (new AdminUser()).Ready
        const webform = new ProdcutsAndServicesPage(page);
        webform.data = {
            ...webform.data,
            SingleInterest__c: 'Other',
            Interest__c: 'Other',
            SpecifyOtherAreaofInterest__c: faker.lorem.word({length: {min: 5, max: 10}}),
        }
        await test.step('login to webform', async () => {
            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillContactAndCompanyDetails();
        });

        await test.step('fill out Additional Information page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: webform.data.SingleInterest__c }).click();
            await webform.EXPLAIN_YOUR_CHOICE.fill(webform.data.SpecifyOtherAreaofInterest__c);
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.fillBrandInformation();
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
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
    test('create Other Lead via \'Products and Services\' webform - \'Banking & financial services\' investment', async ({ page }) => {
        const admin = await (new AdminUser()).Ready
        const webform = new ProdcutsAndServicesPage(page);
        webform.data = {
            ...webform.data,
            SingleInterest__c: 'Banking and Financial Services',
            Interest__c: 'Banking and Financial Services',
            SpecifyOtherAreaofInterest__c: null
        }
        await test.step('login to webform', async () => {

            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillContactAndCompanyDetails();
        });

        await test.step('fill out Areas Of Interest page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: webform.data.SingleInterest__c.replace(/and/gm, '&') }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.fillBrandInformation();
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
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
    test('create Other Lead via \'Products and Services\' webform - \'Commercial (professional services)\' investment', async ({ page }) => {
        const admin = await (new AdminUser()).Ready
        const webform = new ProdcutsAndServicesPage(page);
        webform.data = {
            ...webform.data,
            SingleInterest__c: 'Commercial (Professional Services)',
            Interest__c: 'Commercial (Professional Services)',
            SpecifyOtherAreaofInterest__c: null
        }
        await test.step('login to webform', async () => {

            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillContactAndCompanyDetails();
        });

        await test.step('fill out Areas Of Interest page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: webform.data.SingleInterest__c.replace(/and/gm, '&') }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.fillBrandInformation();
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
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
    test('create Other Lead via \'Products and Services\' webform - \'Hospitality, food & beverage\' investment', async ({ page }) => {
        const admin = await (new AdminUser()).Ready
        const webform = new ProdcutsAndServicesPage(page);
        webform.data = {
            ...webform.data,
            SingleInterest__c: 'Hospitality Food and Beverage',
            Interest__c: 'Hospitality Food and Beverage',
            SpecifyOtherAreaofInterest__c: null
        }
        await test.step('login to webform', async () => {

            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillContactAndCompanyDetails();
        });

        await test.step('fill out Areas Of Interest page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: webform.data.SingleInterest__c.substring(0, 5) }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.fillBrandInformation();
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
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
    test('did not create Other Lead via \'Products and Services\' webform - \'Retail\' investment', async ({ page }) => {
        const admin = await (new AdminUser()).Ready
        const webform = new ProdcutsAndServicesPage(page);
        webform.data = {
            ...webform.data,
            SingleInterest__c: 'Retail',
            Interest__c: 'Retail',
            SpecifyOtherAreaofInterest__c: null
        }
        await test.step('login to webform', async () => {

            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillContactAndCompanyDetails();
        });

        await test.step('fill out Areas Of Interest page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: webform.data.SingleInterest__c.replace(/and/gm, '&')}).filter({hasNotText: 'stores'}).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.fillBrandInformation();
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
            await webform.SUBMIT_BUTTON.click();
            await expect(webform.THANK_YOU_MESSAGE).toBeVisible();
        });

        await test.step('run BigQuery import and find a Lead in Salesforce', async () => {
            await webform.importLeadFromBigQueryAs(admin);
        });

        await test.step('assert that Lead was imported correctly', async () => {
            const importedLead = await admin.api.read('Lead', webform.data.Id);
            expect(importedLead.recordTypeName__c).not.toEqual(webform.data.RecordTypeName__c);
        });
    })
});
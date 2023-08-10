import test, { expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { AdminUser } from "../../../common/users/AdminUser";
import { BigQuery } from "../utils/BigQuery";
import { InvestInOxagonPage } from "../pages/InvestInOxagonPage";

test.use({ video: 'on', screenshot: 'off' });
test.describe.parallel('@ui @e2e @oxagon @brd17 @webform @otherlead @invest', () => {
    test('create Other Lead via \'Invest in Oxagon\' webform - \'Other\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: InvestInOxagonPage;
        const testData = {
            ...InvestInOxagonPage.getCommonData(),
            SingleInterest__c: 'Other',
            Interest__c: 'Other',
            Description: faker.lorem.word({length: {min: 5, max: 10}}),
            SpecifyOtherAreaofInterest__c: faker.lorem.word({length: {min: 5, max: 10}}),
        }
        await test.step('login to webform', async () => {
            webform = new InvestInOxagonPage(page);
            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillDetailsPageWith(testData);
        });

        await test.step('fill out Additional Information page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c }).click();
            await webform.EXPLAIN_YOUR_CHOICE.fill(testData.SpecifyOtherAreaofInterest__c);
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Description page', async () => {
            await webform.DESCRIPTION.fill(testData.Description);
        });

        await test.step('submit contact form', async () => {
            await webform.SUBMIT_BUTTON.click();
            await expect(webform.THANK_YOU_MESSAGE).toBeVisible();
        });

        await test.step('run BigQuery import and find a Lead in Salesforce', async () => {
            admin = await (new AdminUser()).Ready
            await BigQuery.importAfternoonLeadsAs(admin);
            await BigQuery.findLeadWith(testData, admin);
        });

        await test.step('assert that Lead was imported correctly', async () => {
            const importedLead = await admin.api.read('Lead', testData.Id);
            expect(importedLead).toMatchObject(testData);
        });
    })
    test('create Other Lead via \'Invest in Oxagon\' webform - \'Banking & financial services\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: InvestInOxagonPage;
        const testData = {
            ...InvestInOxagonPage.getCommonData(),
            SingleInterest__c: 'Banking and Financial Services',
            Interest__c: 'Banking and Financial Services',
            Description: faker.lorem.word({length: {min: 5, max: 10}}),
            SpecifyOtherAreaofInterest__c: null,
        }
        await test.step('login to webform', async () => {
            webform = new InvestInOxagonPage(page);
            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillDetailsPageWith(testData);
        });

        await test.step('fill out Additional Information page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c.replace(/and/gm, '&') }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Description page', async () => {
            await webform.DESCRIPTION.fill(testData.Description);
        });

        await test.step('submit contact form', async () => {
            await webform.SUBMIT_BUTTON.click();
            await expect(webform.THANK_YOU_MESSAGE).toBeVisible();
        });

        await test.step('run BigQuery import and find a Lead in Salesforce', async () => {
            admin = await (new AdminUser()).Ready
            await BigQuery.importAfternoonLeadsAs(admin);
            await BigQuery.findLeadWith(testData, admin);
        });

        await test.step('assert that Lead was imported correctly', async () => {
            const importedLead = await admin.api.read('Lead', testData.Id);
            expect(importedLead).toMatchObject(testData);
        });
    })
    test('create Other Lead via \'Invest in Oxagon\' webform - \'Commercial (professional services)\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: InvestInOxagonPage;
        const testData = {
            ...InvestInOxagonPage.getCommonData(),
            SingleInterest__c: 'Commercial (Professional Services)',
            Interest__c: 'Commercial (Professional Services)',
            Description: faker.lorem.word({length: {min: 5, max: 10}}),
            SpecifyOtherAreaofInterest__c: null,
        }
        await test.step('login to webform', async () => {
            webform = new InvestInOxagonPage(page);
            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillDetailsPageWith(testData);
        });

        await test.step('fill out Additional Information page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Description page', async () => {
            await webform.DESCRIPTION.fill(testData.Description);
        });

        await test.step('submit contact form', async () => {
            await webform.SUBMIT_BUTTON.click();
            await expect(webform.THANK_YOU_MESSAGE).toBeVisible();
        });

        await test.step('run BigQuery import and find a Lead in Salesforce', async () => {
            admin = await (new AdminUser()).Ready
            await BigQuery.importAfternoonLeadsAs(admin);
            await BigQuery.findLeadWith(testData, admin);
        });

        await test.step('assert that Lead was imported correctly', async () => {
            const importedLead = await admin.api.read('Lead', testData.Id);
            expect(importedLead).toMatchObject(testData);
        });
    })
    test('create Other Lead via \'Invest in Oxagon\' webform - \'Hospitality, food & beverage\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: InvestInOxagonPage;
        const testData = {
            ...InvestInOxagonPage.getCommonData(),
            SingleInterest__c: 'Hospitality Food and Beverage',
            Interest__c: 'Hospitality Food and Beverage',
            Description: faker.lorem.word({length: {min: 5, max: 10}}),
            SpecifyOtherAreaofInterest__c: null,
        }
        await test.step('login to webform', async () => {
            webform = new InvestInOxagonPage(page);
            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillDetailsPageWith(testData);
        });

        await test.step('fill out Additional Information page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c.substring(0, 5) }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Description page', async () => {
            await webform.DESCRIPTION.fill(testData.Description);
        });

        await test.step('submit contact form', async () => {
            await webform.SUBMIT_BUTTON.click();
            await expect(webform.THANK_YOU_MESSAGE).toBeVisible();
        });

        await test.step('run BigQuery import and find a Lead in Salesforce', async () => {
            admin = await (new AdminUser()).Ready
            await BigQuery.importAfternoonLeadsAs(admin);
            await BigQuery.findLeadWith(testData, admin);
        });

        await test.step('assert that Lead was imported correctly', async () => {
            const importedLead = await admin.api.read('Lead', testData.Id);
            expect(importedLead).toMatchObject(testData);
        });
    })
    test('did not create Other Lead via \'Invest in Oxagon\' webform - \'Retail\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: InvestInOxagonPage;
        const testData = {
            ...InvestInOxagonPage.getCommonData(),
            SingleInterest__c: 'Retail',
            Interest__c: 'Retail',
            Description: faker.lorem.word({length: {min: 5, max: 10}}),
            SpecifyOtherAreaofInterest__c: null,
        }
        await test.step('login to webform', async () => {
            webform = new InvestInOxagonPage(page);
            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.fillDetailsPageWith(testData);
        });

        await test.step('fill out Additional Information page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Description page', async () => {
            await webform.DESCRIPTION.fill(testData.Description);
        });

        await test.step('submit contact form', async () => {
            await webform.SUBMIT_BUTTON.click();
            await expect(webform.THANK_YOU_MESSAGE).toBeVisible();
        });

        await test.step('run BigQuery import and find a Lead in Salesforce', async () => {
            admin = await (new AdminUser()).Ready
            await BigQuery.importAfternoonLeadsAs(admin);
            await BigQuery.findLeadWith(testData, admin);
        });

        await test.step('assert that Lead was imported correctly', async () => {
            const importedLead = await admin.api.read('Lead', testData.Id);
            expect(importedLead.recordTypeName__c).not.toEqual(testData.RecordTypeName__c);
        });
    })
});
import test, { expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { AdminUser } from "../../../common/users/AdminUser";
import { BigQuery } from "../utils/BigQuery";
import { ResearchAndInnovationPage } from "../pages/ResearchAndInnovationPage";
import { InvestInOxagonPage } from "../pages/InvestInOxagonPage";

test.use({ video: 'on', screenshot: 'off' });
test.describe.serial('@ui @e2e @oxagon @brd17 @webform @ri', () => {
    test('create Research & Innovation Lead via Webform', async ({ page }) => {
        let admin: AdminUser;
        let webform: ResearchAndInnovationPage;
        const testData = {
            Id: null,
            FirstName: `${faker.name.firstName().replace(/\W/gm, '')} ${faker.random.alpha(5)}`,
            LastName: `${faker.name.lastName().replace(/\W/gm, '')} test automation`,
            Email: faker.internet.email(undefined, undefined, 'test.com', { allowSpecialCharacters: false }).toLowerCase(),
            Phone: `+966${faker.random.numeric(6)}`,
            GlobalHQLocation__c: 'Afghanistan',
            Company: faker.company.name(),
            Website: `${faker.internet.url()}`,
            CompanyType__c: 'VC',
            JobTitle__c: 'C-suite',
            SingleInterest__c: 'Autonomous and sustainable mobility',
            Status: 'Business Function Review',
            LeadOwner__c: 'Research & Innovation',
            LeadSource: 'oxagon_form',
            HasOptedOutOfEmail: false,
            RecordTypeName__c: 'RI Lead'
        }
        await test.step('login to webform', async () => {
            webform = new ResearchAndInnovationPage(page);
            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.FIRST_NAME.fill(testData.FirstName);
            await webform.LAST_NAME.fill(testData.LastName);
            await webform.EMAIL.fill(testData.Email);
            await webform.PHONE.fill(testData.Phone);
            await webform.LOCATION.selectOption(testData.GlobalHQLocation__c);
            await webform.COMPANY_NAME.fill(testData.Company);
            await webform.COMPANY_WEBSITE.fill(testData.Website);
            await webform.JOB_TITLE.selectOption(testData.JobTitle__c);
            await webform.CONSENT_YES_CHECKBOX.click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Company Type page', async () => {
            await webform.COMPANY_TYPES.filter({ hasText: testData.CompanyType__c }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Personal Interests page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c.replace(/and/gm, '&') }).click();
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
    test('create Other Lead via Webform', async ({ page }) => {
        let admin: AdminUser;
        let webform: InvestInOxagonPage;
        const testData = {
            Id: null,
            FirstName: `${faker.name.firstName().replace(/\W/gm, '')} ${faker.random.alpha(5)}`,
            LastName: `${faker.name.lastName().replace(/\W/gm, '')} test automation`,
            Email: faker.internet.email(undefined, undefined, 'test.com', { allowSpecialCharacters: false }).toLowerCase(),
            Phone: `+966${faker.random.numeric(6)}`,
            GlobalHQLocation__c: 'Afghanistan',
            Company: faker.company.name(),
            Website: `${faker.internet.url()}`,
            JobTitle__c: 'C-suite',
            SingleInterest__c: 'Other',
            Status: 'ICC Review',
            LeadOwner__c: 'Investor Care Center',
            LeadSource: 'oxagon_form',
            HasOptedOutOfEmail: false,
            RecordTypeName__c: 'Other Lead'
        }
        await test.step('login to webform', async () => {
            webform = new InvestInOxagonPage(page);
            await webform.login();
            await webform.openForm();
        });

        await test.step('fill out Contact and Company details page', async () => {
            await webform.FIRST_NAME.fill(testData.FirstName);
            await webform.LAST_NAME.fill(testData.LastName);
            await webform.EMAIL.fill(testData.Email);
            await webform.PHONE.fill(testData.Phone);
            await webform.LOCATION.selectOption(testData.GlobalHQLocation__c);
            await webform.COMPANY_NAME.fill(testData.Company);
            await webform.COMPANY_WEBSITE.fill(testData.Website);
            await webform.JOB_TITLE.selectOption(testData.JobTitle__c);
            await webform.CONSENT_YES_CHECKBOX.click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Additional Information page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c }).click();
            await webform.EXPLAIN_YOUR_CHOICE.fill('choice explained debug');
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Personal Interests page', async () => {
            await webform.DESCRIPTION.fill('additional info debug');
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
});
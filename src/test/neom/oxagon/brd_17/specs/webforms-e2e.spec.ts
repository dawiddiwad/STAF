import test, { APIResponse, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { AdminUser } from "../../../common/users/AdminUser";
import { BigQuery } from "../../utils/BigQuery";
import { Webform } from "../../utils/Webform";

test.use({ video: 'on', screenshot: 'off' });
test.describe.serial('@ui @e2e @oxagon @brd17 @webform @ri', () => {
    test('create Research & Innovation Lead via Webform', async ({ page }) => {
        let adminUser: AdminUser;
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
            HasOptedOutOfEmail: false
        }
        await test.step('login to webform', async () => {
            const webform = new Webform(page);
            await webform.login();
            await webform.openForm('research & innovation');
        });

        await test.step('fill out Contact and Company details page', async () => {
            await page.getByLabel('FIRST NAME').fill(testData.FirstName);
            await page.getByLabel('LAST NAME').fill(testData.LastName);
            await page.getByLabel('EMAIL').fill(testData.Email);
            await page.getByRole('button', { name: 'Select' }).click();
            await page.getByRole('textbox', { name: 'Type here' }).fill(testData.Phone);
            await page.getByRole('combobox', { name: 'Location *' }).selectOption(testData.GlobalHQLocation__c);
            await page.getByLabel('COMPANY NAME').fill(testData.Company);
            await page.getByLabel('COMPANY WEBSITE').fill(testData.Website);
            await page.getByRole('combobox', { name: 'My Role *' }).selectOption(testData.JobTitle__c);
            await page.getByText('Yes').click();
            await page.getByRole('button', { name: 'Next' }).click();
        });

        await test.step('fill out Company Type page', async () => {
            await page.locator('label').filter({ hasText: testData.CompanyType__c }).click();
            await page.getByRole('button', { name: 'Next' }).click();
        });

        await test.step('fill out Personal Interests page', async () => {
            await page.locator('label').filter({ hasText: 'Autonomous & sustainable mobility' }).click();
        });

        await test.step('submit contact form', async () => {
            await page.getByRole('button', { name: 'Submit' }).click();
            await expect(page.getByRole('heading', { name: 'Thank you, we’ll be in touch soon.' })).toBeVisible();
        });

        await test.step('run BigQuery import and find a Lead in Salesforce', async () => {
            adminUser = await (new AdminUser()).Ready
            await BigQuery.importAfternoonLeadsAs(adminUser);
            await BigQuery.findLeadWith(testData, adminUser);
        });

        await test.step('assert that Lead was imported correctly', async () => {
            const importedLead = await adminUser.api.read('Lead', testData.Id);
            expect(importedLead).toMatchObject(testData);
        });
    })
});
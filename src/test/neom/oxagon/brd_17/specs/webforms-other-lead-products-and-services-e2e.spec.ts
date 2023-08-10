import test, { expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { AdminUser } from "../../../common/users/AdminUser";
import { BigQuery } from "../utils/BigQuery";
import { ProdcutsAndServicesPage } from "../pages/ProdcutsAndServicesPage";

test.use({ video: 'on', screenshot: 'off' });
test.describe.parallel('@ui @e2e @oxagon @brd17 @webform @otherlead @products @services', () => {
    test('create Other Lead via \'Products and Services\' webform - \'Other\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: ProdcutsAndServicesPage;
        const testData = {
            ...ProdcutsAndServicesPage.getCommonData(),
            SingleInterest__c: 'Other',
            Interest__c: 'Other',
            SpecifyOtherAreaofInterest__c: faker.lorem.word({length: {min: 5, max: 10}}),
        }
        await test.step('login to webform', async () => {
            webform = new ProdcutsAndServicesPage(page);
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
            await webform.COMPANY_SIZE.selectOption(testData.CompanySize__c);
            await webform.JOB_TITLE.selectOption(testData.JobTitle__c);
            await webform.CONSENT_YES_CHECKBOX.click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Additional Information page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c }).click();
            await webform.EXPLAIN_YOUR_CHOICE.fill(testData.SpecifyOtherAreaofInterest__c);
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.BRAND_GROUP_NAME.fill(testData.CompanyGroupName__c);
            await webform.CATEGORY.selectOption(testData.Category__c);
            await webform.SUB_CATEGORY.selectOption(testData.SubCategory__c);
            await webform.FRANCHISE_YES.click();
            await webform.FRANCHISE_NAME.fill(testData.FranchiseeName__c);
            await webform.NUMBER_OF_RETAIL_STORES_IN_KSA.selectOption(testData.RetailStoresNumber__c);
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
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
    test('create Other Lead via \'Products and Services\' webform - \'Banking & financial services\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: ProdcutsAndServicesPage;
        const testData = {
            ...ProdcutsAndServicesPage.getCommonData(),
            SingleInterest__c: 'Banking and Financial Services',
            Interest__c: 'Banking and Financial Services',
            SpecifyOtherAreaofInterest__c: null
        }
        await test.step('login to webform', async () => {
            webform = new ProdcutsAndServicesPage(page);
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
            await webform.COMPANY_SIZE.selectOption(testData.CompanySize__c);
            await webform.JOB_TITLE.selectOption(testData.JobTitle__c);
            await webform.CONSENT_YES_CHECKBOX.click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Areas Of Interest page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c.replace(/and/gm, '&') }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.BRAND_GROUP_NAME.fill(testData.CompanyGroupName__c);
            await webform.CATEGORY.selectOption(testData.Category__c);
            await webform.SUB_CATEGORY.selectOption(testData.SubCategory__c);
            await webform.FRANCHISE_YES.click();
            await webform.FRANCHISE_NAME.fill(testData.FranchiseeName__c);
            await webform.NUMBER_OF_RETAIL_STORES_IN_KSA.selectOption(testData.RetailStoresNumber__c);
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
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
    test('create Other Lead via \'Products and Services\' webform - \'Commercial (professional services)\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: ProdcutsAndServicesPage;
        const testData = {
            ...ProdcutsAndServicesPage.getCommonData(),
            SingleInterest__c: 'Commercial (Professional Services)',
            Interest__c: 'Commercial (Professional Services)',
            SpecifyOtherAreaofInterest__c: null
        }
        await test.step('login to webform', async () => {
            webform = new ProdcutsAndServicesPage(page);
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
            await webform.COMPANY_SIZE.selectOption(testData.CompanySize__c);
            await webform.JOB_TITLE.selectOption(testData.JobTitle__c);
            await webform.CONSENT_YES_CHECKBOX.click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Areas Of Interest page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c.replace(/and/gm, '&') }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.BRAND_GROUP_NAME.fill(testData.CompanyGroupName__c);
            await webform.CATEGORY.selectOption(testData.Category__c);
            await webform.SUB_CATEGORY.selectOption(testData.SubCategory__c);
            await webform.FRANCHISE_YES.click();
            await webform.FRANCHISE_NAME.fill(testData.FranchiseeName__c);
            await webform.NUMBER_OF_RETAIL_STORES_IN_KSA.selectOption(testData.RetailStoresNumber__c);
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
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
    test('create Other Lead via \'Products and Services\' webform - \'Hospitality, food & beverage\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: ProdcutsAndServicesPage;
        const testData = {
            ...ProdcutsAndServicesPage.getCommonData(),
            SingleInterest__c: 'Hospitality Food and Beverage',
            Interest__c: 'Hospitality Food and Beverage',
            SpecifyOtherAreaofInterest__c: null
        }
        await test.step('login to webform', async () => {
            webform = new ProdcutsAndServicesPage(page);
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
            await webform.COMPANY_SIZE.selectOption(testData.CompanySize__c);
            await webform.JOB_TITLE.selectOption(testData.JobTitle__c);
            await webform.CONSENT_YES_CHECKBOX.click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Areas Of Interest page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c.substring(0, 5) }).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.BRAND_GROUP_NAME.fill(testData.CompanyGroupName__c);
            await webform.CATEGORY.selectOption(testData.Category__c);
            await webform.SUB_CATEGORY.selectOption(testData.SubCategory__c);
            await webform.FRANCHISE_YES.click();
            await webform.FRANCHISE_NAME.fill(testData.FranchiseeName__c);
            await webform.NUMBER_OF_RETAIL_STORES_IN_KSA.selectOption(testData.RetailStoresNumber__c);
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
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
    test('did not create Other Lead via \'Products and Services\' webform - \'Retail\' investment', async ({ page }) => {
        let admin: AdminUser;
        let webform: ProdcutsAndServicesPage;
        const testData = {
            ...ProdcutsAndServicesPage.getCommonData(),
            SingleInterest__c: 'Retail',
            Interest__c: 'Retail',
            SpecifyOtherAreaofInterest__c: null
        }
        await test.step('login to webform', async () => {
            webform = new ProdcutsAndServicesPage(page);
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
            await webform.COMPANY_SIZE.selectOption(testData.CompanySize__c);
            await webform.JOB_TITLE.selectOption(testData.JobTitle__c);
            await webform.CONSENT_YES_CHECKBOX.click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Areas Of Interest page', async () => {
            await webform.AREAS_OF_INTEREST.filter({ hasText: testData.SingleInterest__c.replace(/and/gm, '&')}).filter({hasNotText: 'stores'}).click();
            await webform.NEXT_BUTTON.click();
        });

        await test.step('fill out Brand Information page', async () => {
            await webform.BRAND_GROUP_NAME.fill(testData.CompanyGroupName__c);
            await webform.CATEGORY.selectOption(testData.Category__c);
            await webform.SUB_CATEGORY.selectOption(testData.SubCategory__c);
            await webform.FRANCHISE_YES.click();
            await webform.FRANCHISE_NAME.fill(testData.FranchiseeName__c);
            await webform.NUMBER_OF_RETAIL_STORES_IN_KSA.selectOption(testData.RetailStoresNumber__c);
        });

        await test.step('submit contact form', async () => {
            await webform.NEXT_BUTTON.click();
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
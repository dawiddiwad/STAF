import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import { QueryResult, SuccessResult } from "jsforce";
import { AdminUser } from "../../common/users/AdminUser";

test.use({video: 'on', screenshot: 'off'});
test.describe.serial('@ui @e2e @lp sales path', () => {
    let actor: AdminUser;
    let leasingTeamUserId;
    let leaseeUsername;
    let leaseeApp;
    let contactName;
    let accountName;

    test.beforeAll(async () => {
        actor = await (new AdminUser()).Ready;
        leasingTeamUserId = (await actor.api.query("select Id, AssigneeId from PermissionSetAssignment where PermissionSet.Name = 'LP_App_Permission_Set' and Assignee.IsActive = true and Assignee.Profile.Name = 'LP Standard User' limit 1") as QueryResult<any>).records[0].AssigneeId;
        leaseeUsername = faker.internet.email();
        contactName = faker.name.firstName();
        accountName = `${faker.commerce.productName()} ${faker.company.companySuffix()}`;
    });

    test.beforeEach(async ({page}) => {
        await actor.workOnPage(page);
    })

    test('Leasing Team enables new Customer', async ({page}) => {
        await test.step('login to SFDC as LP Leasing Team', async () => {
            await actor.ui.loginAsCrmUser(leasingTeamUserId);
        });

        await test.step('Create new Case', async () => {
            const lpCaseRecordTypeId = (await actor.api.query("select id from recordtype where name = 'LP Case'") as QueryResult<any>).records[0].Id;
            const lpLeasingTeamQueueId = (await actor.api.query("select id from Group where DeveloperName = 'Leasing_Team'") as QueryResult<any>).records[0].Id;
            const lpCaseData = {
                Origin: "Web",
                Status: "New",
                Type: "Request",
                RecordTypeId: lpCaseRecordTypeId,
                OwnerId: lpLeasingTeamQueueId
            }
            const lpCaseId = (await actor.api.create("Case", lpCaseData) as SuccessResult).id;
            await actor.ui.navigateToResource(lpCaseId);
        });

        await test.step('Create new Contact/Account and link it to the Case', async () => {
            await page.getByTitle('Edit Contact Name').click();
            await page.getByRole('tabpanel').getByPlaceholder('Search Contacts...').click();
            await page.getByTitle('New Contact').click();
            await page.getByPlaceholder('Last Name').fill(contactName);
            await page.getByPlaceholder('Search Accounts...').click();
            await page.getByTitle('New Account').click();
            await page.getByLabel('Company Registration Number').fill(faker.finance.account());
            await page.locator('.uiModal.active').getByLabel('Account Name').first().fill(accountName);
            await page.locator('.uiModal.active').getByTitle('Save', {exact: true}).click();
            await (await page.waitForResponse(/saveRecord/gm)).ok();
            await page.locator('.uiModal.active').getByTitle('Save', {exact: true}).click();
            await page.locator("button[name='SaveEdit']").click();
        });

        await test.step('Enable Account and Contact as Partner', async () => {
            await page.locator(`records-hoverable-link:has-text("${accountName}")`).getByRole('link').click()
            await page.locator("button[name='EnableAsPartner']").click();
            await page.locator("button[title='Enable As Partner']").click();
            await (await page.waitForResponse(/managePortalAccount/gm)).ok();
            await page.goBack();
            await page.locator(`records-hoverable-link:has-text("${contactName}")`).getByRole('link').click()
            await page.locator("button:has-text('Enable Partner User')").click();
            const iframe = "//iframe[contains(@title, 'New User')]";
            const LpCommunityUserProfileId = (await actor.api.query("select id from profile where name = 'LP Partner Community Login User'") as QueryResult<any>).records[0].Id.substring(0,15);
            await page.frameLocator(iframe).locator('select[name="Profile"]').selectOption(LpCommunityUserProfileId);
            await page.frameLocator(iframe).locator("//input[@id='Email']").fill(leaseeUsername);
            await page.frameLocator(iframe).locator("(//input[@title='Save'])[last()]").click();
        });
    });

    test('Leasee sends out application', async ({page}) => {
        async function getLeaseeIdFor(username: string, acc?: number): Promise<string> {
            if (acc && acc > 10){
                throw new Error(`unable to find Leasee User: ${username}`);
            }
            try {
                return (await actor.api.query(`select id from user where username = '${leaseeUsername}'`) as QueryResult<any>).records[0].Id;
            } catch (error) {
                if ((error as Error).message.includes('no records returned')){
                    await page.waitForTimeout(1000);
                    return getLeaseeIdFor(username, (acc ? ++acc : 1));
                } else throw error;
            }
        }

        await test.step('Login to Portal', async() => {
            const leaseeUserId = await getLeaseeIdFor(leaseeUsername);
            await actor.ui.loginAsPortalUser(leaseeUserId, 'Logistics_Park');
        });

        await test.step('Fill new Application Form', async() => {
            await page.locator('text=Complete Application').click();
            expect((await page.waitForResponse(/ApexAction/gm)).ok(), `probably Application data was not fetched on portal for ${leaseeUsername}`).toBeTruthy();
            
            await page.type("//input[ancestor::*[preceding-sibling::label[text()='Phone']]]", faker.phone.number('###-###-###'), {delay: 50});
            await page.type("//input[ancestor::*[preceding-sibling::label[text()='Street']]]", faker.address.streetAddress(), {delay: 50});
            await page.type("//input[ancestor::*[preceding-sibling::label[text()='City']]]", faker.address.city(), {delay: 50});
            await page.type("//input[ancestor::*[preceding-sibling::label[text()='Postal Code']]]", faker.address.zipCode(), {delay: 50});
            await page.click("//button[ancestor::*[preceding-sibling::label[text()='Country']]]");
            await page.click("//*[text()='Albania']");
            await page.locator('text=Laydown Yard AssetsOther Laydown Yard Assets >> [placeholder="Select an option"]').click();
            await page.locator('text=Plot').click();
            await page.locator('text=Batch Plant AssetsOther Batch Plant Assets >> [placeholder="Select an option"]').click();
            await page.locator('text=Laboratory').click();
            await page.locator('[aria-label="Size of the Area \\(sqm\\)\\, Select size of the area"]').click();
            await page.locator('span:has-text("5000 - 10000")').nth(1).click()
            await page.locator('text=*I hereby acknowledge that I have read, understand, and acknowledge for full com >> span').first().click();
            await page.locator('text=Continue').click();
        });

        await test.step('Upload Documents', async() => {
            const documentPath = './scripts/test/neom/lp/uploads/placeholder-doc.pdf';
            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='Overall Company Profile']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();
            
            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='ZATCA Certificate']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();

            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='Saudization Certificate']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();

            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='Authorization Letter']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();

            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='Conflict of Interest Form']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();

            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='Commercial Registration Certificate']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();

            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='Valid VAT Registration Certificate']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();

            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='Bank Details']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();

            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='NEOM Non-Disclosure Agreement']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();

            await page.setInputFiles("//span[contains(@class,'file-selector__button') and ancestor::slot[descendant::*[text()='General Organization for Social Insuranc']]]", documentPath);
            await (await page.waitForResponse(/saveContent/gm)).ok();
            await page.click("//button[descendant::*[text()='Done']]"); await (await page.waitForResponse(/ApexAction/gm)).ok();

        });

        await test.step('Submit Application', async () => {
            await page.waitForTimeout(2000);
            await page.click('text=Submit Application');
            await expect(page.getByText('Thank you for submitting your Land Lease Application.')).toBeVisible();
        });
    });

    test('Leasing Team processes Opportunity until Document Approval', async ({page}) => {
        await test.step('login to SFDC as LP Leasing Team', async () => {
            await actor.ui.loginAsCrmUser(leasingTeamUserId);
        });

        await test.step('Navigate to recently Submitted Opportunity', async () => {
            leaseeApp = (await actor.api.query(`select id, name from Opportunity where CreatedBy.Username = '${leaseeUsername}' and Application_Status__c = 'Submitted' order by CreatedDate desc limit 1`) as QueryResult<any>).records[0];
            await actor.ui.navigateToResource(leaseeApp.Id);
        });

        await test.step('Eligibility check', async () => {
            await page.click("//a[@data-tab-name='Eligibility']");
            await page.click("//button[descendant::*[text()='Mark as Current Stage']]");
            await page.getByText('Stage changed successfully.').waitFor({state: "visible"});
            await page.getByText('Stage changed successfully.').waitFor({state: "hidden"});
            await page.click("//a[@data-label='Scoring']");
            await page.mouse.wheel(0, 800); 
            await page.click("//button[@title='Edit No. of Years in the Industry']");
            await page.fill("//input[preceding-sibling::*[descendant::*[text()='No. of Years in the Industry']]]", "10");
            await page.press("//a[ancestor::*[preceding-sibling::span[descendant::*[text()='Business with NEOM']]]]", 'Enter'); await page.waitForTimeout(1000);
            await page.click("//a[text()='Yes']", {force: true,});
            await page.press("//a[ancestor::*[preceding-sibling::span[descendant::*[text()='Clients']]]]", 'Enter'); await page.waitForTimeout(1000);
            await page.click("//a[text()='Major']", {force: true,});
            await page.press("//a[ancestor::*[preceding-sibling::span[descendant::*[text()='Financial Statement']]]]", 'Enter'); await page.waitForTimeout(1000);
            await page.click("//a[text()='Provided']", {force: true,});
            await page.press("//a[ancestor::*[preceding-sibling::span[descendant::*[text()='Type']]]]", 'Enter'); await page.waitForTimeout(1000);
            await page.click("//a[text()='NEOM Function']", {force: true,});
            await page.press("//a[ancestor::*[preceding-sibling::span[descendant::*[text()='Account Type - Score']]]]", 'Enter'); await page.waitForTimeout(1000);
            await page.click("//a[text()='6']", {force: true,});
            await page.check("//input[preceding-sibling::*[descendant::*[text()='Overall Company Profile']]]");
            await page.check("//input[preceding-sibling::*[descendant::*[text()='Commercial Registration Certificate']]]");
            await page.check("//input[preceding-sibling::*[descendant::*[text()='Valid VAT Registration Certificate']]]");
            await page.check("//input[preceding-sibling::*[descendant::*[text()='General Org. for Social Insurance']]]");
            await page.check("//input[preceding-sibling::*[descendant::*[text()='Saudization Certificate']]]");
            await page.check("//input[preceding-sibling::*[descendant::*[text()='Health, Safety and Environmental Plan']]]");
            await page.check("//input[preceding-sibling::*[descendant::*[text()='Accredited ISO 9001 Certification']]]");
            await page.check("//input[preceding-sibling::*[descendant::*[text()='Local Content']]]");
            await page.check("//input[preceding-sibling::*[descendant::*[text()='NEOM Approved Vendor']]]");
            await page.click("//button[@title='Save']");
            await page.reload();
        });

        await test.step('Document Review', async () => {
            await page.click("//a[@data-tab-name='Document Review']");
            await page.click("//button[descendant::*[text()='Mark as Current Stage']]");
            await page.getByText('Stage changed successfully.').waitFor({state: "visible"});
            await page.getByText('Stage changed successfully.').waitFor({state: "hidden"});
            await page.reload();
            await page.click("//button[text()='Submit for approval']");
            await page.click("//button[text()='Finish']");
        })
    });

    test('Approval team reviews Approval Request', async ({page}) => {
        let approvalRequests;
        await test.step('retrieve Approval Requests for the Opportunity', async () => {
            approvalRequests = (await actor.api.query(`select id from Approval_Request__c where Opportunity__r.Id = '${leaseeApp.Id}' and Status__c = 'Submitted'`) as QueryResult<any>).records;
            expect(approvalRequests).toHaveLength(7);
        });

        await test.step('Approve all Requests as individual Approvers', async () => {
            for (const record of approvalRequests){
                const approverId = (await actor.api.query(`select ActorId from ProcessInstanceWorkitem where ProcessInstance.TargetObjectId = '${record.Id}'`) as QueryResult<any>).records[0].ActorId;
                await actor.ui.loginAsCrmUser(approverId);
                await actor.ui.navigateToResource(record.Id);
                await page.click("//a[@title='Approve']");
                await page.fill("//textarea[@role='textbox']", "approved by test automation");
                await page.click("//button[descendant::*[text()='Approve']]");
                await actor.ui.logout();
            }
        });
    });

    test('Leasing Team finalizes Opportunity process', async ({page}) => {
        await test.step('login to SFDC as LP Leasing Team', async () => {
            await actor.ui.loginAsCrmUser(leasingTeamUserId);
        });

        await test.step('Navigate to recently Submitted Opportunity', async () => {
            await actor.ui.navigateToResource(leaseeApp.Id);
        });

        await test.step('Contract Activation', async() => {
            const oppOwnerName = (await actor.api.query(`select Id, Owner.Name from Opportunity where id = '${leaseeApp.Id}'`) as QueryResult<any>).records[0].Owner.Name;
            await page.click("//a[@data-tab-name='Contract Approval']");
            await page.click("//button[descendant::*[text()='Mark as Current Stage']]");
            await page.getByText('Stage changed successfully.').waitFor({state: "visible"});
            await page.getByText('Stage changed successfully.').waitFor({state: "hidden"});
            await page.click("//button[@name='Opportunity.Create_Contract']");
            await page.click("//button[text()='Create Contract' and ancestor::*[contains(@class, 'modal')]]");
            await page.click("//a[ancestor::*[preceding-sibling::*[contains(@class,'test-id__field-label-container') and descendant::span[text()='Contract']]]]");
            await page.click("//a[@title='Edit']");
            await page.fill("//input[ancestor::*[preceding-sibling::label[descendant::*[text()='Contract Start Date']]]]", "01/01/2049");
            await page.fill("//input[ancestor::*[preceding-sibling::label[descendant::*[text()='Contract End Date']]]]", "01/01/2050");
            await page.type("//input[ancestor::*[preceding-sibling::label[descendant::*[text()='Customer Signed By']]]]", contactName, {delay: 50});
            await page.click(`(//a[@role='option' and descendant::*[contains(text(),'${contactName}')] and ancestor::*[preceding-sibling::label[descendant::*[text()='Customer Signed By']]]])[1]`);
            await page.type("//input[ancestor::*[preceding-sibling::label[descendant::*[text()='Company Signed By']]]]", oppOwnerName, {delay: 50});
            await page.click(`//*[@title='${oppOwnerName}']`);
            await page.click("//button[@title='Save']");
            await page.click("(//a[@data-tab-name='Activated'])[last()]");
            await page.click("//button[descendant::*[text()='Mark as Current Status']]");
        })

        await test.step('Close Opportunity', async() => {
            await actor.ui.navigateToResource(leaseeApp.Id);
            await page.click("//a[@data-tab-name='Closed']");
            await page.click("//button[descendant::*[text()='Select Closed Stage']]");
            await page.click("//button[text()='Done']");
        })
    });
});
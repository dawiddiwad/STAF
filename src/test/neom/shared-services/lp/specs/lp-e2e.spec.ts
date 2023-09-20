import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import { QueryResult, SuccessResult, RecordResult } from "jsforce";
import { AdminUser } from "test/neom/common/users/AdminUser";
import { LpStandardUser } from "../users/standard/User";
import { LpCase } from "../users/standard/objects/LpCase";

test.use({video: 'on', screenshot: 'off'});
test.describe.serial('@ui @e2e @lp sales path', () => {
    let admin: AdminUser;
    let leasingTeam: LpStandardUser;
    let leasingTeamUserId;
    let leaseeUsername;
    let leaseeApp;
    let contactName;
    let accountName;

    test.beforeAll(async () => {
        admin = await (new AdminUser()).Ready;
        leasingTeamUserId = (await admin.api.query("select Id, AssigneeId from PermissionSetAssignment where PermissionSet.Name = 'LP_App_Permission_Set' and Assignee.IsActive = true and Assignee.Profile.Name = 'LP Standard User' limit 1") as QueryResult<any>).records[0].AssigneeId;
        leaseeUsername = faker.internet.email();
        contactName = faker.name.firstName();
        accountName = `${faker.commerce.productName()} ${faker.company.companySuffix()}`;
    });

    test.beforeEach(async ({page}) => {
        leasingTeam = await (new LpStandardUser(page)).Ready;
    })

    test('Leasing Team enables new Customer', async ({page}) => {
        const caseCtx = new LpCase(leasingTeam);
        
        await test.step('Create new Case', async () => {
            const leasingTeamQueueId = (await admin.api.query("select id from Group where DeveloperName = 'Leasing_Team'") as QueryResult<any>).records[0].Id;
            const caseData = {
                Origin: "Web",
                Status: "New",
                Type: "Request",
                OwnerId: leasingTeamQueueId
            }
            const caseId = (await admin.api.create("Case", caseData) as SuccessResult).id;
            await leasingTeam.ui.navigateToResource(caseId);
        });

        await test.step('Create new Contact/Account and link it to the Case', async () => {
            await caseCtx.linkNewContactWithNewAccountViaUi(contactName, accountName);
        });

        await test.step('Enable Account and Contact as Partner', async () => {
            await page.locator(`records-hoverable-link:has-text("${accountName}")`).getByRole('link').click()
            await page.locator("button[name='EnableAsPartner']").click();
            await page.locator("button[title='Enable As Partner']").click();
            await (await page.waitForResponse(/managePortalAccount/gm)).ok();
            await page.goBack();
            await page.locator(`records-hoverable-link:has-text("${contactName}")`).getByRole('link').click();
            await expect(async () => {
                await page.reload();
                await page.locator("button:has-text('Enable Partner User')").click();
            }).toPass({intervals: [5_000, 10_000]});
            const iframe = "//iframe[contains(@title, 'New User')]";
            const LpCommunityUserProfileId = (await admin.api.query("select id from profile where name = 'LP Partner Community Login User'") as QueryResult<any>).records[0].Id.substring(0,15);
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
                return (await admin.api.query(`select id from user where username = '${leaseeUsername}'`) as QueryResult<any>).records[0].Id;
            } catch (error) {
                if ((error as Error).message.includes('no records returned')){
                    await page.waitForTimeout(1000);
                    return getLeaseeIdFor(username, (acc ? ++acc : 1));
                } else throw error;
            }
        }

        await test.step('Login to Portal', async() => {
            const leaseeUserId = await getLeaseeIdFor(leaseeUsername);
            await admin.ui.loginAsPortalUser(leaseeUserId, 'Logistics_Park');
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
            const documentPath = './src/test/neom/lp/uploads/placeholder-doc.pdf';
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
            await admin.ui.loginAsCrmUser(leasingTeamUserId);
        });

        await test.step('Navigate to recently Submitted Opportunity', async () => {
            leaseeApp = (await admin.api.query(`select id, name from Opportunity where CreatedBy.Username = '${leaseeUsername}' and Application_Status__c = 'Submitted' order by CreatedDate desc limit 1`) as QueryResult<any>).records[0];
            await admin.ui.navigateToResource(leaseeApp.Id);
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
            await expect(async () => {
                await page.reload();
                await page.click("//button[text()='Submit for approval']");
            }).toPass({intervals: [5_000, 10_000]});
            await page.click("//button[text()='Finish']");
        })
    });

    test('Approval team reviews Approval Request', async ({page}) => {
        let approvalRequests;
        await test.step('retrieve Approval Requests for the Opportunity', async () => {
            approvalRequests = (await admin.api.query(`select id from Approval_Request__c where Opportunity__r.Id = '${leaseeApp.Id}' and Status__c = 'Submitted'`) as QueryResult<any>).records;
            expect(approvalRequests).toHaveLength(7);
        });

        await test.step('Approve all Requests as individual Approvers', async () => {
            for (const record of approvalRequests){
                const approverId = (await admin.api.query(`select ActorId from ProcessInstanceWorkitem where ProcessInstance.TargetObjectId = '${record.Id}'`) as QueryResult<any>).records[0].ActorId;
                await admin.ui.loginAsCrmUser(approverId);
                await admin.ui.navigateToResource(record.Id);
                await page.click("//a[@title='Approve']");
                await page.fill("//textarea[@role='textbox']", "approved by test automation");
                await page.click("//button[descendant::*[text()='Approve']]");
                await page.waitForLoadState("networkidle");
                await admin.ui.logout();
            }
        });
    });

    test('Leasing Team finalizes Opportunity process', async ({page}) => {
        await test.step('login to SFDC as LP Leasing Team', async () => {
            await admin.ui.loginAsCrmUser(leasingTeamUserId);
        });

        await test.step('Navigate to recently Submitted Opportunity', async () => {
            await admin.ui.navigateToResource(leaseeApp.Id);
        });

        await test.step('Contract Activation', async() => {
            const oppOwnerName = (await admin.api.query(`select Id, Owner.Name from Opportunity where id = '${leaseeApp.Id}'`) as QueryResult<any>).records[0].Owner.Name;
            await page.click("//a[@data-tab-name='Contract Approval']");
            await page.click("//button[descendant::*[text()='Mark as Current Stage']]");
            await page.getByText('Stage changed successfully.').waitFor({state: "visible"});
            await page.getByText('Stage changed successfully.').waitFor({state: "hidden"});

            await page.click("//li[contains(@title,'Contracts')]");
            await page.click("//*[contains(@data-target-selection-name,'sfdc:StandardButton.Contract.New')]");

            await page.locator('.uiModal.active').locator("//a[ancestor::*[preceding-sibling::span[descendant::*[text()='Status']]]]").click();
            await page.getByTitle('Draft').click();
            await page.locator('.uiModal.active').locator("//a[ancestor::*[preceding-sibling::span[descendant::*[text()='Type']]]]").click();
            await page.getByTitle('Building Lease').click();
            await page.locator('.uiModal.active').getByLabel('Account Name').type(accountName, {delay: 50});
            await page.locator('.uiModal.active').getByTitle(accountName).last().click();

            await page.type("//input[ancestor::*[preceding-sibling::label[descendant::*[text()='Customer Signed By']]]]", contactName, {delay: 50});
            await page.click(`(//a[@role='option' and descendant::*[contains(text(),'${contactName}')] and ancestor::*[preceding-sibling::label[descendant::*[text()='Customer Signed By']]]])[1]`);
            await page.getByLabel('Customer Signed Date').fill(new Date().toLocaleString('en-GB').slice(0, 10));

            await page.type("//input[ancestor::*[preceding-sibling::label[descendant::*[text()='Company Signed By']]]]", oppOwnerName, {delay: 50});
            await page.click(`//*[@title='${oppOwnerName}']`);
            await page.getByLabel('Company Signed Date').fill(new Date().toLocaleString('en-GB').slice(0, 10));

            await page.getByTitle('Save', {exact: true}).click();
            await admin.ui.page.getByText('was created').waitFor({state: "visible"});
            await admin.ui.page.getByText('was created').waitFor({state: "hidden"});

            await page.locator("table a.textUnderline").last().click();
            await page.click("(//a[@data-tab-name='Activated'])[last()]");
            await page.click("//button[descendant::*[text()='Mark as Current Status']]");
            await admin.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
            await admin.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});
        })

        await test.step('Close Opportunity', async() => {
            await admin.ui.navigateToResource(leaseeApp.Id);
            await page.click("//a[@data-tab-name='Closed']");
            await page.click("//button[descendant::*[text()='Select Closed Stage']]");
            await page.click("//button[text()='Done']");
            await admin.ui.page.getByText('Stage changed successfully.').waitFor({state: "visible"});
        })
    });
});
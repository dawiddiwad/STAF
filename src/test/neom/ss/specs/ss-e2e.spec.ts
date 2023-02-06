import test, { expect } from "@playwright/test";
import { SsStandardUser } from "../users/standard/User";
import { SsAdminUser } from "../users/admin/User";

test.use({video: 'on', screenshot: 'off'});
test.describe.serial('@ui @e2e @ss path', () => {
    let accountId;
    let contactId;
    let OpportunityId;

    test('Lead path and conversion', async ({page}) => {
        const actor = await (new SsStandardUser(page)).Ready;
        let leadId;

        await test.step('create Lead record', async ()=>{
            leadId = await actor.lead.createViaApi();
        });

        await test.step('follow all Lead stages', async () => {
            await actor.ui.navigateToResource(leadId);

            await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('New').click();
            await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
            await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
            await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});

            await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Nurturing').click();
            await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
            await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
            await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});

            await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Working').click();
            await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
            await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
            await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});

            await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Converted').click();
            await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
            await expect(actor.ui.page.getByText('Convert Lead')).toBeVisible();
            await actor.ui.page.locator('.leadConvertModal').getByText('Convert', {exact: true}).click({delay: 1500});
            await expect(actor.ui.page.locator('.uiModal--leadConvert').getByText('Your lead has been converted')).toBeVisible();
        })

        await test.step('Verify converted records', async () => {
            await expect(actor.ui.page.locator('.containerConvertedItem >> text=Account').first()).toBeVisible();
            await expect(actor.ui.page.locator('.containerConvertedItem >> text=Contact').first()).toBeVisible();
            await expect(actor.ui.page.locator('.containerConvertedItem >> text=Opportunity').first()).toBeVisible();
            accountId = await actor.ui.page.locator("(//*[contains(@class, 'forceOutputLookup') and ancestor::*[preceding-sibling::*[contains(@class, 'headerConvertedItem') and text()='Account']]])[1]").getAttribute('data-recordid');
            contactId = await actor.ui.page.locator("(//*[contains(@class, 'forceOutputLookup') and ancestor::*[preceding-sibling::*[contains(@class, 'headerConvertedItem') and text()='Contact']]])[1]").getAttribute('data-recordid'); 
            OpportunityId = await actor.ui.page.locator("(//*[contains(@class, 'forceOutputLookup') and ancestor::*[preceding-sibling::*[contains(@class, 'headerConvertedItem') and text()='Opportunity']]])[1]").getAttribute('data-recordid');
        })
    })

    test('Opportunity path', async ({page}) => {
        const actor = await (new SsStandardUser(page)).Ready;

        await actor.ui.navigateToResource(OpportunityId);

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Qualification', {exact: true}).click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "hidden"});

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Needs Analysis').click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "hidden"});

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Proposal').click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "hidden"});

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Negotiation').click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "hidden"});

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Closed').click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.locator('.uiModal').getByText("Done", {exact: true}).click();
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Stage changed successfully.').waitFor({state: "hidden"});
    })

    test('Contract creation and path', async ({page}) => {
        let actor = await (new SsStandardUser(page)).Ready as any;
        let contractId;

        await actor.ui.navigateToResource(accountId);

        const contractRelatedList = actor.ui.page.locator("//*[contains(@class, 'forceRelatedListSingleContainer') and descendant::*[contains(@title, 'Contracts')]]");
        await contractRelatedList.getByRole('button').first().click();
        await actor.ui.page.locator("//*[contains(@data-target-selection-name,'sfdc:StandardButton.Contract.New')]").click();

        await actor.ui.page.locator('.modal-body').getByLabel('Contract Start Date').fill('12/12/2050');
        await actor.ui.page.locator('.modal-body').getByLabel('Contract Term (months)').fill('12');

        await actor.ui.page.locator('.modal-body').getByTitle('Save', {exact: true}).click();
        await actor.ui.page.getByText('was created').waitFor({state: "visible"});
        await actor.ui.page.getByText('was created').waitFor({state: "hidden"});

        contractId = await contractRelatedList.locator('.forceOutputLookup').first().getAttribute('data-recordid');
        await actor.ui.navigateToResource(contractId);

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('In Approval Process', {exact: true}).click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('In Signing Process').click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Activated').click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText("You don't have permission to activate Contracts").waitFor({state: "visible"});
        await actor.ui.page.getByText("You don't have permission to activate Contracts").waitFor({state: "hidden"});

        actor = await (new SsAdminUser(page)).Ready;
        await actor.ui.navigateToResource(contractId);

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Activated').click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Cancelled').click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});

        await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle('Expired').click();
        await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
        await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});
    })
})
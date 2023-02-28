import test, { expect } from "@playwright/test";
import { MeUser } from "../users/standard/User";

test.use({video: 'on', screenshot: 'off'});
test.describe.serial('@ui @e2e @me path', () => {
    let accountId;
    let contactId;
    let OpportunityId;

    test('Lead path and conversion', async ({page}) => {
        let leadId;
        const actor = await (new MeUser(page)).Ready;

        await test.step('create Lead record', async ()=>{
            leadId = await actor.lead.createViaApi();
        });

        await test.step('follow all Lead stages', async () => {
            await actor.ui.navigateToResource(leadId);
            await actor.lead.changePathStageTo({status: 'New', using: actor.ui});
            await actor.lead.changePathStageTo({status: 'Nurturing', using: actor.ui});
            await actor.lead.changePathStageTo({status: 'Working', using: actor.ui});
            await actor.lead.convertAs({status: 'Converted', using: actor.ui});
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
        const actor = await (new MeUser(page)).Ready;
        await actor.ui.navigateToResource(OpportunityId);
        
        await actor.ui.page.getByTitle('Edit Primary Pillar').click();
        await actor.ui.page.getByLabel('Primary Pillar').click();
        await actor.ui.page.locator('[data-value="Operations"]').click();
        await actor.ui.page.getByLabel('Mode of Engagement').click();
        await actor.ui.page.locator("lightning-base-combobox-item[data-value='TBD']").click();
        await actor.ui.page.locator("button[name='SaveEdit']").click();
        await (await actor.ui.page.waitForResponse(/updateRecord/gm)).ok();
        await (await actor.ui.page.waitForResponse(/getRecordActions/gm)).ok();

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
        const actor = await (new MeUser(page)).Ready;
        let contractId;

        await actor.ui.navigateToResource(accountId);

        const contractRelatedList = actor.ui.page.locator("//*[contains(@class, 'forceRelatedListSingleContainer') and descendant::*[contains(@title, 'Contracts')]]");
        await contractRelatedList.getByRole('button').first().click();
        await actor.ui.page.locator("//*[contains(@data-target-selection-name,'sfdc:StandardButton.Contract.New')]").click();

        await actor.ui.page.locator('.modal-body').getByLabel('Contract Start Date').fill('12/12/2050');
        await actor.ui.page.locator('.modal-body').getByLabel('Contract Term (months)').fill('12');
        await actor.ui.page.locator('.modal-body').locator("//a[ancestor::*[preceding-sibling::span[descendant::*[text()='Status']]]]").click();
        await actor.ui.page.getByTitle('Draft').click();

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
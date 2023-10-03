import test from "@playwright/test";
import { RetailUser } from "test/neom/oxagon/retail/users/User";

test.use({video: 'retain-on-failure', screenshot: 'off'});
test.describe.parallel('@api @oxagon @retail layout validations', async () => {
    let actor: RetailUser
    
    test.beforeEach(async ({browser}, testInfo) => {
        actor = await new RetailUser().Ready.then(actor => actor.use(browser))
        actor.api.testInfo = testInfo
    });

    test('Contact', async() => {
        let contactID;

        await test.step('create Account record', async () => {
            contactID = await actor.contact.createViaApi();
        })

        await test.step('validate layouts', async() => {
            await actor.api.validateVisibleRecordLayouts(contactID, actor.ui)
        })
    })

    test('Opportunity', async() => {
        let opportunityID;

        await test.step('create Opportunity record', async () => {
            opportunityID = await actor.opportunity.createViaApi();
        })

        await test.step('validate layouts', async() => {
            await actor.api.validateVisibleRecordLayouts(opportunityID, actor.ui)
        })
    })


    test('Account', async() => {
        let accountId;

        await test.step('create Account record', async () => {
            accountId = await actor.account.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(accountId, actor.ui);
        });
    });

    test('Lead', async() => {
        let leadId;

        await test.step('create Lead record', async () => {
            leadId = await actor.lead.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(leadId, actor.ui);
        });
    });

    test('Apps and Tabs', async () => {
        await actor.api.validateAvailableApps(actor.ui);
    });
})
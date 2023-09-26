import test from "@playwright/test";
import { RetailUser } from "test/neom/oxagon/retail/users/User";

test.use({video: 'retain-on-failure', screenshot: 'off'});
test.describe.parallel('@api @oxagon @retail layout validations', async () => {
    let actor: RetailUser
    
    test.beforeEach(async ({browser}, testInfo) => {
        actor = await new RetailUser().Ready.then(actor => actor.use(browser))
        actor.api.testInfo = testInfo
    });

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
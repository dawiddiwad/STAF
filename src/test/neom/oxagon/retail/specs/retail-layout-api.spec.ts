import test from "@playwright/test";
import { RetailUser } from "test/neom/oxagon/retail/users/User";

test.use({video: 'on'});
test.describe.parallel('@api @oxagon @retail layout validations', async () => {
    let actor: RetailUser;

    test.beforeEach(async ({page}) => {
        await (actor = new RetailUser(page)).Ready;
    });

    test('Account', async() => {
        let accountId;

        await test.step('create Account record', async () => {
            accountId = await actor.account.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(accountId);
        });
    });

    test('Apps and Tabs', async() => {
        await actor.api.validateAvailableApps();
    });
})
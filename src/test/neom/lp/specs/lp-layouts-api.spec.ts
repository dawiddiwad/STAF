import test, { expect } from "@playwright/test";
import { LpStandardUser } from "../users/standard/User";

test.use({video: 'off'});
test.describe.parallel('@api @lp layout validations', async () => {
    let actor: LpStandardUser;

    test.beforeEach(async ({page}) => {
        await (actor = new LpStandardUser(page)).Ready;
    });

    test('Opportunity', async() => {
        let oppId;
        await test.step('create Opportunity record', async () => {
            oppId = await actor.opportunity.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(oppId);
        });
    });

    test('Contract', async() => {
        let conId;
        await test.step('create Contract record', async () => {
            conId = await actor.contract.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(conId);
        });
    });

    test('Case', async () => {
        let caseId;
        await test.step('create Case record', async () => {
            caseId = await actor.case.createViaApi();
        })

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(caseId);
        })
    });

    test('Account', async () => {
        let accId;
        await test.step('create Account record', async () => {
            accId = await actor.account.createViaApi();
        })

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(accId);
        })
    });

    test('Contact', async () => {
        let conId;
        await test.step('create Contact record', async () => {
            conId = await actor.contact.createViaApi();
        })

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(conId);
        })
    });

    test('Product', async () => {
        let prodId;
        await test.step('create Product record', async () => {
            prodId = await actor.product.createViaApi();
        })

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(prodId, {Full: {View: true}, Compact: {View: true}});
        })
    });

    test('Apps and Tabs', async() => {
        await actor.api.validateAvailableApps();
    });
})
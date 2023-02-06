import test from "@playwright/test";
import { SsStandardUser } from "../users/standard/User";

test.use({video: 'off'});
test.describe.parallel('@api @ss layout validations', async () => {
    let actor: SsStandardUser;

    test.beforeEach(async ({page}) => {
        await (actor = new SsStandardUser(page)).Ready;
    });

    test('Lead', async() => {
        let leadId;

        await test.step('create Lead record', async () => {
            leadId = await actor.lead.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(leadId);
        });
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

    test('Contact', async() => {
        let contactId;

        await test.step('create Contact record and link it with Account', async () => {
            contactId = await actor.contact.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(contactId);
        });
    });

    test('Opportunity', async() => {
        let opportunityId;
    
        await test.step('create Opportunity record and link it with Account', async () => {
            opportunityId = await actor.opportunity.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(opportunityId);
        });
    });

    test('Contract', async() => {
        let contractId;

        await test.step('create Contract record and link it with Account', async () => {
            contractId = await actor.contract.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(contractId);
        });
    });

    test('Order', async() => {
        let orderId;

        await test.step('create Order record and link it with Account', async () => {
            orderId = await actor.order.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(orderId);
        });
    });

    test('Product', async() => {
        let productId;

        await test.step('create Product record', async () => {
            productId = await actor.product.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(productId, {Full: {View: true}, Compact: {View: true}});
        });
    });

    test('Apps and Tabs', async() => {
        await actor.api.validateAvailableApps();
    });
})
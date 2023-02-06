import test from "@playwright/test";
import { WaterUser } from "../users/standard/User";

test.use({video: 'off'});
test.describe.parallel('@api @water layout validations', async () => {
    let actor: WaterUser;

    test.beforeEach(async ({page}) => {
        await (actor = new WaterUser(page)).Ready;
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

    test('NDA Agreement', async() => {
        let agreementId;

        await test.step('create Agreement__c record and link it with Account', async () => {
            agreementId = await actor.agreement.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(agreementId);
        });
    });

    test('Apps and Tabs', async() => {
        await actor.api.validateAvailableApps();
    });
})
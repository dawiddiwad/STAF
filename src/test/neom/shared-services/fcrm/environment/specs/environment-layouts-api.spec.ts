import test from "@playwright/test";
import { EnvironmentUser } from "../users/standard/User";

test.use({video: 'off'});
test.describe.parallel('@api @fcrm @environment layout validations', async () => {
    let actor: EnvironmentUser;

    test.beforeEach(async ({page}) => {
        await (actor = new EnvironmentUser(page)).Ready;
    });

    test('Lead', async() => {
        let LeadId;

        await test.step('create Lead record', async () => {
            LeadId = await actor.lead.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(LeadId);
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

        await test.step('create Contact record', async () => {
            contactId = await actor.contact.createViaApi();
        });

        await test.step('validate layouts', async () => {
            await actor.api.validateVisibleRecordLayouts(contactId);
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
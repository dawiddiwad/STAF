import test, { expect } from "@playwright/test";
import { FoodUser } from "../users/standard/User";

test.use({video: 'off', screenshot: 'off'});
test.describe.parallel('@api @food validation rules', async () => {
    let foodUser: FoodUser;

    test.beforeEach(async ({page}) => {
        await (foodUser = new FoodUser(page)).Ready;
    });

    test('Lead', async() => {
        let leadId;

        await test.step('create Lead', async() => {
            leadId = await foodUser.lead.createViaApi();
        })

        await test.step('change status to Disqulaified without Disqualified Reason', async() => {
            const data = {
                Id: leadId,
                Status: 'Disqualified'
            }
            try {
                expect(await foodUser.api.update('Lead', data), {message: `Lead ${leadId} status was changed to Disqulaified without Disqualified Reason`}).toThrowError();
            } catch (error) {
                expect((error as Error).message, {message: `Missing correct validation message due to\n${error}`}).toContain('Disqualified Reason has to be provided');
            }
        })

        await test.step('change status to Disqulaified with Disqualified Reason', async() => {
            const data = {
                Id: leadId,
                Status: 'Disqualified',
                Disqualified_Reason__c: 'Not Interested in NEOM'
            }

            await foodUser.api.update('Lead', data);
        })
    })

    test('Opportunity', async() => {
        let accountId;
        let agreementId;
        let opportunityId;

        await test.step('create Opportunity', async() => {
            accountId = await foodUser.account.createViaApi();
            opportunityId = await foodUser.opportunity.createViaApi(accountId);
        })

        await test.step('Change stage to MOU without active NDA on Account', async() => {
            agreementId = await foodUser.agreement.createViaApi(accountId, null, 'NDA', 'New');
            const data = {
                Id: opportunityId,
                StageName: 'MOU'
            }
            
            try {
                expect(await foodUser.api.update('Opportunity', data), {message: `Opportunity ${opportunityId} stage was changed to MOU without active NDA ${agreementId} on Account ${accountId}`}).toThrowError();
            } catch (error) {
                expect((error as Error).message, {message: `Missing correct validation message due to\n${error}`}).toContain(`Unless there's an active NDA in place for the Account, the Opportunity cannot move beyond Qualification stage`);
            }
        })

        await test.step('Change stage to MOU with active NDA on Account', async() => {
            const agreementData = {
                Id: agreementId,
                Status__c: 'Active',
                Signed_Date__c: '2050-12-12'
            }

            const opportunityData = {
                Id: opportunityId,
                StageName: 'MOU'
            }

            await foodUser.api.update('Agreement__c', agreementData);
            await foodUser.api.update('Opportunity', opportunityData);
        })

        await test.step('Change stage to Contract Negotiation without MOU in place', async() => {
            const data = {
                Id: opportunityId,
                StageName: 'Contract Negotiation'
            }
            
            try {
                expect(await foodUser.api.update('Opportunity', data), {message: `Opportunity ${opportunityId} stage was changed to Contract Negotiation without MOU in place`}).toThrowError();
            } catch (error) {
                expect((error as Error).message, {message: `Missing correct validation message due to\n${error}`}).toContain(`confirm a Valid MOU in Place is checked`);
            }
        })

        await test.step('Change stage to Contract Negotiation with MOU in place', async() => {
            const data = {
                Id: opportunityId,
                Valid_MOU_in_Place__c: true,
                StageName: 'Contract Negotiation'
            }
            
            await foodUser.api.update('Opportunity', data);
        })

        await test.step('Change stage to Closed-Lost without Lost Reason', async() => {
            const data = {
                Id: opportunityId,
                StageName: 'Closed Lost'
            }
            
            try {
                expect(await foodUser.api.update('Opportunity', data), {message: `Opportunity ${opportunityId} stage was changed to Closed Lost without providing Loss Reason`}).toThrowError();
            } catch (error) {
                expect((error as Error).message, {message: `Missing correct validation message due to\n${error}`}).toContain(`Please provide 'Loss Reason' before closing the opportunity`);
            }
        })

        await test.step('Change stage to Closed-Lost with Lost Reason', async() => {
            const data = {
                Id: opportunityId,
                Loss_Reason__c: 'Other',
                StageName: 'Closed Lost'
            }
            
            await foodUser.api.update('Opportunity', data)
        })
    })
})
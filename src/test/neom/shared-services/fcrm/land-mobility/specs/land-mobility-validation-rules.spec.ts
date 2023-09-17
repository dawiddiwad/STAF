import { faker } from "@faker-js/faker";
import test, { expect } from "@playwright/test";
import { LandMobilityUser } from "../users/standard/User";

test.use({video: 'off', screenshot: 'off'});
test.describe.parallel('@api @fcrm @land_mobility validation rules', async () => {
    let actor: LandMobilityUser;

    test.beforeEach(async ({page}) => {
        await (actor = new LandMobilityUser(page)).Ready;
    });

    test('Agreement', async() => {
        let agreement;

        await test.step('create Agreement', async() => {
            agreement = await actor.agreement.createViaApi();
        })

        await test.step('change status to Active without Signed Date', async() => {
            const data = {
                Id: agreement,
                Status__c: 'Active'
            }
            try {
                expect(await actor.api.update('Agreement__c', data), {message: `Agreement ${agreement} status was changed to Active without Signed Date`}).toThrowError();
            } catch (error) {
                expect((error as Error).message, {message: `Missing correct validation message due to\n${error}`}).toContain('Signed date is mandatory');
            }
        })

        await test.step('change status to Active with Signed Date in the future', async() => {
            const data = {
                Id: agreement,
                Status__c: 'Active',
                Signed_Date__c: '2050-12-12'
            }
            try {
                expect(await actor.api.update('Agreement__c', data), {message: `Agreement ${agreement} status was changed to Active with Signed Date in the future`}).toThrowError();
            } catch (error) {
                expect((error as Error).message, {message: `Missing correct validation message due to\n${error}`}).toContain('Signed Date cannot be date in the future');
            }
        })

        await test.step('change status to Active with Signed Date in the past', async() => {
            const data = {
                Id: agreement,
                Status__c: 'Active',
                Signed_Date__c: '2000-12-12'
            }

            await actor.api.update('Agreement__c', data);
        })
    })

    test('Lead duplicates', async() => {
        const leadData = {
            Phone: faker.phone.number('###-###-###-###'),
            Email: faker.internet.email(null, null, null, {allowSpecialCharacters: true})
        }

        await test.step('create first Lead', async() => {
            await actor.lead.createViaApi(leadData);
        })

        await test.step('create duplicate Lead', async() => {
            try {
                expect(await actor.lead.createViaApi(leadData), {message: `It was possible to create duplicate lead with data:\n${JSON.stringify(leadData)}`}).toThrowError();
            } catch (error) {
                expect((error as Error).message, {message: `Missing correct validation message due to\n${error}`}).toContain('DUPLICATES_DETECTED');
            }
        }) 
    })
})
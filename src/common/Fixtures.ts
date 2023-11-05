import { test as base } from '@playwright/test';
import { SalesforceStandardUser } from './SalesforceUsers';

type SalesforceFixtures = {
    cast<T extends SalesforceStandardUser>(actor: T): Promise<T>
}

export const test = base.extend<SalesforceFixtures>({
    cast: async ({browser}, use, testInfo) => {
        await use(async <T extends SalesforceStandardUser>(actor: T) => {
            await actor.Ready.then(actor => actor.use(browser))
            await actor.Ready.then(actor => actor.api.testInfo = testInfo)
            return actor.Ready
        })
    }
})
import { Page, expect } from "@playwright/test";
import { SalesforceStandardUser } from "common/SalesforceUsers";
import { FlexiPage } from "./pages/FlexiPage";
import { SOQLBuilder } from "./SOQLBuilder";
import { SalesforceNavigator } from "./SalesforceNavigator";

export abstract class SalesforceObject<T extends SalesforceStandardUser> {
    public readonly user: T;
    public flexipage: {
        validateComponentsFor: (recordId: string) => Promise<void>
    };

    constructor (user: T){
        this.user = user;
        this.flexipage = {
            validateComponentsFor: async (recordId: string) => {
                const testInfo = this.user.api.testInfo
                const flexipage = new FlexiPage(this.user.ui)
                await SalesforceNavigator.openResource(recordId, this.user.ui)
                let parsedComponents: string
                try {
                    if (testInfo.config.updateSnapshots !== 'none'){
                        const safePeriod = testInfo.project.use.actionTimeout ? 
                        testInfo.project.use.actionTimeout : testInfo.timeout
                        console.debug(`snapshot capture is on in '${testInfo.config.updateSnapshots}' mode: using implicit wait of ${safePeriod/1000}s to record`)
                        await flexipage.ui.waitForTimeout(safePeriod)
                    }
                    await expect(async () => {
                        parsedComponents = await flexipage.getComponents()
                        expect(parsedComponents, 'components validation').toMatchSnapshot()
                    }).toPass({timeout: testInfo.project.use.actionTimeout ? 
                        testInfo.project.use.actionTimeout : testInfo.timeout})
                } finally {
                    if ((testInfo.project.use.trace instanceof Object 
                            && (testInfo.project.use.trace.snapshots
                            && testInfo.project.use.trace.mode === 'on'))
                        || testInfo.retry === 1 && (testInfo.project.use.trace instanceof Object 
                            && (testInfo.project.use.trace.snapshots
                            && testInfo.project.use.trace.mode === 'on-first-retry'))
                        || testInfo.retry > 0 && (testInfo.project.use.trace instanceof Object 
                            && (testInfo.project.use.trace.snapshots
                            && testInfo.project.use.trace.mode === 'on-all-retries'))
                        || testInfo.error && (testInfo.project.use.trace instanceof Object 
                            && testInfo.project.use.trace.snapshots 
                            && testInfo.project.use.trace.mode === 'retain-on-failure')
                        || testInfo.config.updateSnapshots !== 'none'){
                            await this.attachPageSnapshot(flexipage.ui)
                        }
                    await testInfo.attach('snapshot-flexipage_components', {body: parsedComponents})
                    await testInfo.attach('testrecord-sfdc_id', {body: recordId})
                }
            }
        }
    }

    private async attachPageSnapshot(page: Page){
        try {
            await expect(page).toHaveScreenshot({maxDiffPixels: 0, fullPage: true})
        } catch (ignore) {}
    }

    public async recordTypeIdFor(recordTypeName: string): Promise<string>{
        return this.user.api.query(new SOQLBuilder().recordTypeByName(recordTypeName))
            .then(queryResult => (queryResult.records[0] as any).Id)
    }
}

export type CreatableViaApi = {
    createViaApi: (data?) => Promise<string>
}

export type CreatableViaUi = {
    createViaUI: (data?) => Promise<void>
}

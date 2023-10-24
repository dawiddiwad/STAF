import { expect } from "@playwright/test";
import { SalesforceStandardUser } from "common/SalesforceUsers";
import { FlexiPage } from "./pages/FlexiPage";
import { SOQLBuilder } from "./SOQLBuilder";

export abstract class SalesforceObject {
    public readonly user: SalesforceStandardUser;
    public flexipage: {
        validateComponentsFor: (recordId: string) => Promise<void>
    };

    constructor (user: SalesforceStandardUser){
        this.user = user;
        this.flexipage = {
            validateComponentsFor: async (recordId: string) => {
                const flexipage = new FlexiPage(this.user.ui)
                const parsedComponents = await flexipage.getComponentsFor(recordId)
                if (this.user.api.testInfo){
                    try {
                        await flexipage.scrollPageBottomTop()
                        await expect(flexipage.ui).toHaveScreenshot({maxDiffPixels: 0, fullPage: true})
                        await this.user.api.testInfo.attach('screenshot', { body: await flexipage.ui.screenshot({fullPage: true}), contentType: 'image/png' })
                    } catch (error) {
                        await this.user.api.testInfo.attach('snapshot-fullpage_screenshots', {body: error})
                    } finally {
                        await this.user.api.testInfo.attach('snapshot-flexipage_components', {body: parsedComponents})
                        await this.user.api.testInfo.attach('testrecord-sfdc_id', {body: recordId})
                    }
                }
                expect(parsedComponents).toMatchSnapshot()
            }
        }
    }

    public async recordTypeIdFor(recordTypeName: string): Promise<string>{
        return this.user.api.query(new SOQLBuilder().recordTypeByName(recordTypeName))
            .then(queryResult => (queryResult.records[0] as any).Id)
    }
}

export interface IsCreatableViaApi {
    createViaApi: (data?) => Promise<string>
}

export interface IsCreatableViaUi {
    createViaUI: (data?) => Promise<void>
}

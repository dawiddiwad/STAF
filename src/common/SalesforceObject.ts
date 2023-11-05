import { expect } from "@playwright/test";
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
                const flexipage = new FlexiPage(this.user.ui)
                await SalesforceNavigator.openResource(recordId, this.user.ui)
                let parsedComponents: string
                try {
                    await expect(async () => {
                        parsedComponents = await flexipage.getComponents()
                        expect(parsedComponents).toMatchSnapshot()
                    }).toPass({timeout: 30000})
                } catch (error) {
                    throw error
                } finally {
                    if (this.user.api.testInfo){
                        try {
                            await expect(flexipage.ui).toHaveScreenshot({maxDiffPixels: 0, fullPage: true})
                        } catch (error) {
                        } finally {
                            await this.user.api.testInfo.attach('snapshot-flexipage_components', {body: parsedComponents})
                            await this.user.api.testInfo.attach('testrecord-sfdc_id', {body: recordId})
                        }
                    }
                }
            }
        }
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

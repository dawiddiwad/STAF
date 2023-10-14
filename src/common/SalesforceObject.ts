import { expect } from "@playwright/test";
import { SalesforceStandardUser } from "common/SalesforceUsers";
import { SalesforceNavigator } from "./SalesforceNavigator";

export abstract class SalesforceObject {
    public readonly user: SalesforceStandardUser;

    constructor (user: SalesforceStandardUser){
        this.user = user;
    }

    private async handleFlexipageSnapshots(parsedComponents: string, recordId: string){
        await this.scrollPageBottomTop()
        try {
            await expect(this.user.ui).toHaveScreenshot({maxDiffPixels: 0, fullPage: true})
            await this.user.api.testInfo.attach('screenshot', { body: await this.user.ui.screenshot({fullPage: true}), contentType: 'image/png' })
        } catch (error) {
            await this.user.api.testInfo.attach('snapshot-fullpage_screenshots', {body: error})
        } finally {
            await this.user.api.testInfo.attach('snapshot-flexipage_components', {body: parsedComponents})
            await this.user.api.testInfo.attach('testrecord-sfdc_id', {body: recordId})
        }
        expect(parsedComponents).toMatchSnapshot()
    }

    public async scrollPageBottomTop(){
        await this.user.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await this.user.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
    }

    public async scrollPageTopBottom(){
        await this.user.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
        await this.user.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    }

    public async validateVisibleFlexigpage(recordId: string){
        await SalesforceNavigator.openResource(recordId, this.user.ui)
        await this.user.ui.waitForLoadState('networkidle')
        await this.scrollPageBottomTop()
        const snapshot: string[] = []
        await this.user.ui.locator(SalesforceNavigator.FLEXIPAGE_COMPONENT_TAG)
            .elementHandles().then(async flexipageComponents => {
                for (const component of flexipageComponents){
                    if (!(await component.$$(SalesforceNavigator.FLEXIPAGE_COMPONENT_TAG)).length){
                        
                        const parseComponentId = async () => {
                            await component.scrollIntoViewIfNeeded()
                            await this.user.ui.waitForLoadState('networkidle')
                            snapshot.push(`[FLEXCOMPONENT] ${await component.getAttribute(SalesforceNavigator.FLEXIPAGE_COMPONENT_ID)}`)
            
                        }
        
                        const parseLabeledFields = async () => {
                            for (const field of await component.$$(SalesforceNavigator.FLEXIPAGE_FIELD_LABEL)){
                                const label = await field.innerText()
                                if (label){
                                    snapshot.push(`[FIELD] ${label}`)
                                }
                            }
                        }
        
                        const parseHighlightFields = async () => {
                            for (const field of await component.$$(SalesforceNavigator.FLEXIPAGE_HIGHLIGHTS_ITEM)){
                                for (const paragraph of await field.$$('*')){
                                    const title = await paragraph.getAttribute('title')
                                    if (title && !title.toLowerCase().includes('preview') 
                                        && !(await paragraph.getAttribute('src'))){
                                        snapshot.push(`[FIELD] ${title}`)
                                    }
                                }
                            }
                        }
        
                        const parseButtons = async () => {
                            for (const action of await component.$$('button')){
                                const actionText = await action.innerText()
                                if (actionText && !actionText.toLowerCase().includes('preview')){
                                    snapshot.push(`[BUTTON] ${await action.innerText()}`)
                                }
                            }
            
                        }
        
                        const parseLinks = async () => {
                            for (const hyperlink of await component.$$('a')){
                                const title =  await hyperlink.getAttribute('title')
                                if (title && !(await hyperlink.getAttribute('class')).toLowerCase().includes('outputlookuplink')){
                                    snapshot.push(`[LINK] ${title}`)
                                }
                            }
                        }
        
                        const createSnapshotFooter = () => {
                            snapshot.push('------')
                            snapshot.push('')
                        }

                        await parseComponentId()
                        await parseLabeledFields()
                        await parseHighlightFields()
                        await parseButtons()
                        await parseLinks()
                        createSnapshotFooter()
                    }
                }
            })
        const parsedComponents = snapshot.join('\n')
        await this.handleFlexipageSnapshots(parsedComponents, recordId)
    }
}

export interface IsCreatableViaApi {
    createViaApi: (data?) => Promise<string>
}

export interface IsCreatableViaUi {
    createViaUI: (data?) => Promise<void>
}

import { SalesforceNavigator } from "common/SalesforceNavigator";
import { SalesforcePage } from "./SalesforcePage";

export class FlexiPage extends SalesforcePage {
    public async getComponentsFor(recordId: string): Promise<string> {
        await SalesforceNavigator.openResource(recordId, this.ui)
        await this.ui.waitForResponse(/ui-force-components-controllers-slds/);
        await this.scrollPageBottomTop();
        const snapshot: string[] = []
        await this.ui.$$(SalesforceNavigator.FLEXIPAGE_COMPONENT_CSS_LOCATOR)
            .then(async flexipageComponents => {
                for (const component of flexipageComponents){
                    if (!(await component.$$(SalesforceNavigator.FLEXIPAGE_COMPONENT_CSS_LOCATOR)).length){
                        
                        const parseComponentId = async () => {
                            await component.scrollIntoViewIfNeeded()
                            await this.ui.waitForLoadState('networkidle')
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
        return snapshot.join('\n')
    }
}
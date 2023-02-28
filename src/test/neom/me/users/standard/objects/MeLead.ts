import { faker } from "@faker-js/faker";
import { MeUser } from "../User"
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsConvertable, IsPathEditOptions, IsCreatableViaApi, IsHavingPath, Sobject, IsConvertableOptions } from "../../../../../utils/common/Sobject";
import { SfdcUiCtx } from "../../../../../utils/UI/SfdcUiCtx";
import { expect } from "@playwright/test";

export class MeLead extends Sobject implements IsCreatableViaApi, IsConvertable, IsHavingPath{
    constructor(user: MeUser){
        super(user);
    }

    public async createViaApi(): Promise<string>{
        const data = {
            Status: "Unqualified",
            Mode_of_Engagement__c: 'TBD',
            LastName: faker.name.lastName(),
            Pillars__c: 'Operations;Gaming;Fashion',
            Company: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        return (await this.user.api.create("Lead", data) as RecordResult).id;
    }

    public async changePathStageTo(options: IsPathEditOptions): Promise<void>{
        if (options.using instanceof SfdcUiCtx){
            const actor = options.using.user as MeUser;
            await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle(options.status).click();
            await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
            await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "visible"});
            await actor.ui.page.getByText('Status changed successfully.').waitFor({state: "hidden"});
        } else {
            throw new Error('API context is not supported for this method');
        }
    };

    public async convertAs (options: IsConvertableOptions): Promise<void>{
        if (options.using instanceof SfdcUiCtx){
            const actor = options.using.user as MeUser;
            await actor.ui.page.locator('[aria-label="Path Options"]').getByTitle(options.status).click();
            await actor.ui.page.locator('.runtime_sales_pathassistantPathAssistant').locator('.slds-path__mark-complete').click();
            await expect(actor.ui.page.getByText('Convert Lead')).toBeVisible();
            await actor.ui.page.locator('.leadConvertModal').getByText('Convert', {exact: true}).click({delay: 1500});
            await expect(actor.ui.page.locator('.uiModal--leadConvert').getByText('Your lead has been converted')).toBeVisible();
        } else {
            throw new Error('API context is not supported for this method');
        }
    };
}
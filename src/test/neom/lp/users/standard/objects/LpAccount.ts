import { faker } from "@faker-js/faker";
import { LpStandardUser } from "../User"
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";
import { Locator, Page, expect } from "@playwright/test";

export class LpAccount extends Sobject implements IsCreatableViaApi{
    readonly page: Page;
    readonly companyRegistrationNumberEdit: Locator;
    readonly accountNameEdit: Locator;
    readonly saveEdit: Locator;


    constructor(user: LpStandardUser){
        super(user);
        this.page = this.user.ui.page;
        this.companyRegistrationNumberEdit = this.page.getByLabel('Company Registration Number');
        this.accountNameEdit = this.page.locator('.uiModal.active').getByLabel('Account Name').first();
        this.saveEdit = this.page.locator('.uiModal.active').getByTitle('Save', {exact: true});
    }

    private async saveRecordViaUi(): Promise<void>{
        await this.saveEdit.click();
        expect((await this.user.ui.page.waitForResponse(/saveRecord/gm)).ok()).toBeTruthy();
    }

    public async createViaApi(): Promise<string>{
        const accData = {
            Name: `${faker.company.name()} ${faker.company.companySuffix()}`
        }
        return (await this.user.api.create("Account", accData) as RecordResult).id;
    }

    public async fillMandatoryDataOnEditAndSaveViaUi(accountName): Promise<void>{
        await this.companyRegistrationNumberEdit.fill(faker.finance.account());
        await this.accountNameEdit.fill(accountName);
        await this.saveRecordViaUi();
    }
}

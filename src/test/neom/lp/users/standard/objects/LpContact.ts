import { faker } from "@faker-js/faker";
import { LpStandardUser } from "../User";
import { SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "../../../../../utils/common/Sobject";
import { Locator, Page, expect } from "@playwright/test";
import { LpAccount } from "./LpAccount";

export class LpContact extends Sobject implements IsCreatableViaApi{
    readonly page: Page;
    readonly lastNameEdit: Locator;
    readonly accountLookup: Locator;
    readonly accountLookupSearchNew: Locator;
    readonly saveEdit: Locator;

    constructor(user: LpStandardUser){
        super(user);
        const page = this.user.ui.page;
        this.lastNameEdit = this.page.getByPlaceholder('Last Name');
        this.accountLookup = this.page.getByPlaceholder('Search Accounts...');
        this.accountLookupSearchNew = this.page.getByTitle('New Account');
        this.saveEdit = this.page.locator('.uiModal.active').getByTitle('Save', {exact: true});
    }

    private async saveRecordViaUi(): Promise<void>{
        await this.saveEdit.click();
        expect((await this.user.ui.page.waitForResponse(/saveRecord/gm)).ok()).toBeTruthy();
    }

    public async createViaApi(): Promise<string>{
        const conData = {
            LastName: faker.name.lastName(),
            AccountId: await (this.user as LpStandardUser).account.createViaApi()
        }
        return (await this.user.api.create("Contact", conData) as RecordResult).id;
    }

    public async fillMandatoryDataOnEditAndSaveViaUi(contactName: string, accountName: string): Promise<void>{
        await this.lastNameEdit.fill(contactName);
        await this.accountLookup.click();
        await this.accountLookupSearchNew.click();
        const lpAccoount = new LpAccount(this.user as LpStandardUser);
        lpAccoount.fillMandatoryDataOnEditAndSaveViaUi(accountName);
        await this.saveRecordViaUi();
    }


}
import { LpStandardUser } from "../User";
import { QueryResult, SuccessResult as RecordResult } from "jsforce";
import { IsCreatableViaApi, Sobject } from "test/utils/common/Sobject";
import { faker } from "@faker-js/faker";
import { Locator, Page } from "@playwright/test";
import { LpContact } from "./LpContact";

export class LpCase extends Sobject implements IsCreatableViaApi{
    readonly page: Page;
    readonly contactEditInline: Locator;
    readonly contactLookupSearch: Locator;
    readonly contactLookupSearchNew: Locator;
    readonly saveEditInline: Locator;

    constructor(user: LpStandardUser){
        super(user);
        this.page = this.user.ui.page;
        this.contactEditInline = this.page.getByTitle('Edit Contact Name');
        this.contactLookupSearch = this.page.getByRole('tabpanel').getByPlaceholder('Search Contacts...');
        this.contactLookupSearchNew = this.page.getByTitle('New Contact');
        this.saveEditInline = this.page.locator("button[name='SaveEdit']");
    }

    public async createViaApi(): Promise<string>{
        const caseRecordId = (await this.user.api.query("select id from recordtype where name = 'LP Case'") as QueryResult<any>).records[0].Id;
        const caseData = {
            Status: "New",
            Origin: "Email",
            RecordTypeId: caseRecordId
        }
        return (await this.user.api.create("Case", caseData) as RecordResult).id;
    }

    public async linkNewContactWithNewAccountViaUi(contactName: string, accountName: string): Promise<void>{
        await this.contactEditInline.click();
        await this.contactLookupSearch.click();
        await this.contactLookupSearchNew.click();
        const lpContact = new LpContact(this.user as LpStandardUser);
        await lpContact.fillMandatoryDataOnEditAndSaveViaUi(contactName, accountName);
        await this.contactEditInline.click();
    }
}
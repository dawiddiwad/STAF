import { Page } from "@playwright/test";
import { AdminUser } from "../../../common/users/AdminUser";
import { BigQuery } from "../utils/BigQuery";

export interface OxagonFormData {
    Id,
    FirstName,
    LastName,
    Email,
    Phone,
    GlobalHQLocation__c,
    Company,
    Website,
    JobTitle__c,
    Status,
    LeadOwner__c,
    LeadSource,
    LeadType__c,
    HasOptedOutOfEmail,
    RecordTypeName__c,
    SingleInterest__c,
    Interest__c,
    Description,
    SpecifyOtherAreaofInterest__c,
    CompanySize__c,
    Category__c,
    CompanyGroupName__c,
    FranchiseCompanyActive__c,
    FranchiseeName__c,
    RetailStoresNumber__c,
    SubCategory__c,
    CompanyType__c
}
export abstract class OxagonForm {
    private authUrl: string;
    public data: OxagonFormData;
    protected page: Page;
    protected baseUrl: string;
    protected abstract readonly path: string;

    constructor(page: Page) {
        this.page = page;
        this.data = this.getMandatoryData();
        this.baseUrl = 'https://staging.neom.com/en-us/oxagon-form';
        this.authUrl = 'https://staging.neom.com/libs/granite/core/content/login.html?resource=%2Fcontent%2Fneom%2Fen-us%2Foxagon-form&$$login$$=%24%24login%24%24&j_reason=unknown&j_reason_code=unknown';
    }

    abstract getMandatoryData(): OxagonFormData;

    private getCredentials(){
        const username = process.env.WEBFORM_USERNAME as string;
        const password = process.env.WEBFORM_PASSWORD as string;
        if (!password || !username) {
            throw new Error ('unable to parse username/password for oxagon webform from environment variables. Makes sure to set them up.');
        }
        return {
            username: username,
            password: password
        }
    }

    public async login() {
        const credentials = this.getCredentials();
        await this.page.goto(this.authUrl);
        await this.page.getByText('Sign in locally (admin tasks only)').click();
        await this.page.getByPlaceholder('User name').fill(credentials.username);
        await this.page.getByPlaceholder('Password', { exact: true }).fill(credentials.password);
        await this.page.getByRole('button', { name: 'Sign In', exact: true }).click();
    }

    public async openForm() {
        await this.page.goto(`${this.baseUrl}/${this.path}`);
    }

    public async importLeadFromBigQueryAs(admin: AdminUser) {
        await BigQuery.importAfternoonLeadsAs(admin);
        await BigQuery.findLeadWith(this.data, admin);
    }
}
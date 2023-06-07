import { faker } from "@faker-js/faker";
import { OxagonForm } from "./OxagonForm";

export class ProdcutsAndServicesPage extends OxagonForm {
    protected path = 'service';
    public readonly FIRST_NAME = this.page.getByLabel('FIRST NAME');
    public readonly LAST_NAME = this.page.getByLabel('LAST NAME');
    public readonly EMAIL = this.page.getByLabel('EMAIL');
    public readonly PHONE = this.page.getByRole('textbox', { name: 'Type here' });
    public readonly LOCATION = this.page.getByRole('combobox', { name: 'Location *' });
    public readonly COMPANY_WEBSITE = this.page.getByLabel('COMPANY WEBSITE');
    public readonly COMPANY_SIZE = this.page.getByRole('combobox', { name: 'SIZE' });
    public readonly COMPANY_NAME = this.page.getByLabel('COMPANY NAME');
    public readonly JOB_TITLE = this.page.getByRole('combobox', { name: 'My Role *' });
    public readonly CONSENT_YES_CHECKBOX = this.page.getByText('Yes').first();
    public readonly NEXT_BUTTON = this.page.getByRole('button', { name: 'Next' });
    public readonly SUBMIT_BUTTON = this.page.getByRole('button', { name: 'Submit' });
    public readonly COMPANY_TYPES = this.page.locator('label');
    public readonly AREAS_OF_INTEREST = this.page.locator('span');
    public readonly EXPLAIN_YOUR_CHOICE = this.page.locator(("//textarea[@name='category_interest_comment']"));
    public readonly DESCRIPTION = this.page.getByPlaceholder('Type here...', { exact: true });
    public readonly BRAND_GROUP_NAME = this.page.getByLabel('BRAND GROUP NAME');
    public readonly CATEGORY = this.page.getByRole('combobox', { name: 'CATEGORY' });
    public readonly SUB_CATEGORY = this.page.getByRole('combobox', { name: 'Sub-category' });
    public readonly FRANCHISE_YES = this.page.locator('label').filter({ hasText: 'Yes' }).nth(1)
    public readonly FRANCHISE_NAME = this.page.getByLabel('FRANCHISE NAME');
    public readonly NUMBER_OF_RETAIL_STORES_IN_KSA = this.page.getByRole('combobox', { name: 'Number of retail stores in KSA' });
    public readonly THANK_YOU_MESSAGE = this.page.getByRole('heading', { name: 'Thank you, we’ll be in touch soon.' });

    public static getCommonData() {
        return {
            Id: null,
            FirstName: `${faker.name.firstName().replace(/\W/gm, '')} ${faker.random.alpha(5)}`,
            LastName: `${faker.name.lastName().replace(/\W/gm, '')} test automation`,
            Email: faker.internet.email(undefined, undefined, 'test.com', { allowSpecialCharacters: false }).toLowerCase(),
            Phone: `+966${faker.random.numeric(6)}`,
            GlobalHQLocation__c: 'Afghanistan',
            Company: faker.company.name(),
            CompanySize__c: '1-49',
            Website: `${faker.internet.url()}`,
            JobTitle__c: 'C-suite',
            Status: 'ICC Review',
            LeadOwner__c: 'Investor Care Center',
            LeadSource: 'oxagon_form',
            LeadType__c: 'provide services / products in oxagon',
            HasOptedOutOfEmail: false,
            RecordTypeName__c: 'Other Lead',
            CompanyGroupName__c: 'test brand group name',
            Category__c: 'Groceries',
            SubCategory__c: 'Specialty food store',
            FranchiseCompanyActive__c: true,
            FranchiseeName__c: 'test franchise name',
            RetailStoresNumber__c: '1-10'
        }
    }
}
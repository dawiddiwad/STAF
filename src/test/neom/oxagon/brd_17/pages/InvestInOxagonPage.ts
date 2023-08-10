import { OxagonForm, OxagonFormData } from "./OxagonForm";
import { faker } from "@faker-js/faker";

export class InvestInOxagonPage extends OxagonForm{
    protected path = 'invest';
    public readonly FIRST_NAME = this.page.getByLabel('FIRST NAME');
    public readonly LAST_NAME = this.page.getByLabel('LAST NAME');
    public readonly EMAIL = this.page.getByLabel('EMAIL');
    public readonly PHONE = this.page.getByRole('textbox', { name: 'Type here' });
    public readonly LOCATION = this.page.getByRole('combobox', { name: 'GLOBAL HQ LOCATION' })
    public readonly COMPANY_WEBSITE = this.page.getByLabel('COMPANY WEBSITE');
    public readonly COMPANY_NAME = this.page.getByLabel('COMPANY NAME');
    public readonly JOB_TITLE = this.page.getByRole('combobox', { name: 'My Role' });
    public readonly CONSENT_YES_CHECKBOX = this.page.getByText('Yes');
    public readonly NEXT_BUTTON = this.page.getByRole('button', { name: 'Next' });
    public readonly SUBMIT_BUTTON = this.page.getByRole('button', { name: 'Submit' });
    public readonly AREAS_OF_INTEREST = this.page.locator('span');
    public readonly DESCRIPTION = this.page.getByPlaceholder('Type here...', { exact: true });
    public readonly EXPLAIN_YOUR_CHOICE = this.page.locator(("//textarea[@name='category_interest_comment']"));
    public readonly THANK_YOU_MESSAGE = this.page.getByRole('heading', { name: 'Thank you, we’ll be in touch soon.' });

    getMandatoryData(): OxagonFormData {
        return {
            Id: null,
            FirstName: `${faker.name.firstName().replace(/\W/gm, '')} ${faker.random.alpha(5)}`,
            LastName: `${faker.name.lastName().replace(/\W/gm, '')} test automation`,
            Email: faker.internet.email(undefined, undefined, 'test.com', { allowSpecialCharacters: false }).toLowerCase(),
            Phone: `+966${faker.random.numeric(6)}`,
            GlobalHQLocation__c: 'Afghanistan',
            Company: faker.company.name(),
            Website: `${faker.internet.url()}`,
            JobTitle__c: 'C-suite',
            Status: 'ICC Review',
            LeadOwner__c: 'Investor Care Center',
            LeadSource: 'oxagon_form',
            LeadType__c: 'invest in oxagon',
            HasOptedOutOfEmail: false,
            RecordTypeName__c: 'Other Lead',
            SingleInterest__c: null, 
            Interest__c: null, 
            Description: null,
            SpecifyOtherAreaofInterest__c: null,
            CompanySize__c: null,
            Category__c: null,
            CompanyGroupName__c: null,
            FranchiseCompanyActive__c: null,
            FranchiseeName__c: null,
            RetailStoresNumber__c: null,
            SubCategory__c: null,
            CompanyType__c: null
        }
    }

    async fillDetailsPage() {
        await this.FIRST_NAME.fill(this.data.FirstName);
        await this.LAST_NAME.fill(this.data.LastName);
        await this.EMAIL.fill(this.data.Email);
        await this.PHONE.fill(this.data.Phone);
        await this.LOCATION.selectOption(this.data.GlobalHQLocation__c);
        await this.COMPANY_NAME.fill(this.data.Company);
        await this.COMPANY_WEBSITE.fill(this.data.Website);
        await this.JOB_TITLE.selectOption(this.data.JobTitle__c);
        await this.CONSENT_YES_CHECKBOX.click();
        await this.NEXT_BUTTON.click();
    }
}
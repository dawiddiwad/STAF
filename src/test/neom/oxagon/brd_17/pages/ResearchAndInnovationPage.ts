import { faker } from "@faker-js/faker";
import { OxagonForm, OxagonFormData } from "./OxagonForm";

export class ResearchAndInnovationPage extends OxagonForm{
    protected path = 'research';
    public readonly FIRST_NAME = this.page.getByLabel('FIRST NAME');
    public readonly LAST_NAME = this.page.getByLabel('LAST NAME');
    public readonly EMAIL = this.page.getByLabel('EMAIL');
    public readonly PHONE = this.page.getByRole('textbox', { name: 'Type here' });
    public readonly LOCATION = this.page.getByRole('combobox', { name: 'Location *' });
    public readonly COMPANY_WEBSITE = this.page.getByLabel('COMPANY WEBSITE');
    public readonly COMPANY_NAME = this.page.getByLabel('COMPANY NAME');
    public readonly JOB_TITLE = this.page.getByRole('combobox', { name: 'My Role *' });
    public readonly CONSENT_YES_CHECKBOX = this.page.getByText('Yes');
    public readonly NEXT_BUTTON = this.page.getByRole('button', { name: 'Next' });
    public readonly SUBMIT_BUTTON = this.page.getByRole('button', { name: 'Submit' });
    public readonly COMPANY_TYPES = this.page.locator('label');
    public readonly AREAS_OF_INTEREST = this.page.locator('label')
    public readonly EXPLAIN_YOUR_CHOICE = this.page.getByPlaceholder('PLEASE EXPLAIN YOUR CHOICE');
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
            CompanyType__c: 'VC',
            JobTitle__c: 'C-suite',
            SingleInterest__c: 'Autonomous and Sustainable Mobility',
            Status: 'Business Function Review',
            LeadOwner__c: 'Research & Innovation',
            LeadSource: 'oxagon_form',
            HasOptedOutOfEmail: false,
            RecordTypeName__c: 'RI Lead',
            LeadType__c: null, 
            Interest__c: null, 
            Description: null, 
            SpecifyOtherAreaofInterest__c: null,
            CompanySize__c: null, 
            Category__c: null, 
            CompanyGroupName__c: null,
            FranchiseCompanyActive__c: null, 
            FranchiseeName__c: null,
            RetailStoresNumber__c: null, 
            SubCategory__c: null
        }
    }
}
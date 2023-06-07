import { Page } from "@playwright/test";
import { OxagonForm } from "./OxagonForm";

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
}
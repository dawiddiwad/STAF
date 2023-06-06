import { Page } from "@playwright/test";
import { WebformPage } from "./Webform";

export class InvestInOxagonPage extends WebformPage{
    protected formUrl = `${this.baseUrl}/invest`;
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
    public readonly THANK_YOU_MESSAGE = this.page.getByRole('heading', { name: 'Thank you, we’ll be in touch soon.' });;
    constructor(page: Page){
        super(page);
    }
}
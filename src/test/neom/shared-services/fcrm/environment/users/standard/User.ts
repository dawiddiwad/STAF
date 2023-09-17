import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { EnvironmentAccount } from "./objects/EnvironmentAccount";
import { EnvironmentAgreement } from "./objects/EnvironmentAgreement";
import { EnvironmentContact } from "./objects/EnvironmentContact";
import { EnvironmentLead } from "./objects/EnvironmentLead";
import { EnvironmentContract } from "./objects/EnvironmentContract";

export class EnvironmentUser extends User{
    public readonly account: EnvironmentAccount;
    public readonly contact: EnvironmentContact;
    public readonly lead: EnvironmentLead
    public readonly agreement: EnvironmentAgreement;
    public readonly contract: EnvironmentContract;

    constructor(page: Page){
        super({
            profileName: 'Environment User',
            roleName: 'Environment',
            permsetNames: ['Environment_Group', 'BvD_User_Read_Write_Permission', 'Scan to Salesforce'],
            page: page
        });
        this.account = new EnvironmentAccount(this);
        this.contact = new EnvironmentContact(this);
        this.lead = new EnvironmentLead(this);
        this.agreement = new EnvironmentAgreement(this);
        this.contract = new EnvironmentContract(this);
    }
}
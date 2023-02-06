import { Page } from "@playwright/test";
import { User } from "../../../../../utils/common/User";
import { NeomuAccount } from "./objects/NeomuAccount";
import { NeomuAgreement } from "./objects/NeomuAgreement";
import { NeomuContact } from "./objects/NeomuContact";
import { NeomuLead } from "./objects/NeomuLead";
import { NeomuContract } from "./objects/NeomuContract";

export class NeomuUser extends User{
    public readonly account: NeomuAccount;
    public readonly contact: NeomuContact;
    public readonly lead: NeomuLead
    public readonly agreement: NeomuAgreement;
    public readonly contract: NeomuContract;

    constructor(page: Page){
        super({
            profileName: 'NEOM U User',
            roleName: 'NEOM U',
            permsetNames: ['NEOM_U_Group', 'BvD_User_Read_Write_Permission', 'Scan to Salesforce'],
            page: page
        });
        this.account = new NeomuAccount(this);
        this.contact = new NeomuContact(this);
        this.lead = new NeomuLead(this);
        this.agreement = new NeomuAgreement(this);
        this.contract = new NeomuContract(this);
    }
}
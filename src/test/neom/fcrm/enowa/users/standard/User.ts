import { Page } from "@playwright/test";
import { User } from "../../../../../utils/common/User";
import { EnowaAccount } from "./objects/EnowaAccount";
import { EnowaAgreement } from "./objects/EnowaAgreement";
import { EnowaContact } from "./objects/EnowaContact";
import { EnowaLead } from "./objects/EnowaLead";
import { EnowaContract } from "./objects/EnowaContract";

export class EnowaUser extends User{
    public readonly account: EnowaAccount;
    public readonly contact: EnowaContact;
    public readonly lead: EnowaLead
    public readonly agreement: EnowaAgreement;
    public readonly contract: EnowaContract;

    constructor(page: Page){
        super({
            profileName: 'ENOWA User',
            roleName: 'ENOWA',
            permsetNames: ['ENOWA_Group', 'BvD_User_Read_Write_Permission', 'Scan to Salesforce'],            
            page: page
        });
        this.account = new EnowaAccount(this);
        this.contact = new EnowaContact(this);
        this.lead = new EnowaLead(this);
        this.agreement = new EnowaAgreement(this);
        this.contract = new EnowaContract(this);
    }
}
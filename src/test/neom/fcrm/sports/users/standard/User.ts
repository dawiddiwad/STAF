import { Page } from "@playwright/test";
import { User } from "../../../../../utils/common/User";
import { SportsAccount } from "./objects/SportsAccount";
import { SportsAgreement } from "./objects/SportsAgreement";
import { SportsContact } from "./objects/SportsContact";
import { SportsLead } from "./objects/SportsLead";
import { SportsContract } from "./objects/SportsContract";

export class SportsUser extends User{
    public readonly account: SportsAccount;
    public readonly contact: SportsContact;
    public readonly lead: SportsLead
    public readonly agreement: SportsAgreement;
    public readonly contract: SportsContract;

    constructor(page: Page){
        super({
            profileName: 'Sports User',
            roleName: 'Sports',
            permsetNames: ['Sports_Group', 'BvD_User_Read_Write_Permission', 'Scan to Salesforce'],
            page: page
        });
        this.account = new SportsAccount(this);
        this.contact = new SportsContact(this);
        this.lead = new SportsLead(this);
        this.agreement = new SportsAgreement(this);
        this.contract = new SportsContract(this);
    }
}
import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { WaterAccount } from "./objects/WaterAccount";
import { WaterAgreement } from "../standard/objects/WaterAgreement";
import { WaterContact } from "../standard/objects/WaterContact";
import { WaterContract } from "../standard/objects/WaterContract";
import { WaterLead } from "../standard/objects/WaterLead";
import { WaterOpportunity } from "../standard/objects/WaterOpportunity";

export class WaterUser extends User{
    public readonly account: WaterAccount;
    public readonly agreement: WaterAgreement;
    public readonly contact: WaterContact;
    public readonly contract: WaterContract;
    public readonly lead: WaterLead;
    public readonly opportunity: WaterOpportunity;

    constructor(page: Page){
        super({
            profileName: 'Water Standard User',
            roleName: 'Water',
            permsetNames: ['Water_Standard_User', 'Scan_to_Salesforce'],
            page: page
        });
        this.account = new WaterAccount(this);
        this.agreement = new WaterAgreement(this);
        this.contact = new WaterContact(this);
        this.contract = new WaterContract(this);
        this.lead = new WaterLead(this);
        this.opportunity = new WaterOpportunity(this);
    }
}
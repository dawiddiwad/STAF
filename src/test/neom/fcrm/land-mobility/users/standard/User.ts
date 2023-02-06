import { Page } from "@playwright/test";
import { User } from "../../../../../utils/common/User";
import { LandMobilityAccount } from "./objects/LandMobilityAccount";
import { LandMobilityAgreement } from "./objects/LandMobilityAgreement";
import { LandMobilityContact } from "./objects/LandMobilityContact";
import { LandMobilityLead } from "./objects/LandMobilityLead";
import { LandMobilityContract } from "./objects/LandMobilityContract";

export class LandMobilityUser extends User{
    public readonly account: LandMobilityAccount;
    public readonly contact: LandMobilityContact;
    public readonly lead: LandMobilityLead
    public readonly agreement: LandMobilityAgreement;
    public readonly contract: LandMobilityContract;

    constructor(page: Page){
        super({
            profileName: 'Land Mobility User',
            roleName: 'Land Mobility',
            permsetNames: ['Land_Mobility_Group', 'BvD_User_Read_Write_Permission', 'Scan to Salesforce'],
            page: page
        });
        this.account = new LandMobilityAccount(this);
        this.contact = new LandMobilityContact(this);
        this.lead = new LandMobilityLead(this);
        this.agreement = new LandMobilityAgreement(this);
        this.contract = new LandMobilityContract(this);
    }
}
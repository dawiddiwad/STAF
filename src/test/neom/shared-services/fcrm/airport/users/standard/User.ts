import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { AirportAccount } from "./objects/AirportAccount";
import { AirportAgreement } from "./objects/AirportAgreement";
import { AirportContact } from "./objects/AirportContact";
import { AirportLead } from "./objects/AirportLead";
import { AirportContract } from "./objects/AirportContract";

export class AirportUser extends User{
    public readonly account: AirportAccount;
    public readonly contact: AirportContact;
    public readonly lead: AirportLead
    public readonly agreement: AirportAgreement;
    public readonly contract: AirportContract;

    constructor(page: Page){
        super({
            profileName: 'NEOM Airport User',
            roleName: 'NEOM Airport',
            permsetNames: ['NEOM_Airport_Group', 'BvD_User_Read_Write_Permission', 'Scan to Salesforce'],
            page: page
        });
        this.account = new AirportAccount(this);
        this.contact = new AirportContact(this);
        this.lead = new AirportLead(this);
        this.agreement = new AirportAgreement(this);
        this.contract = new AirportContract(this);
    }
}
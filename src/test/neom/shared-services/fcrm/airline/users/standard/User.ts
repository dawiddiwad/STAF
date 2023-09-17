import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { AirlineAccount } from "./objects/AirlineAccount";
import { AirlineAgreement } from "./objects/AirlineAgreement";
import { AirlineContact } from "./objects/AirlineContact";
import { AirlineLead } from "./objects/AirlineLead";
import { AirlineContract } from "./objects/AirlineContract";

export class AirlineUser extends User{
    public readonly account: AirlineAccount;
    public readonly contact: AirlineContact;
    public readonly lead: AirlineLead
    public readonly agreement: AirlineAgreement;
    public readonly contract: AirlineContract;

    constructor(page: Page){
        super({
            profileName: 'NEOM Airline User',
            roleName: 'NEOM Airline',
            permsetNames: ['NEOM_Airline_Group', 'BvD_User_Read_Write_Permission', 'Scan to Salesforce'],
            page: page
        });
        this.account = new AirlineAccount(this);
        this.contact = new AirlineContact(this);
        this.lead = new AirlineLead(this);
        this.agreement = new AirlineAgreement(this);
        this.contract = new AirlineContract(this);
    }
}
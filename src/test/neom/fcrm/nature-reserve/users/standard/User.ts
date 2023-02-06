import { Page } from "@playwright/test";
import { User } from "../../../../../utils/common/User";
import { NatureReserveAccount } from "./objects/NatureReserveAccount";
import { NatureReserveAgreement } from "./objects/NatureReserveAgreement";
import { NatureReserveContact } from "./objects/NatureReserveContact";
import { UrbanPlanningLead } from "./objects/NatureReserveLead";
import { NatureReserveContract } from "./objects/NatureReserveContract";

export class NatureReserveUser extends User{
    public readonly account: NatureReserveAccount;
    public readonly contact: NatureReserveContact;
    public readonly lead: UrbanPlanningLead
    public readonly agreement: NatureReserveAgreement;
    public readonly contract: NatureReserveContract;

    constructor(page: Page){
        super({
            profileName: 'Nature Reserve User',
            roleName: 'Nature Reserve',
            permsetNames: ['Nature_Reserve_Group', 'BvD_User_Read_Write_Permission', 'Scan to Salesforce'],
            page: page
        });
        this.account = new NatureReserveAccount(this);
        this.contact = new NatureReserveContact(this);
        this.lead = new UrbanPlanningLead(this);
        this.agreement = new NatureReserveAgreement(this);
        this.contract = new NatureReserveContract(this);
    }
}
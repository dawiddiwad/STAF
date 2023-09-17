import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { TheLineAccount } from "./objects/TheLineAccount";
import { TheLineAgreement } from "./objects/TheLineAgreement";
import { TheLineContact } from "./objects/TheLineContact";
import { TheLineLead } from "./objects/TheLineLead";
import { TheLineContract } from "./objects/TheLineContract";

export class TheLineUser extends User{
    public readonly account: TheLineAccount;
    public readonly contact: TheLineContact;
    public readonly lead: TheLineLead
    public readonly agreement: TheLineAgreement;
    public readonly contract: TheLineContract;

    constructor(page: Page){
        super({
            profileName: 'The Line User',
            roleName: 'The Line',
            permsetNames: ['The_Line_Group', 'BvD_User_Read_Write_Permission', 'Scan to Salesforce'],
            page: page
        });
        this.account = new TheLineAccount(this);
        this.contact = new TheLineContact(this);
        this.lead = new TheLineLead(this);
        this.agreement = new TheLineAgreement(this);
        this.contract = new TheLineContract(this);
    }
}
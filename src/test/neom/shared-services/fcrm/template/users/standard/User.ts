import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { FcrmAccount } from "./objects/FcrmAccount";
import { FcrmAgreement } from "./objects/FcrmAgreement";
import { FcrmContact } from "./objects/FcrmContact";
import { FcrmLead } from "./objects/FcrmLead";
import { FcrmContract } from "./objects/FrcmContract";

export class FcrmUser extends User{
    public readonly account: FcrmAccount;
    public readonly contact: FcrmContact;
    public readonly lead: FcrmLead
    public readonly agreement: FcrmAgreement;
    public readonly contract: FcrmContract;

    constructor(page: Page){
        super({
            profileName: 'CRM Foundation User',
            roleName: 'CRM Foundation',
            permsetNames: ['CRM_Foundation_Group', 'BvD_User_Read_Write_Permission'],
            page: page
        });
        this.account = new FcrmAccount(this);
        this.contact = new FcrmContact(this);
        this.lead = new FcrmLead(this);
        this.agreement = new FcrmAgreement(this);
        this.contract = new FcrmContract(this);
    }
}
import { Page } from "@playwright/test";
import { User } from "../../../../utils/common/User";
import { MeAccount } from "./objects/MeAccount";
import { MeContact } from "./objects/MeContact";
import { MeContract } from "./objects/MeContract";
import { MeLead } from "./objects/MeLead";
import { MeOpportunity } from "./objects/MeOpportunity";
import { MeOrder } from "./objects/MeOrder";
import { MeProduct } from "./objects/MeProduct";

export class MeUser extends User{
    public readonly lead: MeLead;
    public readonly order: MeOrder;
    public readonly account: MeAccount;
    public readonly contact: MeContact;
    public readonly product: MeProduct;
    public readonly contract: MeContract;
    public readonly opportunity: MeOpportunity;

    constructor(page: Page){
        super({
            profileName: 'NOEM Media & Entertainment',
            roleName: 'Media & Entertainment',
            permsetNames: ['Scan_to_Salesforce'],
            page: page
        });
        this.lead = new MeLead(this);
        this.order = new MeOrder(this);
        this.account = new MeAccount(this);
        this.contact = new MeContact(this);
        this.product = new MeProduct(this);
        this.contract = new MeContract(this);
        this.opportunity = new MeOpportunity(this);
    }
}
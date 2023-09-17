import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { SsAccount } from "./objects/SsAccount";
import { SsContact } from "./objects/SsContact";
import { SsContract } from "./objects/SsContract";
import { SsLead } from "./objects/SsLead";
import { SsOpportunity } from "./objects/SsOpportunity";
import { SsOrder } from "./objects/SsOrder";
import { SsProduct } from "./objects/SsProduct";

export class SsStandardUser extends User{
    public readonly lead: SsLead;
    public readonly order: SsOrder;
    public readonly account: SsAccount;
    public readonly contact: SsContact;
    public readonly product: SsProduct;
    public readonly contract: SsContract;
    public readonly opportunity: SsOpportunity;

    constructor(page: Page){
        super({
            profileName: 'NEOM Shared Services',
            roleName: 'Shared Services',
            page: page
        });
        this.lead = new SsLead(this);
        this.order = new SsOrder(this);
        this.account = new SsAccount(this);
        this.contact = new SsContact(this);
        this.product = new SsProduct(this);
        this.contract = new SsContract(this);
        this.opportunity = new SsOpportunity(this);
    }
}
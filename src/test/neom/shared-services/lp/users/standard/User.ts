import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { LpAccount } from "./objects/LpAccount";
import { LpCase } from "./objects/LpCase";
import { LpContact } from "./objects/LpContact";
import { LpContract } from "./objects/LpContract";
import { LpOpportunity } from "./objects/LpOpportunity";
import { LpProduct } from "./objects/LpProduct";

export class LpStandardUser extends User {
    public readonly account: LpAccount;
    public readonly case: LpCase
    public readonly contact: LpContact;
    public readonly contract: LpContract;
    public readonly product: LpProduct;
    public readonly opportunity: LpOpportunity;

    constructor(page: Page){
        super({
            profileName: 'LP Standard User',
            roleName: 'Logistics Park',
            permsetNames: ['LP_App_Permission_Set'],
            page: page
        });
        this.account = new LpAccount(this);
        this.case = new LpCase(this);
        this.contact = new LpContact(this);
        this.contract = new LpContract(this);
        this.product = new LpProduct(this);
        this.opportunity = new LpOpportunity(this);
    }
}
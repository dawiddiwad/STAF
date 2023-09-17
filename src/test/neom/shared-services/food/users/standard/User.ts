import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { FoodAccount } from "./objects/FoodAccount";
import { FoodAgreement } from "./objects/FoodAgreement";
import { FoodContact } from "./objects/FoodContact";
import { FoodContract } from "./objects/FoodContract";
import { FoodLead } from "./objects/FoodLead";
import { FoodOpportunity } from "./objects/FoodOpportunity";

export class FoodUser extends User {
    public readonly account: FoodAccount;
    public readonly agreement: FoodAgreement;
    public readonly contact: FoodContact;
    public readonly contract: FoodContract;
    public readonly lead: FoodLead;
    public readonly opportunity: FoodOpportunity;

    constructor(page: Page){
        super({
            profileName: 'NEOM Food',
            roleName: 'Food',
            page: page
        });
        this.account = new FoodAccount(this);
        this.agreement = new FoodAgreement(this);
        this.contact = new FoodContact(this);
        this.contract = new FoodContract(this);
        this.lead = new FoodLead(this);
        this.opportunity = new FoodOpportunity(this);
    }
}
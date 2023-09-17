import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { UrbanPlanningAccount } from "./objects/UrbanPlanningAccount";
import { UrbanPlanningAgreement } from "./objects/UrbanPlanningAgreement";
import { UrbanPlanningContact } from "./objects/UrbanPlanningContact";
import { UrbanPlanningLead } from "./objects/UrbanPlanningLead";
import { UrbanPlanningContract } from "./objects/UrbanPlanningContract";

export class UrbanPlanningUser extends User{
    public readonly account: UrbanPlanningAccount;
    public readonly contact: UrbanPlanningContact;
    public readonly lead: UrbanPlanningLead
    public readonly agreement: UrbanPlanningAgreement;
    public readonly contract: UrbanPlanningContract;

    constructor(page: Page){
        super({
            profileName: 'Urban Planning User',
            roleName: 'Urban Planning',
            permsetNames: ['Urban_Planning_Group', 'BvD_User_Read_Write_Permission'],
            page: page
        });
        this.account = new UrbanPlanningAccount(this);
        this.contact = new UrbanPlanningContact(this);
        this.lead = new UrbanPlanningLead(this);
        this.agreement = new UrbanPlanningAgreement(this);
        this.contract = new UrbanPlanningContract(this);
    }
}
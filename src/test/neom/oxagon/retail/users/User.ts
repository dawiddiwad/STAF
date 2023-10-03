import { SalesforceStandardUsers, SalesforceUserDefinition } from "test/utils/common/SalesforceUsers";
import { RetailAccount } from "./objects/RetailAccount";
import { RetailLead } from "./objects/RetailLead";
import { RetailOpportunity } from "./objects/RetailOpportunity";
import { RetailContact } from "./objects/RetailContact";

export class RetailUser extends SalesforceStandardUsers {
    public readonly account: RetailAccount
    public readonly lead: RetailLead
    public readonly opportunity: RetailOpportunity
    public readonly contact: RetailContact
    config = {
        details: {
            'Profile.Name': 'Oxagon Standard User',
            'UserRole.Name': 'Retail Team Member',
            LocaleSidKey: 'en_AE'
        },
        permissionSets: ['RetailUser']
    }

    constructor(mods?: SalesforceUserDefinition){
        super(mods)
        this.account = new RetailAccount(this)
        this.lead = new RetailLead(this)
        this.opportunity = new RetailOpportunity(this)
        this.contact = new RetailContact(this)
    }
}
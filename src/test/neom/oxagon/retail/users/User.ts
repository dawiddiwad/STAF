import { RetailAccount } from "./objects/RetailAccount";
import { SalesforceStandardUsers, SalesforceUserDefinition } from "test/utils/common/SalesforceUsers";
import { RetailLead } from "./objects/RetailLead";

export class RetailUser extends SalesforceStandardUsers {
    public readonly account: RetailAccount
    public readonly lead: RetailLead
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
    }
}
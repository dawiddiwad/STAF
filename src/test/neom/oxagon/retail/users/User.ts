import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";
import { RetailAccount } from "./objects/RetailAccount";

export class RetailUser extends User {
    public readonly account: RetailAccount;

    constructor(page: Page){
        super({
            profileName: 'Oxagon Standard User',
            roleName: 'Retail Team Member',
            localeKey: 'en_AE',
            permsetNames: ['RetailUser'],
            page: page
        })

        this.account = new RetailAccount(this);
    }
}
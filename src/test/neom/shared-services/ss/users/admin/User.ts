import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";

export class SsAdminUser extends User{
    constructor(page: Page){
        super({
            profileName: 'NEOM Shared Services Admin',
            roleName: 'Shared Services',
            page: page
        });
    }
}
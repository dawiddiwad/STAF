import { Page } from "@playwright/test";
import { User } from "test/utils/common/User";

export class ResearchAndInnovationUser extends User{
    constructor(page: Page){
        super({
            profileName: 'Oxagon Standard User',
            roleName: 'RI Team Member',
            permsetNames: ['RITeamMember'],
            page: page
        });
    }
}
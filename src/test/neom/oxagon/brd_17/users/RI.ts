import { Page } from "@playwright/test";
import { User } from "../../../../utils/common/User";

export class ResearchAndInnovationUser extends User{
    public webformUrl: string = 'https://staging.neom.com/en-us/oxagon-form/research';
    constructor(page: Page){
        super({
            profileName: 'Oxagon Standard User',
            roleName: 'RI Team Member',
            permsetNames: ['RITeamMember'],
            page: page
        });
    }
}
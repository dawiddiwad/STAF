import { User, UserInfo } from "../../../utils/common/User";

export class AdminUser extends User {
    constructor(){
        super({
            profileName: 'System Administrator',
            page: undefined
        });
        if (!User.sfdxCredentials) User.sfdxCredentials = this.credentials;
    }

    protected async authorize(): Promise<UserInfo> {
        const defaultUser: any = await this.sfdx.exec({
            cmd: 'force:user:display',
            f: ['--json']
        });
        
        return {
            id: defaultUser.result.id,
            orgId: defaultUser.result.orgId,
            username: defaultUser.result.username,
            password: defaultUser.result.password,
            accessToken: defaultUser.result.accessToken,
            instanceUrl: defaultUser.result.instanceUrl
        } as UserInfo;
    }
}
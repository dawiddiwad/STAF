import { Page } from "@playwright/test";
import { SfdcApiCtx } from "../API/sfdc/SfdcApiCtx";
import { SfdxExecutor } from "../CI/SfdxExecutor";
import { SfdcUiCtx } from "../UI/SfdcUiCtx";

export interface UserDefinition {
    profileName: string,
    roleName?: string,
    permsetNames?: string[],
    page?: Page
}

export interface UserInfo {
    id: string;
    orgId: string;
    username: string;
    password: string;
    accessToken: string;
    instanceUrl: string;
    sessionId: string;
}

export abstract class User {
    protected readonly permissionSetNames?: string[];
    protected readonly profileName: string;
    protected readonly roleName: string;
    protected readonly sfdx: SfdxExecutor;

    public readonly Ready: Promise<this>;
    public static sfdxCredentials: UserInfo;
    public credentials: UserInfo;
    public api: SfdcApiCtx;
    public ui: SfdcUiCtx;

    constructor(data: UserDefinition){
        this.permissionSetNames = data.permsetNames;
        this.profileName = data.profileName;
        this.roleName = data.roleName as string;
        this.sfdx = new SfdxExecutor('sfdx');
        this.Ready = new Promise(async (makeReady) => {
            try {
                this.credentials = await this.authorize(data.page);
                this.api = await new SfdcApiCtx(this).Ready;
                makeReady(this);
            } catch (error) {
                throw new Error(`unable to setup new ${this.profileName} user\ndue to:\n${error}`);
            }
        })
    }

    protected async authorize(page: Page | undefined): Promise<UserInfo>{
        if (!User.sfdxCredentials){
            const defaultUser: any = await this.sfdx.exec({
                cmd: 'force:user:display',
                f: ['--json']
            });
            User.sfdxCredentials = {
                orgId: defaultUser.result.orgId,
                username: defaultUser.result.username,
                instanceUrl: defaultUser.result.instanceUrl,
            } as UserInfo;
            return this.authorize(page);
        } else this.credentials = User.sfdxCredentials;
  
        if (!page){
            throw new Error('Page was specified for autohrization - cannot continue');
        } else {
            await this.workOnPage(page);
            await (await this.ui.page.context().cookies(this.credentials.instanceUrl)).forEach(cookie => {
                if(cookie.name === 'sid'){
                    this.credentials.sessionId = cookie.value;
                }
            });
    
            this.api = await new SfdcApiCtx(this).Ready;
    
            const targetUser = this.permissionSetNames ? await this.searchUserByPermsets() : await this.searchUserByProfileAndRole();
    
            await this.ui.loginAsCrmUser(targetUser.Id);
            await (await this.ui.page.context().cookies(User.sfdxCredentials.instanceUrl)).forEach(cookie => {
                if(cookie.name === 'sid'){
                    this.credentials.sessionId = cookie.value;
                }
            });
    
            return {
                id: targetUser.Id,
                orgId: this.credentials.orgId,
                username: targetUser.Username,
                instanceUrl: this.credentials.instanceUrl,
                sessionId: this.credentials.sessionId
            } as UserInfo;
        }
    };

    private async searchUserByProfileAndRole(): Promise<{Id: string, Username: string}>{
        try {
            return (await this.api.query(`
            SELECT Id, Username FROM User
            WHERE IsActive = true
            AND LocaleSidKey = 'en_GB'
            AND Profile.Name = '${this.profileName}'
            AND UserRole.Name = '${this.roleName}'
            AND Id NOT IN 
                (SELECT AssigneeId
                FROM PermissionSetAssignment
                WHERE IsActive = true
                AND PermissionSet.IsOwnedByProfile = false)
            ORDER BY LastLoginDate ASC
            LIMIT 1
        `) as any).records[0];
        } catch (error) {
            throw new Error(`unable to find any users with:\nProfile: ${this.profileName}\nRole: ${this.roleName}\ndue to:\n${error}`);
        }
    }

    private async searchUserByPermsets(): Promise<{Id: string, Username: string}>{
        const permsetsList = (await this.api.query(`
            SELECT Id, AssigneeId, Assignee.Username, PermissionSet.Name 
            FROM PermissionSetAssignment 
            WHERE IsActive = true
            AND Assignee.IsActive = true
            AND Assignee.LocaleSidKey = 'en_GB'
            AND PermissionSet.IsOwnedByProfile = false
            AND Assignee.UserRole.Name = '${this.roleName}'
            AND Assignee.Profile.Name = '${this.profileName}'
        `) as any).records;

        const candidateUsers = new Set<{Id: string, Username: string}>();
        permsetsList.forEach(record => {
            if (this.permissionSetNames?.includes(record.PermissionSet.Name)){
                candidateUsers.add({Id: record.AssigneeId, Username: record.Assignee.Username});
            }
        })

        let targetUser;
        candidateUsers.forEach(user => {
            let count = 0;
            permsetsList.forEach(record => {
                if (record.AssigneeId === user.Id){
                    count++;
                }
            })
            if (count === this.permissionSetNames?.length){
                targetUser = user;
            }
        })

        if (!targetUser){
            throw new Error(`unable to find any users with:\nProfile: ${this.profileName}\nRole: ${this.roleName}\nPermission sets: ${this.permissionSetNames}`);
        } else return targetUser;
    }

    public async workOnPage(page: Page){
        this.ui = new SfdcUiCtx(this, page);
        await this.ui.Ready;
    }
}
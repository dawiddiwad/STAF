import { Page } from "@playwright/test";
import { SfdxExecutor } from "test/utils/ci/SfdxExecutor";
import { SfdcCtx } from "../common/context/SfdcCtx";
import { User } from "test/utils/common/User";
import { QueryResult } from "jsforce";

export class SfdcUiCtx extends SfdcCtx {
    Ready: Promise<this>;
    page: Page;
    
    constructor (user: User, page: Page){
        super(user);
        this.Ready = new Promise(async (makeReady) => {
            this.page = page;
            await this.login();
            makeReady(this);
        })
    }

    private async loginAsOtherUserBy(loginUrl: string){
        try {
            await this.navigateToResource(loginUrl);
        } catch (error) {
            if ((error as Error).message.toLowerCase().includes('net::err_aborted')){
                await this.page.waitForTimeout(3000);
                return this.loginAsOtherUserBy(loginUrl);
            } else throw error;
        }
    }

    public async navigateToResource(id: string, removeSlash?: boolean): Promise<void> {
        const recordUri = this.user.credentials.instanceUrl
            + (removeSlash ? "" : "/")
            + id;
        await this.page.goto(recordUri);
    }

    public async login(): Promise<void> {
        const sfdx = new SfdxExecutor('sfdx');
        const response: any = await sfdx.exec({
            cmd: 'force:org:open',
            f: ['--json',
                '-r',
                `-u "${this.user.credentials.username}"`]
        });
        await this.page.goto(response.result.url);
    }

    public async loginAsCrmUser(userId: string){
        const loginUrl = `servlet/servlet.su?oid=${this.user.credentials.orgId}&suorgadminid=${userId}&retURL=lightning/page/home&targetURL=lightning/page/home`;
        await this.loginAsOtherUserBy(loginUrl);
        try {
            await this.page.locator("//*[contains(text(),'Logged in as')]").waitFor();
        } catch (error) {
            await this.logout();
            await this.login();
            await this.loginAsCrmUser(userId);
        }
    }

    public async loginAsPortalUser(portalUserId: string, networkName: string){
        const lpNetworkId = (await this.user.api.query(`SELECT Id FROM Network WHERE Name = '${networkName}'`) as QueryResult<any>).records[0].Id;
        const loginUrl = `servlet/servlet.su?oid=${this.user.credentials.orgId}&retURL=/${portalUserId}&sunetworkid=${lpNetworkId}&sunetworkuserid=${portalUserId}`;
        await this.loginAsOtherUserBy(loginUrl);
    }

    public async logout(): Promise<void> {
        await this.navigateToResource(`secur/logout.jsp`);
    }
}
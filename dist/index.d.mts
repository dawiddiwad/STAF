import { TestInfo, Page, Browser } from '@playwright/test';
import { RecordResult, SalesforceId, Record, QueryResult, ExecuteAnonymousResult, MetadataInfo } from 'jsforce';
import * as playwright_core from 'playwright-core';

declare abstract class Api {
    testInfo: TestInfo;
    abstract Ready: Promise<Api>;
    protected captureScreenshot(options: {
        page: Page;
        fullPage?: boolean;
    }): Promise<void>;
    protected captureFullPageScreenshot(page: Page): Promise<void>;
}

interface RecordUiData {
    Compact?: LayoutMode;
    Full?: LayoutMode;
}
interface LayoutMode {
    Create?: Layout | boolean;
    Edit?: Layout | boolean;
    View?: Layout | boolean;
}
interface Layout {
    sections: any;
}
declare class UiLayout implements RecordUiData {
    Compact?: LayoutMode;
    Full?: LayoutMode;
    constructor(data: RecordUiData);
}

type SalesforceInstance = 'SANDBOX' | 'PRODUCTION' | URL;
type UsernamePassword = {
    username: string;
    password: string;
};
type StorageState = {
    cookies: {
        name: string;
        value: string;
        url?: string;
        domain?: string;
        path?: string;
        expires?: number;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "Strict" | "Lax" | "None";
    }[];
    origins: {}[];
};
type DefaultCliUserInfo = {
    status: number;
    result: {
        orgId: string;
        url: string;
        username: string;
    };
    warnings: string[];
};
type SalesforceFrontdoorData = {
    sessionId: string;
    instance: string;
};
type UiGateway = {
    loginToUi(page: Page): Promise<StorageState>;
};
type ApiGateway = {
    loginToApi(): Promise<Api>;
};

declare class NoRecordsReturnedError extends Error {
    constructor(msg: string);
}
declare class SalesforceApi extends Api {
    private version;
    private conn;
    Ready: Promise<this>;
    constructor(frontdoorData: SalesforceFrontdoorData, version?: string);
    private parseLayoutFromLayoutResponse;
    create(sobject: string, data: object | object[]): Promise<RecordResult | RecordResult[]>;
    update(sobject: string, data: object | object[]): Promise<RecordResult | RecordResult[]>;
    delete(sobject: string, id: SalesforceId | SalesforceId[]): Promise<RecordResult | RecordResult[]>;
    read(sobject: string, id: SalesforceId | SalesforceId[]): Promise<Record | Record[]>;
    query(soql: string): Promise<QueryResult<unknown>>;
    executeApex(apexBody: string): Promise<ExecuteAnonymousResult>;
    readRecordUi(recordId: string, options?: RecordUiData): Promise<MetadataInfo | MetadataInfo[]>;
    readApps(formFactor?: 'Large' | 'Medium' | 'Small', userCustomizations?: boolean): Promise<MetadataInfo | MetadataInfo[]>;
    readRelatedListsUi(object: string, recordTypeId?: string): Promise<MetadataInfo | MetadataInfo[]>;
    readLayoutsFromOrg(recordId: string, options?: RecordUiData): Promise<UiLayout>;
    writeLayoutSectionsToFileFromOrg(filePath: string, recordId: string, dataToFetch: RecordUiData): Promise<void>;
    validateVisibleRecordLayouts(recordId: string, page?: Page, options?: RecordUiData): Promise<void>;
    validateAvailableApps(page?: Page): Promise<void>;
    writeAppsToFileFromOrg(filePath: string): Promise<void>;
}

interface SalesforceCliParameters {
    cmd: string;
    f?: Array<string>;
    log?: boolean;
}
declare class SalesforceCliHandler {
    private path;
    constructor(path?: string);
    private pass;
    private parseResponse;
    private handleError;
    exec({ cmd, f: flags, log }: SalesforceCliParameters): Promise<any>;
}

declare class storageStateHandler implements UiGateway {
    private storageState;
    constructor(storageState: StorageState);
    loginToUi(page: Page): Promise<StorageState>;
}
declare class DefaultCliUserHandler implements UiGateway, ApiGateway {
    private cli;
    _defaultUserData: Promise<DefaultCliUserInfo>;
    constructor(cliHandler: SalesforceCliHandler);
    get defaultUserData(): Promise<DefaultCliUserInfo>;
    private parseFrontDoorData;
    loginToUi(page: Page): Promise<StorageState>;
    loginToApi(): Promise<SalesforceApi>;
}
declare class CredentialsHandler implements UiGateway {
    private credentials;
    instance: URL;
    constructor(credentials: UsernamePassword, instance: SalesforceInstance);
    loginToUi(page: Page): Promise<StorageState>;
}
declare class SessionIdHandler implements UiGateway, ApiGateway {
    private frontDoor;
    constructor(frontDoor: SalesforceFrontdoorData);
    loginToUi(page: Page): Promise<StorageState>;
    loginToApi(): Promise<SalesforceApi>;
}
declare class SalesforceAuthenticator {
    usingStorageState: (data: StorageState) => storageStateHandler;
    usingSessionId: (data: SalesforceFrontdoorData) => SessionIdHandler;
    usingCli: (handler: SalesforceCliHandler) => DefaultCliUserHandler;
    usingCredentials: (credentials: UsernamePassword, instance: SalesforceInstance) => CredentialsHandler;
}

interface SalesforceUserDefinition {
    details?: {};
    permissionSets?: string[];
}
declare class SalesforceDefaultCliUser {
    static _instance: Promise<SalesforceDefaultCliUser>;
    private browser;
    authorizationState: StorageState;
    info: DefaultCliUserInfo;
    ui: Page;
    api: SalesforceApi;
    Ready: Promise<this>;
    private constructor();
    static get instance(): Promise<SalesforceDefaultCliUser>;
    impersonateCrmUser(salesforceUserId: string): Promise<StorageState>;
}
declare abstract class SalesforceStandardUsers {
    private static uniquePool;
    private static _cached;
    abstract config: SalesforceUserDefinition;
    ui: Page;
    api: SalesforceApi;
    Ready: Promise<this>;
    constructor(mods?: SalesforceUserDefinition);
    get cached(): Promise<StorageState>;
    use(browser: Browser): Promise<this>;
}

declare class SOQLBuilder {
    private parseValue;
    crmUsersMatching(config: SalesforceUserDefinition): string;
}

declare class SalesforceNavigator {
    static readonly PRODUCTION_LOGIN_URL: URL;
    static readonly SANDBOX_LOGIN_URL: URL;
    static readonly HOME_PATH = "/home/home.jsp";
    static readonly FRONTDOOR_PATH = "secur/frontdoor.jsp";
    static readonly IMPERSONATION_PATH = "servlet/servlet.su";
    static readonly SESSIONID_PARAM = "sid";
    static readonly ORGANIZATION_ID_PARAM = "oid";
    static readonly IMPERSONATION_USER_ID_PARAM = "suorgadminid";
    static readonly TARGET_ULR_PARAM = "targetURL";
    static readonly RETURN_URL_PARAM = "retURL";
    static readonly APP_OR_TAB_SET_ID_PARAM = "tsid";
    private constructor();
    static buildLoginUrl(frontdoorData: {
        sessionId: string;
        instance: string;
    }): URL;
    static buildImpersonationUrl(data: {
        instanceUrl: string;
        orgId: string;
        targetUserId: string;
    }): URL;
    static openResource(resourcePath: string, page: Page): Promise<playwright_core.Response>;
    static openHome(page: Page): Promise<playwright_core.Response>;
}

declare abstract class SalesforceObject {
    readonly user: SalesforceStandardUsers;
    constructor(user: SalesforceStandardUsers);
}
interface IsCreatableViaApi {
    createViaApi: (data?: any) => Promise<string>;
}
interface IsCreatableViaUi {
    createViaUI: (data?: any) => Promise<void>;
}

declare abstract class AbstractPage {
    protected page: Page;
    constructor(page: Page);
}

declare class SalesforceLoginPage extends AbstractPage {
    readonly instance: URL;
    readonly username: playwright_core.Locator;
    readonly password: playwright_core.Locator;
    readonly loginButton: playwright_core.Locator;
    constructor(page: Page, instance: URL);
    loginUsing(credentials: UsernamePassword): Promise<StorageState>;
}

export { AbstractPage, Api, ApiGateway, DefaultCliUserInfo, IsCreatableViaApi, IsCreatableViaUi, NoRecordsReturnedError, RecordUiData, SOQLBuilder, SalesforceApi, SalesforceAuthenticator, SalesforceCliHandler, SalesforceDefaultCliUser, SalesforceFrontdoorData, SalesforceInstance, SalesforceLoginPage, SalesforceNavigator, SalesforceObject, SalesforceStandardUsers, SalesforceUserDefinition, StorageState, UiGateway, UiLayout, UsernamePassword };

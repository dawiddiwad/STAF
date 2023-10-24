import { TestInfo, Page, Browser } from '@playwright/test';
import { RecordResult, SalesforceId, Record, QueryResult, ExecuteAnonymousResult } from 'jsforce';
import * as playwright_core from 'playwright-core';

declare abstract class Api {
    testInfo: TestInfo;
    abstract Ready: Promise<Api>;
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
    private readRecordUi;
    private readApps;
    private readLayoutsFromOrg;
    create(sobject: string, data: object | object[]): Promise<RecordResult | RecordResult[]>;
    update(sobject: string, data: object | object[]): Promise<RecordResult | RecordResult[]>;
    delete(sobject: string, id: SalesforceId | SalesforceId[]): Promise<RecordResult | RecordResult[]>;
    read(sobject: string, id: SalesforceId | SalesforceId[]): Promise<Record | Record[]>;
    query(soql: string): Promise<QueryResult<unknown>>;
    executeApex(apexBody: string): Promise<ExecuteAnonymousResult>;
    validateRecordLayoutsFor(recordId: string, page?: Page, options?: RecordUiData): Promise<void>;
    validateAppsAndTabsFor(page?: Page): Promise<void>;
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
    exec({ cmd, f: flags, log }: SalesforceCliParameters): Promise<any>;
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
declare class SalesforceAuthenticator {
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
    private Ready;
    authorizationState: StorageState;
    info: DefaultCliUserInfo;
    ui: Page;
    api: SalesforceApi;
    private constructor();
    static get instance(): Promise<SalesforceDefaultCliUser>;
    impersonateCrmUser(salesforceUserId: string): Promise<StorageState>;
}
declare abstract class SalesforceStandardUser {
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
    recordTypeByName(name: string): string;
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
    static readonly FLEXIPAGE_COMPONENT_ID = "data-component-id";
    static readonly FLEXIPAGE_COMPONENT_CSS_LOCATOR: string;
    static readonly FLEXIPAGE_FIELD_LABEL = ".test-id__field-label";
    static readonly FLEXIPAGE_HIGHLIGHTS_ITEM = "records-highlights-details-item";
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
    readonly user: SalesforceStandardUser;
    flexipage: {
        validateComponentsFor: (recordId: string) => Promise<void>;
    };
    constructor(user: SalesforceStandardUser);
    recordTypeIdFor(recordTypeName: string): Promise<string>;
}
interface IsCreatableViaApi {
    createViaApi: (data?: any) => Promise<string>;
}
interface IsCreatableViaUi {
    createViaUI: (data?: any) => Promise<void>;
}

declare abstract class AbstractPage {
    ui: Page;
    constructor(page: Page);
    attachScreenshotToTestInfo(screenshot: Buffer, testInfo: TestInfo): Promise<void>;
    captureScreenshot(options: {
        fullPage?: boolean;
    }): Promise<Buffer>;
    captureFullPageScreenshot(): Promise<Buffer>;
    scrollPageBottomTop(): Promise<void>;
    scrollPageTopBottom(): Promise<void>;
}

declare class SalesforcePage extends AbstractPage {
}

declare class SalesforceLoginPage extends SalesforcePage {
    readonly instance: URL;
    readonly username: playwright_core.Locator;
    readonly password: playwright_core.Locator;
    readonly loginButton: playwright_core.Locator;
    constructor(page: Page, instance: URL);
    loginUsing(credentials: UsernamePassword): Promise<StorageState>;
}

export { AbstractPage, Api, ApiGateway, DefaultCliUserInfo, IsCreatableViaApi, IsCreatableViaUi, NoRecordsReturnedError, RecordUiData, SOQLBuilder, SalesforceApi, SalesforceAuthenticator, SalesforceCliHandler, SalesforceDefaultCliUser, SalesforceFrontdoorData, SalesforceInstance, SalesforceLoginPage, SalesforceNavigator, SalesforceObject, SalesforceStandardUser, SalesforceUserDefinition, StorageState, UiGateway, UiLayout, UsernamePassword };

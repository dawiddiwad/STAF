// src/api/Api.ts
var Api = class {
  testInfo;
};

// src/api/SalesforceApi.ts
import { expect } from "@playwright/test";
import { Connection } from "jsforce";

// src/api/UiLayout.ts
var UiLayout = class {
  Compact;
  Full;
  constructor(data) {
    this.Compact = data.Compact;
    this.Full = data.Full;
  }
};

// src/common/SalesforceUsers.ts
import { chromium } from "@playwright/test";

// src/common/pages/AbstractPage.ts
var AbstractPage = class {
  ui;
  constructor(page) {
    this.ui = page;
  }
  async attachScreenshotToTestInfo(screenshot, testInfo) {
    await testInfo.attach("screenshot", { body: screenshot, contentType: "image/png" });
  }
  async captureScreenshot(options) {
    await this.ui.waitForLoadState("networkidle");
    return this.ui.screenshot({ fullPage: options.fullPage });
  }
  async captureFullPageScreenshot() {
    await this.ui.waitForLoadState("networkidle");
    await this.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await this.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
    return this.captureScreenshot({ fullPage: true });
  }
  async scrollPageBottomTop() {
    await this.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await this.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
  }
  async scrollPageTopBottom() {
    await this.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
    await this.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  }
};

// src/common/pages/SalesforcePage.ts
var SalesforcePage = class extends AbstractPage {
};

// src/common/pages/SalesforceLoginPage.ts
var SalesforceLoginPage = class extends SalesforcePage {
  instance;
  username = this.ui.getByLabel("Username");
  password = this.ui.getByLabel("Password");
  loginButton = this.ui.getByRole("button").getByText("Log In");
  constructor(page, instance) {
    super(page);
    this.instance = instance;
  }
  async loginUsing(credentials) {
    await this.ui.goto(this.instance.toString());
    await this.username.fill(credentials.username);
    await this.password.fill(credentials.password);
    await this.loginButton.click();
    return this.ui.context().storageState();
  }
};

// src/auth/SalesforceAuthenticator.ts
var DefaultCliUserHandler = class {
  cli;
  _defaultUserData;
  constructor(cliHandler) {
    this.cli = cliHandler;
  }
  get defaultUserData() {
    try {
      if (!this._defaultUserData) {
        this._defaultUserData = this.cli.exec({
          cmd: "org open",
          f: ["--json", "-r"]
        });
      }
    } catch (error) {
      throw new Error(`unable to authorize default cli user
                
due to:
                
${error}`);
    }
    return this._defaultUserData;
  }
  async parseFrontDoorData() {
    const loginUrl = new URL((await this.defaultUserData).result.url);
    return {
      instance: loginUrl.origin,
      sessionId: loginUrl.searchParams.get(SalesforceNavigator.SESSIONID_PARAM)
    };
  }
  async loginToUi(page) {
    await page.goto((await this.defaultUserData).result.url, { waitUntil: "commit" });
    return page.context().storageState();
  }
  async loginToApi() {
    return new SalesforceApi(await this.parseFrontDoorData()).Ready;
  }
};
var CredentialsHandler = class {
  credentials;
  instance;
  constructor(credentials, instance) {
    this.credentials = credentials;
    switch (instance) {
      case "PRODUCTION":
        this.instance = SalesforceNavigator.PRODUCTION_LOGIN_URL;
        break;
      case "SANDBOX":
        this.instance = SalesforceNavigator.SANDBOX_LOGIN_URL;
        break;
      default:
        this.instance = instance;
    }
  }
  async loginToUi(page) {
    return new SalesforceLoginPage(page, this.instance).loginUsing(this.credentials);
  }
};
var SalesforceAuthenticator = class {
  usingCli = (handler) => new DefaultCliUserHandler(handler);
  usingCredentials = (credentials, instance) => new CredentialsHandler(credentials, instance);
};

// src/cli/SalesforceCli.ts
import { exec } from "child_process";
var SalesforceCliHandler = class {
  path;
  constructor(path = "sf") {
    this.path = path;
  }
  pass(params) {
    return params.join(" ");
  }
  parseResponse(response) {
    try {
      const cliColoring = /[\u001b\u009b][[()#?]*(?:[0-9]{1,4}(?:[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
      response = response.replace(cliColoring, "");
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`unable to parse SFDX command response:

${response}

due to:
${error}`);
    }
  }
  async exec({ cmd, f: flags, log }) {
    const fullCommand = `${this.path} ${cmd} ${flags ? this.pass(flags) : ""}`;
    if (log)
      console.info(`Executing ${this.path} command: ${fullCommand}`);
    return new Promise((resolve) => {
      exec(fullCommand, (error, stdout) => {
        if (error && error.code === 1) {
          throw new Error(`${this.path} command failed with exit code: ${error.code} caused by:
${error.message}
                        
Error details:
${JSON.stringify(this.parseResponse(stdout), null, 3)}`);
        } else {
          resolve(flags?.includes("--json") ? this.parseResponse(stdout) : stdout);
        }
      });
    });
  }
};

// src/common/SOQLBuilder.ts
var SOQLBuilder = class {
  parseValue(value) {
    if (typeof value == "boolean") {
      return `${value}`;
    } else {
      return `'${value}'`;
    }
  }
  crmUsersMatching(config) {
    const soql = [];
    soql.push(`SELECT Id, Username FROM USER`);
    soql.push(`WHERE IsActive = true`);
    soql.push(`AND UserType = 'Standard'`);
    if (config.details) {
      Object.entries(config.details).forEach((record) => soql.push(`AND ${record[0]} = ${this.parseValue(record[1])}`));
    }
    if (config.permissionSets) {
      config.permissionSets.forEach((name) => {
        soql.push(`AND Id IN`);
        soql.push(`(`);
        soql.push(`SELECT AssigneeId`);
        soql.push(`FROM PermissionSetAssignment`);
        soql.push(`WHERE IsActive = true`);
        soql.push(`AND PermissionSet.name = '${name}'`);
        soql.push(`)`);
      });
    }
    return soql.join("\n");
  }
  recordTypeByName(name) {
    return `SELECT Id FROM RecordType WHERE Name = '${name}'`;
  }
};

// src/common/SalesforceUsers.ts
var SalesforceDefaultCliUser = class _SalesforceDefaultCliUser {
  static _instance;
  browser;
  Ready;
  authorizationState;
  info;
  ui;
  api;
  constructor(authenticator) {
    this.Ready = new Promise(async (makeReady) => {
      const handler = authenticator.usingCli(new SalesforceCliHandler());
      this.info = await handler.defaultUserData;
      this.api = await handler.loginToApi();
      this.browser = await chromium.launch({ headless: true });
      this.ui = await this.browser.newContext().then((context) => context.newPage());
      this.authorizationState = await handler.loginToUi(this.ui);
      makeReady(this);
    });
  }
  static get instance() {
    if (!_SalesforceDefaultCliUser._instance) {
      return _SalesforceDefaultCliUser._instance = new _SalesforceDefaultCliUser(new SalesforceAuthenticator()).Ready;
    } else
      return _SalesforceDefaultCliUser._instance;
  }
  async impersonateCrmUser(salesforceUserId) {
    const impersonationUrl = SalesforceNavigator.buildImpersonationUrl({
      instanceUrl: new URL(this.info.result.url).origin,
      orgId: this.info.result.orgId,
      targetUserId: salesforceUserId
    }).toString();
    const isolatedPage = await this.browser.newContext().then((context) => context.newPage());
    await isolatedPage.context().addCookies(this.authorizationState.cookies);
    await isolatedPage.goto(impersonationUrl, { waitUntil: "commit" });
    const otherCrmUserStorageData = await isolatedPage.context().storageState();
    await isolatedPage.context().close();
    return otherCrmUserStorageData;
  }
};
var SalesforceStandardUser = class _SalesforceStandardUser {
  static _cached = /* @__PURE__ */ new Map();
  ui;
  api;
  Ready;
  constructor(mods) {
    this.Ready = new Promise(async (makeReady) => {
      this.config = { ...this.config, ...mods };
      const frontdoor = await SalesforceDefaultCliUser.instance.then((instance2) => instance2.info.result.url);
      const sessionId = (await this.cached).cookies.filter(
        (cookie) => cookie.name === "sid" && frontdoor.includes(cookie.domain)
      )[0].value;
      const instance = new URL(frontdoor).origin;
      const frontDoor = { instance, sessionId };
      this.api = await new SalesforceApi(frontDoor).Ready;
      makeReady(this);
    });
  }
  get cached() {
    if (!_SalesforceStandardUser._cached.get(this.constructor.name)) {
      return SalesforceDefaultCliUser.instance.then((cliUser) => {
        const users = new SOQLBuilder().crmUsersMatching(this.config);
        return cliUser.api.query(users).then((result) => {
          const selected = result.records[0].Id;
          _SalesforceStandardUser._cached.set(this.constructor.name, cliUser.impersonateCrmUser(selected));
          return _SalesforceStandardUser._cached.get(this.constructor.name);
        });
      });
    } else
      return _SalesforceStandardUser._cached.get(this.constructor.name);
  }
  async use(browser) {
    const context = await browser.newContext();
    await context.addCookies((await this.cached).cookies);
    this.ui = await context.newPage();
    return this;
  }
};

// src/common/SalesforceNavigator.ts
var SalesforceNavigator = class _SalesforceNavigator {
  static PRODUCTION_LOGIN_URL = new URL("https://login.salesforce.com/");
  static SANDBOX_LOGIN_URL = new URL("https://test.salesforce.com/");
  static HOME_PATH = "/home/home.jsp";
  static FRONTDOOR_PATH = "secur/frontdoor.jsp";
  static IMPERSONATION_PATH = "servlet/servlet.su";
  static SESSIONID_PARAM = "sid";
  static ORGANIZATION_ID_PARAM = "oid";
  static IMPERSONATION_USER_ID_PARAM = "suorgadminid";
  static TARGET_ULR_PARAM = "targetURL";
  static RETURN_URL_PARAM = "retURL";
  static APP_OR_TAB_SET_ID_PARAM = "tsid";
  static FLEXIPAGE_COMPONENT_ID = "data-component-id";
  static FLEXIPAGE_COMPONENT_CSS_LOCATOR = `[${_SalesforceNavigator.FLEXIPAGE_COMPONENT_ID}]`;
  static FLEXIPAGE_FIELD_LABEL = ".test-id__field-label";
  static FLEXIPAGE_HIGHLIGHTS_ITEM = "records-highlights-details-item";
  constructor() {
  }
  static buildLoginUrl(frontdoorData) {
    const url = new URL(_SalesforceNavigator.FRONTDOOR_PATH, frontdoorData.instance);
    url.searchParams.append(_SalesforceNavigator.SESSIONID_PARAM, frontdoorData.sessionId);
    return url;
  }
  static buildImpersonationUrl(data) {
    const url = new URL(_SalesforceNavigator.IMPERSONATION_PATH, data.instanceUrl);
    url.searchParams.append(_SalesforceNavigator.ORGANIZATION_ID_PARAM, data.orgId);
    url.searchParams.append(_SalesforceNavigator.IMPERSONATION_USER_ID_PARAM, data.targetUserId);
    url.searchParams.append(_SalesforceNavigator.TARGET_ULR_PARAM, _SalesforceNavigator.HOME_PATH);
    url.searchParams.append(_SalesforceNavigator.RETURN_URL_PARAM, _SalesforceNavigator.HOME_PATH);
    return url;
  }
  static async openResource(resourcePath, page) {
    const origin = new URL((await SalesforceDefaultCliUser._instance).info.result.url).origin;
    const resourceUrl = new URL(resourcePath, origin).toString();
    return page.goto(resourceUrl);
  }
  static async openHome(page) {
    return _SalesforceNavigator.openResource(_SalesforceNavigator.HOME_PATH, page);
  }
};

// src/api/SalesforceApi.ts
var NoRecordsReturnedError = class extends Error {
  constructor(msg) {
    super(msg);
  }
};
var SalesforceApi = class extends Api {
  version;
  conn;
  Ready;
  constructor(frontdoorData, version) {
    super();
    version ? this.version = version : this.version = "57.0";
    this.Ready = new Promise((connect) => {
      try {
        this.conn = new Connection({
          instanceUrl: frontdoorData.instance,
          sessionId: frontdoorData.sessionId,
          version: this.version
        });
        connect(this);
      } catch (error) {
        throw new Error(`unable to initialize SFDC API due to:
${error}`);
      }
    });
  }
  parseLayoutFromLayoutResponse(layoutData) {
    const sfdcEtag = /[a-zA-Z0-9]{32}/gm;
    const sfdcLongId = /[a-zA-Z0-9]{18}/gm;
    const filter = /"filter":.+",/gm;
    const placeholder = /"placeholder":.+",/gm;
    return JSON.parse(
      JSON.stringify(layoutData, null, 3).replace(sfdcEtag, "").replace(sfdcLongId, "").replace(filter, "").replace(placeholder, "")
    );
  }
  async readRecordUi(recordId, options) {
    options = options ? options : {
      Full: { Edit: true, Create: true, View: true },
      Compact: { Edit: true, Create: true, View: true }
    };
    const types = () => {
      let types2 = "";
      options?.Full ? types2 += "Full" : null;
      options?.Compact ? types2 ? types2 += ",Compact" : types2 += "Compact" : null;
      if (!types2)
        throw new Error(`missing layout types for ui-record request:
${JSON.stringify(options)}`);
      else
        return types2;
    };
    const modes = () => {
      let modes2 = "";
      if (options && options.Full) {
        if (!options.Full) {
          options.Full = options.Compact;
        }
        if (options.Full.Create) {
          modes2 += "Create";
        }
        if (options.Full.Edit) {
          modes2 += modes2 ? ",Edit" : "Edit";
        }
        if (options.Full.View) {
          modes2 += modes2 ? ",View" : "View";
        }
      }
      if (!modes2)
        throw new Error(`missing layout modes for ui-record request:
${JSON.stringify(options)}`);
      else
        return modes2;
    };
    const resource = `/ui-api/record-ui/${recordId}?layoutTypes=${types()}&modes=${modes()}`;
    try {
      return this.conn.request({ method: "Get", url: resource });
    } catch (error) {
      throw new Error(`unable to retrieve ${resource} due to:
${error}`);
    }
  }
  async readApps(formFactor, userCustomizations) {
    const formFactorParam = formFactor ? `?formFactor=${formFactor}` : `?formFactor=Large`;
    const userCustomizationsParam = userCustomizations ? `&userCustomizations=${userCustomizations}` : "";
    const resource = `/ui-api/apps${formFactorParam}${userCustomizationsParam}`;
    try {
      let result = await this.conn.request({ method: "Get", url: resource });
      const sfdcEtag = /[a-zA-Z0-9]{32}/gm;
      const sfdcLongId = /[a-zA-Z0-9]{18}/gm;
      const url = /^.*\bhttps\b.*$/gm;
      return JSON.parse(JSON.stringify(result, null, 3).replace(sfdcEtag, "").replace(sfdcLongId, "").replace(url, ""));
    } catch (error) {
      throw new Error(`unable to fetch available Apps due to:
${error}`);
    }
  }
  async readLayoutsFromOrg(recordId, options) {
    try {
      let data = Object.values((await this.readRecordUi(recordId, options)).layouts)[0];
      data = this.parseLayoutFromLayoutResponse(data);
      return new UiLayout(Object.values(data)[0]);
    } catch (error) {
      throw new Error(`Unable to read Layout data from org due to:
${error}`);
    }
  }
  async create(sobject, data) {
    try {
      return await this.conn.create(sobject, data, { allOrNone: true });
    } catch (error) {
      throw new Error(`unable to create ${sobject} due to:
${error}`);
    }
  }
  async update(sobject, data) {
    try {
      return await this.conn.update(sobject, data, { allOrNone: true });
    } catch (error) {
      throw new Error(`unable to update ${sobject} with data:
${JSON.stringify(data, null, 3)}
due to:
${error}`);
    }
  }
  async delete(sobject, id) {
    try {
      return await this.conn.delete(sobject, id);
    } catch (error) {
      throw new Error(`unable to delete ${sobject} record ${id} due to:
${error}`);
    }
  }
  async read(sobject, id) {
    try {
      return await this.conn.retrieve(sobject, id);
    } catch (error) {
      throw new Error(`unable to read ${sobject} record ${id} due to:
${error}`);
    }
  }
  async query(soql) {
    let result;
    try {
      result = await this.conn.query(soql);
    } catch (error) {
      throw new Error(`unable to execute soql:
${soql}
due to:
$
${error}`);
    }
    if (!result.records.length) {
      throw new NoRecordsReturnedError(`no records returned by soql:
${soql}`);
    } else
      return result;
  }
  async executeApex(apexBody) {
    let result;
    try {
      result = await this.conn.tooling.executeAnonymous(apexBody);
    } catch (error) {
      throw new Error(`unable to execute anonymous apex:
${apexBody}
due to:
${error}`);
    }
    if (!result.success) {
      throw new Error(`exception running anonymous apex:
${apexBody}
due to:
${result.exceptionMessage}
${result.exceptionStackTrace}`);
    } else
      return result;
  }
  async validateRecordLayoutsFor(recordId, page, options) {
    try {
      const orgLayouts = this.readLayoutsFromOrg(recordId, options);
      if (page && this.testInfo) {
        await Promise.all([
          orgLayouts,
          SalesforceNavigator.openResource(recordId, page).then(async () => {
            const currentPage = new SalesforcePage(page);
            await currentPage.attachScreenshotToTestInfo(
              await currentPage.captureFullPageScreenshot(),
              this.testInfo
            );
          })
        ]);
      }
      expect(JSON.stringify(await orgLayouts, null, 3)).toMatchSnapshot();
    } catch (error) {
      throw new Error(`Layouts validation via UI-API failed due to:
${error}`);
    }
  }
  async validateAppsAndTabsFor(page) {
    try {
      const orgApps = this.readApps();
      if (page && this.testInfo) {
        await Promise.all([
          orgApps,
          SalesforceNavigator.openHome(page).then(async () => {
            await page.getByRole("button", { name: "App Launcher" }).click();
            const currentPage = new SalesforcePage(page);
            await currentPage.attachScreenshotToTestInfo(
              await currentPage.captureScreenshot({ fullPage: false }),
              this.testInfo
            );
          })
        ]);
      }
      expect(JSON.stringify(await orgApps, null, 3)).toMatchSnapshot;
    } catch (error) {
      throw new Error(`Apps validation via UI-API failed due to:
${error}`);
    }
  }
};

// src/common/SalesforceObject.ts
import { expect as expect2 } from "@playwright/test";

// src/common/pages/FlexiPage.ts
var FlexiPage = class extends SalesforcePage {
  async getComponentsFor(recordId) {
    await SalesforceNavigator.openResource(recordId, this.ui);
    await this.ui.waitForLoadState("networkidle");
    await this.scrollPageBottomTop();
    await this.ui.waitForLoadState("networkidle");
    const snapshot = [];
    await this.ui.$$(SalesforceNavigator.FLEXIPAGE_COMPONENT_CSS_LOCATOR).then(async (flexipageComponents) => {
      for (const component of flexipageComponents) {
        if (!(await component.$$(SalesforceNavigator.FLEXIPAGE_COMPONENT_CSS_LOCATOR)).length) {
          const parseComponentId = async () => {
            snapshot.push(`[FLEXCOMPONENT] ${await component.getAttribute(SalesforceNavigator.FLEXIPAGE_COMPONENT_ID)}`);
          };
          const parseLabeledFields = async () => {
            for (const field of await component.$$(SalesforceNavigator.FLEXIPAGE_FIELD_LABEL)) {
              const label = await field.innerText();
              if (label) {
                snapshot.push(`[FIELD] ${label}`);
              }
            }
          };
          const parseHighlightFields = async () => {
            for (const field of await component.$$(SalesforceNavigator.FLEXIPAGE_HIGHLIGHTS_ITEM)) {
              for (const paragraph of await field.$$("*")) {
                const title = await paragraph.getAttribute("title");
                if (title && !title.toLowerCase().includes("preview") && !await paragraph.getAttribute("src")) {
                  snapshot.push(`[FIELD] ${title}`);
                }
              }
            }
          };
          const parseButtons = async () => {
            for (const action of await component.$$("button")) {
              const actionText = await action.innerText();
              if (actionText && !actionText.toLowerCase().includes("preview")) {
                snapshot.push(`[BUTTON] ${await action.innerText()}`);
              }
            }
          };
          const parseLinks = async () => {
            for (const hyperlink of await component.$$("a")) {
              const title = await hyperlink.getAttribute("title");
              if (title && !(await hyperlink.getAttribute("class")).toLowerCase().includes("outputlookuplink")) {
                snapshot.push(`[LINK] ${title}`);
              }
            }
          };
          const createSnapshotFooter = () => {
            snapshot.push("------");
            snapshot.push("");
          };
          await parseComponentId();
          await parseLabeledFields();
          await parseHighlightFields();
          await parseButtons();
          await parseLinks();
          createSnapshotFooter();
        }
      }
    });
    return snapshot.join("\n");
  }
};

// src/common/SalesforceObject.ts
var SalesforceObject = class {
  user;
  flexipage;
  constructor(user) {
    this.user = user;
    this.flexipage = {
      validateComponentsFor: async (recordId) => {
        const flexipage = new FlexiPage(this.user.ui);
        const parsedComponents = await flexipage.getComponentsFor(recordId);
        if (this.user.api.testInfo) {
          try {
            await expect2(flexipage.ui).toHaveScreenshot({ maxDiffPixels: 0, fullPage: true });
            await this.user.api.testInfo.attach("screenshot", { body: await flexipage.ui.screenshot({ fullPage: true }), contentType: "image/png" });
          } catch (error) {
            await this.user.api.testInfo.attach("snapshot-fullpage_screenshots", { body: error });
          } finally {
            await this.user.api.testInfo.attach("snapshot-flexipage_components", { body: parsedComponents });
            await this.user.api.testInfo.attach("testrecord-sfdc_id", { body: recordId });
          }
        }
        expect2(parsedComponents).toMatchSnapshot();
      }
    };
  }
  async recordTypeIdFor(recordTypeName) {
    return this.user.api.query(new SOQLBuilder().recordTypeByName(recordTypeName)).then((queryResult) => queryResult.records[0].Id);
  }
};

// src/common/Fixtures.ts
import { test as base } from "@playwright/test";
var test = base.extend({
  cast: async ({ browser }, use, testInfo) => {
    await use(async (actor) => {
      await actor.Ready.then((actor2) => actor2.use(browser));
      await actor.Ready.then((actor2) => actor2.api.testInfo = testInfo);
      return actor.Ready;
    });
  }
});
export {
  AbstractPage,
  Api,
  NoRecordsReturnedError,
  SOQLBuilder,
  SalesforceApi,
  SalesforceAuthenticator,
  SalesforceCliHandler,
  SalesforceDefaultCliUser,
  SalesforceLoginPage,
  SalesforceNavigator,
  SalesforceObject,
  SalesforceStandardUser,
  UiLayout,
  test
};
//# sourceMappingURL=index.mjs.map
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/api/Api.ts
var Api = class {
  captureScreenshot(options) {
    return __async(this, null, function* () {
      yield options.page.waitForLoadState("networkidle");
      const screenshot = yield options.page.screenshot({ fullPage: options.fullPage });
      yield this.testInfo.attach("screenshot", { body: screenshot, contentType: "image/png" });
    });
  }
  captureFullPageScreenshot(page) {
    return __async(this, null, function* () {
      yield page.waitForLoadState("networkidle");
      yield page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      yield page.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
      yield this.captureScreenshot({ page, fullPage: true });
    });
  }
};

// src/api/SalesforceApi.ts
import { expect } from "@playwright/test";
import { Connection } from "jsforce";
import { writeFile } from "fs/promises";

// src/api/UiLayout.ts
var UiLayout = class {
  constructor(data) {
    this.Compact = data.Compact;
    this.Full = data.Full;
  }
};

// src/common/SalesforceUsers.ts
import { chromium } from "@playwright/test";

// src/common/pages/AbstractPage.ts
var AbstractPage = class {
  constructor(page) {
    this.page = page;
  }
};

// src/common/pages/SalesforceLoginPage.ts
var SalesforceLoginPage = class extends AbstractPage {
  constructor(page, instance) {
    super(page);
    this.username = this.page.getByLabel("Username");
    this.password = this.page.getByLabel("Password");
    this.loginButton = this.page.getByRole("button").getByText("Log In");
    this.instance = instance;
  }
  loginUsing(credentials) {
    return __async(this, null, function* () {
      yield this.page.goto(this.instance.toString());
      yield this.username.fill(credentials.username);
      yield this.password.fill(credentials.password);
      yield this.loginButton.click();
      return this.page.context().storageState();
    });
  }
};

// src/auth/SalesforceAuthenticator.ts
var storageStateHandler = class {
  constructor(storageState) {
    this.storageState = storageState;
  }
  loginToUi(page) {
    return __async(this, null, function* () {
      yield page.context().addCookies(this.storageState.cookies);
      return this.storageState;
    });
  }
};
var DefaultCliUserHandler = class {
  constructor(cliHandler) {
    this.cli = cliHandler;
  }
  get defaultUserData() {
    try {
      if (!this._defaultUserData) {
        if (!process.env.CI) {
          this._defaultUserData = this.cli.exec({
            cmd: "org open",
            f: ["--json", "-r"]
          });
        } else {
          this._defaultUserData = this.cli.exec({
            cmd: "org login sfdx-url",
            f: ["--sfdx-url-file authFile.json", "--set-default"]
          }).then(() => {
            return this.cli.exec({
              cmd: "org open",
              f: ["--json", "-r"]
            });
          });
        }
      }
    } catch (error) {
      throw new Error(`unable to parse data for default cli user
                
due to:
                
${error}`);
    }
    return this._defaultUserData;
  }
  parseFrontDoorData() {
    return __async(this, null, function* () {
      const loginUrl = new URL((yield this.defaultUserData).result.url);
      return {
        instance: loginUrl.origin,
        sessionId: loginUrl.searchParams.get(SalesforceNavigator.SESSIONID_PARAM)
      };
    });
  }
  loginToUi(page) {
    return __async(this, null, function* () {
      yield page.goto((yield this.defaultUserData).result.url, { waitUntil: "commit" });
      return page.context().storageState();
    });
  }
  loginToApi() {
    return __async(this, null, function* () {
      return new SalesforceApi(yield this.parseFrontDoorData()).Ready;
    });
  }
};
var CredentialsHandler = class {
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
  loginToUi(page) {
    return __async(this, null, function* () {
      return new SalesforceLoginPage(page, this.instance).loginUsing(this.credentials);
    });
  }
};
var SessionIdHandler = class {
  constructor(frontDoor) {
    this.frontDoor = frontDoor;
  }
  loginToUi(page) {
    return __async(this, null, function* () {
      const loginUrl = SalesforceNavigator.buildLoginUrl(this.frontDoor);
      yield page.goto(loginUrl.toString());
      return page.context().storageState();
    });
  }
  loginToApi() {
    return __async(this, null, function* () {
      return new SalesforceApi(this.frontDoor).Ready;
    });
  }
};
var SalesforceAuthenticator = class {
  constructor() {
    this.usingStorageState = (data) => new storageStateHandler(data);
    this.usingSessionId = (data) => new SessionIdHandler(data);
    this.usingCli = (handler) => new DefaultCliUserHandler(handler);
    this.usingCredentials = (credentials, instance) => new CredentialsHandler(credentials, instance);
  }
};

// src/cli/SalesforceCli.ts
import { exec } from "child_process";
var SalesforceCliHandler = class {
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
  handleError(message) {
    return JSON.stringify(this.parseResponse(message), null, 3);
  }
  exec(_0) {
    return __async(this, arguments, function* ({ cmd, f: flags, log }) {
      const fullCommand = `${this.path} ${cmd} ${flags ? this.pass(flags) : ""}`;
      if (log)
        console.info(`Executing ${this.path} command: ${fullCommand}`);
      return new Promise((resolve, reject) => {
        exec(fullCommand, (error, stdout) => {
          if (error && error.code === 1) {
            reject(new Error(`${this.path} command failed with exit code: ${error.code} caused by:
${error.message}
Error details:
${JSON.stringify(this.parseResponse(stdout), null, 3)}`));
          } else {
            resolve((flags == null ? void 0 : flags.includes("--json")) ? this.parseResponse(stdout) : stdout);
          }
        });
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
};

// src/common/SalesforceUsers.ts
var SalesforceDefaultCliUser = class _SalesforceDefaultCliUser {
  constructor(authenticator) {
    this.Ready = new Promise((makeReady) => __async(this, null, function* () {
      const handler = authenticator.usingCli(new SalesforceCliHandler());
      this.info = yield handler.defaultUserData;
      this.api = yield handler.loginToApi();
      this.browser = yield chromium.launch({ headless: true });
      this.ui = yield this.browser.newContext().then((context) => context.newPage());
      this.authorizationState = yield handler.loginToUi(this.ui);
      makeReady(this);
    }));
  }
  static get instance() {
    if (!_SalesforceDefaultCliUser._instance) {
      return _SalesforceDefaultCliUser._instance = new _SalesforceDefaultCliUser(new SalesforceAuthenticator()).Ready;
    } else
      return _SalesforceDefaultCliUser._instance;
  }
  impersonateCrmUser(salesforceUserId) {
    return __async(this, null, function* () {
      const impersonationUrl = SalesforceNavigator.buildImpersonationUrl({
        instanceUrl: new URL(this.info.result.url).origin,
        orgId: this.info.result.orgId,
        targetUserId: salesforceUserId
      }).toString();
      const isolatedPage = yield this.browser.newContext().then((context) => context.newPage());
      yield isolatedPage.context().addCookies(this.authorizationState.cookies);
      yield isolatedPage.goto(impersonationUrl, { waitUntil: "commit" });
      const otherCrmUserStorageData = yield isolatedPage.context().storageState();
      yield isolatedPage.context().close();
      return otherCrmUserStorageData;
    });
  }
};
var _SalesforceStandardUser = class _SalesforceStandardUser {
  constructor(mods) {
    this.Ready = new Promise((makeReady) => __async(this, null, function* () {
      this.config = __spreadValues(__spreadValues({}, this.config), mods);
      const frontdoor = yield SalesforceDefaultCliUser.instance.then((instance2) => instance2.info.result.url);
      const sessionId = (yield this.cached).cookies.filter(
        (cookie) => cookie.name === "sid" && frontdoor.includes(cookie.domain)
      )[0].value;
      const instance = new URL(frontdoor).origin;
      const frontDoor = { instance, sessionId };
      this.api = yield new SalesforceApi(frontDoor).Ready;
      makeReady(this);
    }));
  }
  get cached() {
    if (!_SalesforceStandardUser._cached.get(this.constructor.name)) {
      return SalesforceDefaultCliUser.instance.then((cliUser) => {
        const users = new SOQLBuilder().crmUsersMatching(this.config);
        return cliUser.api.query(users).then((result) => {
          const selected = result.records[0].Id;
          _SalesforceStandardUser.uniquePool.add(selected);
          _SalesforceStandardUser._cached.set(this.constructor.name, cliUser.impersonateCrmUser(selected));
          return _SalesforceStandardUser._cached.get(this.constructor.name);
        });
      });
    } else
      return _SalesforceStandardUser._cached.get(this.constructor.name);
  }
  use(browser) {
    return __async(this, null, function* () {
      const context = yield browser.newContext();
      yield context.addCookies((yield this.cached).cookies);
      this.ui = yield context.newPage();
      return this;
    });
  }
};
_SalesforceStandardUser.uniquePool = /* @__PURE__ */ new Set();
_SalesforceStandardUser._cached = /* @__PURE__ */ new Map();
var SalesforceStandardUser = _SalesforceStandardUser;

// src/common/SalesforceNavigator.ts
var _SalesforceNavigator = class _SalesforceNavigator {
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
  static openResource(resourcePath, page) {
    return __async(this, null, function* () {
      const origin = new URL((yield SalesforceDefaultCliUser._instance).info.result.url).origin;
      const resourceUrl = new URL(resourcePath, origin).toString();
      return page.goto(resourceUrl);
    });
  }
  static openHome(page) {
    return __async(this, null, function* () {
      return _SalesforceNavigator.openResource(_SalesforceNavigator.HOME_PATH, page);
    });
  }
};
_SalesforceNavigator.PRODUCTION_LOGIN_URL = new URL("https://login.salesforce.com/");
_SalesforceNavigator.SANDBOX_LOGIN_URL = new URL("https://test.salesforce.com/");
_SalesforceNavigator.HOME_PATH = "/home/home.jsp";
_SalesforceNavigator.FRONTDOOR_PATH = "secur/frontdoor.jsp";
_SalesforceNavigator.IMPERSONATION_PATH = "servlet/servlet.su";
_SalesforceNavigator.SESSIONID_PARAM = "sid";
_SalesforceNavigator.ORGANIZATION_ID_PARAM = "oid";
_SalesforceNavigator.IMPERSONATION_USER_ID_PARAM = "suorgadminid";
_SalesforceNavigator.TARGET_ULR_PARAM = "targetURL";
_SalesforceNavigator.RETURN_URL_PARAM = "retURL";
_SalesforceNavigator.APP_OR_TAB_SET_ID_PARAM = "tsid";
_SalesforceNavigator.FLEXIPAGE_COMPONENT_TAG = "flexipage-component2";
_SalesforceNavigator.FLEXIPAGE_COMPONENT_ID = "data-component-id";
_SalesforceNavigator.FLEXIPAGE_FIELD_LABEL = ".test-id__field-label";
_SalesforceNavigator.FLEXIPAGE_HIGHLIGHTS_ITEM = "records-highlights-details-item";
var SalesforceNavigator = _SalesforceNavigator;

// src/api/SalesforceApi.ts
var NoRecordsReturnedError = class extends Error {
  constructor(msg) {
    super(msg);
  }
};
var SalesforceApi = class extends Api {
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
  create(sobject, data) {
    return __async(this, null, function* () {
      try {
        return yield this.conn.create(sobject, data, { allOrNone: true });
      } catch (error) {
        throw new Error(`unable to create ${sobject} due to:
${error}`);
      }
    });
  }
  update(sobject, data) {
    return __async(this, null, function* () {
      try {
        return yield this.conn.update(sobject, data, { allOrNone: true });
      } catch (error) {
        throw new Error(`unable to update ${sobject} with data:
${JSON.stringify(data, null, 3)}
due to:
${error}`);
      }
    });
  }
  delete(sobject, id) {
    return __async(this, null, function* () {
      try {
        return yield this.conn.delete(sobject, id);
      } catch (error) {
        throw new Error(`unable to delete ${sobject} record ${id} due to:
${error}`);
      }
    });
  }
  read(sobject, id) {
    return __async(this, null, function* () {
      try {
        return yield this.conn.retrieve(sobject, id);
      } catch (error) {
        throw new Error(`unable to read ${sobject} record ${id} due to:
${error}`);
      }
    });
  }
  query(soql) {
    return __async(this, null, function* () {
      let result;
      try {
        result = yield this.conn.query(soql);
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
    });
  }
  executeApex(apexBody) {
    return __async(this, null, function* () {
      let result;
      try {
        result = yield this.conn.tooling.executeAnonymous(apexBody);
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
    });
  }
  readRecordUi(recordId, options) {
    return __async(this, null, function* () {
      options = options ? options : {
        Full: { Edit: true, Create: true, View: true },
        Compact: { Edit: true, Create: true, View: true }
      };
      const types = () => {
        let types2 = "";
        (options == null ? void 0 : options.Full) ? types2 += "Full" : null;
        (options == null ? void 0 : options.Compact) ? types2 ? types2 += ",Compact" : types2 += "Compact" : null;
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
    });
  }
  readApps(formFactor, userCustomizations) {
    return __async(this, null, function* () {
      const formFactorParam = formFactor ? `?formFactor=${formFactor}` : `?formFactor=Large`;
      const userCustomizationsParam = userCustomizations ? `&userCustomizations=${userCustomizations}` : "";
      const resource = `/ui-api/apps${formFactorParam}${userCustomizationsParam}`;
      try {
        let result = yield this.conn.request({ method: "Get", url: resource });
        const sfdcEtag = /[a-zA-Z0-9]{32}/gm;
        const sfdcLongId = /[a-zA-Z0-9]{18}/gm;
        const url = /^.*\bhttps\b.*$/gm;
        return JSON.parse(JSON.stringify(result, null, 3).replace(sfdcEtag, "").replace(sfdcLongId, "").replace(url, ""));
      } catch (error) {
        throw new Error(`unable to fetch available Apps due to:
${error}`);
      }
    });
  }
  readRelatedListsUi(object, recordTypeId) {
    return __async(this, null, function* () {
      recordTypeId = recordTypeId ? `?recordTypeId=${recordTypeId}` : "";
      const resource = `/ui-api/related-list-info/${object}${recordTypeId}`;
      try {
        return this.conn.request({ method: "Get", url: resource });
      } catch (error) {
        throw new Error(`unable to retrieve ${resource} due to:
${error}`);
      }
    });
  }
  readLayoutsFromOrg(recordId, options) {
    return __async(this, null, function* () {
      try {
        let data = Object.values((yield this.readRecordUi(recordId, options)).layouts)[0];
        data = this.parseLayoutFromLayoutResponse(data);
        return new UiLayout(Object.values(data)[0]);
      } catch (error) {
        throw new Error(`Unable to read Layout data from org due to:
${error}`);
      }
    });
  }
  writeLayoutSectionsToFileFromOrg(filePath, recordId, dataToFetch) {
    return __async(this, null, function* () {
      try {
        const layoutData = yield this.readLayoutsFromOrg(recordId, dataToFetch);
        yield writeFile(filePath, JSON.stringify(layoutData, null, 1));
      } catch (error) {
        throw new Error(`Unable to write Layout data to file due to:
${error}`);
      }
    });
  }
  validateVisibleRecordLayouts(recordId, page, options) {
    return __async(this, null, function* () {
      try {
        const orgLayouts = this.readLayoutsFromOrg(recordId, options);
        if (page && this.testInfo) {
          yield Promise.all([
            orgLayouts,
            SalesforceNavigator.openResource(recordId, page).then(() => this.captureFullPageScreenshot(page))
          ]);
        }
        expect(JSON.stringify(yield orgLayouts, null, 3)).toMatchSnapshot();
      } catch (error) {
        throw new Error(`Layouts validation via UI-API failed due to:
${error}`);
      }
    });
  }
  validateAvailableApps(page) {
    return __async(this, null, function* () {
      try {
        const orgApps = this.readApps();
        if (page && this.testInfo) {
          yield Promise.all([
            orgApps,
            SalesforceNavigator.openHome(page).then(() => page.getByRole("button", { name: "App Launcher" }).click().then(() => page.waitForResponse(/getAppLauncherMenuData/gm).then(() => this.captureScreenshot({ page }))))
          ]);
        }
        expect(JSON.stringify(yield orgApps, null, 3)).toMatchSnapshot();
      } catch (error) {
        throw new Error(`Apps validation via UI-API failed due to:
${error}`);
      }
    });
  }
  writeAppsToFileFromOrg(filePath) {
    return __async(this, null, function* () {
      try {
        const appsData = yield this.readApps();
        yield writeFile(filePath, JSON.stringify(appsData, null, 1));
      } catch (error) {
        throw new Error(`Unable to write Apps data to file due to:
${error}`);
      }
    });
  }
};

// src/common/SalesforceObject.ts
import { expect as expect2 } from "@playwright/test";
var SalesforceObject = class {
  constructor(user) {
    this.user = user;
  }
  handleFlexipageSnapshots(parsedComponents, recordId) {
    return __async(this, null, function* () {
      yield this.scrollPageBottomTop();
      try {
        yield expect2(this.user.ui).toHaveScreenshot({ maxDiffPixels: 0, fullPage: true });
        yield this.user.api.testInfo.attach("screenshot", { body: yield this.user.ui.screenshot({ fullPage: true }), contentType: "image/png" });
      } catch (error) {
        yield this.user.api.testInfo.attach("snapshot-fullpage_screenshots", { body: error });
      } finally {
        yield this.user.api.testInfo.attach("snapshot-flexipage_components", { body: parsedComponents });
        yield this.user.api.testInfo.attach("testrecord-sfdc_id", { body: recordId });
      }
      expect2(parsedComponents).toMatchSnapshot();
    });
  }
  scrollPageBottomTop() {
    return __async(this, null, function* () {
      yield this.user.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      yield this.user.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
    });
  }
  scrollPageTopBottom() {
    return __async(this, null, function* () {
      yield this.user.ui.evaluate(() => window.scrollTo(document.documentElement.scrollHeight, 0));
      yield this.user.ui.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    });
  }
  validateVisibleFlexigpage(recordId) {
    return __async(this, null, function* () {
      yield SalesforceNavigator.openResource(recordId, this.user.ui);
      yield this.user.ui.waitForLoadState("networkidle");
      yield this.scrollPageBottomTop();
      const snapshot = [];
      yield this.user.ui.locator(SalesforceNavigator.FLEXIPAGE_COMPONENT_TAG).elementHandles().then((flexipageComponents) => __async(this, null, function* () {
        for (const component of flexipageComponents) {
          if (!(yield component.$$(SalesforceNavigator.FLEXIPAGE_COMPONENT_TAG)).length) {
            const parseComponentId = () => __async(this, null, function* () {
              yield component.scrollIntoViewIfNeeded();
              yield this.user.ui.waitForLoadState("networkidle");
              snapshot.push(`[FLEXCOMPONENT] ${yield component.getAttribute(SalesforceNavigator.FLEXIPAGE_COMPONENT_ID)}`);
            });
            const parseLabeledFields = () => __async(this, null, function* () {
              for (const field of yield component.$$(SalesforceNavigator.FLEXIPAGE_FIELD_LABEL)) {
                const label = yield field.innerText();
                if (label) {
                  snapshot.push(`[FIELD] ${label}`);
                }
              }
            });
            const parseHighlightFields = () => __async(this, null, function* () {
              for (const field of yield component.$$(SalesforceNavigator.FLEXIPAGE_HIGHLIGHTS_ITEM)) {
                for (const paragraph of yield field.$$("*")) {
                  const title = yield paragraph.getAttribute("title");
                  if (title && !title.toLowerCase().includes("preview") && !(yield paragraph.getAttribute("src"))) {
                    snapshot.push(`[FIELD] ${title}`);
                  }
                }
              }
            });
            const parseButtons = () => __async(this, null, function* () {
              for (const action of yield component.$$("button")) {
                const actionText = yield action.innerText();
                if (actionText && !actionText.toLowerCase().includes("preview")) {
                  snapshot.push(`[BUTTON] ${yield action.innerText()}`);
                }
              }
            });
            const parseLinks = () => __async(this, null, function* () {
              for (const hyperlink of yield component.$$("a")) {
                const title = yield hyperlink.getAttribute("title");
                if (title && !(yield hyperlink.getAttribute("class")).toLowerCase().includes("outputlookuplink")) {
                  snapshot.push(`[LINK] ${title}`);
                }
              }
            });
            const createSnapshotFooter = () => {
              snapshot.push("------");
              snapshot.push("");
            };
            yield parseComponentId();
            yield parseLabeledFields();
            yield parseHighlightFields();
            yield parseButtons();
            yield parseLinks();
            createSnapshotFooter();
          }
        }
      }));
      const parsedComponents = snapshot.join("\n");
      yield this.handleFlexipageSnapshots(parsedComponents, recordId);
    });
  }
};
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
  UiLayout
};
//# sourceMappingURL=index.mjs.map
import { Page } from "@playwright/test"
import { SalesforceDefaultCliUser } from "common/SalesforceUsers"

export class SalesforceNavigator {
    static readonly PRODUCTION_LOGIN_URL = new URL('https://login.salesforce.com/')
    static readonly SANDBOX_LOGIN_URL = new URL('https://test.salesforce.com/')
    static readonly HOME_PATH = '/home/home.jsp'
    static readonly FRONTDOOR_PATH = 'secur/frontdoor.jsp'
    static readonly IMPERSONATION_PATH = 'servlet/servlet.su'
    static readonly SESSIONID_PARAM = 'sid'
    static readonly ORGANIZATION_ID_PARAM = 'oid'
    static readonly IMPERSONATION_USER_ID_PARAM = 'suorgadminid'
    static readonly TARGET_ULR_PARAM = 'targetURL'
    static readonly RETURN_URL_PARAM = 'retURL'
    static readonly APP_OR_TAB_SET_ID_PARAM = 'tsid'
    static readonly FLEXIPAGE_COMPONENT_ID = 'data-component-id'
    static readonly FLEXIPAGE_COMPONENT_CSS_LOCATOR = `[${SalesforceNavigator.FLEXIPAGE_COMPONENT_ID}]`
    static readonly FLEXIPAGE_FIELD_LABEL = '.test-id__field-label'
    static readonly FLEXIPAGE_HIGHLIGHTS_ITEM = 'records-highlights-details-item'

    private constructor(){}

    static buildLoginUrl(frontdoorData: {sessionId: string, instance: string}): URL{
        const url = new URL(SalesforceNavigator.FRONTDOOR_PATH, frontdoorData.instance)
        url.searchParams.append(SalesforceNavigator.SESSIONID_PARAM, frontdoorData.sessionId)
        return url
    }

    static buildImpersonationUrl(data: {instanceUrl: string, orgId: string, targetUserId: string}): URL {
        const url = new URL(SalesforceNavigator.IMPERSONATION_PATH, data.instanceUrl)
        url.searchParams.append(SalesforceNavigator.ORGANIZATION_ID_PARAM, data.orgId)
        url.searchParams.append(SalesforceNavigator.IMPERSONATION_USER_ID_PARAM, data.targetUserId)
        url.searchParams.append(SalesforceNavigator.TARGET_ULR_PARAM, SalesforceNavigator.HOME_PATH)
        url.searchParams.append(SalesforceNavigator.RETURN_URL_PARAM, SalesforceNavigator.HOME_PATH)
        return url
    }

    static async openResource(resourcePath: string, page: Page){
        const origin = new URL((await SalesforceDefaultCliUser._instance).info.result.url).origin
        const resourceUrl = new URL(resourcePath, origin).toString()
        return page.goto(resourceUrl)
    }

    static async openHome(page: Page){
        return SalesforceNavigator.openResource(SalesforceNavigator.HOME_PATH, page)
    }
}
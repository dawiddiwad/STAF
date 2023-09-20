export class SalesforceNavigator {
    static readonly PRODUCTION_LOGIN_URL = new URL('https://login.salesforce.com/')
    static readonly SANDBOX_LOGIN_URL = new URL('https://test.salesforce.com/')
    static readonly FRONTDOOR_PATH = 'secur/frontdoor.jsp'
    static readonly SESSIONID_PARAM = 'sid'

    static buildLoginUrl(frontdoorData: {sessionId: string, instance: URL}){
        const url = new URL(SalesforceNavigator.FRONTDOOR_PATH, frontdoorData.instance)
        url.searchParams.append(SalesforceNavigator.SESSIONID_PARAM, frontdoorData.sessionId)
        return url
    }
}
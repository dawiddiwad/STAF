import { Page } from "@playwright/test";
import { Api } from "../api/Api";

export type SalesforceInstance = 
    'SANDBOX' | 'PRODUCTION' | URL

export type UsernamePassword = {
    username: string,
    password: string
}

export type StorageState = {
  cookies: { 
    name: string; 
    value: string; 
    url?: string; 
    domain?: string; 
    path?: string; 
    expires?: number; 
    httpOnly?: boolean; 
    secure?: boolean; 
    sameSite?: "Strict" | "Lax" | "None"; }[],
  origins: {}[]
}

export type DefaultCliUserInfo = {
    status: number,
    result: {
        orgId: string,
        url: string,
        username: string
    },
    warnings: string[]
}

export type SalesforceFrontdoorData = {
    sessionId: string,
    instance: URL
}

export type UiGateway = {
    loginToUi(page: Page): Promise<StorageState>
}

export type ApiGateway = {
    loginToApi(): Promise<Api>
}
import { Page, TestInfo } from "@playwright/test"

export abstract class Api {
    testInfo: TestInfo
    abstract Ready: Promise<Api>
}
import { TestInfo } from "@playwright/test"

export abstract class Api {
    testInfo: TestInfo
    Ready: Promise<Api>
}
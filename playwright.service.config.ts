import { defineConfig } from '@playwright/test';
import config from './playwright.config';
import { config as envConfig } from "dotenv";
import { EndUserExample, EndUserExample2, SalesforceDefaultCliUser } from 'test/utils/common/SalesforceUsers';

envConfig();
// Name the test run if it's not named yet.
process.env.PLAYWRIGHT_SERVICE_RUN_ID = process.env.PLAYWRIGHT_SERVICE_RUN_ID || new Date().toISOString();

export default defineConfig({
    // Define more generous timeout for the service operation if necessary.
    // timeout: 60000,
    // expect: {
    //   timeout: 10000,
    // },
    timeout: 300000,
    expect: {
      timeout: 20000
    },
    reporter: [['html', { outputFolder: './src/test/playwright-report' }], ['list']],
    testDir: './src/test/neom/',
    grep: /@retail/gm,
    repeatEach: 1,
    retries: 0,
    use: { ...config.use,
    connectOptions: {
      // Specify the service endpoint.
      wsEndpoint: `${process.env.PLAYWRIGHT_SERVICE_URL}?cap=${JSON.stringify({
        os: process.env.PLAYWRIGHT_SERVICE_OS || 'linux',
        runId: process.env.PLAYWRIGHT_SERVICE_RUN_ID
      })}`,
      timeout: 300000,
      headers: {
        'x-mpt-access-key': process.env.PLAYWRIGHT_SERVICE_ACCESS_KEY!
      },
      // Allow service to access the localhost.
      exposeNetwork: '<loopback>'
    }
  }
});
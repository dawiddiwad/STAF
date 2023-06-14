import type { PlaywrightTestConfig } from '@playwright/test';
 const config: PlaywrightTestConfig = {
  testDir: './src/test/',
  timeout: 300000,
  reporter: [['html', { outputFolder: './src/test/playwright-report' }], ['list']],
  repeatEach: 1,
  retries: 3,
  workers: '50%',
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
  expect: {
    timeout: 20000
  },
  use: {
    channel: 'chrome',
    actionTimeout: 20000,
    navigationTimeout: 30000,
    headless: true,
    ignoreHTTPSErrors: true,
    trace: {
      mode: 'retain-on-failure',
      screenshots: true,
      snapshots: true
    },
    viewport: { width: 1366, height: 768 },
    screenshot: {mode: 'on', fullPage: true},
    video: {
      mode: 'on',
      size: {
        width: 1366,
        height: 768
      }
    },
  },
};

export default config;

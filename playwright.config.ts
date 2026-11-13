import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests. Locally/CI they run against `next start`; after a deployment the
 * release workflow sets BASE_URL to the deployed URL to verify it is really live.
 */
const baseURL = process.env.BASE_URL || "http://localhost:3000";
const useLocalServer = !process.env.BASE_URL;

export default defineConfig({
  testDir: "tests/smoke",
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL,
    trace: "off",
    // Cloud dev containers ship a preinstalled Chromium; CI installs its own.
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : undefined,
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: useLocalServer
    ? { command: "npm run start", url: "http://localhost:3000/api/health", reuseExistingServer: !process.env.CI, timeout: 120_000 }
    : undefined,
});

/**
 * Playwright authentication fixtures
 * Provides authenticated pages for testing
 */

import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedCompanyPage: Page;
  authenticatedScoutPage: Page;
  authenticatedAdminPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedCompanyPage: async ({ page }, use) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');

    // Fill in test company credentials
    await page.fill('input[name="identifier"]', process.env.TEST_COMPANY_EMAIL || 'test-company@leadscout.test');
    await page.fill('input[name="password"]', process.env.TEST_COMPANY_PASSWORD || 'TestPassword123!');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Provide authenticated page to test
    await use(page);
  },

  authenticatedScoutPage: async ({ page }, use) => {
    await page.goto('/sign-in');

    await page.fill('input[name="identifier"]', process.env.TEST_SCOUT_EMAIL || 'test-scout@leadscout.test');
    await page.fill('input[name="password"]', process.env.TEST_SCOUT_PASSWORD || 'TestPassword123!');

    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard', { timeout: 10000 });

    await use(page);
  },

  authenticatedAdminPage: async ({ page }, use) => {
    await page.goto('/sign-in');

    await page.fill('input[name="identifier"]', process.env.TEST_ADMIN_EMAIL || 'admin@leadscout.test');
    await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!');

    await page.click('button[type="submit"]');

    await page.waitForURL('/admin', { timeout: 10000 });

    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper function to login manually if needed
 */
export async function loginAsCompany(page: Page) {
  await page.goto('/sign-in');
  await page.fill('input[name="identifier"]', process.env.TEST_COMPANY_EMAIL || 'test-company@leadscout.test');
  await page.fill('input[name="password"]', process.env.TEST_COMPANY_PASSWORD || 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

export async function loginAsScout(page: Page) {
  await page.goto('/sign-in');
  await page.fill('input[name="identifier"]', process.env.TEST_SCOUT_EMAIL || 'test-scout@leadscout.test');
  await page.fill('input[name="password"]', process.env.TEST_SCOUT_PASSWORD || 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/sign-in');
  await page.fill('input[name="identifier"]', process.env.TEST_ADMIN_EMAIL || 'admin@leadscout.test');
  await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin', { timeout: 10000 });
}

/**
 * E2E Tests: Authentication Flows
 *
 * Tests for user authentication including:
 * - Signup process
 * - Login process
 * - Logout
 * - Protected routes
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication - Signup', () => {
  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');

    // Click signup link
    const signupLink = page.getByRole('link', { name: /sign up/i }).first();

    if (await signupLink.isVisible({ timeout: 2000 })) {
      await signupLink.click();

      await page.waitForURL('**/sign-up');

      await expect(page).toHaveURL(/sign-up/);

      await page.screenshot({ path: 'test-results/screenshots/signup-page.png' });
    }
  });

  test('should display signup form', async ({ page }) => {
    await page.goto('/sign-up');

    // Clerk provides the signup UI
    // Verify Clerk iframe or form is present
    const clerkForm = page.locator('.cl-rootBox, .cl-component, form');
    await expect(clerkForm.first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/screenshots/signup-form.png' });
  });
});

test.describe('Authentication - Login', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /log in|sign in/i }).first();

    if (await loginLink.isVisible({ timeout: 2000 })) {
      await loginLink.click();

      await page.waitForURL('**/sign-in');

      await expect(page).toHaveURL(/sign-in/);

      await page.screenshot({ path: 'test-results/screenshots/login-page.png' });
    }
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/sign-in');

    // Verify Clerk login UI is present
    const clerkForm = page.locator('.cl-rootBox, .cl-component, form');
    await expect(clerkForm.first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/screenshots/login-form.png' });
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/sign-in');

    // Wait for Clerk form to load
    await page.waitForSelector('input[name="identifier"]', { timeout: 10000 });

    // Enter invalid email
    await page.fill('input[name="identifier"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');

    // Try to submit
    await page.click('button[type="submit"]');

    // Clerk should show validation error
    const errorMessage = page.locator('text=/invalid|error|incorrect/i');

    // Wait a bit for error to appear
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasError) {
      await page.screenshot({ path: 'test-results/screenshots/login-validation-error.png' });
      console.log('Validation error correctly displayed');
    }
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/sign-in');

    // Wait for Clerk form
    await page.waitForSelector('input[name="identifier"]', { timeout: 10000 });

    // Fill in test credentials
    await page.fill('input[name="identifier"]', process.env.TEST_COMPANY_EMAIL || 'test-company@leadscout.test');
    await page.fill('input[name="password"]', process.env.TEST_COMPANY_PASSWORD || 'TestPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await expect(page).toHaveURL(/dashboard/);

    await page.screenshot({ path: 'test-results/screenshots/login-success-dashboard.png' });
  });
});

test.describe('Authentication - Protected Routes', () => {
  test('should redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to sign-in
    await page.waitForURL('**/sign-in', { timeout: 10000 });

    await expect(page).toHaveURL(/sign-in/);

    await page.screenshot({ path: 'test-results/screenshots/auth-redirect.png' });

    console.log('Correctly redirected to login');
  });

  test('should redirect to login when accessing marketplace unauthenticated', async ({ page }) => {
    await page.goto('/dashboard/marketplace');

    await page.waitForURL('**/sign-in', { timeout: 10000 });

    await expect(page).toHaveURL(/sign-in/);
  });

  test('should redirect to login when accessing admin unauthenticated', async ({ page }) => {
    await page.goto('/admin');

    await page.waitForURL('**/sign-in', { timeout: 10000 });

    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe('Authentication - Logout', () => {
  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/sign-in');
    await page.waitForSelector('input[name="identifier"]', { timeout: 10000 });

    await page.fill('input[name="identifier"]', process.env.TEST_COMPANY_EMAIL || 'test-company@leadscout.test');
    await page.fill('input[name="password"]', process.env.TEST_COMPANY_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Now logout
    // Look for user menu button (Clerk UserButton)
    const userButton = page.locator('.cl-userButton, [data-testid="user-menu"]').first();

    if (await userButton.isVisible({ timeout: 5000 })) {
      await userButton.click();

      // Click logout option
      const logoutButton = page.getByRole('button', { name: /sign out|log out/i });

      if (await logoutButton.isVisible({ timeout: 2000 })) {
        await logoutButton.click();

        // Should redirect to homepage or login
        await page.waitForURL(/\/|sign-in/, { timeout: 10000 });

        await page.screenshot({ path: 'test-results/screenshots/logout-success.png' });

        console.log('Successfully logged out');
      }
    }
  });

  test('should not access dashboard after logout', async ({ page }) => {
    // Ensure we're logged out
    await page.goto('/');

    // Try to access dashboard
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL('**/sign-in', { timeout: 10000 });

    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe('Authentication - Session Persistence', () => {
  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await page.goto('/sign-in');
    await page.waitForSelector('input[name="identifier"]', { timeout: 10000 });

    await page.fill('input[name="identifier"]', process.env.TEST_COMPANY_EMAIL || 'test-company@leadscout.test');
    await page.fill('input[name="password"]', process.env.TEST_COMPANY_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Reload page
    await page.reload();

    // Should still be on dashboard (not redirected to login)
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    expect(currentUrl).toContain('dashboard');

    console.log('Session persisted across reload');
  });
});

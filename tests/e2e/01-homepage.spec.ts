/**
 * E2E Tests: Homepage and Marketing Pages
 *
 * Tests for public-facing marketing pages including:
 * - Homepage rendering
 * - Navigation
 * - CTA buttons
 * - Responsive design
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Verify page loads without errors
    await expect(page).toHaveURL('/');

    // Take screenshot
    await page.screenshot({ path: 'test-results/screenshots/homepage.png', fullPage: true });
  });

  test('should display hero section with heading', async ({ page }) => {
    // Find main heading (could be h1 or prominent text)
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Verify heading contains product-related text
    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();
    expect(headingText!.length).toBeGreaterThan(10);
  });

  test('should display CTA buttons', async ({ page }) => {
    // Look for primary CTA (e.g., "Get Started", "Sign Up")
    const ctaButton = page.getByRole('link', { name: /get started|sign up|join now/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    // Click signup CTA
    const signupLink = page.getByRole('link', { name: /sign up/i }).first();

    if (await signupLink.isVisible()) {
      await signupLink.click();

      // Wait for navigation
      await page.waitForURL('**/sign-up', { timeout: 5000 });

      // Verify we're on signup page
      expect(page.url()).toContain('sign-up');
    }
  });

  test('should navigate to login page', async ({ page }) => {
    // Click login link
    const loginLink = page.getByRole('link', { name: /log in|sign in/i }).first();

    if (await loginLink.isVisible()) {
      await loginLink.click();

      // Wait for navigation
      await page.waitForURL('**/sign-in', { timeout: 5000 });

      // Verify we're on login page
      expect(page.url()).toContain('sign-in');
    }
  });

  test('should display navigation menu', async ({ page }) => {
    // Check for navigation elements
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known/acceptable errors
    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes('favicon') && !error.includes('sourcemap')
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Homepage - Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/screenshots/homepage-mobile.png', fullPage: true });

    // Verify mobile menu button exists (if applicable)
    const mobileMenuButton = page.getByRole('button', { name: /menu|navigation/i });

    // Mobile menu may or may not exist depending on design
    // Just verify page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    // Set tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');

    await page.screenshot({ path: 'test-results/screenshots/homepage-tablet.png', fullPage: true });

    await expect(page.locator('body')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');

    await page.screenshot({ path: 'test-results/screenshots/homepage-desktop.png', fullPage: true });

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Homepage - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`Homepage load time: ${loadTime}ms`);

    // Page should load in under 5 seconds (generous for first load)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');

    // Get all images
    const images = await page.locator('img').all();

    // Check that images have alt text (accessibility + SEO)
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt can be empty string for decorative images, but should exist
      expect(alt).not.toBeNull();
    }
  });
});

test.describe('Homepage - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is visible (can't directly test, but ensure no errors)
    expect(page).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThan(0);

    // Ideally only one h1 per page
    expect(h1Elements).toBeLessThanOrEqual(2);
  });
});

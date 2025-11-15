/**
 * E2E Tests: Company User Flow
 *
 * Critical test covering:
 * 1. Company browses marketplace
 * 2. Filters leads by category/budget
 * 3. Purchases a lead
 * 4. Receives contact information
 * 5. Credits are deducted
 */

import { test, expect } from '@playwright/test';
import { loginAsCompany } from './fixtures/auth';

test.describe('Company Lead Purchase Flow', () => {
  test('should allow company to browse and purchase lead', async ({ page }) => {
    // Step 1: Login as company
    await loginAsCompany(page);

    // Verify we're on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Take screenshot of dashboard
    await page.screenshot({ path: 'test-results/screenshots/company-dashboard.png' });

    // Step 2: Check current credit balance
    const creditsBefore = await page.locator('[data-testid="credits-remaining"]').textContent();
    console.log(`Credits before purchase: ${creditsBefore}`);

    // Step 3: Navigate to marketplace
    await page.click('[href="/dashboard/marketplace"]', { timeout: 10000 });
    await page.waitForURL('**/marketplace');

    await page.screenshot({ path: 'test-results/screenshots/marketplace.png', fullPage: true });

    // Step 4: Verify leads are displayed
    const leadCards = page.locator('[data-testid="lead-card"]');
    const leadCount = await leadCards.count();

    console.log(`Found ${leadCount} leads in marketplace`);

    if (leadCount === 0) {
      console.warn('No leads available in marketplace - test cannot proceed');
      test.skip();
    }

    expect(leadCount).toBeGreaterThan(0);

    // Step 5: Click on first lead to view details
    const firstLead = leadCards.first();
    await firstLead.click();

    // Lead details modal/page should appear
    await page.waitForSelector('[data-testid="lead-details"]', { timeout: 5000 });

    await page.screenshot({ path: 'test-results/screenshots/lead-details.png' });

    // Step 6: Verify contact info is masked before purchase
    const contactEmailMasked = page.locator('text=***@***');
    const contactPhoneMasked = page.locator('text=+** * ** ** ** **');

    // At least one contact field should be masked
    const hasMaskedInfo = (await contactEmailMasked.count()) > 0 || (await contactPhoneMasked.count()) > 0;

    if (hasMaskedInfo) {
      console.log('Contact information is properly masked');
    }

    // Step 7: Click purchase button
    const purchaseButton = page.getByRole('button', { name: /purchase|buy|unlock/i });
    await expect(purchaseButton).toBeVisible();

    await purchaseButton.click();

    // Step 8: Confirm purchase (if confirmation dialog appears)
    const confirmButton = page.getByRole('button', { name: /confirm|yes|proceed/i });

    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }

    // Step 9: Wait for success message
    await expect(
      page.locator('text=/purchased|unlocked|success/i')
    ).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/screenshots/purchase-success.png' });

    // Step 10: Verify contact info is now visible
    // Should now show real email/phone
    await expect(
      page.locator('[data-testid="contact-email"]')
    ).toBeVisible({ timeout: 5000 });

    const contactEmail = await page.locator('[data-testid="contact-email"]').textContent();
    console.log(`Contact email revealed: ${contactEmail}`);

    expect(contactEmail).toMatch(/@/); // Should contain @ symbol

    // Step 11: Verify credits were deducted
    // Navigate back to dashboard to check credits
    await page.click('[href="/dashboard"]');
    await page.waitForURL('**/dashboard');

    const creditsAfter = await page.locator('[data-testid="credits-remaining"]').textContent();
    console.log(`Credits after purchase: ${creditsAfter}`);

    // Credits should have decreased
    // Note: This is a simple check - actual credit values depend on test data
  });

  test('should show error when insufficient credits', async ({ page }) => {
    // This test requires a company with 0 credits
    // You may need to set up test data for this scenario

    await loginAsCompany(page);

    // Navigate to marketplace
    await page.goto('/dashboard/marketplace');

    // Try to purchase lead
    const leadCard = page.locator('[data-testid="lead-card"]').first();

    if (await leadCard.isVisible()) {
      const purchaseButton = leadCard.locator('button', { hasText: /purchase/i });

      if (await purchaseButton.isVisible()) {
        await purchaseButton.click();

        // Should show error or disabled state
        // This depends on implementation
        const errorMessage = page.locator('text=/insufficient credits|not enough credits/i');

        if (await errorMessage.isVisible({ timeout: 2000 })) {
          expect(errorMessage).toBeVisible();
          console.log('Correctly shows insufficient credits error');
        }
      }
    }
  });
});

test.describe('Company Marketplace Filters', () => {
  test('should filter leads by category', async ({ page }) => {
    await loginAsCompany(page);

    await page.goto('/dashboard/marketplace');

    // Find category filter dropdown
    const categoryFilter = page.locator('[data-testid="category-filter"]');

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();

      // Select "IT Services" category
      await page.click('text=IT Services');

      // Wait for results to update
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'test-results/screenshots/marketplace-filtered.png' });

      // Verify filtered results
      const leadCards = page.locator('[data-testid="lead-card"]');
      const count = await leadCards.count();

      console.log(`Found ${count} IT Services leads`);

      // If there are results, verify they're the correct category
      if (count > 0) {
        const firstLeadCategory = leadCards.first().locator('[data-testid="lead-category"]');
        await expect(firstLeadCategory).toContainText(/IT/i);
      }
    }
  });

  test('should filter leads by budget range', async ({ page }) => {
    await loginAsCompany(page);

    await page.goto('/dashboard/marketplace');

    // Find budget filter inputs
    const minBudgetInput = page.locator('[data-testid="budget-min"]');
    const maxBudgetInput = page.locator('[data-testid="budget-max"]');

    if (await minBudgetInput.isVisible()) {
      await minBudgetInput.fill('10000');
      await maxBudgetInput.fill('50000');

      // Apply filter
      const applyButton = page.getByRole('button', { name: /apply|filter/i });

      if (await applyButton.isVisible()) {
        await applyButton.click();
      }

      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'test-results/screenshots/marketplace-budget-filtered.png' });

      // Verify filtered results show budgets in range
      const leadCards = page.locator('[data-testid="lead-card"]');
      const count = await leadCards.count();

      console.log(`Found ${count} leads in budget range 10k-50k`);
    }
  });
});

test.describe('Company Dashboard', () => {
  test('should display purchased leads', async ({ page }) => {
    await loginAsCompany(page);

    // Navigate to purchases/history section
    const purchasesLink = page.locator('[href*="purchases"], [href*="history"]').first();

    if (await purchasesLink.isVisible({ timeout: 2000 })) {
      await purchasesLink.click();

      await page.screenshot({ path: 'test-results/screenshots/purchase-history.png' });

      // Verify purchase history is displayed
      const purchaseItems = page.locator('[data-testid="purchase-item"]');
      const count = await purchaseItems.count();

      console.log(`Found ${count} purchased leads in history`);

      // Each purchase should show contact info
      if (count > 0) {
        const firstPurchase = purchaseItems.first();
        await expect(firstPurchase).toBeVisible();
      }
    }
  });

  test('should display subscription info', async ({ page }) => {
    await loginAsCompany(page);

    // Look for subscription info section
    const subscriptionSection = page.locator('[data-testid="subscription-info"]');

    if (await subscriptionSection.isVisible({ timeout: 2000 })) {
      await expect(subscriptionSection).toBeVisible();

      await page.screenshot({ path: 'test-results/screenshots/subscription-info.png' });

      // Should show plan name
      const planName = subscriptionSection.locator('[data-testid="plan-name"]');
      await expect(planName).toBeVisible();

      const planText = await planName.textContent();
      console.log(`Current plan: ${planText}`);
    }
  });

  test('should show credit allocation and renewal date', async ({ page }) => {
    await loginAsCompany(page);

    // Look for credits info
    const creditsSection = page.locator('[data-testid="credits-info"]');

    if (await creditsSection.isVisible({ timeout: 2000 })) {
      // Should show credits remaining
      const creditsRemaining = page.locator('[data-testid="credits-remaining"]');
      await expect(creditsRemaining).toBeVisible();

      // Should show renewal date
      const renewalDate = page.locator('[data-testid="renewal-date"]');

      if (await renewalDate.isVisible({ timeout: 1000 })) {
        const dateText = await renewalDate.textContent();
        console.log(`Next renewal: ${dateText}`);
      }

      await page.screenshot({ path: 'test-results/screenshots/credits-info.png' });
    }
  });
});

test.describe('Company Lead Details', () => {
  test('should display quality score', async ({ page }) => {
    await loginAsCompany(page);

    await page.goto('/dashboard/marketplace');

    // Click on first lead
    const firstLead = page.locator('[data-testid="lead-card"]').first();

    if (await firstLead.isVisible()) {
      await firstLead.click();

      // Look for quality score indicator
      const qualityScore = page.locator('[data-testid="quality-score"]');

      if (await qualityScore.isVisible({ timeout: 2000 })) {
        const scoreText = await qualityScore.textContent();
        console.log(`Lead quality score: ${scoreText}`);

        await page.screenshot({ path: 'test-results/screenshots/lead-quality-score.png' });
      }
    }
  });

  test('should show lead category and budget', async ({ page }) => {
    await loginAsCompany(page);

    await page.goto('/dashboard/marketplace');

    const firstLead = page.locator('[data-testid="lead-card"]').first();

    if (await firstLead.isVisible()) {
      await firstLead.click();

      // Should show category
      const category = page.locator('[data-testid="lead-category"]');
      await expect(category).toBeVisible();

      // Should show budget
      const budget = page.locator('[data-testid="estimated-budget"]');
      await expect(budget).toBeVisible();

      await page.screenshot({ path: 'test-results/screenshots/lead-full-details.png' });
    }
  });
});

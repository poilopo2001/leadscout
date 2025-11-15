# LeadScout Test Suite

Comprehensive testing framework for the LeadScout application covering unit tests, integration tests, end-to-end tests, and accessibility compliance.

## Quick Start

### 1. Install Dependencies

```bash
cd leadscout-web
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install --with-deps
```

### 3. Run Tests

```bash
# Run all unit tests
npm run test:unit

# Run E2E tests (requires dev server running)
npm run dev # in one terminal
npm run test:e2e # in another terminal

# Run accessibility tests
npm run test:a11y

# Run all tests with coverage
npm run test:coverage
```

## Test Structure

```
tests/
├── fixtures/              # Test data fixtures
│   ├── mockScout.ts
│   ├── mockCompany.ts
│   ├── mockLead.ts
│   ├── mockPurchase.ts
│   ├── mockPayout.ts
│   └── index.ts
├── unit/                  # Unit tests
│   └── lib/
│       ├── calculateLeadPrice.test.ts
│       ├── calculateQualityScore.test.ts
│       └── calculateCommission.test.ts
├── integration/           # Integration tests (pending)
├── e2e/                   # End-to-end tests (Playwright)
│   ├── fixtures/
│   │   └── auth.ts        # Authentication helpers
│   ├── 01-homepage.spec.ts
│   ├── 02-company-flow.spec.ts
│   ├── 03-authentication.spec.ts
│   └── 04-accessibility.spec.ts
└── README.md
```

## Test Commands

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm test -- calculateLeadPrice.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test 01-homepage.spec.ts

# View HTML report
npx playwright show-report
```

### Accessibility Tests

```bash
# Run only accessibility tests
npm run test:a11y
```

## Writing Tests

### Unit Test Example

```typescript
import { calculateLeadPrice } from '../../../convex/lib/calculateLeadPrice';

describe('calculateLeadPrice', () => {
  it('should return correct price for IT Services', () => {
    expect(calculateLeadPrice('IT Services')).toBe(30);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should display homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await page.screenshot({ path: 'homepage.png' });
});
```

### Using Fixtures

```typescript
import { mockLead, mockCompany } from '../fixtures';

test('test with fixtures', () => {
  expect(mockLead.category).toBe('IT Services');
  expect(mockCompany.plan).toBe('growth');
});
```

## Test Coverage Goals

- **Overall**: 80%+
- **Critical paths**: 100%
- **Convex mutations**: 90%+
- **React components**: 70%+

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop` branches
- All pull requests

See `.github/workflows/test.yml` for configuration.

## Environment Variables

Create `.env.test` for E2E tests:

```env
# Test user credentials
TEST_COMPANY_EMAIL=test-company@leadscout.test
TEST_COMPANY_PASSWORD=TestPassword123!
TEST_SCOUT_EMAIL=test-scout@leadscout.test
TEST_SCOUT_PASSWORD=TestPassword123!
TEST_ADMIN_EMAIL=admin@leadscout.test
TEST_ADMIN_PASSWORD=AdminPassword123!

# API keys (test mode)
CONVEX_DEPLOYMENT=your-dev-deployment
STRIPE_SECRET_KEY=sk_test_...
```

## Debugging Tests

### Unit Tests

```bash
# Run with verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand calculateLeadPrice.test.ts
```

### E2E Tests

```bash
# Debug mode
npx playwright test --debug

# UI mode (best for debugging)
npx playwright test --ui

# Headed mode (see browser)
npx playwright test --headed

# Trace viewer
npx playwright show-trace trace.zip
```

## Test Reports

### Unit Test Reports
- Terminal output
- Coverage report: `coverage/index.html`
- JSON report: `coverage/coverage-final.json`

### E2E Test Reports
- HTML report: `playwright-report/index.html`
- JSON report: `playwright-report/results.json`
- JUnit report: `playwright-report/results.xml`
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/` (on failure)

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Don't Repeat**: Use fixtures and helpers
5. **Fast Tests**: Keep unit tests under 1ms, E2E under 30s
6. **Clean Up**: Restore state after tests
7. **Screenshots**: Take screenshots for visual verification
8. **Timeouts**: Use appropriate timeouts for async operations

## Common Issues

### Playwright Tests Timing Out

Increase timeout:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // test code
});
```

### Convex Mock Issues

Check `jest.setup.js` for mock configuration.

### Authentication Fails in E2E

Ensure test users exist in Clerk and credentials are correct in `.env.test`.

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core)

## Support

For questions or issues:
1. Check existing test examples
2. Review `TEST_PLAN.md` for strategy
3. Check `QA_REPORT.md` for execution status

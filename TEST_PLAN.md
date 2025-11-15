# LeadScout Test Plan & Strategy

## Document Information
- **Version**: 1.0
- **Last Updated**: 2025-11-15
- **QA Engineer**: QA Agent
- **Status**: Ready for Execution

## 1. Testing Philosophy

### 1.1 Core Principles
- **Quality Over Speed**: No shortcuts in testing critical user flows
- **Shift-Left Testing**: Test early and often throughout development
- **Real-World Scenarios**: Test with realistic data and user behaviors
- **Continuous Monitoring**: Integrate tests into CI/CD pipeline
- **User-Centric Focus**: Prioritize user-facing functionality over internal optimizations

### 1.2 Testing Pyramid
```
    /\
   /  \  E2E Tests (10%)
  /____\ Integration Tests (30%)
 /      \ Unit Tests (60%)
/_________\
```

- **Unit Tests (60%)**: Fast, isolated tests for functions and components
- **Integration Tests (30%)**: Test interactions between modules (Stripe, emails, Convex)
- **End-to-End Tests (10%)**: Full user flows from UI to database

## 2. Test Levels

### 2.1 Unit Testing
**Tools**: Jest + React Testing Library
**Coverage Target**: 80%+ for critical paths

**Scope**:
- Convex functions (queries, mutations, actions)
- React components (UI rendering, user interactions)
- Utility functions (pricing calculations, quality scoring)
- Form validation logic

**Example**:
```typescript
// Test lead purchase mutation
it('should deduct credit and return contact info', async () => {
  const result = await ctx.runMutation(api.mutations.leads.purchase, {
    leadId: testLead._id,
    companyId: testCompany._id
  })
  expect(result.creditsRemaining).toBe(19)
  expect(result.contactInfo.email).toBeDefined()
})
```

### 2.2 Integration Testing
**Tools**: Jest + Convex Test Client
**Coverage Target**: 100% for external integrations

**Scope**:
- Stripe subscription webhooks
- Stripe payout webhooks
- Email notifications (Resend)
- Convex database operations
- Authentication flows (Clerk)

**Example**:
```typescript
// Test Stripe subscription webhook
it('should activate subscription and allocate credits', async () => {
  await handleStripeWebhook('customer.subscription.created', {
    customer: testCompany.stripeCustomerId,
    items: [{ price: { id: STARTER_PRICE_ID } }]
  })

  const company = await ctx.query(api.queries.companies.getCurrentUser)
  expect(company.subscriptionStatus).toBe('active')
  expect(company.creditsRemaining).toBe(20)
})
```

### 2.3 End-to-End Testing
**Tools**: Playwright
**Coverage Target**: 100% for critical user flows

**Scope**:
- Company signup → subscription → lead purchase
- Scout signup → lead submission → approval → sale → payout
- Admin moderation workflows
- Authentication and authorization
- Responsive design (mobile, tablet, desktop)
- Performance benchmarks

**Example**:
```typescript
test('company can purchase lead', async ({ page }) => {
  await loginAsCompany(page)
  await page.goto('/dashboard/marketplace')
  await page.click('.lead-card:first-child button:has-text("Purchase")')
  await page.click('button:has-text("Confirm")')
  await expect(page.locator('text=Lead purchased!')).toBeVisible()
})
```

## 3. Test Coverage Goals

### 3.1 Coverage by Module
| Module | Unit Tests | Integration Tests | E2E Tests | Total Coverage |
|--------|-----------|-------------------|-----------|----------------|
| Convex Mutations | 90% | 100% | 80% | 95% |
| Convex Queries | 80% | 80% | 60% | 75% |
| React Components | 70% | - | 90% | 85% |
| Stripe Integration | - | 100% | 100% | 100% |
| Email System | - | 100% | - | 100% |
| Authentication | - | 80% | 100% | 95% |

### 3.2 Critical Paths (100% Coverage Required)
1. **Lead Purchase Flow**: Company browses → filters → purchases → receives contact info
2. **Scout Earnings Flow**: Scout submits → admin approves → company purchases → scout earns
3. **Subscription Management**: Company subscribes → gets credits → renews monthly
4. **Payout Flow**: Scout accumulates earnings → requests payout → receives transfer
5. **Moderation Queue**: Admin reviews → approves/rejects → notifies scout

## 4. Test Environments

### 4.1 Local Development
- **Purpose**: Developer testing during implementation
- **Database**: Convex local deployment
- **Stripe**: Test mode with test API keys
- **Emails**: Logged to console (no actual sending)
- **Auth**: Clerk development instance

### 4.2 Staging
- **Purpose**: Pre-production QA testing
- **Database**: Convex staging deployment
- **Stripe**: Test mode with webhook forwarding
- **Emails**: Real emails to test addresses
- **Auth**: Clerk staging instance
- **URL**: `https://staging.leadscout.com`

### 4.3 Production
- **Purpose**: Smoke tests and monitoring
- **Database**: Convex production deployment
- **Stripe**: Live mode with real payments
- **Emails**: Real emails to customers
- **Auth**: Clerk production instance
- **URL**: `https://leadscout.com`

### 4.4 CI/CD Pipeline
- **Trigger**: Every push to main branch
- **Tests Run**: All unit + integration + critical E2E flows
- **Duration**: < 10 minutes
- **Failure Action**: Block deployment
- **Success Action**: Auto-deploy to staging

## 5. Test Data Management

### 5.1 Test Fixtures
**Location**: `tests/fixtures/`

**Data Sets**:
- `mockScout.ts`: Sample scout with quality score, earnings
- `mockCompany.ts`: Sample company with subscription, credits
- `mockLead.ts`: Sample lead with all required fields
- `mockPurchase.ts`: Sample purchase transaction
- `mockPayout.ts`: Sample payout record

**Example**:
```typescript
export const mockScout = {
  userId: 'test-user-scout-1',
  qualityScore: 8.2,
  badge: 'silver',
  totalLeadsSold: 23,
  pendingEarnings: 125.50,
  totalEarnings: 1245.00
}
```

### 5.2 Database Seeding
- **Development**: Auto-seed with 50 leads, 10 scouts, 5 companies
- **Testing**: Create fresh test data before each test run
- **Staging**: Manual seed with realistic volume (500 leads, 100 scouts, 50 companies)

### 5.3 Test Data Cleanup
- **After Each Test**: Delete all test records
- **Database Isolation**: Use unique test namespaces
- **Stripe Test Mode**: Automatically cleaned by Stripe

## 6. CI/CD Integration

### 6.1 GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest
    env:
      CONVEX_DEPLOYMENT: ${{ secrets.CONVEX_DEV_DEPLOYMENT }}
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  coverage:
    needs: [unit-tests, integration-tests, e2e-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi
```

### 6.2 Pre-Commit Hooks
**Tool**: Husky + lint-staged

**Hooks**:
- Run unit tests for changed files
- Run ESLint on staged files
- Format code with Prettier
- Block commit if tests fail

### 6.3 Deployment Gates
- **Staging**: All tests must pass
- **Production**: All tests + manual QA approval
- **Rollback**: Auto-rollback if smoke tests fail post-deployment

## 7. Test Execution Schedule

### 7.1 Developer Testing
- **When**: Before committing code
- **What**: Unit tests for changed modules
- **Duration**: < 30 seconds

### 7.2 CI/CD Testing
- **When**: Every push to main/develop
- **What**: Full test suite
- **Duration**: < 10 minutes

### 7.3 Nightly Regression
- **When**: Every night at 2am UTC
- **What**: Full E2E suite + performance tests
- **Duration**: ~30 minutes
- **Report**: Slack notification with pass/fail status

### 7.4 Pre-Release Testing
- **When**: Before production deployment
- **What**: Manual QA + exploratory testing
- **Duration**: 2-4 hours
- **Checklist**: See Section 8

## 8. Pre-Release QA Checklist

### 8.1 Functional Testing
- [ ] All critical user flows work end-to-end
- [ ] Authentication works (signup, login, logout)
- [ ] Lead submission form validates correctly
- [ ] Lead purchase deducts credits properly
- [ ] Stripe subscription creates and renews
- [ ] Scout payouts process successfully
- [ ] Email notifications sent correctly
- [ ] Admin moderation queue functions
- [ ] Real-time updates work (Convex subscriptions)

### 8.2 UI/UX Testing
- [ ] All pages render without errors
- [ ] Forms display validation errors
- [ ] Loading states appear appropriately
- [ ] Empty states show helpful messages
- [ ] Error states provide clear actions
- [ ] Mobile responsive design works
- [ ] Dark mode functions (if applicable)
- [ ] Accessibility compliance (WCAG AA)

### 8.3 Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Marketplace query response < 500ms
- [ ] Lead purchase completes < 2 seconds
- [ ] No memory leaks in long sessions
- [ ] Database queries use proper indexes

### 8.4 Security Testing
- [ ] No hardcoded secrets in codebase
- [ ] All API routes require authentication
- [ ] User can only access their own data
- [ ] Admin routes require admin role
- [ ] SQL injection protection (N/A for Convex)
- [ ] XSS protection enabled
- [ ] CORS configured correctly
- [ ] Environment variables properly set

### 8.5 Integration Testing
- [ ] Stripe webhooks received correctly
- [ ] Email notifications delivered
- [ ] Clerk authentication works
- [ ] Convex real-time updates propagate
- [ ] File uploads to Convex storage work

## 9. Defect Management

### 9.1 Bug Report Template
```markdown
## Bug Title
[Clear, concise description]

## Severity
- [ ] Critical (blocks release)
- [ ] High (major functionality broken)
- [ ] Medium (minor functionality affected)
- [ ] Low (cosmetic issue)

## Steps to Reproduce
1. Login as company
2. Navigate to /dashboard/marketplace
3. Click "Purchase" on first lead
4. Error occurs

## Expected Behavior
Lead should be purchased, credits deducted, contact info revealed

## Actual Behavior
Error: "Insufficient credits" (but I have 20 credits)

## Environment
- Browser: Chrome 120
- Device: Desktop (Windows 11)
- URL: https://staging.leadscout.com/dashboard/marketplace
- User: test@company.com

## Screenshots
[Attach screenshots/videos]

## Console Logs
[Copy browser console errors]

## Additional Context
[Any other relevant information]
```

### 9.2 Bug Prioritization
**Critical (P0)**: Fix immediately, block deployment
- Payment processing broken
- Data loss or corruption
- Security vulnerability
- Complete feature failure

**High (P1)**: Fix before next release
- Major feature not working as expected
- Performance degradation
- Bad user experience

**Medium (P2)**: Fix in next sprint
- Minor functionality affected
- Edge case failures
- Non-critical UI issues

**Low (P3)**: Backlog
- Cosmetic issues
- Nice-to-have improvements
- Documentation errors

### 9.3 Bug Workflow
1. **Report**: QA creates bug ticket with template
2. **Triage**: PM assigns severity and priority
3. **Assign**: Dev team member takes ownership
4. **Fix**: Developer implements fix and writes regression test
5. **Verify**: QA verifies fix in staging
6. **Close**: Ticket closed after deployment

## 10. Performance Testing

### 10.1 Load Testing (K6)
**Tool**: K6 load testing framework

**Scenarios**:
1. **Marketplace Query Load**: 100 concurrent users browsing leads
2. **Purchase Spike**: 50 purchases in 1 minute
3. **Scout Submission**: 200 leads submitted in 5 minutes

**Thresholds**:
- 95th percentile response time < 500ms
- Error rate < 1%
- Throughput > 100 requests/second

**Example**:
```javascript
export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
}
```

### 10.2 Stress Testing
- **Concurrent Users**: 500 simultaneous users
- **Database Load**: 10,000 queries/minute
- **Memory Usage**: Monitor for leaks over 4-hour session

### 10.3 Performance Benchmarks
| Operation | Target | Acceptable | Unacceptable |
|-----------|--------|------------|--------------|
| Homepage Load | < 1s | < 2s | > 3s |
| Marketplace Query | < 300ms | < 500ms | > 1s |
| Lead Purchase | < 1s | < 2s | > 3s |
| Scout Submission | < 1s | < 2s | > 3s |
| Dashboard Load | < 1.5s | < 2.5s | > 4s |

## 11. Accessibility Testing

### 11.1 Automated Testing
**Tool**: Axe-core + Playwright

**Tests**:
- WCAG AA compliance on all pages
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios
- Form label associations

**Example**:
```typescript
test('homepage is accessible', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  })
})
```

### 11.2 Manual Testing
- [ ] Tab navigation works correctly
- [ ] Focus indicators visible
- [ ] Alt text on all images
- [ ] ARIA labels on interactive elements
- [ ] Screen reader announces page changes
- [ ] Forms accessible via keyboard only

## 12. Visual Regression Testing

### 12.1 Tool
**Percy.io** - Visual testing platform

### 12.2 Scope
- Homepage
- Dashboard (company view)
- Marketplace page
- Lead details modal
- Scout profile page
- Admin moderation queue

### 12.3 Breakpoints
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1920px (Full HD)

### 12.4 Example
```typescript
test('dashboard matches design', async ({ page }) => {
  await loginAsCompany(page)
  await page.goto('/dashboard')
  await percySnapshot(page, 'Company Dashboard', {
    widths: [375, 768, 1920]
  })
})
```

## 13. Security Testing

### 13.1 Automated Scanning
- **npm audit**: Check for vulnerable dependencies
- **Snyk**: Continuous vulnerability monitoring
- **OWASP ZAP**: Web application security scanner

### 13.2 Manual Testing
- [ ] Authentication bypass attempts
- [ ] Authorization escalation tests
- [ ] Input validation (XSS, injection)
- [ ] Session management security
- [ ] API rate limiting
- [ ] Sensitive data exposure

### 13.3 Compliance
- [ ] GDPR compliance (data privacy)
- [ ] PCI DSS compliance (payment data)
- [ ] SOC 2 requirements (if applicable)

## 14. Test Reporting

### 14.1 Daily Reports
**Recipients**: Dev team, PM
**Content**:
- Test pass/fail rate
- New bugs discovered
- Coverage metrics
- Performance benchmarks

### 14.2 Weekly Reports
**Recipients**: Stakeholders, leadership
**Content**:
- QA summary
- Critical bugs status
- Release readiness assessment
- Quality trends

### 14.3 Release Reports
**Recipients**: All stakeholders
**Content**:
- Complete test results
- Known issues and workarounds
- Performance metrics
- Deployment checklist status

## 15. Test Maintenance

### 15.1 Test Review Schedule
- **Weekly**: Review failing tests
- **Monthly**: Refactor flaky tests
- **Quarterly**: Audit test coverage

### 15.2 Flaky Test Management
- Mark flaky tests with `.failing()` or `.skip()`
- Create tickets to fix flaky tests
- Remove tests that provide no value

### 15.3 Test Debt
- Keep test suite execution time < 10 minutes
- Remove obsolete tests
- Consolidate duplicate tests

## 16. Success Criteria

The LeadScout application is production-ready when:

- ✅ All critical user flows have 100% E2E test coverage
- ✅ Overall code coverage > 80%
- ✅ All integration tests passing
- ✅ Performance benchmarks met
- ✅ Accessibility compliance verified (WCAG AA)
- ✅ Security audit complete with no critical issues
- ✅ Load testing shows system handles 500 concurrent users
- ✅ Zero P0/P1 bugs remaining
- ✅ Manual QA checklist 100% complete
- ✅ Staging environment stable for 48+ hours

## Appendix A: Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- leads.test.ts

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage

# Run Playwright UI mode
npx playwright test --ui

# Run performance tests
npm run test:performance

# Run accessibility tests
npm run test:a11y
```

## Appendix B: Useful Links

- **Playwright Docs**: https://playwright.dev
- **Jest Docs**: https://jestjs.io
- **Testing Library**: https://testing-library.com
- **Axe Accessibility**: https://github.com/dequelabs/axe-core
- **K6 Load Testing**: https://k6.io/docs
- **Percy Visual Testing**: https://docs.percy.io

---

**Document Status**: Ready for team review and execution

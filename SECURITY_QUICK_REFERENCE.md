# LeadScout Security Quick Reference Card

**For Development Team** - Keep this handy during deployment

---

## DEPLOYMENT STATUS

**Current Status**: APPROVED (with 3 fixes required)
**Estimated Fix Time**: 2-3 hours
**Risk Level**: MEDIUM → LOW (after fixes)

---

## MUST FIX BEFORE PRODUCTION

### 1. Add Security Headers (15 min)

**File**: `leadscout-web/next.config.ts`

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    }];
  },
};
```

### 2. Stripe Webhook Verification (30 min)

**File**: `convex/actions/stripe.actions.ts`

Add signature verification:
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### 3. Complete Stripe Integration (2 hours)

Replace ALL mock implementations with real Stripe SDK calls.
See `SECURITY_FIXES_REQUIRED.md` for details.

---

## PRODUCTION ENV VARS CHECKLIST

Copy this to Digital Ocean App Platform:

```bash
# Auth
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOY_KEY=...

# Email
RESEND_API_KEY=re_...
```

Plus all configuration variables from `.env.example`

---

## TESTING BEFORE DEPLOYMENT

```bash
# 1. Test security headers
curl -I https://your-staging.com | grep "X-Frame"

# 2. Test Stripe webhooks
stripe listen --forward-to https://your-staging.com/api/webhooks/stripe

# 3. Test authentication
# Try /dashboard without login (should redirect)

# 4. Run dependency audit
npm audit

# 5. Check for secrets
grep -r "sk_live" . --exclude-dir=node_modules
grep -r "sk_test" . --exclude-dir=node_modules
```

---

## WHAT'S SECURE

- Authentication (Clerk)
- Authorization (RBAC)
- Input validation (Zod)
- No hardcoded secrets
- No dependency vulnerabilities
- XSS prevention
- Credit system validation
- Payout security

---

## WHAT NEEDS ATTENTION

**BLOCKING**:
- Security headers (15 min fix)
- Webhook verification (30 min fix)
- Stripe integration (2 hour fix)

**RECOMMENDED**:
- Rate limiting (30 min)
- Error monitoring (Sentry)
- Dependency scanning (Dependabot)

---

## COMMON SECURITY MISTAKES TO AVOID

**NEVER**:
- Commit `.env.local` to git
- Use `NEXT_PUBLIC_` prefix on secrets
- Skip input validation
- Trust webhook data without verification
- Log sensitive data (passwords, tokens)
- Expose error stack traces to users

**ALWAYS**:
- Use environment variables for config
- Validate ALL user inputs with Zod
- Check user roles before mutations
- Verify webhook signatures
- Use HTTPS only
- Keep dependencies updated

---

## INCIDENT RESPONSE

If security issue found in production:

1. **Immediate**: Assess severity
2. **Critical/High**: Take affected feature offline
3. **Document**: What happened, when, who affected
4. **Fix**: Deploy patch ASAP
5. **Notify**: Users if data breach (GDPR requirement)
6. **Review**: Prevent recurrence

**Emergency contacts**:
- Convex support: support@convex.dev
- Stripe support: https://support.stripe.com
- Clerk support: support@clerk.dev

---

## SECURITY MONITORING

**Watch for**:
- Failed authentication attempts (Clerk dashboard)
- Webhook failures (Stripe dashboard)
- Unexpected credit changes (Convex logs)
- Error spikes (Sentry if configured)

**Set up alerts for**:
- Multiple failed login attempts
- Webhook signature failures
- Unusual purchase patterns
- High error rates

---

## POST-DEPLOYMENT (First 48 Hours)

**Hour 1**:
- [ ] Verify app is live
- [ ] Test user signup/login
- [ ] Test subscription flow
- [ ] Verify webhooks receiving events

**Hour 24**:
- [ ] Review error logs
- [ ] Check webhook event log
- [ ] Verify credit allocations
- [ ] Monitor auth failures

**Hour 48**:
- [ ] Review all transactions
- [ ] Check for any security alerts
- [ ] Verify performance metrics
- [ ] Plan any hotfixes needed

---

## SECURITY SCORECARD

| Category | Status |
|----------|--------|
| Secrets Management | ✅ Pass |
| Authentication | ✅ Pass |
| Authorization | ✅ Pass |
| Input Validation | ✅ Pass |
| Security Headers | ⚠️ Fix required |
| Webhook Security | ⚠️ Fix required |
| Dependencies | ✅ Pass (0 vulns) |
| Rate Limiting | ⚠️ Recommended |
| Error Handling | ✅ Pass |
| Data Privacy | ✅ Pass |

---

## ONE-LINE FIX SUMMARY

1. Add headers to `next.config.ts`
2. Add webhook verification to `stripe.actions.ts`
3. Complete Stripe SDK integration
4. Set production environment variables
5. Test everything
6. Deploy
7. Monitor

**Total time**: 2-3 hours + testing

---

## APPROVAL SIGNATURES

**Security Review**: APPROVED (conditional)
**Required Fixes**: 3 blocking issues
**Deployment Ready**: After fixes
**Next Security Review**: 3 months post-launch

---

## USEFUL COMMANDS

```bash
# Check for exposed secrets
npm run security:check-secrets

# Run all tests
npm test

# Build for production
npm run build

# Deploy to Convex
npx convex deploy --prod

# View production logs
npx convex logs --prod

# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## DOCUMENTATION LINKS

- Full audit: `SECURITY_AUDIT_REPORT.md` (36 pages)
- Fix guide: `SECURITY_FIXES_REQUIRED.md` (step-by-step)
- Summary: `SECURITY_SUMMARY.md` (executive overview)
- This card: `SECURITY_QUICK_REFERENCE.md` (quick reference)

---

**Print this card and keep it visible during deployment!**

Last updated: 2025-11-15
Version: 1.0

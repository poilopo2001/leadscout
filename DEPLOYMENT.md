# LeadScout Production Deployment Guide

Complete guide to deploying LeadScout to Digital Ocean App Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Security Fixes Implemented](#security-fixes-implemented)
3. [Environment Variables](#environment-variables)
4. [Convex Deployment](#convex-deployment)
5. [Digital Ocean Deployment](#digital-ocean-deployment)
6. [Stripe Configuration](#stripe-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Rollback Procedure](#rollback-procedure)

---

## Prerequisites

Before deployment, ensure you have:

- [x] **Digital Ocean Account** with billing enabled
- [x] **GitHub Repository** for the codebase
- [x] **doctl CLI** installed ([Installation Guide](https://docs.digitalocean.com/reference/doctl/how-to/install/))
- [x] **Convex Account** ([Sign up](https://www.convex.dev))
- [x] **Clerk Account** ([Sign up](https://clerk.com))
- [x] **Stripe Account** with live mode enabled ([Sign up](https://stripe.com))
- [x] **Resend Account** with verified domain ([Sign up](https://resend.com))

---

## Security Fixes Implemented

The following critical security fixes have been implemented before deployment:

### 1. Security Headers (next.config.ts)

All production security headers configured:
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME type sniffing)
- **X-XSS-Protection**: 1; mode=block (XSS protection)
- **Strict-Transport-Security**: max-age=31536000; includeSubDomains (enforce HTTPS)
- **Content-Security-Policy**: Comprehensive CSP with allowed sources for Clerk, Stripe, Convex
- **Referrer-Policy**: origin-when-cross-origin
- **Permissions-Policy**: Restricted camera, microphone, geolocation

### 2. Stripe Webhook Signature Verification

Implemented in `app/api/webhooks/stripe/route.ts`:
- Full signature verification using `stripe.webhooks.constructEvent()`
- Rejects unsigned or invalid webhook requests
- Proper error handling and logging
- Returns appropriate HTTP status codes

### 3. Complete Stripe SDK Integration

Replaced all placeholder code in `convex/actions/stripe.actions.ts`:
- **createSubscription**: Real Stripe Checkout session creation
- **onboardScout**: Stripe Connect account creation and onboarding links
- **processPayout**: Actual Stripe transfers to Connected Accounts
- **createCreditCheckout**: One-time payment checkout for credit top-ups
- Proper error handling with detailed logging

---

## Environment Variables

### Required Variables

All variables must be configured in Digital Ocean App Platform settings.

#### Clerk Authentication

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

**How to get:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to API Keys
4. Copy "Publishable key" and "Secret key" (use LIVE keys for production)

#### Convex Backend

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:...
```

**How to get:**
1. Deploy Convex to production: `npx convex deploy --prod`
2. Copy the deployment URL from output
3. Get deploy key from Convex dashboard > Settings > Deploy Keys

#### Stripe Payments (LIVE MODE)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_...
STRIPE_CREDIT_PRICE_ID=price_...
```

**How to get:**
1. **API Keys**: Stripe Dashboard > Developers > API keys (use LIVE keys)
2. **Webhook Secret**: See [Stripe Configuration](#stripe-configuration) section
3. **Price IDs**: Create products in Stripe Dashboard > Products

**Create Subscription Products:**
- **Starter Plan**: 99€/month, 20 credits
- **Growth Plan**: 249€/month, 60 credits
- **Scale Plan**: 499€/month, 150 credits
- **Credit Top-up**: One-time purchase for additional credits

#### Resend Email

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@leadscout.app
```

**How to get:**
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create API key
3. Verify your sending domain in Resend > Domains
4. Use verified email address for RESEND_FROM_EMAIL

#### Business Logic Configuration

```bash
NEXT_PUBLIC_APP_URL=https://leadscout-production.ondigitalocean.app
PAYOUT_MINIMUM_THRESHOLD=20
PLATFORM_COMMISSION_RATE=0.5
STARTER_PLAN_CREDITS=20
GROWTH_PLAN_CREDITS=60
SCALE_PLAN_CREDITS=150
NODE_ENV=production
```

---

## Convex Deployment

### Step 1: Deploy Convex Backend to Production

```bash
cd convex
npx convex deploy --prod
```

This will:
- Create a production deployment
- Generate a production URL (https://your-deployment.convex.cloud)
- Ask you to confirm (type 'yes')

### Step 2: Set Convex Environment Variables

```bash
npx convex env set STRIPE_SECRET_KEY sk_live_... --prod
npx convex env set RESEND_API_KEY re_... --prod
npx convex env set PAYOUT_MINIMUM_THRESHOLD 20 --prod
npx convex env set PLATFORM_COMMISSION_RATE 0.5 --prod
npx convex env set STARTER_PLAN_CREDITS 20 --prod
npx convex env set GROWTH_PLAN_CREDITS 60 --prod
npx convex env set SCALE_PLAN_CREDITS 150 --prod
npx convex env set NEXT_PUBLIC_APP_URL https://leadscout-production.ondigitalocean.app --prod
```

### Step 3: Copy Production URL

Save the production Convex URL for the next step. It will look like:
```
https://happy-animal-123.convex.cloud
```

---

## Digital Ocean Deployment

### Option 1: Automated Deployment Script

```bash
# Make script executable (Linux/Mac)
chmod +x infrastructure/deploy.sh

# Run deployment
./infrastructure/deploy.sh
```

### Option 2: Manual Deployment

#### Step 1: Authenticate with Digital Ocean

```bash
doctl auth init
```

Enter your Digital Ocean API token when prompted.

#### Step 2: Create App from Spec

```bash
doctl apps create --spec infrastructure/digital-ocean-app-spec.yaml
```

#### Step 3: Update Environment Variables

1. Go to [Digital Ocean Dashboard](https://cloud.digitalocean.com/apps)
2. Click on "leadscout-production"
3. Go to **Settings** > **App-Level Environment Variables**
4. Replace all `REPLACE_WITH_*` placeholders with actual values
5. Click **Save**

#### Step 4: Trigger Deployment

The app will automatically deploy after saving environment variables.

### Monitor Deployment

```bash
# Get app ID
APP_ID=$(doctl apps list --format ID --no-header)

# View deployment status
doctl apps get $APP_ID

# Follow logs in real-time
doctl apps logs $APP_ID --type run --follow

# View build logs
doctl apps logs $APP_ID --type build
```

---

## Stripe Configuration

### Step 1: Create Subscription Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) > **Products**
2. Create three subscription products:

**Starter Plan:**
- Name: LeadScout Starter
- Price: €99/month
- Billing period: Monthly
- Copy the Price ID (starts with `price_`)

**Growth Plan:**
- Name: LeadScout Growth
- Price: €249/month
- Billing period: Monthly
- Copy the Price ID

**Scale Plan:**
- Name: LeadScout Scale
- Price: €499/month
- Billing period: Monthly
- Copy the Price ID

**Credit Top-up:**
- Name: LeadScout Credits
- Price: €5 per credit (or your preferred price)
- Type: One-time
- Copy the Price ID

### Step 2: Configure Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://leadscout-production.ondigitalocean.app/api/webhooks/stripe`
   - **Events to send**: Select these events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `account.updated`
     - `transfer.created`
     - `transfer.paid`

4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`)
6. Update `STRIPE_WEBHOOK_SECRET` in Digital Ocean

### Step 3: Enable Stripe Connect

1. Go to **Stripe Dashboard** > **Connect** > **Settings**
2. Enable **Express accounts**
3. Configure branding and terms
4. Save Connect settings

### Step 4: Test Webhook

```bash
# Use Stripe CLI to test webhook locally first
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

---

## Post-Deployment Verification

### Step 1: Health Check

```bash
curl https://leadscout-production.ondigitalocean.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-...",
  "environment": "production",
  "service": "leadscout-web"
}
```

### Step 2: Homepage Check

```bash
curl -I https://leadscout-production.ondigitalocean.app
```

Expected: `200 OK`

### Step 3: Security Headers Check

```bash
curl -I https://leadscout-production.ondigitalocean.app | grep -E "X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security"
```

Expected:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Step 4: Test User Flow

1. **Sign Up**: Navigate to `/sign-up` and create account
2. **Authentication**: Verify Clerk authentication works
3. **Onboarding**: Complete role selection (scout or company)
4. **Subscription**: Test subscription checkout (use Stripe test card: 4242 4242 4242 4242)
5. **Dashboard**: Verify dashboard loads with Convex data

### Step 5: Test Stripe Integration

Use Stripe test mode first:
1. Create test subscription
2. Verify webhook receives `checkout.session.completed`
3. Verify company record created in Convex
4. Check Digital Ocean logs for webhook processing

---

## Monitoring and Maintenance

### Application Logs

```bash
# Real-time application logs
doctl apps logs $APP_ID --type run --follow

# Build logs
doctl apps logs $APP_ID --type build

# Last 100 lines
doctl apps logs $APP_ID --type run --tail 100
```

### Application Metrics

View in Digital Ocean Dashboard:
- CPU usage
- Memory usage
- Request rate
- Response time
- Error rate

### Set Up Alerts

Configure in Digital Ocean Dashboard > Apps > Settings > Alerts:
- High error rate
- High response time
- App downtime
- Memory/CPU threshold exceeded

### Convex Monitoring

View in Convex Dashboard:
- Function call logs
- Database queries
- Mutation/query latency
- Storage usage

### Stripe Monitoring

Monitor in Stripe Dashboard:
- Subscription events
- Payment failures
- Webhook delivery status
- Connect payouts

---

## Rollback Procedure

### View Deployments

```bash
doctl apps list-deployments $APP_ID
```

### Rollback to Previous Version

```bash
# Get deployment ID of stable version
DEPLOYMENT_ID=<previous-deployment-id>

# Create new deployment from previous spec
doctl apps create-deployment $APP_ID --force-rebuild
```

### Emergency Rollback

If the application is completely broken:

1. **Revert Git Commit**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **App will auto-redeploy** from the reverted commit

3. **Or manually trigger**:
   ```bash
   doctl apps create-deployment $APP_ID --force-rebuild
   ```

### Rollback Convex

```bash
# View Convex deployments
npx convex deployments list --prod

# Revert to previous deployment
npx convex deploy --prod --override-version <previous-version>
```

---

## Custom Domain Configuration

### Step 1: Add Domain to App

```bash
doctl apps create-domain $APP_ID --domain leadscout.app
```

### Step 2: Configure DNS

Add these DNS records in your domain registrar:

**For root domain (leadscout.app):**
- Type: `CNAME`
- Name: `@` (or leave empty)
- Value: `leadscout-production.ondigitalocean.app`

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `leadscout-production.ondigitalocean.app`

### Step 3: Update Environment Variables

Update these variables in Digital Ocean:
```bash
NEXT_PUBLIC_APP_URL=https://leadscout.app
```

And in Clerk Dashboard, update redirect URLs to use custom domain.

### Step 4: Verify SSL

Digital Ocean automatically provisions SSL certificates. Verify:
```bash
curl -I https://leadscout.app
```

SSL should be active within 1-2 minutes.

---

## Troubleshooting

### Build Fails

**Check build logs:**
```bash
doctl apps logs $APP_ID --type build
```

**Common issues:**
- Missing environment variables
- TypeScript errors
- Dependency installation failures

### App Won't Start

**Check runtime logs:**
```bash
doctl apps logs $APP_ID --type run --follow
```

**Common issues:**
- Missing NEXT_PUBLIC_CONVEX_URL
- Invalid Clerk keys
- Port configuration

### Webhook Failures

**Check Stripe Dashboard:**
- Go to Developers > Webhooks
- View failed deliveries
- Check error messages

**Common issues:**
- Invalid webhook secret
- Endpoint unreachable
- Signature verification failure

### Database Connection Issues

**Check Convex Dashboard:**
- View error logs
- Verify deployment is active
- Check environment variables

---

## Emergency Contacts

- **DevOps Lead**: [Your email]
- **On-Call**: [On-call contact]
- **Digital Ocean Support**: https://cloud.digitalocean.com/support
- **Stripe Support**: https://support.stripe.com

---

## Deployment Checklist

Use this checklist before each deployment:

- [ ] All tests passing locally
- [ ] Security review completed
- [ ] Environment variables documented
- [ ] Convex deployed to production
- [ ] Stripe products created
- [ ] Stripe webhook configured
- [ ] Resend domain verified
- [ ] Digital Ocean app created/updated
- [ ] Health check returning 200 OK
- [ ] Security headers verified
- [ ] Test user flow completed
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Team notified of deployment

---

## Next Steps After Deployment

1. **Set up monitoring alerts** in Digital Ocean Dashboard
2. **Configure custom domain** (optional)
3. **Set up automated backups** for Convex data
4. **Create runbook** for common operations
5. **Document incident response** procedures
6. **Schedule security audit** (quarterly recommended)
7. **Plan capacity scaling** based on usage

---

**Deployment Guide Version**: 1.0
**Last Updated**: 2025-11-15
**Status**: Production Ready

# Deploy LeadScout to Production - Quick Start

Follow these steps in order to deploy LeadScout to production.

## Pre-Deployment Checklist

- [ ] All security fixes verified (see DEPLOYMENT_SUMMARY.md)
- [ ] All tests passing locally
- [ ] Dependencies installed (npm install in leadscout-web)
- [ ] Environment variables template reviewed (.env.production.example)

---

## Step-by-Step Deployment

### 1. Get Production API Keys (30 minutes)

#### Clerk (Authentication)
1. Go to https://dashboard.clerk.com
2. Create a new application for production (or use existing)
3. Copy these keys:
   - Publishable Key (starts with `pk_live_`)
   - Secret Key (starts with `sk_live_`)
4. Save them securely

#### Stripe (Payments)
1. Go to https://dashboard.stripe.com
2. **Switch to LIVE mode** (toggle in top right)
3. Go to Developers > API Keys
4. Copy these keys:
   - Publishable Key (starts with `pk_live_`)
   - Secret Key (starts with `sk_live_`)
5. Create Products (Products > Add product):
   - **Starter**: €99/month recurring → Copy price ID
   - **Growth**: €249/month recurring → Copy price ID
   - **Scale**: €499/month recurring → Copy price ID
   - **Credits**: €5 one-time → Copy price ID
6. Enable Stripe Connect:
   - Go to Connect > Settings
   - Enable Express accounts
7. Save all price IDs securely

#### Resend (Email)
1. Go to https://resend.com/api-keys
2. Create API key
3. Copy the key (starts with `re_`)
4. Go to Domains
5. Add and verify your domain
6. Use format: `noreply@yourdomain.com`

#### Convex (Backend)
**Note**: You'll deploy Convex in step 3

#### Digital Ocean (Hosting)
1. Go to https://cloud.digitalocean.com/account/api/tokens
2. Click "Generate New Token"
3. Name: "LeadScout Production"
4. Scopes: Read & Write
5. Copy the token immediately (shown only once)

---

### 2. Set Up GitHub Repository (10 minutes)

```bash
# Initialize git (if not already done)
cd C:\Users\sebas\saas\saasagentcode\saascontentv2
git init
git add .
git commit -m "Initial commit: LeadScout production-ready"

# Create GitHub repository
gh repo create leadscout --public --source=. --remote=origin --push

# Or push to existing repository
git remote add origin https://github.com/YOUR_USERNAME/leadscout.git
git branch -M main
git push -u origin main
```

#### Add GitHub Secrets

Go to your repository on GitHub.com:
1. Click Settings > Secrets and variables > Actions
2. Click "New repository secret" for each:

```
NEXT_PUBLIC_CONVEX_URL=https://[will-get-in-step-3].convex.cloud
CONVEX_DEPLOY_KEY=[will-get-in-step-3]
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=[will-get-in-step-5]
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_...
STRIPE_CREDIT_PRICE_ID=price_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://leadscout-production.ondigitalocean.app
DIGITALOCEAN_ACCESS_TOKEN=[your-do-token]
```

---

### 3. Deploy Convex Backend (5 minutes)

```bash
cd convex
npx convex deploy --prod
```

**You'll see output like:**
```
✔ Deployed to https://happy-animal-123.convex.cloud
```

**Copy this URL** - you need it for environment variables!

#### Set Convex Environment Variables

```bash
# Replace with your actual values
npx convex env set STRIPE_SECRET_KEY sk_live_... --prod
npx convex env set RESEND_API_KEY re_... --prod
npx convex env set PAYOUT_MINIMUM_THRESHOLD 20 --prod
npx convex env set PLATFORM_COMMISSION_RATE 0.5 --prod
npx convex env set STARTER_PLAN_CREDITS 20 --prod
npx convex env set GROWTH_PLAN_CREDITS 60 --prod
npx convex env set SCALE_PLAN_CREDITS 150 --prod
npx convex env set NEXT_PUBLIC_APP_URL https://leadscout-production.ondigitalocean.app --prod
```

**Now go back to GitHub and update these secrets:**
- NEXT_PUBLIC_CONVEX_URL = (the URL from deploy output)
- CONVEX_DEPLOY_KEY = (get from Convex dashboard > Settings > Deploy Keys)

---

### 4. Deploy to Digital Ocean (10 minutes)

#### Install and authenticate doctl

**Windows (PowerShell):**
```powershell
choco install doctl
doctl auth init
```

**Mac/Linux:**
```bash
brew install doctl
doctl auth init
```

Enter your Digital Ocean API token when prompted.

#### Update deployment spec

Edit `infrastructure/digital-ocean-app-spec.yaml`:
1. Line 6: Change GitHub repo to your username
2. Save the file

#### Deploy the app

```bash
# Make script executable (Mac/Linux)
chmod +x infrastructure/deploy.sh

# Run deployment
./infrastructure/deploy.sh
```

**Or manually:**
```bash
doctl apps create --spec infrastructure/digital-ocean-app-spec.yaml
```

#### Update environment variables in Digital Ocean

1. Go to https://cloud.digitalocean.com/apps
2. Click on "leadscout-production"
3. Go to Settings > App-Level Environment Variables
4. Click on each variable and replace REPLACE_WITH_* values with actual keys
5. Click Save
6. App will automatically redeploy

**Wait 5-10 minutes for deployment to complete.**

---

### 5. Configure Stripe Webhook (5 minutes)

#### Get your app URL

```bash
# Get app ID
APP_ID=$(doctl apps list --format ID --no-header | head -1)

# Get app URL
doctl apps get $APP_ID --format DefaultIngress --no-header
```

You'll see something like: `leadscout-production-xxxxx.ondigitalocean.app`

#### Create webhook in Stripe

1. Go to https://dashboard.stripe.com/test/webhooks (switch to LIVE mode)
2. Click "Add endpoint"
3. Endpoint URL: `https://leadscout-production-xxxxx.ondigitalocean.app/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `account.updated`
   - `transfer.created`
   - `transfer.paid`
5. Click "Add endpoint"
6. **Copy the Signing secret** (starts with `whsec_`)

#### Update webhook secret

**In Digital Ocean:**
1. Go to your app > Settings > App-Level Environment Variables
2. Find `STRIPE_WEBHOOK_SECRET`
3. Replace value with the signing secret
4. Save (app will redeploy)

**In GitHub:**
1. Go to repository Settings > Secrets and variables > Actions
2. Update `STRIPE_WEBHOOK_SECRET` with the signing secret

---

### 6. Update Clerk Redirect URLs (5 minutes)

1. Go to https://dashboard.clerk.com
2. Select your production application
3. Go to Paths
4. Update these URLs to use your production domain:
   - Sign-in URL: `https://leadscout-production-xxxxx.ondigitalocean.app/sign-in`
   - Sign-up URL: `https://leadscout-production-xxxxx.ondigitalocean.app/sign-up`
   - After sign-in: `https://leadscout-production-xxxxx.ondigitalocean.app/dashboard`
   - After sign-up: `https://leadscout-production-xxxxx.ondigitalocean.app/onboarding`
5. Save changes

---

### 7. Verify Deployment (10 minutes)

#### Test health endpoint

```bash
APP_URL=$(doctl apps get $APP_ID --format DefaultIngress --no-header)
curl https://$APP_URL/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-...",
  "environment": "production",
  "service": "leadscout-web"
}
```

#### Test security headers

```bash
curl -I https://$APP_URL | grep -E "X-Frame-Options|Strict-Transport-Security"
```

**Expected:**
```
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

#### Test the application

1. Open `https://leadscout-production-xxxxx.ondigitalocean.app` in browser
2. Sign up as a new user
3. Complete onboarding (choose scout or company)
4. Verify Clerk authentication works
5. If company: Try to view pricing page
6. If scout: Try to view dashboard

#### Test Stripe webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click on your endpoint
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Send the test
6. Verify it shows "Succeeded" status

#### Monitor logs

```bash
doctl apps logs $APP_ID --type run --follow
```

Watch for any errors during first user interactions.

---

### 8. Test Complete User Flows (20 minutes)

#### Scout Flow
1. Sign up as scout
2. Complete profile
3. Start Stripe Connect onboarding
4. Submit a test lead
5. Verify lead appears in dashboard

#### Company Flow
1. Sign up as company (different email)
2. Go to pricing page
3. Select Starter plan (€99/month)
4. Complete Stripe checkout (use test card: 4242 4242 4242 4242)
5. Verify subscription created
6. Verify credits allocated
7. Browse marketplace
8. Purchase a lead
9. Verify contact information revealed

#### Verify Webhooks
1. Go to Stripe Dashboard > Developers > Webhooks
2. Click on your endpoint
3. View recent events
4. All should show "Succeeded"

---

## Deployment Complete! 🎉

Your application is now live at:
```
https://leadscout-production-xxxxx.ondigitalocean.app
```

### Next Steps

1. **Set up custom domain** (optional):
   - See DEPLOYMENT.md "Custom Domain Configuration" section
   - Update all environment variables with new domain

2. **Set up monitoring**:
   - Configure alerts in Digital Ocean dashboard
   - Set up error tracking (Sentry, etc.)
   - Monitor Stripe webhook deliveries

3. **Review checklist**:
   - Go through PRODUCTION_CHECKLIST.md
   - Ensure all items are complete

4. **Prepare for launch**:
   - Review Terms of Service and Privacy Policy
   - Prepare marketing materials
   - Set up support email
   - Train support team

---

## Troubleshooting

### Build fails
```bash
# Check build logs
doctl apps logs $APP_ID --type build
```

**Common issues:**
- Missing environment variables
- TypeScript errors
- Dependency installation failures

### App won't start
```bash
# Check runtime logs
doctl apps logs $APP_ID --type run
```

**Common issues:**
- Invalid Convex URL
- Invalid Clerk keys
- Missing required environment variables

### Webhook fails
1. Check Stripe Dashboard > Webhooks > Your endpoint
2. View failed deliveries
3. Check error message
4. Verify signing secret matches

**Common issues:**
- Invalid webhook secret
- Wrong endpoint URL
- App not accessible

### Payment fails
1. Check Stripe Dashboard > Payments
2. View error message
3. Check logs for webhook processing

**Common issues:**
- Using test keys in live mode
- Product price IDs incorrect
- Webhook not processing correctly

---

## Rollback Procedure

If something goes wrong:

```bash
# View deployments
doctl apps list-deployments $APP_ID

# Get previous deployment ID
PREVIOUS_DEPLOYMENT_ID=<id-from-list>

# Rollback
doctl apps create-deployment $APP_ID --force-rebuild
```

Or revert Git commit:
```bash
git revert HEAD
git push origin main
# GitHub Actions will auto-deploy the reverted version
```

---

## Support Resources

- **Full Documentation**: DEPLOYMENT.md
- **Security Fixes**: DEPLOYMENT_SUMMARY.md
- **Checklist**: PRODUCTION_CHECKLIST.md
- **Digital Ocean Docs**: https://docs.digitalocean.com/products/app-platform/
- **Convex Docs**: https://docs.convex.dev
- **Stripe Docs**: https://stripe.com/docs
- **Clerk Docs**: https://clerk.com/docs

---

**Total Time Required**: 90-120 minutes (with all API keys ready)

**Status**: Ready to deploy ✅

**Good luck with your launch!** 🚀

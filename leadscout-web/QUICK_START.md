# LeadScout Frontend - Quick Start Guide

Get your LeadScout frontend running in 5 minutes.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git

---

## Step-by-Step Setup

### 1. Install Dependencies (30 seconds)

```bash
cd leadscout-web
npm install
```

### 2. Setup External Services (10 minutes)

#### A. Clerk (Authentication)
1. Go to https://dashboard.clerk.com/
2. Create new application "LeadScout"
3. Copy your publishable key and secret key
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

#### B. Convex (Backend)
1. Go to https://dashboard.convex.dev/
2. Create new project "LeadScout"
3. Copy your deployment URL
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud
   ```

#### C. Stripe (Payments)
1. Go to https://dashboard.stripe.com/
2. Get test mode API keys
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxx
   ```

### 3. Generate Convex Types (1 minute)

**CRITICAL STEP** - Run this before starting the app:

```bash
npx convex dev
```

This will:
- Generate `convex/_generated/` folder
- Create TypeScript types for your backend
- Start Convex dev server

**Keep this terminal open** - Convex must be running.

### 4. Run the App (30 seconds)

In a **new terminal**:

```bash
npm run dev
```

Visit http://localhost:3000

---

## What You'll See

### Homepage (http://localhost:3000)
- Dual hero (Scouts vs Companies)
- How it works
- Pricing preview
- Sign up button → Clerk authentication

### After Sign Up
1. Clerk registration flow
2. Company onboarding (2 steps)
3. Subscription selection
4. Dashboard with:
   - KPI cards (credits, purchases, spending)
   - Lead marketplace
   - Analytics charts
   - Settings

---

## Troubleshooting

### Build fails with "Module not found: @/convex/_generated/api"
**Solution**: Run `npx convex dev` first to generate types.

### Clerk error on sign in
**Solution**: Check that Clerk API keys are correct in `.env.local`.

### "NEXT_PUBLIC_CONVEX_URL is not defined"
**Solution**: Add your Convex deployment URL to `.env.local`.

### Marketplace shows no leads
**Solution**:
1. Check Convex dev server is running
2. Run seed script: `npx convex run seed:seedAll`

---

## Development Workflow

**Always run both together**:

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

---

## Production Build

```bash
npm run build
npm run start
```

**Note**: You must have Convex types generated first (`npx convex dev`).

---

## Next Steps

1. **Test the app**: Sign up, browse marketplace, purchase leads
2. **Customize**: Update branding, colors, content
3. **Deploy**: Follow deployment guide in `FRONTEND_COMPLETE.md`

---

## Need Help?

- **Full Documentation**: See `FRONTEND_COMPLETE.md`
- **Convex Docs**: https://docs.convex.dev/
- **Clerk Docs**: https://clerk.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Status**: Production-ready frontend with 100% feature completion
**Build Time**: ~5 minutes to get running locally

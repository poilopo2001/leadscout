# LeadScout - Web Application (Companies Platform)

Human-verified B2B leads marketplace built with Next.js 14, Convex, and Clerk.

## Features

- Modern UI with Shadcn/UI and Tailwind CSS
- Clerk authentication with social login
- Real-time database with Convex
- Stripe payments integration
- Analytics dashboard with charts
- Mobile-responsive design
- WCAG AA accessible

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Database**: Convex (serverless, real-time)
- **Auth**: Clerk
- **Payments**: Stripe
- **Charts**: Recharts

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` with the following:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LeadScout
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Start Convex Dev Server

In a separate terminal:

```bash
npx convex dev
```

## Project Structure

```
leadscout-web/
├── app/
│   ├── (auth)/           # Sign in/up pages
│   ├── (marketing)/      # Public pages
│   ├── (dashboard)/      # Protected dashboard
│   └── providers.tsx     # Clerk + Convex setup
├── components/
│   ├── ui/              # Shadcn components
│   ├── dashboard/       # Dashboard components
│   └── shared/          # Shared components
├── lib/
│   ├── constants.ts     # Pricing, categories
│   └── utils.ts         # Utilities
├── convex/              # Backend (queries, mutations)
└── middleware.ts        # Auth protection
```

## Key Features Implemented

### Marketing
- Homepage with split hero (scouts vs companies)
- Pricing page (3 tiers)
- Responsive navigation

### Dashboard
- KPI cards (credits, purchases, spending)
- Lead marketplace with filters
- Lead purchase flow
- Real-time updates

### Components
- StatCard - KPI display
- LeadCard - Lead preview + purchase modal
- Sidebar - Navigation with credits widget
- Header - Search + user menu

## Deployment

### Digital Ocean

1. Connect GitHub repo to Digital Ocean
2. Set environment variables in dashboard
3. Deploy Convex production: `npx convex deploy`
4. Update Clerk and Stripe with production URLs

### Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

## Environment Variables

### Required
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `NEXT_PUBLIC_CONVEX_URL` - From `npx convex deploy`

### Optional
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For payments
- `STRIPE_SECRET_KEY` - For server-side Stripe

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - Lint code

## Documentation

- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Detailed implementation notes
- [UI Designs](../ui-designs.md) - Full design specifications
- [Style Guide](../style-guide.md) - Design system tokens
- [Technical Architecture](../technical-architecture.md) - System architecture

## Next Steps

- Complete remaining dashboard pages (purchases, analytics, subscription, settings)
- Add Stripe checkout integration
- Implement email notifications
- Add comprehensive testing
- Performance optimization

---

Built with Next.js 14, Convex, and Clerk

# Product Requirements Document: LeadScout

## Document Information
- **Version**: 1.0
- **Last Updated**: 2025-11-15
- **Product Manager**: AI PM Agent
- **Status**: Draft for Review

## 1. Overview

### 1.1 Product Vision
LeadScout is a two-sided B2B marketplace that connects commercial scouts with companies seeking qualified business leads. Scouts monetize their daily business interactions by submitting opportunities, while companies access pre-qualified leads without maintaining prospecting teams.

### 1.2 Business Objectives
- **Scout Engagement**: Activate 500 scouts submitting 2+ leads/month with 70%+ first-lead submission within 7 days
- **Company Revenue**: Achieve 15,000€ monthly GMV by month 6 with 80%+ subscription retention
- **Marketplace Efficiency**: Maintain 60%+ lead conversion rate (sold within 30 days) with <24h average purchase time

### 1.3 Success Metrics
- **Primary KPI**: Monthly GMV (Gross Merchandise Value) - Target: 15,000€ by month 6
- **Secondary KPIs**:
  - Scout Activation Rate: 70% submit first lead within 7 days
  - Company Retention Rate: 80% monthly subscription renewal
  - Lead Conversion Rate: 60% leads sold within 30 days
  - Average Lead Quality Score: 7.5/10
  - Platform Revenue Split: 50% commission on all transactions

## 2. User Personas

### Persona 1: Commercial Scout (Mobile-First User)
- **Demographics**: 25-45 years old, sales professional, account manager, or business consultant with active professional network
- **Goals**:
  - Monetize daily business interactions and networking
  - Build passive income stream (target: 500-1,000€/month)
  - Gain recognition as a top-tier scout
- **Pain Points**:
  - No easy way to monetize business opportunities outside their scope
  - Time-consuming submission processes
  - Unclear payout timelines and earnings visibility
- **Tech Savviness**: Medium-High (comfortable with mobile apps, familiar with gig economy platforms)
- **Key Behaviors**:
  - Primarily mobile-based interactions
  - Active during business hours (9am-6pm)
  - Values immediate feedback and transparency

### Persona 2: B2B Company Decision Maker (Desktop User)
- **Demographics**: 30-55 years old, Sales Director, CMO, or Business Development Manager at SMB/Mid-Market companies
- **Goals**:
  - Access qualified leads without hiring prospecting team
  - Reduce customer acquisition costs
  - Scale lead generation predictably
- **Pain Points**:
  - Cold outreach has low conversion rates
  - Lead generation agencies are expensive (1,000€+ setup fees)
  - Difficulty assessing lead quality before purchase
- **Tech Savviness**: Medium (comfortable with SaaS platforms, familiar with CRM tools)
- **Key Behaviors**:
  - Desktop-first for browsing and purchasing
  - Data-driven decision making (needs analytics)
  - Values ROI transparency and credit flexibility

### Persona 3: Platform Admin (Moderation & Operations)
- **Demographics**: Internal team member responsible for marketplace quality
- **Goals**:
  - Maintain lead quality standards
  - Prevent fraud and abuse
  - Optimize platform economics
- **Pain Points**:
  - Manual moderation is time-consuming
  - Identifying bad actors early is difficult
- **Tech Savviness**: High
- **Key Behaviors**:
  - Uses admin dashboard for moderation queues
  - Analyzes quality metrics to flag issues
  - Communicates with scouts for quality improvement

## 3. User Journey Maps

### Journey 1: Scout Onboarding & First Lead Submission
1. **Entry Point**: Scout discovers LeadScout via referral or marketing
2. **Steps**:
   - Downloads mobile app (iOS/Android)
   - Signs up with Clerk (email/social auth)
   - Completes scout profile (name, industry expertise, LinkedIn)
   - Receives onboarding tutorial (3 screens: how to spot leads, submission process, earnings model)
   - Submits first lead via mobile form
   - Receives confirmation with estimated earnings (12.5-25€)
   - Waits for lead approval (admin moderation within 24h)
   - Gets notified when lead is published to marketplace
3. **Pain Points**:
   - Unclear lead quality criteria
   - Uncertainty about earnings timeline
   - Stripe Connect onboarding friction
4. **Opportunities**:
   - Gamification: "Submit your first lead to unlock Bronze Scout badge"
   - Immediate feedback: Show estimated value range during submission
   - Progress tracking: "Your lead is under review (typically 24h)"
5. **Success State**: Lead approved, published, and scout receives push notification "Your lead is live! Companies are viewing it now."

### Journey 2: Company Subscription & First Lead Purchase
1. **Entry Point**: Company decision maker discovers LeadScout via LinkedIn/Google search
2. **Steps**:
   - Visits landing page (desktop)
   - Reviews pricing plans (Starter/Growth/Scale)
   - Signs up with Clerk (email/Google workspace)
   - Selects subscription plan (Stripe Checkout)
   - Completes payment (Stripe handles PCI compliance)
   - Redirected to lead marketplace dashboard
   - Filters leads by category/budget/industry
   - Previews lead details (partial info: industry, budget range, location)
   - Clicks "Purchase with 1 Credit"
   - Confirms purchase
   - Receives full lead details (company name, contact info, description)
   - Downloads lead as PDF or exports to CRM
3. **Pain Points**:
   - Unclear lead quality before purchase
   - Fear of wasting credits on low-quality leads
4. **Opportunities**:
   - Trust signals: Show scout quality score and conversion rate
   - Risk mitigation: "Money-back guarantee if lead is duplicate or invalid"
   - Onboarding incentive: "Get 5 bonus credits on your first subscription"
5. **Success State**: Company purchases first lead, contacts prospect, and begins sales process

### Journey 3: Weekly Payout Process for Scouts
1. **Entry Point**: Friday morning, automated Convex scheduled function triggers
2. **Steps**:
   - System identifies scouts with 20€+ pending earnings
   - Validates Stripe Connect account status
   - Creates payout batches via Stripe Connect API
   - Sends payout confirmation email via Resend
   - Updates scout dashboard with payout history
   - Scout receives funds in bank account (2-5 business days)
3. **Pain Points**:
   - Confusion about minimum payout threshold
   - Stripe Connect onboarding incomplete
4. **Opportunities**:
   - Proactive communication: Email on Thursday "You've earned 45€ this week! Payout tomorrow."
   - Transparency: Show payout schedule and bank transfer timeline
5. **Success State**: Scout receives payout notification and sees updated balance in app

### Journey 4: Lead Quality Moderation Flow
1. **Entry Point**: Scout submits new lead, appears in admin moderation queue
2. **Steps**:
   - Admin receives notification (new lead pending review)
   - Reviews lead details in admin dashboard
   - Validates company information (Google search, LinkedIn check)
   - Assesses lead quality criteria (completeness, accuracy, target market fit)
   - Decision: Approve, Request Changes, or Reject
   - If approved: Lead published to marketplace with quality score
   - If rejected: Scout notified with feedback for improvement
3. **Pain Points**:
   - Manual verification is time-consuming
   - Inconsistent quality standards across admins
4. **Opportunities**:
   - Automated validation: API lookup for company verification
   - Quality checklist: Standardized criteria for approval
   - Scout education: Provide quality templates and examples
5. **Success State**: Lead approved within 24h, published with quality score, scout notified

### Journey 5: Analytics Dashboard for Companies
1. **Entry Point**: Company user navigates to Analytics tab (Growth/Scale plans only)
2. **Steps**:
   - Views KPI cards: Total leads purchased, conversion rate, average ROI, credits remaining
   - Analyzes lead performance by category (bar chart)
   - Reviews top-performing scouts (quality leaderboard)
   - Exports data as CSV for internal reporting
   - Identifies optimization opportunities (which categories convert best)
3. **Pain Points**:
   - Difficulty proving ROI to stakeholders
   - Uncertainty about which lead categories to prioritize
4. **Opportunities**:
   - Actionable insights: "Leads in 'SaaS' category have 80% conversion rate"
   - Benchmarking: "Your conversion rate is 15% above average"
5. **Success State**: Company identifies high-ROI categories, adjusts filtering strategy, increases subscription tier

## 4. Feature Requirements

### 4.1 Must-Have Features (MVP)

#### Feature 1: Scout Mobile App - Lead Submission
**Description**: Mobile-first interface for scouts to submit business leads they discover in their daily interactions.

**User Stories**:
- As a scout, I want to quickly submit a lead from my phone so that I don't lose the opportunity
- As a scout, I want to see estimated earnings before submitting so that I know if it's worth my time
- As a scout, I want to upload photos of business cards so that I capture contact details accurately
- As a scout, I want to track submission status so that I know when leads are approved and sold

**Acceptance Criteria**:
- [ ] Lead submission form includes required fields: lead title, company name, contact name, contact email, contact phone, industry category, estimated budget, description (min 100 characters)
- [ ] Form validation prevents submission of incomplete data
- [ ] Photo upload supports JPEG/PNG with max 5MB per image
- [ ] Estimated earnings calculation displays range (12.5-25€) based on category
- [ ] Submission triggers Convex mutation creating lead with status "pending_review"
- [ ] Push notification sent when lead status changes (approved, rejected, sold)
- [ ] Submission history page shows all leads with status badges (pending, live, sold, rejected)
- [ ] Offline support: Form data cached locally, submitted when connection restored
- [ ] Mobile-optimized form with native input types (tel, email)

**Technical Requirements**:
- Frontend: React Native (Expo) with react-hook-form for validation
- Backend: Convex mutation `createLead` with schema validation
- Database: `leads` table with fields: scoutId, title, companyName, contactInfo, category, estimatedBudget, description, status, photos (array), createdAt
- File Storage: Convex file storage for photo uploads
- Notifications: Expo push notifications integrated with Convex triggers
- Environment Variables: `EXPO_PUBLIC_CONVEX_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Success Metrics**:
- 70% of scouts submit first lead within 7 days of signup
- Average submission time: <5 minutes
- 85%+ submission success rate (valid data)

---

#### Feature 2: Company Web App - Lead Marketplace
**Description**: Desktop-optimized marketplace where companies browse, filter, and purchase leads using subscription credits.

**User Stories**:
- As a company, I want to filter leads by industry category so that I find relevant opportunities
- As a company, I want to see partial lead details before purchasing so that I can assess quality
- As a company, I want to purchase leads with 1-click using my credits so that I can act quickly
- As a company, I want to download purchased lead details as PDF so that I can share with my team

**Acceptance Criteria**:
- [ ] Marketplace displays grid of lead cards with preview info: industry, estimated budget, lead quality score, scout rating, days since posted
- [ ] Filter sidebar includes: industry category (multi-select), budget range (slider), quality score (min threshold), posted date (last 7/30/90 days)
- [ ] Real-time updates: New leads appear without page refresh (Convex reactive queries)
- [ ] Lead detail modal shows full information after purchase
- [ ] Purchase button disabled if insufficient credits with upgrade prompt
- [ ] 1-click purchase deducts 1 credit and reveals full lead details
- [ ] Purchased leads page shows all acquired leads with export options (CSV, PDF)
- [ ] Search functionality finds leads by company name or keywords
- [ ] Mobile-responsive view for on-the-go browsing

**Technical Requirements**:
- Frontend: Next.js 14 App Router with Shadcn/UI components (Card, Dialog, Filter, Button)
- Backend: Convex query `getAvailableLeads` with filtering logic, mutation `purchaseLead`
- Database: `purchases` table with fields: companyId, leadId, purchasedAt, creditUsed
- Real-time: Convex subscriptions for live marketplace updates
- PDF Generation: jsPDF library for lead export
- Environment Variables: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Success Metrics**:
- Average time to first purchase: <10 minutes after subscription
- 60%+ leads sold within 30 days
- <2s marketplace page load time

---

#### Feature 3: Stripe Subscription Management (Companies)
**Description**: Complete subscription lifecycle management including plan selection, payment processing, upgrades/downgrades, and credit allocation.

**User Stories**:
- As a company, I want to choose a subscription plan so that I can access leads based on my budget
- As a company, I want to upgrade my plan mid-cycle so that I get more credits immediately
- As a company, I want to see my credit balance so that I know when to purchase more
- As a company, I want to manage my payment method so that I can update card details

**Acceptance Criteria**:
- [ ] Pricing page displays 3 tiers: Starter (99€/month, 20 credits), Growth (249€/month, 60 credits + analytics), Scale (499€/month, 150 credits + API access)
- [ ] Stripe Checkout integration creates subscription with automatic recurring billing
- [ ] Webhook handler processes `checkout.session.completed` to allocate credits
- [ ] Webhook handler processes `invoice.payment_succeeded` for monthly renewals
- [ ] Webhook handler processes `customer.subscription.updated` for plan changes
- [ ] Webhook handler processes `customer.subscription.deleted` for cancellations
- [ ] Credits automatically added on successful payment (stored in Convex `companies` table)
- [ ] Proration logic: Upgrade gives immediate credits, downgrade applies next cycle
- [ ] Subscription management UI (powered by Stripe Customer Portal)
- [ ] Credit purchase top-up option for users who exhaust monthly allocation
- [ ] Email notifications via Resend for subscription events (welcome, renewal, cancellation)

**Technical Requirements**:
- Frontend: Next.js API route `/api/stripe/create-checkout` for session creation
- Backend: Convex actions for Stripe API calls (using Stripe Node SDK)
- Webhooks: Next.js API route `/api/stripe/webhooks` with signature verification
- Database: `companies` table with fields: stripeCustomerId, subscriptionId, plan, creditsRemaining, subscriptionStatus
- Stripe Objects: Products (3 plans), Prices (monthly recurring), Subscriptions, Customers
- Environment Variables:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY` (frontend)
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID`
  - `NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID`
  - `NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID`

**Success Metrics**:
- 80%+ subscription activation rate (signup → paid)
- <5% payment failure rate
- 80%+ monthly renewal rate

---

#### Feature 4: Stripe Connect Payout System (Scouts)
**Description**: Automated weekly payout system using Stripe Connect to transfer scout earnings directly to their bank accounts.

**User Stories**:
- As a scout, I want to connect my bank account so that I can receive payouts
- As a scout, I want to see my pending earnings so that I know how much I'll receive
- As a scout, I want to receive weekly payouts so that I get paid regularly
- As a scout, I want payout history so that I can track my income

**Acceptance Criteria**:
- [ ] Stripe Connect onboarding flow (Express connected accounts) integrated in mobile app
- [ ] Onboarding collects required info: legal name, DOB, bank details, tax ID (EU regulations)
- [ ] Convex scheduled function runs every Friday at 9am UTC to process payouts
- [ ] Payout eligibility: minimum 20€ pending earnings + completed Stripe Connect onboarding
- [ ] Payout calculation: 50% of lead sale price (if Starter plan sold lead for 25€, scout receives 12.5€)
- [ ] Stripe Transfer API creates payout to connected account
- [ ] Payout status tracking: pending → processing → completed → failed
- [ ] Email notification sent via Resend when payout initiated
- [ ] Dashboard shows: pending earnings, total lifetime earnings, payout history with dates/amounts
- [ ] Failed payout retry logic with admin notification

**Technical Requirements**:
- Frontend: React Native Stripe SDK for Connect onboarding
- Backend: Convex scheduled function `processWeeklyPayouts` using Stripe Transfer API
- Database:
  - `scouts` table with fields: stripeConnectAccountId, onboardingComplete, pendingEarnings, totalEarnings
  - `payouts` table with fields: scoutId, amount, status, stripeTransferId, processedAt
- Stripe Objects: Connected Accounts (Express), Transfers, Payouts
- Environment Variables:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_CONNECT_CLIENT_ID`
  - `PAYOUT_MINIMUM_THRESHOLD` (default: 20)
  - `PAYOUT_COMMISSION_RATE` (default: 0.5 for 50%)

**Success Metrics**:
- 90%+ scouts complete Connect onboarding within first payout cycle
- <2% payout failure rate
- Average payout processing time: <48 hours

---

#### Feature 5: Lead Quality Scoring System
**Description**: Automated and manual quality assessment system that scores leads based on completeness, accuracy, and conversion performance.

**User Stories**:
- As a company, I want to see lead quality scores so that I can prioritize high-value opportunities
- As a scout, I want to improve my quality score so that my leads sell faster
- As an admin, I want to moderate leads so that marketplace maintains high quality
- As a platform, I want to track conversion rates so that I can identify top scouts

**Acceptance Criteria**:
- [ ] Initial quality score (0-10) calculated on submission based on: description length (20%), contact info completeness (20%), budget estimation accuracy (20%), photo attachments (10%), scout historical performance (30%)
- [ ] Admin moderation queue displays pending leads sorted by submission time
- [ ] Admin can approve (publish lead), request changes (send back to scout with notes), or reject (with reason)
- [ ] Approved leads get final quality score adjustment from admin (manual override)
- [ ] Conversion tracking: When lead is purchased, status updates to "sold"
- [ ] Scout quality score (0-10) calculated as: (total leads sold / total leads submitted) * 5 + (average lead quality score) * 0.5
- [ ] Badge system: Bronze (<20 sold), Silver (20-49 sold), Gold (50-99 sold), Platinum (100+ sold)
- [ ] Leaderboard in scout app showing top 10 scouts by quality score
- [ ] Companies see scout quality score and badge in lead preview

**Technical Requirements**:
- Frontend: Admin dashboard (Next.js) with moderation queue, scout app with quality dashboard
- Backend: Convex functions for quality calculation, moderation mutations
- Database:
  - `leads` table with fields: qualityScore (0-10), moderationStatus, moderationNotes, conversionTracking
  - `scouts` table with fields: qualityScore, badge, totalLeadsSubmitted, totalLeadsSold
- Quality Algorithm: Weighted scoring based on multiple factors
- Environment Variables:
  - `QUALITY_MIN_DESCRIPTION_LENGTH` (default: 100)
  - `QUALITY_BADGE_THRESHOLDS` (JSON: {"bronze":0,"silver":20,"gold":50,"platinum":100})

**Success Metrics**:
- Average lead quality score: 7.5/10
- 90%+ leads approved within 24h
- 60%+ conversion rate (approved leads → sold)

---

#### Feature 6: Real-Time Notifications System
**Description**: Push notifications and in-app alerts for critical events across both mobile and web platforms.

**User Stories**:
- As a scout, I want push notifications when my lead is sold so that I celebrate the earning
- As a company, I want real-time alerts when new leads match my preferences so that I can act fast
- As a user, I want to control notification preferences so that I'm not overwhelmed
- As a platform, I want to send transactional emails for key events so that users stay informed

**Acceptance Criteria**:
- [ ] Scout mobile push notifications for: lead approved, lead sold, payout processed, quality milestone reached
- [ ] Company web notifications (toast) for: new matching lead available, subscription renewal upcoming, credits running low (<5 remaining)
- [ ] Email notifications via Resend for: welcome (signup), subscription confirmed, lead purchased, weekly payout summary
- [ ] Notification preferences page: toggle push/email for each event type
- [ ] Notification history page showing last 30 days of alerts
- [ ] Badge count on mobile app icon showing unread notifications
- [ ] Web notification permission request on first login
- [ ] Convex triggers fire notifications on database events (lead status change, purchase created)

**Technical Requirements**:
- Frontend:
  - React Native: Expo push notifications with token registration
  - Next.js: Browser Notification API + toast component (Shadcn/UI)
- Backend: Convex triggers on table changes calling notification functions
- Email: Resend API with templated emails (React Email for templates)
- Database: `notifications` table with fields: userId, type, message, read, createdAt
- Environment Variables:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `EXPO_PUSH_TOKEN_SECRET`

**Success Metrics**:
- 85%+ notification delivery rate
- 40%+ notification open rate (push)
- <5s notification latency from trigger event

---

#### Feature 7: Scout Earnings Dashboard
**Description**: Comprehensive mobile dashboard showing real-time earnings, payout history, and performance analytics.

**User Stories**:
- As a scout, I want to see my pending earnings so that I know my upcoming payout amount
- As a scout, I want to track which leads sold so that I understand what types perform best
- As a scout, I want to see my all-time earnings so that I can measure my success
- As a scout, I want payout history with dates so that I can reconcile with bank deposits

**Acceptance Criteria**:
- [ ] Dashboard header displays: pending earnings (current week), total lifetime earnings, next payout date
- [ ] Lead performance section shows: total submitted, total sold, conversion rate %, average quality score
- [ ] Recent activity feed: latest 5 lead status changes with timestamps
- [ ] Payout history table: date, amount, status (pending/completed/failed), Stripe transfer ID
- [ ] Earnings breakdown by category (pie chart): which industries generate most income
- [ ] Top performing leads list: highest earning leads with amounts
- [ ] Weekly earnings trend (line chart): last 12 weeks
- [ ] Pull-to-refresh updates all data in real-time
- [ ] Tap lead to view full details and purchase information

**Technical Requirements**:
- Frontend: React Native with charts library (Victory Native)
- Backend: Convex queries for aggregated earnings data
- Database: Derived data from `leads`, `purchases`, `payouts` tables
- Real-time: Convex reactive queries update dashboard live
- Environment Variables: None (uses existing Convex connection)

**Success Metrics**:
- Dashboard viewed by 80%+ scouts weekly
- Average session duration: 3+ minutes
- Earnings visibility drives 25%+ increase in submissions

---

#### Feature 8: Company Credits Management
**Description**: Real-time credit balance tracking, usage history, and top-up purchase system.

**User Stories**:
- As a company, I want to see my credit balance so that I know how many leads I can purchase
- As a company, I want to buy additional credits so that I don't have to upgrade my plan
- As a company, I want usage history so that I can track spending
- As a company, I want low-credit alerts so that I don't run out unexpectedly

**Acceptance Criteria**:
- [ ] Credits dashboard displays: current balance, monthly allocation, credits used this cycle, renewal date
- [ ] Credit purchase modal: select quantity (10, 25, 50 credits) with pricing (5€ per credit)
- [ ] Stripe Checkout for credit top-ups (one-time payment)
- [ ] Credit usage history table: date, lead purchased, credits spent, remaining balance
- [ ] Low-credit notification when balance <5 credits
- [ ] Credit expiration policy: unused credits roll over for 3 months (configurable)
- [ ] Monthly credit refresh on subscription renewal date
- [ ] Upgrade plan CTA when frequently buying top-ups

**Technical Requirements**:
- Frontend: Next.js dashboard with Shadcn/UI components
- Backend: Convex mutations for credit transactions, Stripe Checkout for purchases
- Database:
  - `companies` table with fields: creditsRemaining, creditsAllocated, nextRenewalDate
  - `creditTransactions` table with fields: companyId, type (allocation/purchase/usage), amount, balance, timestamp
- Stripe: One-time payment sessions for credit purchases
- Environment Variables:
  - `STRIPE_CREDIT_PRICE_ID`
  - `CREDIT_TOP_UP_PRICE` (default: 5)
  - `CREDIT_EXPIRATION_MONTHS` (default: 3)

**Success Metrics**:
- 30%+ companies purchase credit top-ups
- Average top-up amount: 25 credits
- <1% credit expiration waste

---

#### Feature 9: Authentication & User Management
**Description**: Secure authentication system with role-based access control for scouts, companies, and admins.

**User Stories**:
- As a user, I want to sign up with email or Google so that I can access the platform quickly
- As a scout, I want my profile to show my expertise so that companies trust my leads
- As a company, I want team member access so that multiple people can purchase leads
- As an admin, I want to manage user roles so that I can moderate the platform

**Acceptance Criteria**:
- [ ] Clerk authentication integrated with Convex for both web and mobile
- [ ] Sign up flow captures role selection: Scout or Company
- [ ] Scout profile includes: name, industry expertise (tags), LinkedIn URL, bio (optional)
- [ ] Company profile includes: company name, industry, team size, website URL
- [ ] Role-based access control: scouts access mobile app, companies access web app, admins access admin panel
- [ ] Team management (Growth/Scale plans): invite team members via email, assign view-only or purchase permissions
- [ ] Profile editing with photo upload
- [ ] Account deletion with data export (GDPR compliance)
- [ ] Two-factor authentication option (Clerk built-in)

**Technical Requirements**:
- Authentication: Clerk with Next.js and React Native SDKs
- Backend: Convex auth integration with Clerk JWT validation
- Database:
  - `users` table with fields: clerkId, role (scout/company/admin), profile (JSON), createdAt
  - `teamMembers` table with fields: companyId, userId, permissions (array)
- Authorization: Convex function middleware checking user roles
- Environment Variables:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SECRET`

**Success Metrics**:
- <2 minutes average signup time
- 90%+ signup completion rate
- <5% authentication error rate

---

#### Feature 10: Admin Moderation Dashboard
**Description**: Web-based admin panel for lead moderation, user management, and platform analytics.

**User Stories**:
- As an admin, I want to review pending leads so that only quality leads reach companies
- As an admin, I want to ban bad actors so that I protect marketplace integrity
- As an admin, I want to see platform metrics so that I can optimize operations
- As an admin, I want to communicate with users so that I can provide support

**Acceptance Criteria**:
- [ ] Moderation queue displays pending leads with filters: category, submission date, scout
- [ ] Lead detail view shows: full lead info, scout profile, quality score breakdown
- [ ] Moderation actions: Approve (publish immediately), Request Changes (return to scout), Reject (with reason template)
- [ ] User management table: view all scouts/companies, filter by status, ban/suspend accounts
- [ ] Platform analytics dashboard: total GMV, leads submitted/sold, active scouts/companies, revenue breakdown
- [ ] Communication tools: send in-app message to user, email templates for common scenarios
- [ ] Fraud detection alerts: duplicate leads, suspicious activity patterns
- [ ] Bulk actions: approve multiple leads, export data to CSV
- [ ] Activity log: audit trail of all admin actions

**Technical Requirements**:
- Frontend: Next.js admin panel (protected route requiring admin role)
- Backend: Convex queries/mutations with admin-only permissions
- Database:
  - `moderationActions` table with fields: adminId, leadId, action, reason, timestamp
  - `activityLog` table with fields: userId, action, metadata, timestamp
- Analytics: Aggregation queries on existing tables
- Environment Variables:
  - `ADMIN_EMAIL_WHITELIST` (comma-separated list of admin emails)

**Success Metrics**:
- 90%+ leads moderated within 24h
- <5% appeal rate on rejections
- 100% fraud cases identified within 48h

---

### 4.2 Should-Have Features (Post-MVP)

#### Feature 11: Advanced Analytics for Companies (Growth/Scale Plans)
**Description**: Comprehensive analytics dashboard with ROI tracking, lead performance insights, and conversion funnels.

**User Stories**:
- As a company, I want to see ROI per lead category so that I optimize my purchases
- As a company, I want conversion funnel analytics so that I understand where leads drop off
- As a company, I want to track lead-to-customer journey so that I measure platform value

**Acceptance Criteria**:
- [ ] ROI calculator: input customer lifetime value, view return per lead purchased
- [ ] Conversion funnel: purchased → contacted → meeting scheduled → proposal sent → closed won
- [ ] Performance by scout: which scouts provide highest converting leads
- [ ] Time-to-conversion metrics: average days from purchase to close
- [ ] Category benchmarking: compare performance against platform averages
- [ ] Custom date range filtering and report exports

**Technical Requirements**:
- Frontend: Next.js with recharts library for advanced visualizations
- Backend: Convex queries with aggregation pipelines
- Database: `leadConversions` table tracking funnel stages
- Environment Variables: None

---

#### Feature 12: API Access for Companies (Scale Plan)
**Description**: RESTful API allowing companies to programmatically access leads and integrate with their CRM systems.

**User Stories**:
- As a Scale plan company, I want API access so that I can auto-import leads to Salesforce
- As a developer, I want clear API documentation so that I can integrate quickly

**Acceptance Criteria**:
- [ ] REST API endpoints: GET /api/leads (list), GET /api/leads/:id (details), POST /api/leads/:id/purchase
- [ ] API key authentication with rate limiting (100 requests/hour)
- [ ] Webhook support: notify external systems when new matching leads available
- [ ] OpenAPI documentation with Postman collection
- [ ] Usage dashboard showing API calls and rate limit status

**Technical Requirements**:
- Backend: Next.js API routes with Convex integration
- Authentication: API key stored in Convex, validated in middleware
- Environment Variables: `API_RATE_LIMIT_PER_HOUR`

---

#### Feature 13: Lead Matching Algorithm
**Description**: AI-powered recommendation system that matches leads to companies based on purchase history and preferences.

**User Stories**:
- As a company, I want personalized lead recommendations so that I don't miss relevant opportunities
- As a company, I want to save search preferences so that I get auto-matched leads

**Acceptance Criteria**:
- [ ] Company profile includes preference tags: industries, budget range, location
- [ ] Email/push notification when new matching lead arrives
- [ ] "Recommended for You" section in marketplace
- [ ] Machine learning model improves matching based on purchase patterns

**Technical Requirements**:
- Backend: Convex actions calling OpenRouter API for ML recommendations
- Algorithm: Collaborative filtering based on purchase history
- Environment Variables: `OPENROUTER_API_KEY`

---

#### Feature 14: Scout Referral Program
**Description**: Referral system where scouts earn bonuses for inviting other scouts who submit quality leads.

**User Stories**:
- As a scout, I want to refer other scouts so that I earn referral bonuses
- As a new scout, I want to use a referral code so that I support my referrer

**Acceptance Criteria**:
- [ ] Unique referral code for each scout
- [ ] Referral bonus: 10€ when referred scout sells first 5 leads
- [ ] Referral dashboard showing invites sent and bonuses earned
- [ ] Social sharing: WhatsApp, LinkedIn, Email templates

**Technical Requirements**:
- Database: `referrals` table linking referrer to referee
- Bonus calculation in weekly payout function
- Environment Variables: `REFERRAL_BONUS_AMOUNT`

---

### 4.3 Could-Have Features (Future)

#### Feature 15: Lead Negotiation System
- Scouts can set custom pricing for premium leads
- Companies can counter-offer on lead prices
- Platform adjusts commission based on negotiated price

#### Feature 16: Lead Verification Service
- Third-party data enrichment (Apollo, ZoomInfo integration)
- Automatic company validation and contact verification
- Reduce bad lead rate to <2%

#### Feature 17: Scout Training Academy
- Video tutorials on lead qualification
- Certification program with exams
- Certified scouts get higher visibility in marketplace

#### Feature 18: White-Label Solution
- Enterprise companies deploy branded version of LeadScout
- Custom commission structures
- Dedicated scout networks per company

## 5. Technical Specifications

### 5.1 Technology Stack
- **Frontend Web**: Next.js 14+ (App Router), React 18, TypeScript
- **Frontend Mobile**: React Native (Expo SDK 50+), TypeScript
- **UI Components**: Shadcn/UI (Web), React Native Paper (Mobile)
- **Styling**: Tailwind CSS (Web), StyleSheet (Mobile)
- **Backend**: Convex (database, serverless functions, real-time subscriptions, scheduled jobs)
- **Authentication**: Clerk (multi-platform: web + mobile)
- **Payments**: Stripe (Checkout for subscriptions, Connect for payouts)
- **Email**: Resend (transactional emails with React Email templates)
- **File Storage**: Convex file storage (lead photos)
- **Hosting**: Digital Ocean App Platform (Next.js web app)
- **Mobile Distribution**: App Store (iOS), Google Play (Android)

### 5.2 Data Models

#### Model 1: Users
```typescript
{
  _id: Id<"users">,
  clerkId: string, // Clerk user ID
  role: "scout" | "company" | "admin",
  email: string,
  name: string,
  profile: {
    avatar?: string,
    bio?: string,
    linkedin?: string,
    // Scout-specific
    industryExpertise?: string[], // ["SaaS", "Fintech", "E-commerce"]
    // Company-specific
    companyName?: string,
    website?: string,
    industry?: string,
    teamSize?: string
  },
  createdAt: number,
  updatedAt: number
}
```

#### Model 2: Scouts
```typescript
{
  _id: Id<"scouts">,
  userId: Id<"users">,
  stripeConnectAccountId?: string,
  onboardingComplete: boolean,
  qualityScore: number, // 0-10
  badge: "bronze" | "silver" | "gold" | "platinum",
  totalLeadsSubmitted: number,
  totalLeadsSold: number,
  pendingEarnings: number, // in euros
  totalEarnings: number, // lifetime
  lastPayoutDate?: number,
  createdAt: number
}
```

#### Model 3: Companies
```typescript
{
  _id: Id<"companies">,
  userId: Id<"users">,
  stripeCustomerId: string,
  subscriptionId?: string,
  plan: "starter" | "growth" | "scale" | null,
  subscriptionStatus: "active" | "past_due" | "canceled" | "incomplete",
  creditsRemaining: number,
  creditsAllocated: number, // monthly allocation based on plan
  nextRenewalDate?: number,
  preferences: {
    categories: string[],
    budgetMin?: number,
    budgetMax?: number,
    notifications: {
      newLeads: boolean,
      lowCredits: boolean,
      renewalReminder: boolean
    }
  },
  createdAt: number,
  updatedAt: number
}
```

#### Model 4: Leads
```typescript
{
  _id: Id<"leads">,
  scoutId: Id<"scouts">,

  // Lead information
  title: string,
  description: string, // min 100 chars
  category: string, // "SaaS", "E-commerce", "Consulting", etc.

  // Company details (revealed after purchase)
  companyName: string,
  contactName: string,
  contactEmail: string,
  contactPhone: string,
  companyWebsite?: string,
  estimatedBudget: number, // in euros

  // Media
  photos: string[], // Convex storage URLs

  // Status & moderation
  status: "pending_review" | "approved" | "rejected" | "sold",
  moderationStatus: "pending" | "approved" | "changes_requested" | "rejected",
  moderationNotes?: string,
  moderatedBy?: Id<"users">,
  moderatedAt?: number,

  // Quality scoring
  qualityScore: number, // 0-10
  qualityFactors: {
    descriptionLength: number,
    contactCompleteness: number,
    budgetAccuracy: number,
    photoCount: number,
    scoutReputation: number
  },

  // Sales tracking
  purchasedBy?: Id<"companies">,
  purchasedAt?: number,
  salePrice: number, // actual price at time of sale

  createdAt: number,
  updatedAt: number
}
```

#### Model 5: Purchases
```typescript
{
  _id: Id<"purchases">,
  companyId: Id<"companies">,
  leadId: Id<"leads">,
  scoutId: Id<"scouts">,
  creditsUsed: number, // typically 1
  purchasePrice: number, // for accounting
  scoutEarning: number, // 50% of purchase price
  platformCommission: number, // 50% of purchase price
  status: "completed" | "refunded",
  refundReason?: string,
  createdAt: number
}
```

#### Model 6: Payouts
```typescript
{
  _id: Id<"payouts">,
  scoutId: Id<"scouts">,
  amount: number, // in euros
  status: "pending" | "processing" | "completed" | "failed",
  stripeTransferId?: string,
  stripePayoutId?: string,
  failureReason?: string,
  processedAt?: number,
  completedAt?: number,
  createdAt: number
}
```

#### Model 7: Notifications
```typescript
{
  _id: Id<"notifications">,
  userId: Id<"users">,
  type: "lead_approved" | "lead_sold" | "payout_processed" | "new_matching_lead" | "low_credits" | "subscription_renewed",
  title: string,
  message: string,
  metadata?: any, // additional context (leadId, amount, etc.)
  read: boolean,
  createdAt: number
}
```

#### Model 8: CreditTransactions
```typescript
{
  _id: Id<"creditTransactions">,
  companyId: Id<"companies">,
  type: "allocation" | "purchase" | "usage" | "refund",
  amount: number, // positive for add, negative for usage
  balanceAfter: number,
  relatedPurchaseId?: Id<"purchases">,
  stripePaymentId?: string,
  description: string,
  createdAt: number
}
```

### 5.3 API Endpoints

#### Public APIs (Next.js Routes)
- `POST /api/stripe/create-checkout` - Create Stripe subscription checkout session
- `POST /api/stripe/create-credit-checkout` - Create Stripe checkout for credit purchase
- `POST /api/stripe/webhooks` - Handle Stripe webhook events (signature verification)
- `GET /api/stripe/customer-portal` - Generate Stripe Customer Portal session
- `GET /api/health` - Health check endpoint

#### Protected APIs (Convex Functions)
**Queries (read operations):**
- `getAvailableLeads({ filters })` - Get marketplace leads with filtering
- `getMyLeads()` - Scout: get all submitted leads
- `getMyPurchases()` - Company: get all purchased leads
- `getMyEarnings()` - Scout: get earnings dashboard data
- `getMyCredits()` - Company: get credit balance and history
- `getNotifications({ limit, unreadOnly })` - Get user notifications
- `getScoutProfile({ scoutId })` - Get public scout profile
- `getPendingModerationLeads()` - Admin: get leads awaiting moderation

**Mutations (write operations):**
- `createLead({ leadData })` - Scout: submit new lead
- `purchaseLead({ leadId })` - Company: purchase lead with credits
- `markNotificationRead({ notificationId })` - Mark notification as read
- `updateScoutProfile({ profileData })` - Update scout profile
- `updateCompanyProfile({ profileData })` - Update company profile
- `moderateLead({ leadId, action, notes })` - Admin: approve/reject lead
- `updateCompanyPreferences({ preferences })` - Update lead matching preferences

**Actions (external API calls):**
- `initiateStripeConnectOnboarding()` - Create Stripe Connect account link
- `processWeeklyPayouts()` - Scheduled function: process scout payouts (runs Fridays 9am)
- `sendEmailNotification({ userId, type, data })` - Send email via Resend
- `calculateLeadQuality({ leadId })` - Compute quality score for lead

### 5.4 Third-Party Integrations

#### Stripe (Payment Processing & Payouts)
- **Purpose**: Subscription billing, credit purchases, scout payouts
- **Integration Points**:
  - Checkout Sessions for subscriptions and one-time purchases
  - Customer Portal for subscription management
  - Connect Express accounts for scout payouts
  - Webhooks for event handling (payment success, subscription updates)
  - Transfer API for weekly payouts
- **Required ENV**:
  - `STRIPE_SECRET_KEY` - Server-side API key
  - `STRIPE_PUBLISHABLE_KEY` - Client-side publishable key
  - `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
  - `STRIPE_CONNECT_CLIENT_ID` - Connect onboarding
  - `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID` - Starter plan price ID
  - `NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID` - Growth plan price ID
  - `NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID` - Scale plan price ID
  - `STRIPE_CREDIT_PRICE_ID` - Credit top-up price ID

#### Clerk (Authentication)
- **Purpose**: Multi-platform authentication (web + mobile)
- **Integration Points**:
  - Sign up/sign in flows
  - JWT token validation in Convex
  - User management and profile data
  - Webhooks for user lifecycle events
- **Required ENV**:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Frontend key (web + mobile)
  - `CLERK_SECRET_KEY` - Backend verification
  - `CLERK_WEBHOOK_SECRET` - Webhook signature verification

#### Convex (Backend Platform)
- **Purpose**: Database, serverless functions, real-time subscriptions, scheduled jobs
- **Integration Points**:
  - All data storage and retrieval
  - Real-time marketplace updates
  - Weekly payout scheduled function
  - File storage for lead photos
  - Authentication integration with Clerk
- **Required ENV**:
  - `CONVEX_DEPLOYMENT` - Deployment URL
  - `NEXT_PUBLIC_CONVEX_URL` - Client-side connection (web)
  - `EXPO_PUBLIC_CONVEX_URL` - Client-side connection (mobile)

#### Resend (Email Delivery)
- **Purpose**: Transactional emails (welcome, payout notifications, subscription updates)
- **Integration Points**:
  - Welcome emails on signup
  - Subscription confirmation and renewal reminders
  - Payout notifications
  - Lead status updates
  - React Email templates for consistent branding
- **Required ENV**:
  - `RESEND_API_KEY` - API authentication
  - `RESEND_FROM_EMAIL` - Verified sender email (e.g., noreply@leadscout.com)

#### Expo Push Notifications (Mobile Notifications)
- **Purpose**: Push notifications for scouts on mobile app
- **Integration Points**:
  - Lead approval/rejection notifications
  - Lead sold notifications
  - Payout processed notifications
  - Quality milestone achievements
- **Required ENV**:
  - `EXPO_PUSH_TOKEN_SECRET` - Server-side push token validation

### 5.5 Environment Variables

```bash
# ============================================
# APPLICATION CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_NAME=LeadScout
NEXT_PUBLIC_APP_URL=https://leadscout.com
NEXT_PUBLIC_WEB_URL=https://leadscout.com
NEXT_PUBLIC_MOBILE_SCHEME=leadscout://

# ============================================
# AUTHENTICATION (Clerk)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# ============================================
# DATABASE & BACKEND (Convex)
# ============================================
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
EXPO_PUBLIC_CONVEX_URL=

# ============================================
# PAYMENTS (Stripe)
# ============================================
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_CLIENT_ID=

# Subscription Plan Price IDs (from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=
STRIPE_CREDIT_PRICE_ID=

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@leadscout.com

# ============================================
# MOBILE NOTIFICATIONS (Expo)
# ============================================
EXPO_PUSH_TOKEN_SECRET=

# ============================================
# BUSINESS LOGIC CONFIGURATION
# ============================================
# Payout Settings
PAYOUT_MINIMUM_THRESHOLD=20
PAYOUT_COMMISSION_RATE=0.5
PAYOUT_SCHEDULE_DAY=5
PAYOUT_SCHEDULE_HOUR=9

# Credit Settings
CREDIT_TOP_UP_PRICE=5
CREDIT_EXPIRATION_MONTHS=3

# Quality Scoring
QUALITY_MIN_DESCRIPTION_LENGTH=100
QUALITY_BADGE_THRESHOLDS={"bronze":0,"silver":20,"gold":50,"platinum":100}

# Feature Flags
FEATURE_API_ACCESS_ENABLED=true
FEATURE_ANALYTICS_ENABLED=true
FEATURE_REFERRAL_PROGRAM_ENABLED=false

# ============================================
# ADMIN CONFIGURATION
# ============================================
ADMIN_EMAIL_WHITELIST=admin@leadscout.com,support@leadscout.com

# ============================================
# MONITORING & ANALYTICS (Future)
# ============================================
# SENTRY_DSN=
# GOOGLE_ANALYTICS_ID=
# MIXPANEL_TOKEN=

# ============================================
# DO NOT HARDCODE ANY VALUES!
# All configuration must use environment variables
# ============================================
```

## 6. User Interface Requirements

### 6.1 Page Structure

#### Web Application (Companies)
**Public Pages:**
- `/` - Landing page with value proposition, features, pricing preview, testimonials
- `/pricing` - Detailed pricing comparison (Starter/Growth/Scale)
- `/about` - Company story, mission, team
- `/how-it-works` - Explainer for companies (how marketplace works)
- `/login` - Clerk sign-in component
- `/signup` - Clerk sign-up with role selection

**Protected Pages (Companies):**
- `/dashboard` - Main marketplace view with lead grid and filters
- `/dashboard/my-leads` - Purchased leads with export options
- `/dashboard/credits` - Credit balance, usage history, top-up purchase
- `/dashboard/analytics` - ROI tracking, performance insights (Growth/Scale plans)
- `/dashboard/settings` - Account settings, notification preferences
- `/dashboard/billing` - Subscription management (Stripe Customer Portal link)

**Admin Pages:**
- `/admin/moderation` - Lead moderation queue
- `/admin/users` - User management (scouts/companies)
- `/admin/analytics` - Platform metrics dashboard
- `/admin/payouts` - Payout management and history

#### Mobile Application (Scouts)
**Screens:**
- **Onboarding Flow**: Welcome → Tutorial (3 screens) → Sign Up (Clerk) → Profile Setup
- **Main Tabs**:
  - **Home**: Dashboard with earnings summary, recent activity, quick submit button
  - **Submit Lead**: Multi-step form (company details → contact info → categorization → photos → review)
  - **My Leads**: List of submitted leads with status filters
  - **Earnings**: Detailed earnings dashboard with charts
  - **Profile**: Scout profile, settings, Stripe Connect onboarding, logout

### 6.2 UI/UX Principles

#### Design System Foundation
- **Mobile-First Responsive Design**: All web pages adapt from 320px to 1920px
- **Accessibility**: WCAG 2.1 AA compliance
  - Keyboard navigation support
  - ARIA labels on all interactive elements
  - High contrast mode support
  - Screen reader compatibility
  - Minimum touch target size: 44x44px
- **Performance Targets**:
  - First Contentful Paint (FCP): <1.8s
  - Largest Contentful Paint (LCP): <2.5s
  - Cumulative Layout Shift (CLS): <0.1
  - Time to Interactive (TTI): <3.8s
- **Dark Mode**: Auto-detect system preference with manual toggle (web + mobile)
- **Typography**: System fonts for performance (SF Pro on iOS, Roboto on Android, Inter on web)
- **Spacing**: 4px base grid system (4, 8, 16, 24, 32, 48, 64px)
- **Color Accessibility**: All text meets 4.5:1 contrast ratio minimum

#### Component Consistency
- **Web**: Shadcn/UI components with consistent styling
- **Mobile**: React Native Paper components matching brand colors
- **Form Validation**: Real-time validation with clear error messages
- **Loading States**: Skeleton screens for data fetching, spinners for actions
- **Empty States**: Helpful illustrations and CTAs when no data exists
- **Error Handling**: Friendly error messages with actionable next steps

## 7. Non-Functional Requirements

### 7.1 Performance

**Web Application:**
- Initial page load: <3s on 3G connection
- Marketplace page load: <2s
- Real-time update latency: <500ms (Convex subscriptions)
- API response time (p95): <200ms
- Image optimization: WebP format, lazy loading, responsive images

**Mobile Application:**
- App launch time: <2s on mid-range devices
- Lead submission: <30s end-to-end (including photo upload)
- Dashboard refresh: <1s
- Offline capability: Form data cached, synced when online
- Battery impact: <2% per hour of active use

**Database Performance:**
- Convex query execution: <100ms (p95)
- Real-time subscription updates: <500ms
- File upload: <5s for 5MB image
- Scheduled function execution: <30s for weekly payout processing

### 7.2 Security

**Authentication & Authorization:**
- Clerk JWT validation on all protected routes
- Role-based access control (RBAC) enforced in Convex functions
- Session timeout: 30 days with secure token refresh
- Multi-factor authentication (MFA) available via Clerk

**Data Protection:**
- All data in transit encrypted (HTTPS/TLS 1.3)
- All data at rest encrypted (Convex managed encryption)
- PCI DSS compliance via Stripe (no card data stored)
- GDPR compliance: data export, right to deletion, consent management

**API Security:**
- Rate limiting: 100 requests/minute per user (Convex built-in)
- Input validation: Zod schemas on all Convex mutations
- SQL injection prevention: Convex's type-safe queries
- XSS prevention: React's built-in escaping, CSP headers
- CSRF protection: SameSite cookies, CSRF tokens on forms

**Payment Security:**
- Stripe Connect Express accounts (identity verification)
- Webhook signature verification (Stripe + Clerk)
- Payout fraud detection: minimum threshold, velocity checks
- Refund policy: 7-day money-back guarantee on subscriptions

**File Upload Security:**
- File type validation: JPEG, PNG only
- File size limit: 5MB per image
- Malware scanning: Convex file storage security
- User-generated content moderation: admin review before publishing

### 7.3 Scalability

**User Capacity:**
- Support 500 active scouts (Year 1 target)
- Support 100 active companies (Year 1 target)
- Support 10,000 concurrent connections (Convex auto-scales)

**Data Growth:**
- 2,000 leads submitted per month
- 1,200 leads sold per month (60% conversion)
- 200 payouts processed per week
- Database designed for 1M+ records

**Infrastructure:**
- Auto-scaling on Digital Ocean App Platform (CPU/memory)
- CDN for static assets (images, CSS, JS)
- Convex serverless functions auto-scale
- Database indexes on frequently queried fields (category, status, createdAt)

### 7.4 Reliability

**Uptime & Availability:**
- Target: 99.9% uptime (43 minutes downtime/month)
- Health checks: `/api/health` endpoint monitored every 60s
- Automated failover: Digital Ocean load balancing

**Error Handling:**
- Graceful degradation: App functions with limited connectivity
- Retry logic: Exponential backoff on API failures
- Error logging: Sentry integration (future)
- User-friendly error messages: No stack traces shown to users

**Data Integrity:**
- Transactional operations: Convex ensures ACID properties
- Credit deduction atomic with lead purchase
- Payout processing idempotent (prevent double payouts)
- Backup strategy: Convex automatic backups (point-in-time recovery)

### 7.5 Accessibility

**WCAG 2.1 AA Compliance:**
- Keyboard navigation: All actions accessible via keyboard
- Screen reader support: Semantic HTML, ARIA labels
- Color contrast: Minimum 4.5:1 for text, 3:1 for UI components
- Focus indicators: Visible focus states on all interactive elements
- Alternative text: All images have descriptive alt text
- Form labels: Explicit labels for all input fields
- Error identification: Clear, descriptive error messages

**Mobile Accessibility:**
- VoiceOver (iOS) and TalkBack (Android) support
- Dynamic text sizing: Respect system font size preferences
- Reduced motion: Disable animations when system preference set

## 8. Release Planning

### Phase 1: MVP (Weeks 1-6) - Core Marketplace
**Goal**: Launch minimal viable marketplace with essential features for both scouts and companies.

**Week 1-2: Foundation**
- [ ] Project setup: Next.js web app, React Native mobile app, Convex backend
- [ ] Clerk authentication integration (web + mobile)
- [ ] Database schema implementation (all core tables)
- [ ] Design system setup: Shadcn/UI (web), React Native Paper (mobile)

**Week 3-4: Core Features**
- [ ] Scout mobile app: Lead submission form with photo upload
- [ ] Company web app: Lead marketplace with filters and search
- [ ] Stripe subscriptions: Checkout integration, webhook handling, credit allocation
- [ ] Admin dashboard: Lead moderation queue with approve/reject

**Week 5-6: Payment & Launch Prep**
- [ ] Stripe Connect: Scout onboarding flow, payout infrastructure
- [ ] Weekly payout scheduled function (Convex)
- [ ] Email notifications: Welcome, subscription confirmed, lead purchased (Resend)
- [ ] Basic analytics dashboards (scout earnings, company credits)
- [ ] Testing: Manual QA, payment flow verification
- [ ] Deploy to Digital Ocean staging environment

**MVP Launch Criteria:**
- ✅ Scouts can submit leads via mobile app
- ✅ Companies can subscribe and purchase leads via web
- ✅ Admins can moderate leads before publishing
- ✅ Weekly payouts process automatically
- ✅ All payments handled securely via Stripe

---

### Phase 2: Enhancement (Weeks 7-10) - Quality & Engagement
**Goal**: Improve user experience with quality scoring, notifications, and gamification.

**Week 7-8: Quality System**
- [ ] Lead quality scoring algorithm implementation
- [ ] Scout quality score and badge system (Bronze/Silver/Gold/Platinum)
- [ ] Leaderboard in scout app
- [ ] Quality-based filtering in company marketplace
- [ ] Automated quality checks (description length, contact validation)

**Week 9-10: Notifications & Engagement**
- [ ] Push notifications: Lead sold, payout processed, quality milestones (Expo)
- [ ] Web notifications: New matching leads, low credits (toast)
- [ ] Email digests: Weekly summary for scouts, monthly insights for companies
- [ ] In-app notification center with history
- [ ] Notification preferences management

**Phase 2 Success Metrics:**
- 70%+ scouts submit first lead within 7 days
- Average lead quality score: 7.5/10
- 40%+ notification engagement rate

---

### Phase 3: Scale (Weeks 11-14) - Analytics & Optimization
**Goal**: Add advanced features for Growth/Scale plan companies and optimize platform performance.

**Week 11-12: Advanced Analytics**
- [ ] Company analytics dashboard: ROI tracking, conversion funnels, category performance
- [ ] Scout performance insights: Earnings by category, conversion rates
- [ ] Platform admin analytics: GMV trends, user cohorts, revenue breakdown
- [ ] Export capabilities: CSV/PDF reports
- [ ] API access for Scale plan (REST endpoints, documentation)

**Week 13-14: Optimization & Polish**
- [ ] Performance optimization: Image compression, query optimization, caching
- [ ] Mobile app polish: Animations, micro-interactions, offline mode
- [ ] Lead matching algorithm (personalized recommendations)
- [ ] Credit top-up purchase flow
- [ ] Comprehensive testing: E2E tests, load testing, security audit

**Phase 3 Success Metrics:**
- 60%+ leads sold within 30 days
- 80%+ subscription retention rate
- 15,000€ monthly GMV
- <2s marketplace load time

---

### Phase 4: Growth (Weeks 15+) - Future Roadmap
**Features:**
- Scout referral program (10€ bonus per referred scout)
- Lead negotiation system (custom pricing)
- Lead verification service (third-party data enrichment)
- Scout training academy (certification program)
- White-label solution for enterprise

## 9. Dependencies & Risks

### Dependencies

**External Services:**
- **Stripe Account**: Production account with Connect enabled (requires business verification)
  - Timeline: 2-5 business days for approval
  - Owner: Finance team
- **Digital Ocean Account**: App Platform access with billing configured
  - Timeline: 1 day setup
  - Owner: DevOps team
- **Clerk Account**: Production tier for authentication
  - Timeline: Immediate (free tier available)
  - Owner: Dev team
- **Convex Account**: Production deployment
  - Timeline: Immediate
  - Owner: Dev team
- **Resend Account**: Email sending (verified domain required)
  - Timeline: 2-3 days for domain verification
  - Owner: Marketing team
- **Domain Registration**: leadscout.com (or equivalent)
  - Timeline: 1 day
  - Owner: Marketing team
- **SSL Certificates**: Auto-provisioned by Digital Ocean
  - Timeline: Automatic
  - Owner: Digital Ocean

**App Store Distribution:**
- **Apple Developer Account**: $99/year, 2-3 days approval
- **Google Play Developer Account**: $25 one-time, 1-2 days approval
- **App Review Timeline**: 2-7 days per platform

**Legal & Compliance:**
- **Terms of Service**: Legal review required
- **Privacy Policy**: GDPR compliance review
- **Payment Terms**: Payout policy, refund policy
- **Content Moderation Policy**: Lead quality standards

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Stripe Connect delays** (verification issues for scouts) | High - Blocks payouts | Medium | Provide clear onboarding documentation, support chat for Connect issues, manual verification fallback |
| **Low lead quality** (spam submissions) | High - Companies lose trust | High | Mandatory admin moderation pre-launch, quality scoring, ban repeat offenders, money-back guarantee |
| **Low conversion rate** (leads don't sell) | High - Scouts lose motivation | Medium | Personalized matching algorithm, email notifications to companies, category diversification |
| **Payment fraud** (fake companies or scouts) | Medium - Financial loss | Low | Stripe fraud detection, identity verification via Clerk, manual review for high-value accounts |
| **Scalability issues** (Convex limits) | Medium - Performance degradation | Low | Convex auto-scales, database indexing, monitor query performance, CDN for static assets |
| **App Store rejection** (policy violations) | Medium - Launch delays | Medium | Follow App Store guidelines strictly, prepare for review with screenshots/video, have web fallback |
| **GDPR compliance gaps** | High - Legal liability | Low | Privacy policy review by legal, data export/deletion features, consent management, EU hosting if needed |
| **Poor mobile UX** (complex submission flow) | Medium - Low scout activation | Medium | User testing with real scouts, iterate on form design, tutorial videos, progressive disclosure |
| **Subscription churn** (companies cancel) | High - Revenue loss | Medium | Onboarding emails, success metrics dashboard, proactive support, upgrade incentives |
| **Payout timing issues** (delayed payments) | Medium - Scout dissatisfaction | Low | Transparent payout schedule, email notifications, Stripe monitoring, manual override for urgent cases |

## 10. Open Questions

### Business Model
- [ ] **Refund Policy**: Should companies get credits refunded if lead is duplicate/invalid? (Recommendation: Yes, within 7 days with proof)
- [ ] **Lead Exclusivity**: Should leads be exclusive (1 company) or non-exclusive (multiple buyers)? (Recommendation: Exclusive for MVP, test non-exclusive in Phase 2)
- [ ] **Scout Commission Split**: Is 50/50 optimal or should it adjust based on quality score? (Recommendation: Start 50/50, introduce quality bonuses in Phase 2)
- [ ] **Credit Expiration**: 3-month expiration too restrictive? (Recommendation: Test with user feedback, consider 6-month or no expiration)

### Technical Implementation
- [ ] **Mobile App Priority**: iOS-first launch or simultaneous iOS + Android? (Recommendation: Simultaneous using Expo for faster time-to-market)
- [ ] **Lead Approval**: Fully manual moderation or semi-automated with admin override? (Recommendation: Manual for MVP, introduce AI pre-screening in Phase 3)
- [ ] **API Rate Limits**: 100 req/hour sufficient for Scale plan companies? (Recommendation: Yes for MVP, adjust based on usage patterns)

### User Experience
- [ ] **Scout Onboarding**: Require Stripe Connect before first submission or after first lead sold? (Recommendation: After first lead sold to reduce friction)
- [ ] **Company Trial Period**: Offer 7-day free trial or first 5 leads free? (Recommendation: 5 bonus credits on first subscription, no free tier to avoid abuse)
- [ ] **Lead Preview**: How much information to show before purchase? (Recommendation: Industry, budget range, location, quality score - no contact details)

### Compliance & Legal
- [ ] **Tax Handling**: Does platform handle VAT/taxes for EU scouts? (Recommendation: Scouts responsible for own taxes, platform provides earnings reports)
- [ ] **Data Retention**: How long to store purchased lead data? (Recommendation: Indefinite for companies, 90 days for marketplace visibility)

## 11. Appendix

### A. Research References

**Marketplace Best Practices:**
- Airbnb's two-sided marketplace trust mechanisms
- Upwork's quality scoring and freelancer ratings
- Fiverr's gamification and badge system
- TaskRabbit's lead matching algorithms

**B2B Lead Generation:**
- Average B2B lead cost: 50-100€ (LeadScout undercuts at 25-50€)
- Lead conversion benchmarks: 40-60% in qualified B2B markets
- Subscription pricing psychology: tiered pricing drives 30% higher revenue than flat pricing

**Payment Integration:**
- Stripe Connect best practices for marketplace payouts
- PCI compliance requirements (handled by Stripe)
- Subscription dunning strategies (reduce involuntary churn)

### B. Competitive Analysis

| Competitor | Model | Pricing | Weakness | LeadScout Advantage |
|------------|-------|---------|----------|---------------------|
| **Lead Agencies** | Service | 1,000€+ setup | Expensive, slow | Self-service, instant access |
| **Upwork** | Freelancer marketplace | Commission-based | Not lead-focused | Specialized for leads, higher quality |
| **LinkedIn Sales Navigator** | SaaS tool | 80€/month | Requires manual prospecting | Pre-qualified warm leads |
| **ZoomInfo** | Data provider | 15,000€+/year | Enterprise pricing | SMB-friendly pricing |

### C. User Persona Deep Dives

**Scout Persona - "Marie, the Networker"**
- 32-year-old account manager at SaaS company
- Attends 3-4 industry events per month, hears about opportunities
- Currently makes 4,000€/month salary, wants 500€ side income
- Frustrated that interesting leads outside her territory go nowhere
- Mobile-first (submits leads from events via phone)
- Motivated by leaderboard competition and badges

**Company Persona - "Thomas, the Sales Director"**
- 45-year-old Sales Director at 50-person consulting firm
- Tired of cold outreach (2% response rate)
- Tried lead agencies but found them too expensive and slow
- Budget: 250€/month for lead generation
- Needs 10-15 qualified leads per month to hit quota
- Wants data/analytics to justify spend to CEO

### D. Success Metric Definitions

**Scout Activation Rate**:
- Formula: (Scouts who submit ≥1 lead within 7 days) / (Total scouts signed up)
- Target: 70%
- Measurement: Convex query on `leads` table joined with `scouts` table

**Company Retention Rate**:
- Formula: (Companies with active subscription at end of month) / (Companies with active subscription at start of month)
- Target: 80%
- Measurement: Stripe subscription status tracking

**Lead Conversion Rate**:
- Formula: (Leads with status="sold") / (Leads with status="approved" and created >30 days ago)
- Target: 60%
- Measurement: Convex query on `leads` table

**Platform GMV**:
- Formula: SUM(purchase_price) for all purchases in period
- Target: 15,000€/month by month 6
- Measurement: Convex query on `purchases` table

### E. Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-15 | Initial PRD creation with comprehensive feature specifications | AI PM Agent |

---

## Next Steps

This PRD is now ready for review by:
1. **Marketing Team**: Review user personas, value propositions, and go-to-market fit
2. **UX Designer**: Create style guide, component library, and high-fidelity mockups
3. **Software Architect**: Design technical implementation plan and create Linear tickets
4. **Legal Team**: Review terms of service, privacy policy, and payment terms
5. **Finance Team**: Set up Stripe account and verify pricing model

**Approval Required Before Proceeding to Design Phase.**

---

**Document Status**: Draft for Review
**Next Review Date**: TBD
**Questions/Feedback**: Contact AI PM Agent

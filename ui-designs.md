# LeadScout UI/UX Design Specifications

Complete page-by-page design specifications for both Web (Companies) and Mobile (Scouts) platforms.

---

## Table of Contents

1. [Web App - Public Pages](#web-public)
2. [Web App - Company Dashboard](#web-dashboard)
3. [Mobile App - Scout Screens](#mobile-scout)
4. [Admin Dashboard](#admin)
5. [Design Patterns & Flows](#patterns)

---

<a name="web-public"></a>
## 1. Web App - Public Pages (Marketing Site)

### 1.1 Homepage

**Layout Structure:**
```
┌─────────────────────────────────────────────────────┐
│ [Logo: LeadScout]    [How It Works] [Pricing] [FAQ] │
│                                     [Sign In] [Get Started] │
├─────────────────────────────────────────────────────┤
│                                                       │
│              HERO SECTION (Split Design)              │
│                                                       │
│ ┌────────────────────┬────────────────────────────┐ │
│ │  FOR SCOUTS        │  FOR COMPANIES              │ │
│ │                    │                              │ │
│ │  Your Network,     │  Human-Verified Leads       │ │
│ │  Your Revenue      │  at Scale                   │ │
│ │                    │                              │ │
│ │  Turn LinkedIn     │  Stop wasting budget on     │ │
│ │  connections into  │  unqualified leads          │ │
│ │  500-2000€/month   │                              │ │
│ │                    │                              │ │
│ │  [Download App]    │  [Start Free Trial]         │ │
│ │  iOS | Android     │  99€/month, 20 leads        │ │
│ └────────────────────┴────────────────────────────┘ │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│              HOW IT WORKS (3 Steps Each Side)         │
│                                                       │
│  SCOUTS:                  COMPANIES:                  │
│  1. Submit Lead           1. Subscribe to Plan        │
│  2. We Verify             2. Browse Leads             │
│  3. Get Paid Weekly       3. Purchase with Credits    │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│              SOCIAL PROOF                             │
│                                                       │
│  "Generated 1,200€ in first month" - Marc, Scout     │
│  "80% cheaper than our old lead gen" - Sophie, CEO   │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│              KEY FEATURES (3 Columns)                 │
│                                                       │
│  [Quality Verified]  [Weekly Payouts]  [Fair Pricing]│
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│              FINAL CTA                                │
│                                                       │
│  Ready to Start?                                      │
│  [Scouts: Download App] [Companies: Start Trial]     │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components Used:**
- Navigation: `<nav>` with Logo, Links, Button components
- Hero: Custom split layout with Heading (H1), Body text, Button (primary-lg)
- How It Works: Card components (3 per side) with icons, headings, descriptions
- Social Proof: Testimonial cards with avatar, quote, author details
- Features: Feature card grid (icon, title, description)
- Footer: Standard footer with links, social icons

**Color Usage:**
- Scout side background: `bg-gradient-to-br from-teal-50 to-blue-50`
- Company side background: `bg-gradient-to-br from-blue-50 to-indigo-50`
- CTAs: Scout = `bg-teal-600`, Company = `bg-blue-600`

**Responsive Behavior:**
- Desktop (1024px+): Split hero side-by-side
- Tablet (768-1023px): Split hero stacked vertically
- Mobile (<768px): Single column, Scout-first messaging with toggle to Company view

**Interactions:**
- Hero CTAs: Hover elevates (`hover:shadow-lg transform hover:-translate-y-1`)
- Feature cards: Subtle hover animation
- Sticky navigation on scroll

---

### 1.2 Pricing Page

**Layout Structure:**
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│              HEADING & TOGGLE                         │
│                                                       │
│  Choose Your Plan                                     │
│  [Monthly] / [Annual] (Save 20%)                      │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│        PRICING TIERS (3 Cards Side-by-Side)          │
│                                                       │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│ │  STARTER  │  │  GROWTH   │  │   SCALE   │        │
│ │           │  │ [Popular] │  │           │        │
│ │   99€     │  │   249€    │  │   499€    │        │
│ │  /month   │  │  /month   │  │  /month   │        │
│ │           │  │           │  │           │        │
│ │ 20 credits│  │ 60 credits│  │150 credits│        │
│ │ 20 leads  │  │ 60 leads  │  │150 leads  │        │
│ │           │  │           │  │           │        │
│ │ • Basic   │  │ • All     │  │ • All     │        │
│ │   support │  │   Starter │  │   Growth  │        │
│ │ • Email   │  │ • Priority│  │ • API     │        │
│ │   alerts  │  │   support │  │   access  │        │
│ │           │  │ • Advanced│  │ • Custom  │        │
│ │           │  │   analytics│ │   terms   │        │
│ │           │  │           │  │ • Dedicated│       │
│ │           │  │           │  │   account │        │
│ │           │  │           │  │   manager │        │
│ │           │  │           │  │           │        │
│ │ [Start]   │  │ [Start]   │  │ [Contact] │        │
│ └───────────┘  └───────────┘  └───────────┘        │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│              FAQ SECTION                              │
│                                                       │
│  Common Questions:                                    │
│  • What happens if I don't use all credits?          │
│  • Can I upgrade/downgrade anytime?                  │
│  • How are leads verified?                           │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components Used:**
- Toggle switch: Custom switch component (Monthly/Annual)
- Pricing cards: Card component with:
  - Badge (if "Popular")
  - Price display (large number + currency)
  - Feature list (checkmarks)
  - CTA button (variant depends on tier)
- FAQ: Accordion component

**Color/Style Highlights:**
- Growth tier: Border `border-blue-600 border-2` with "Popular" badge
- Hover state: All cards elevate slightly
- Annual toggle: Show savings badge "+20% savings" in green

**Interactions:**
- Monthly/Annual toggle: Smooth price animation
- Card hover: Slight elevation and border color change
- CTA buttons: "Start Trial" (Starter/Growth) vs "Contact Sales" (Scale)

---

### 1.3 How It Works Page

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│              TABS: [For Scouts] [For Companies]       │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│              SCOUT FLOW (Tab 1)                       │
│                                                       │
│  Step 1: Download Mobile App                         │
│  ┌────────────────────────────────┐                  │
│  │ [Screenshot: App Store listing] │                  │
│  │ iOS & Android available         │                  │
│  └────────────────────────────────┘                  │
│                                                       │
│  Step 2: Submit Your First Lead                      │
│  ┌────────────────────────────────┐                  │
│  │ [Screenshot: Lead form]         │                  │
│  │ Takes <2 minutes                │                  │
│  └────────────────────────────────┘                  │
│                                                       │
│  Step 3: Get Verified & Paid                         │
│  ┌────────────────────────────────┐                  │
│  │ [Screenshot: Earnings screen]   │                  │
│  │ Weekly payouts via Stripe       │                  │
│  └────────────────────────────────┘                  │
│                                                       │
│  [Download App Now]                                   │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│              COMPANY FLOW (Tab 2)                     │
│                                                       │
│  Step 1: Choose Your Plan                            │
│  Step 2: Browse Verified Leads                       │
│  Step 3: Purchase with Credits                       │
│  Step 4: Contact Prospects                           │
│                                                       │
│  [Start Free Trial]                                   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- Tab navigation: Tabs component with active state indicator
- Step cards: Numbered cards with screenshot placeholder, heading, description
- CTA: Primary button at bottom of each tab

---

<a name="web-dashboard"></a>
## 2. Web App - Company Dashboard

### 2.1 Dashboard Layout (Shell)

**Structure:**
```
┌─────────────────────────────────────────────────────┐
│ [LeadScout Logo]        [Search]      [Avatar ▼]    │ ← Header (sticky)
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│ Sidebar  │         Main Content Area                 │
│          │                                           │
│ • Dashboard                                          │
│ • Marketplace                                        │
│ • My Purchases                                       │
│ • Analytics                                          │
│ • Subscription                                       │
│ • Settings                                           │
│          │                                           │
│          │                                           │
│          │                                           │
│ [Credits]│                                           │
│  12/20   │                                           │
│ [Upgrade]│                                           │
│          │                                           │
└──────────┴──────────────────────────────────────────┘
```

**Components:**
- Header: Logo, Global search, User menu dropdown
- Sidebar: Navigation links with icons, Credits widget
- Main: Dynamic content based on route

---

### 2.2 Dashboard Overview

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Dashboard                               [Last 30 days ▼] │
├─────────────────────────────────────────────────────┤
│                                                       │
│  KPI CARDS (4 across)                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Credits  │ │ Leads    │ │ Total    │ │ Avg Cost ││
│ │ Remaining│ │ Purchased│ │ Spent    │ │ Per Lead ││
│ │          │ │          │ │          │ │          ││
│ │   12     │ │    8     │ │  198€    │ │  24.75€  ││
│ │ /20 total│ │ +2 ↑     │ │ +50€ ↑   │ │  -3€ ↓   ││
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  QUICK ACTIONS                                        │
│  [Browse New Leads] [View Purchases] [Upgrade Plan]  │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  RECENT PURCHASES (Table)                             │
│                                                       │
│  Lead Title          Category    Date       Contact  │
│  ─────────────────────────────────────────────────── │
│  ERP Migration IT    IT Services 2024-11-14 View     │
│  SEO Campaign Lead   Marketing   2024-11-13 View     │
│  [View All Purchases →]                               │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- Page header: Heading + date range selector (dropdown)
- Stat cards: Custom card with large number, label, trend indicator
- Quick actions: Button group
- Recent table: Data table (simplified, 3-5 rows)

**Interactions:**
- Stat cards: Click to view detailed breakdown
- Trend arrows: Tooltip on hover showing percentage change
- Table rows: Click to view lead details

---

### 2.3 Lead Marketplace

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Lead Marketplace                    [Sort: Newest ▼] │
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│ FILTERS  │  LEAD GRID (2-3 columns)                  │
│          │                                           │
│ Category │ ┌─────────────┐ ┌─────────────┐          │
│ ☑ All    │ │ ERP Migration│ │ Website     │          │
│ □ IT     │ │ IT Services  │ │ Redesign    │          │
│ □ Marketing │ │           │ │ Marketing   │          │
│ □ HR     │ │ Mid-sized   │ │ Retail co.  │          │
│ □ Sales  │ │ manufacturing│ │ seeking new │          │
│          │ │ company needs│ │ e-commerce  │          │
│ Budget   │ │ ERP system...│ │ site...     │          │
│ 1k ━━●━━ 100k │ │         │ │             │          │
│          │ │ Budget:     │ │ Budget:     │          │
│ Posted   │ │ 50-75k€     │ │ 15-20k€     │          │
│ ○ Last 7d│ │             │ │             │          │
│ ○ Last 30d│ │ [Purchase  │ │ [Purchase   │          │
│ ● All    │ │  1 credit] │ │  1 credit]  │          │
│          │ └─────────────┘ └─────────────┘          │
│ [Reset]  │                                           │
│          │ ┌─────────────┐ ┌─────────────┐          │
│          │ │ HR Software │ │ Lead Gen    │          │
│          │ │ ...         │ │ Service...  │          │
│          │ └─────────────┘ └─────────────┘          │
│          │                                           │
│          │ [Load More]                               │
│          │                                           │
└──────────┴──────────────────────────────────────────┘
```

**Components:**
- Sidebar filters:
  - Checkbox group (categories)
  - Range slider (budget)
  - Radio group (date posted)
  - Reset button
- Lead cards:
  - Card container
  - Badge (category)
  - Heading (title)
  - Body text (description - truncated)
  - Metadata (budget range)
  - Button (Purchase)
- Pagination: "Load More" button

**Lead Card States:**
- Default: White background, subtle shadow
- Hover: Elevated shadow, border color change
- Loading: Skeleton placeholders while fetching

**Interaction: Purchase Flow**
1. Click "Purchase" → Modal opens
2. Modal shows:
   - Lead full details
   - Contact information (revealed after purchase)
   - Confirmation: "Use 1 credit to purchase this lead?"
   - [Cancel] [Confirm Purchase]
3. On confirm → Success toast + credit count updates
4. Lead card shows "Purchased" badge and moves to My Purchases

---

### 2.4 Lead Detail Modal

**Layout:**
```
┌─────────────────────────────────────────┐
│  Lead Details                      [X]  │
├─────────────────────────────────────────┤
│                                         │
│  ERP Migration for Manufacturing        │
│  [IT Services]                          │
│                                         │
│  Description:                           │
│  Mid-sized manufacturing company (250+  │
│  employees) is seeking to modernize    │
│  their inventory and production mgmt... │
│                                         │
│  Budget: 50,000 - 75,000€               │
│  Timeline: Q1 2025                      │
│  Decision Maker: Operations Director    │
│                                         │
│  Company Information:                   │
│  Name: [Revealed after purchase]        │
│  Industry: Manufacturing                │
│  Size: 250-500 employees                │
│  Location: Luxembourg                   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Purchase this lead for 1 credit   │ │
│  │                                   │ │
│  │ You have 12 credits remaining     │ │
│  │                                   │ │
│  │ [Cancel]      [Confirm Purchase]  │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Components:**
- Modal container (centered overlay)
- Close button (X icon)
- Content sections with headings
- Info alert box (credits remaining)
- Action buttons (secondary + primary)

**Interaction:**
- Click outside modal → Close
- Confirm → Loading spinner on button → Success → Modal closes → Toast notification

---

### 2.5 My Purchases

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  My Purchases                        [Export CSV ▼]  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  [Search purchases...]              [Filter: All ▼]  │
│                                                       │
│  PURCHASES TABLE                                      │
│                                                       │
│  Title              Category   Date       Status  Action │
│  ─────────────────────────────────────────────────────── │
│  ERP Migration      IT         Nov 14     New     [View] │
│  Website Redesign   Marketing  Nov 13     Contacted [View] │
│  HR Software Lead   HR         Nov 10     Closed   [View] │
│  ...                                                      │
│                                                       │
│  Showing 1-10 of 23        [1] [2] [3] ... [Next]    │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- Search input
- Filter dropdown
- Export dropdown (CSV, PDF)
- Data table with:
  - Sortable columns (click heading)
  - Status badges (New=blue, Contacted=yellow, Closed=green)
  - Action button per row
- Pagination controls

**Interaction:**
- Click row → Expands to show full lead details + contact info
- Status dropdown: Update lead status (New → Contacted → Closed)
- Export: Downloads CSV with all purchase data

---

### 2.6 Analytics Dashboard

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Analytics                          [Last 90 days ▼] │
├─────────────────────────────────────────────────────┤
│                                                       │
│  OVERVIEW METRICS (4 KPI Cards)                       │
│  [Total Spent] [Leads Purchased] [Conversion] [ROI]  │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  SPENDING TREND (Line Chart)                          │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 500€                                            │ │
│  │     ╱╲                                          │ │
│  │    ╱  ╲    ╱╲                                   │ │
│  │   ╱    ╲  ╱  ╲                                  │ │
│  │  ╱      ╲╱    ╲                                 │ │
│  │ ────────────────────────────                    │ │
│  │ Aug  Sep  Oct  Nov                              │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  LEADS BY CATEGORY (Donut Chart)   TOP CATEGORIES    │
│  ┌──────────┐                      1. IT (45%)      │
│  │   ╱──╲   │                      2. Marketing (30%)│
│  │  │ 23 │  │                      3. HR (15%)      │
│  │   ╲──╱   │                      4. Sales (10%)   │
│  └──────────┘                                        │
│   Total Leads                                         │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- Date range selector (dropdown)
- KPI cards (same as dashboard)
- Line chart (Recharts library)
- Donut chart + legend list
- Insight cards (AI-generated insights - future feature)

**Charts Config:**
- Colors: Use design system palette (blue, teal, orange, green)
- Tooltips: Show on hover with exact values
- Responsive: Charts resize based on container

---

### 2.7 Subscription Management

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Subscription                                         │
├─────────────────────────────────────────────────────┤
│                                                       │
│  CURRENT PLAN                                         │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Growth Plan                    [Manage in Stripe]│ │
│  │ 249€/month                                       │ │
│  │                                                   │ │
│  │ • 60 credits per month                           │ │
│  │ • Priority support                               │ │
│  │ • Advanced analytics                             │ │
│  │                                                   │ │
│  │ Next billing: December 14, 2024                  │ │
│  │ Credits renew: December 14, 2024                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  UPGRADE OPTIONS                                      │
│  ┌───────────────────┐                               │
│  │ Scale Plan        │                               │
│  │ 499€/month        │                               │
│  │ [Upgrade Now]     │                               │
│  └───────────────────┘                               │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  BILLING HISTORY                                      │
│                                                       │
│  Date         Amount    Status      Invoice           │
│  ────────────────────────────────────────────────    │
│  Nov 14, 2024 249€      Paid        [Download]       │
│  Oct 14, 2024 249€      Paid        [Download]       │
│  Sep 14, 2024 249€      Paid        [Download]       │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- Current plan card with:
  - Plan name and price
  - Feature list
  - Next billing date
  - "Manage in Stripe" link (opens Stripe portal)
- Upgrade card
- Billing history table

**Interactions:**
- "Manage in Stripe" → Opens Stripe Customer Portal (update payment method, cancel)
- "Upgrade Now" → Stripe Checkout for Scale plan
- Download invoice → Opens PDF

---

### 2.8 Settings

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Settings                                             │
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│ TABS     │  COMPANY PROFILE                          │
│          │                                           │
│ • Profile│  Company Name                             │
│ • Team   │  [Acme Corp                          ]   │
│ • Notifications                                      │
│ • Security│  Industry                                │
│          │  [IT Services              ▼]            │
│          │                                           │
│          │  Company Size                             │
│          │  [50-100 employees         ▼]            │
│          │                                           │
│          │  Website                                  │
│          │  [https://acme.com              ]        │
│          │                                           │
│          │  [Save Changes]                           │
│          │                                           │
└──────────┴──────────────────────────────────────────┘
```

**Tabs:**
1. **Profile**: Company info (name, industry, size, website)
2. **Team**: Team members list, invite functionality
3. **Notifications**: Email/in-app notification preferences
4. **Security**: Password change, 2FA settings

**Components:**
- Tab navigation (vertical on left)
- Form inputs (text, select, email)
- Save button (disabled until changes made)

---

<a name="mobile-scout"></a>
## 3. Mobile App - Scout Screens (React Native)

### 3.1 App Shell & Bottom Navigation

**Structure:**
```
┌─────────────────────────────┐
│                             │
│                             │
│        SCREEN CONTENT       │
│                             │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│  [Home] [Leads] [+] [Wallet] [Profile] │ ← Bottom Nav
└─────────────────────────────┘
```

**Bottom Navigation Tabs:**
1. **Home** (Dashboard) - Icon: Home
2. **My Leads** - Icon: List
3. **Submit Lead** (+) - Icon: Plus Circle (highlighted, elevated)
4. **Earnings** - Icon: Wallet
5. **Profile** - Icon: User

**Design:**
- Active tab: Icon + label in teal-600
- Inactive: Icon + label in gray-500
- Center tab (+): Larger, circular, elevated with shadow
- Background: white with top border shadow

---

### 3.2 Scout Dashboard (Home Tab)

**Layout:**
```
┌─────────────────────────────┐
│ ☰ LeadScout        🔔       │ ← Header
├─────────────────────────────┤
│                             │
│  Hey Marc! 👋               │
│                             │
│  ┌───────────────────────┐  │
│  │  Earnings Overview    │  │
│  │                       │  │
│  │  Total Earned         │  │
│  │  1,245€               │  │
│  │                       │  │
│  │  Pending: 125€        │  │
│  │  Available: 1,120€    │  │
│  └───────────────────────┘  │
│                             │
│  ┌──────┐  ┌──────┐        │
│  │ Leads│  │Quality│        │
│  │ Sold │  │ Score │        │
│  │  23  │  │  82%  │        │
│  └──────┘  └──────┘        │
│                             │
│  Recent Activity            │
│  ─────────────────────────  │
│  ● Lead "ERP Migration" sold│
│    +25€   2 hours ago       │
│  ● New badge unlocked: 🥈  │
│    Silver Scout! 1 day ago  │
│                             │
│  [Submit New Lead]          │
│                             │
└─────────────────────────────┘
```

**Components:**
- Header: Hamburger menu, logo, notification bell
- Greeting: Personalized with name + emoji
- Earnings card: Large card with total earnings (emphasized), pending/available breakdown
- Stat cards: 2-column grid (leads sold, quality score)
- Activity feed: List of recent events with icons and timestamps
- CTA button: Primary button (full width)

**Interactions:**
- Tap earnings card → Navigate to Earnings tab
- Tap stat card → View detailed breakdown
- Tap activity item → Navigate to relevant screen
- Pull down → Refresh data

---

### 3.3 Submit Lead Flow (Main Feature)

**Screen 1: Lead Basics**
```
┌─────────────────────────────┐
│ ← Submit Lead        [1/4]  │
├─────────────────────────────┤
│                             │
│  What's the opportunity?    │
│                             │
│  Lead Title                 │
│  ┌───────────────────────┐  │
│  │ ERP Migration needed  │  │
│  └───────────────────────┘  │
│                             │
│  Category                   │
│  ┌─────────────────────────┐│
│  │ [IT] [Marketing] [HR]   ││
│  │ [Sales] [Other]         ││
│  └─────────────────────────┘│
│  [IT Services] selected     │
│                             │
│                             │
│            [Next →]         │
│                             │
└─────────────────────────────┘
```

**Screen 2: Details**
```
┌─────────────────────────────┐
│ ← Submit Lead        [2/4]  │
├─────────────────────────────┤
│                             │
│  Tell us more               │
│                             │
│  Description                │
│  ┌───────────────────────┐  │
│  │ Manufacturing company │  │
│  │ with 250+ employees   │  │
│  │ needs modern ERP...   │  │
│  │                       │  │
│  │ (200 chars remaining) │  │
│  └───────────────────────┘  │
│                             │
│  Estimated Budget           │
│  1k ────●──────────── 100k  │
│       50,000€               │
│                             │
│  Timeline                   │
│  [Q1 2025        ▼]        │
│                             │
│            [Next →]         │
│                             │
└─────────────────────────────┘
```

**Screen 3: Company Info**
```
┌─────────────────────────────┐
│ ← Submit Lead        [3/4]  │
├─────────────────────────────┤
│                             │
│  Company Details            │
│                             │
│  Company Name               │
│  ┌───────────────────────┐  │
│  │ Acme Manufacturing    │  │
│  └───────────────────────┘  │
│                             │
│  Industry                   │
│  [Manufacturing      ▼]    │
│                             │
│  Contact Information        │
│  ┌───────────────────────┐  │
│  │ john.doe@acme.com     │  │
│  └───────────────────────┘  │
│  or                         │
│  ┌───────────────────────┐  │
│  │ +352 123 456 789      │  │
│  └───────────────────────┘  │
│                             │
│            [Next →]         │
│                             │
└─────────────────────────────┘
```

**Screen 4: Review & Submit**
```
┌─────────────────────────────┐
│ ← Submit Lead        [4/4]  │
├─────────────────────────────┤
│                             │
│  Review Your Lead           │
│                             │
│  ┌───────────────────────┐  │
│  │ ERP Migration needed  │  │
│  │ [IT Services]         │  │
│  │                       │  │
│  │ Manufacturing co...   │  │
│  │ Budget: 50k€          │  │
│  │ Timeline: Q1 2025     │  │
│  │                       │  │
│  │ Company: Acme Mfg     │  │
│  │ Contact: john.doe@... │  │
│  │                       │  │
│  │ [Edit]                │  │
│  └───────────────────────┘  │
│                             │
│  Estimated Earnings         │
│  ┌───────────────────────┐  │
│  │    If sold: ~25€      │  │
│  └───────────────────────┘  │
│                             │
│       [Submit Lead]         │
│                             │
└─────────────────────────────┘
```

**Screen 5: Success**
```
┌─────────────────────────────┐
│                             │
│         ✅                  │
│                             │
│  Lead Submitted!            │
│                             │
│  We're reviewing your lead  │
│  and will notify you when   │
│  it's approved.             │
│                             │
│  Estimated earnings: ~25€   │
│                             │
│  [Submit Another] [Home]    │
│                             │
└─────────────────────────────┘
```

**Components:**
- Progress indicator (1/4, 2/4, etc.)
- Form inputs:
  - Text input
  - Category chips (selectable)
  - Textarea (with character count)
  - Range slider (with live value display)
  - Dropdown select
- Navigation buttons (Back, Next)
- Review card (read-only summary)
- Success screen (icon, message, CTAs)

**Interactions:**
- Category chips: Tap to select (single selection, visual feedback)
- Slider: Drag to adjust, shows value in real-time
- Next button: Disabled until required fields filled
- Edit in review: Returns to specific step
- Success screen: Auto-navigate to home after 3s or tap button

**Validation:**
- Title: Required, min 10 chars
- Category: Required
- Description: Required, min 50 chars, max 500 chars
- Budget: Required
- Company name: Required
- Contact: Required, email or phone format

---

### 3.4 My Leads (Leads Tab)

**Layout:**
```
┌─────────────────────────────┐
│ My Leads          [Filter ▼]│
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ ERP Migration needed  │  │
│  │ [Sold] 🎉             │  │
│  │                       │  │
│  │ Submitted: Nov 10     │  │
│  │ Sold: Nov 14          │  │
│  │ Earnings: +25€        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Website Redesign      │  │
│  │ [Pending] ⏳          │  │
│  │                       │  │
│  │ Submitted: Nov 13     │  │
│  │ Under review          │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ HR Software Lead      │  │
│  │ [Rejected] ❌         │  │
│  │                       │  │
│  │ Reason: Duplicate     │  │
│  └───────────────────────┘  │
│                             │
│  [Pull to refresh]          │
│                             │
└─────────────────────────────┘
```

**Components:**
- Header with filter dropdown (All, Sold, Pending, Rejected)
- Lead cards:
  - Title
  - Status badge (color-coded)
  - Emoji indicator
  - Metadata (dates, earnings, rejection reason)
- Pull-to-refresh loader

**Status Badges:**
- Sold: Green background, "Sold" text, 🎉
- Pending: Yellow background, "Pending" text, ⏳
- Rejected: Red background, "Rejected" text, ❌

**Interactions:**
- Tap card → View full lead details
- Pull down → Refresh list
- Filter → Show only selected status

---

### 3.5 Earnings (Wallet Tab)

**Layout:**
```
┌─────────────────────────────┐
│ Earnings                    │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │  Total Earnings       │  │
│  │  1,245€               │  │
│  │                       │  │
│  │  ● Pending: 125€      │  │
│  │  ● Available: 1,120€  │  │
│  └───────────────────────┘  │
│                             │
│  [Request Payout]           │
│  (Minimum: 20€)             │
│                             │
│  Recent Payouts             │
│  ─────────────────────────  │
│  ┌───────────────────────┐  │
│  │ Nov 8, 2024           │  │
│  │ 100€  [Completed] ✅  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Nov 1, 2024           │  │
│  │ 75€   [Completed] ✅  │  │
│  └───────────────────────┘  │
│                             │
│  Earnings History           │
│  ─────────────────────────  │
│  • +25€  ERP Lead sold      │
│    Nov 14, 2024             │
│  • +30€  Website lead sold  │
│    Nov 10, 2024             │
│                             │
└─────────────────────────────┘
```

**Components:**
- Earnings overview card (large, emphasized)
- Request payout button:
  - Primary style if available ≥ 20€
  - Disabled style if < 20€
- Payout history cards (status: Completed, Processing, Failed)
- Earnings history list (chronological, with lead titles)

**Interactions:**
- Tap "Request Payout" → Opens Stripe Connect flow if not onboarded, else confirms payout
- Tap payout card → View payout details
- Tap earnings item → View lead details

**Stripe Connect Onboarding:**
If scout hasn't connected Stripe:
```
┌─────────────────────────────┐
│                             │
│  💳 Connect Your Bank       │
│                             │
│  To receive payouts, please │
│  connect your bank account  │
│  via Stripe.                │
│                             │
│  Safe & secure              │
│  ✓ Bank-level security      │
│  ✓ Direct deposits          │
│  ✓ 2-3 day transfers        │
│                             │
│  [Connect Bank Account]     │
│                             │
└─────────────────────────────┘
```

---

### 3.6 Profile (Profile Tab)

**Layout:**
```
┌─────────────────────────────┐
│ Profile                     │
├─────────────────────────────┤
│                             │
│       [Avatar Photo]        │
│       Marc Dubois           │
│       marc.d@email.com      │
│                             │
│  ┌───────────────────────┐  │
│  │ Quality Score         │  │
│  │                       │  │
│  │      ╱───╲            │  │
│  │     │ 82 │            │  │
│  │      ╲───╱            │  │
│  │   /100 points         │  │
│  │                       │  │
│  │ [View Breakdown]      │  │
│  └───────────────────────┘  │
│                             │
│  Achievements               │
│  🥉 Bronze Scout (unlocked) │
│  🥈 Silver Scout (unlocked) │
│  🥇 Gold Scout   (locked)   │
│  💎 Diamond      (locked)   │
│                             │
│  Leaderboard                │
│  Your rank: #47 / 212       │
│  [View Full Leaderboard]    │
│                             │
│  Settings                   │
│  • Notification Preferences │
│  • Account Settings         │
│  • Help & Support           │
│  • Privacy Policy           │
│                             │
│  [Sign Out]                 │
│                             │
└─────────────────────────────┘
```

**Components:**
- Profile header: Avatar (editable), name, email
- Quality score card:
  - Circular progress gauge (0-100)
  - Breakdown link
- Achievements: Badge grid (unlocked vs locked states)
- Leaderboard preview: Rank display, link to full view
- Settings list: Navigation links
- Sign out button (danger variant)

**Interactions:**
- Tap avatar → Upload new photo
- Tap quality score → Modal with breakdown (submission rate, sold rate, quality feedback)
- Tap achievement → Modal with unlock criteria
- Tap leaderboard → Navigate to full leaderboard screen
- Tap settings item → Navigate to respective settings screen

---

### 3.7 Quality Score Breakdown Modal

**Layout:**
```
┌─────────────────────────────┐
│ Quality Score        [X]    │
├─────────────────────────────┤
│                             │
│  Your score: 82/100         │
│                             │
│  How it's calculated:       │
│                             │
│  Lead Sold Rate      40pts  │
│  ████████░░  80%            │
│                             │
│  Approval Rate       30pts  │
│  ███████░░░  70%            │
│                             │
│  Lead Quality        12pts  │
│  ████░░░░░░  40%            │
│  (Based on buyer feedback)  │
│                             │
│  Tips to improve:           │
│  • Provide more detailed    │
│    descriptions             │
│  • Verify contact info      │
│    before submitting        │
│                             │
│         [Got It]            │
│                             │
└─────────────────────────────┘
```

**Components:**
- Modal header with close button
- Score display (large number)
- Score breakdown:
  - Metric name + points earned
  - Progress bar (visual representation)
  - Percentage
- Tips section (bullet list)
- Dismiss button

---

### 3.8 Leaderboard Screen

**Layout:**
```
┌─────────────────────────────┐
│ ← Leaderboard       [Period▼]
├─────────────────────────────┤
│                             │
│  🏆 Top Scouts This Month   │
│                             │
│  ┌───────────────────────┐  │
│  │ 🥇 1. Sophie M.       │  │
│  │    156 leads · 2,340€ │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🥈 2. Jean-Luc D.     │  │
│  │    142 leads · 2,130€ │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🥉 3. Marie C.        │  │
│  │    138 leads · 2,070€ │  │
│  └───────────────────────┘  │
│                             │
│  ─────────────────────────  │
│  47. Marc D. (You)          │
│      23 leads · 575€        │
│  ─────────────────────────  │
│                             │
│  [... more scouts ...]      │
│                             │
└─────────────────────────────┘
```

**Components:**
- Period selector (This Week, This Month, All Time)
- Top 3 cards (special styling with medals)
- User's position (highlighted row)
- Leaderboard list (rank, name, stats)

**Styling:**
- Top 3: Gradient backgrounds (gold, silver, bronze)
- User's row: Teal background highlight
- Medals: Large emojis (🥇🥈🥉)

---

### 3.9 Achievement Unlock Animation

**Layout:**
```
┌─────────────────────────────┐
│                             │
│         ✨ ✨ ✨            │
│                             │
│         🥈                  │
│                             │
│   Achievement Unlocked!     │
│                             │
│     Silver Scout            │
│                             │
│  You've sold 10 leads!      │
│  Keep up the great work.    │
│                             │
│         [Awesome!]          │
│                             │
│         ✨ ✨ ✨            │
│                             │
└─────────────────────────────┘
```

**Animation:**
- Badge scales up from 0 to 1 with bounce
- Sparkles animate in with rotation
- Confetti particles (optional)
- Auto-dismiss after 5s or tap button

**Trigger:**
When user unlocks achievement (after lead sold, payout received, etc.)

---

<a name="admin"></a>
## 4. Admin Dashboard (Web)

### 4.1 Moderation Queue

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Moderation Queue             [Filter: Pending ▼]    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  PENDING LEADS (23)                                   │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ ERP Migration needed                            │ │
│  │ [IT Services]                                   │ │
│  │                                                   │ │
│  │ Scout: Marc Dubois (Quality: 82%)              │ │
│  │ Submitted: Nov 14, 2024 10:23 AM                │ │
│  │                                                   │ │
│  │ Manufacturing company with 250+ employees...    │ │
│  │ Budget: 50-75k€                                 │ │
│  │ Contact: john.doe@acme.com                      │ │
│  │                                                   │ │
│  │ [Approve] [Reject] [Flag Scout]                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ [Next lead...]                                  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- Filter dropdown (Pending, Approved, Rejected, Flagged)
- Lead cards with full details
- Scout info (name, quality score)
- Action buttons:
  - Approve (green)
  - Reject (red, opens reason modal)
  - Flag Scout (yellow, opens flag modal)

**Reject Modal:**
```
┌─────────────────────────────┐
│ Reject Lead          [X]    │
├─────────────────────────────┤
│                             │
│  Reason for rejection:      │
│  ○ Duplicate                │
│  ○ Insufficient info        │
│  ○ Invalid contact          │
│  ○ Off-topic                │
│  ○ Spam                     │
│  ● Other: [____________]    │
│                             │
│  Notify scout: ☑            │
│                             │
│  [Cancel]  [Confirm Reject] │
│                             │
└─────────────────────────────┘
```

---

### 4.2 Platform Analytics (Admin)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Platform Analytics                  [Last 30 days ▼]│
├─────────────────────────────────────────────────────┤
│                                                       │
│  KEY METRICS (4 KPIs)                                 │
│  [GMV] [Active Scouts] [Active Companies] [Conversion]│
│                                                       │
│  GROWTH CHART (Line chart)                            │
│  GMV, New Scouts, New Companies over time             │
│                                                       │
│  FUNNELS                                              │
│  Scout Activation: Sign up → Submit → Sold → Payout  │
│  Company Activation: Sign up → Trial → Paid → Retain │
│                                                       │
│  TOP PERFORMERS                                       │
│  • Top 10 scouts by earnings                         │
│  • Top 10 companies by spend                         │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

<a name="patterns"></a>
## 5. Design Patterns & Flows

### 5.1 Authentication Flow (Clerk)

**Web (Companies):**
1. User clicks "Get Started" on homepage
2. Clerk sign-up modal opens
3. User signs up with email or Google/Microsoft
4. Redirected to onboarding (company info)
5. Subscription selection (Stripe Checkout)
6. Redirected to dashboard

**Mobile (Scouts):**
1. User opens app → Splash screen
2. Sign in/sign up screen (Clerk)
3. Scout onboarding (name, expertise)
4. Dashboard (home tab)

**Environment Variables:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding`

---

### 5.2 Purchase Flow (Detailed)

1. **Browse Marketplace** (Company)
   - View lead cards in grid
   - Click lead card → Lead detail modal opens

2. **Lead Detail Modal**
   - Shows full lead info (description, budget, company name - blurred)
   - Shows credits remaining
   - "Purchase" button

3. **Purchase Confirmation**
   - Click "Purchase" → Confirmation step appears in modal
   - "Confirm Purchase" button

4. **Processing**
   - Button shows loading spinner
   - Convex mutation called:
     - Deduct 1 credit from company
     - Mark lead as sold
     - Credit scout pending earnings
     - Create transaction record

5. **Success**
   - Modal closes
   - Toast notification: "Lead purchased! Contact info revealed."
   - Lead card updates to "Purchased" state
   - Credits counter updates in sidebar
   - Lead appears in "My Purchases" table

6. **Contact Info Revealed**
   - Company can now see full contact details
   - Lead moved to "My Purchases"

---

### 5.3 Payout Flow (Scouts)

**Automated Weekly Payouts (Convex Scheduled Function):**
```typescript
// Runs every Friday at 9:00 AM
export const processWeeklyPayouts = internalAction({
  handler: async (ctx) => {
    // 1. Query scouts with pending ≥ 20€
    const scouts = await ctx.runQuery(internal.scouts.getPendingPayouts);

    // 2. For each scout:
    for (const scout of scouts) {
      // 3. Create Stripe transfer to Connect account
      const transfer = await stripe.transfers.create({
        amount: Math.round(scout.pendingEarnings * 100),
        currency: 'eur',
        destination: scout.stripeConnectAccountId,
      });

      // 4. Update scout record
      await ctx.runMutation(internal.scouts.completePayout, {
        scoutId: scout._id,
        amount: scout.pendingEarnings,
        stripeTransferId: transfer.id,
      });

      // 5. Send notification
      await ctx.runAction(internal.notifications.sendPayoutNotification, {
        scoutId: scout._id,
        amount: scout.pendingEarnings,
      });
    }
  },
});
```

**Manual Payout Request (Mobile App):**
1. Scout goes to Earnings tab
2. If pending ≥ 20€, "Request Payout" button is enabled
3. Tap button → Confirmation modal
4. Confirm → Convex action triggers Stripe transfer
5. Success → Toast notification + pending updates to 0

---

### 5.4 Notification Patterns

**Push Notifications (Mobile - Scouts):**
- Lead sold: "🎉 Your lead 'ERP Migration' was purchased! +25€"
- Lead approved: "✅ Lead approved and now live in marketplace"
- Lead rejected: "❌ Lead rejected. Reason: Insufficient info"
- Payout completed: "💰 Payout of 100€ sent to your bank account"
- Achievement unlocked: "🏆 Achievement unlocked: Silver Scout!"

**Email Notifications:**
- Scout: Weekly earnings summary (Fridays)
- Company: New leads in your categories (daily digest)
- Company: Credits running low (80% used)

**In-App Notifications (Bell Icon):**
- Same events as push notifications
- Notification badge on bell icon (unread count)
- Notification center dropdown

---

### 5.5 Empty States

**No Leads in Marketplace (Company):**
```
┌─────────────────────────────┐
│                             │
│         📭                  │
│                             │
│  No leads available         │
│                             │
│  Check back soon! New leads │
│  are submitted daily.       │
│                             │
│  [Adjust Filters]           │
│                             │
└─────────────────────────────┘
```

**No Purchases Yet (Company):**
```
┌─────────────────────────────┐
│                             │
│         🛒                  │
│                             │
│  No purchases yet           │
│                             │
│  Browse the marketplace to  │
│  find qualified leads.      │
│                             │
│  [Browse Leads]             │
│                             │
└─────────────────────────────┘
```

**No Leads Submitted (Scout):**
```
┌─────────────────────────────┐
│                             │
│         📝                  │
│                             │
│  No leads yet               │
│                             │
│  Submit your first lead to  │
│  start earning!             │
│                             │
│  [Submit Lead]              │
│                             │
└─────────────────────────────┘
```

---

### 5.6 Loading States

**Skeleton Screens:**

Lead Card Skeleton:
```
┌───────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓         │ ← Title placeholder
│ ▓▓▓▓▓▓               │ ← Category badge
│                       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     │ ← Description line 1
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓        │ ← Description line 2
│                       │
│ ▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓   │ ← Budget + button
└───────────────────────┘
```

**Spinners:**
- Button loading: Spinner replaces button text
- Page loading: Full-screen spinner with logo
- Inline loading: Small spinner next to text

---

### 5.7 Error States

**Form Validation Errors:**
```
Lead Title
┌───────────────────────┐
│ ER                    │ ← Input with error border (red)
└───────────────────────┘
❌ Title must be at least 10 characters
```

**API Error:**
```
┌─────────────────────────────┐
│                             │
│         ⚠️                  │
│                             │
│  Something went wrong       │
│                             │
│  Unable to load leads.      │
│  Please try again.          │
│                             │
│  [Retry]                    │
│                             │
└─────────────────────────────┘
```

**No Credits:**
```
┌─────────────────────────────┐
│                             │
│  ⚠️ No credits remaining    │
│                             │
│  You've used all 20 credits │
│  for this month.            │
│                             │
│  Renews: Dec 14, 2024       │
│                             │
│  [Upgrade Plan]             │
│                             │
└─────────────────────────────┘
```

---

### 5.8 Success States

**Lead Purchased (Toast):**
```
┌───────────────────────────┐
│ ✅ Lead purchased!        │
│ Contact info revealed.    │
└───────────────────────────┘
```

**Lead Submitted (Mobile):**
```
┌─────────────────────────────┐
│         ✅                  │
│                             │
│  Lead Submitted!            │
│                             │
│  We're reviewing your lead  │
│  and will notify you when   │
│  it's approved.             │
│                             │
│  Estimated: ~25€            │
└─────────────────────────────┘
```

---

## 6. Design System Implementation Notes

### 6.1 Responsive Breakpoints

**Tailwind Config:**
```javascript
screens: {
  'sm': '640px',  // Mobile landscape
  'md': '768px',  // Tablet portrait
  'lg': '1024px', // Desktop
  'xl': '1280px', // Large desktop
}
```

**Usage:**
- Mobile-first approach (base styles = mobile)
- Use `md:` prefix for tablet overrides
- Use `lg:` prefix for desktop overrides

Example:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  // 1 column mobile, 2 tablet, 3 desktop
</div>
```

---

### 6.2 Accessibility Checklist

**Keyboard Navigation:**
- All interactive elements must be focusable
- Focus indicator must be visible (blue outline)
- Tab order must be logical (top to bottom, left to right)
- Modals must trap focus

**Screen Readers:**
- Use semantic HTML (`<nav>`, `<main>`, `<button>`)
- Add ARIA labels where needed (`aria-label`, `aria-describedby`)
- Form inputs must have associated `<label>` elements
- Status messages use `role="status"` or `role="alert"`

**Color Contrast:**
- Text: 4.5:1 minimum (WCAG AA)
- UI elements: 3:1 minimum
- Use tools like WebAIM Contrast Checker

**Touch Targets (Mobile):**
- Minimum 44x44px for all tappable elements
- Ensure adequate spacing between interactive elements

---

### 6.3 Animation Guidelines

**Transitions:**
- Default: `transition-all duration-200 ease-in-out`
- Hover effects: 200ms
- Modal enter/exit: 300ms
- Page transitions: 400ms

**Animations:**
- Badge unlock: Scale + bounce (500ms)
- Confetti: Particle system (2s duration)
- Loading spinners: Continuous rotation
- Skeleton screens: Shimmer effect (1.5s loop)

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Component Inventory

### Web Components (Next.js + Shadcn/UI)

**Navigation:**
- `<Header />` - Logo, navigation links, user menu
- `<Sidebar />` - Dashboard navigation
- `<Breadcrumbs />` - Page hierarchy

**Data Display:**
- `<StatCard />` - KPI display with trend
- `<DataTable />` - Sortable, filterable table
- `<LeadCard />` - Lead display in marketplace
- `<Chart />` - Line, bar, donut charts (Recharts)

**Forms:**
- `<Input />` - Text, email, number, password
- `<Textarea />` - Multi-line text
- `<Select />` - Dropdown selection
- `<Checkbox />` - Single checkbox
- `<RadioGroup />` - Multiple choice
- `<RangeSlider />` - Numeric range

**Feedback:**
- `<Toast />` - Success/error notifications
- `<Modal />` - Centered overlay dialog
- `<Alert />` - Inline alerts
- `<Spinner />` - Loading indicator
- `<Skeleton />` - Loading placeholder

**Actions:**
- `<Button />` - All button variants
- `<IconButton />` - Icon-only button
- `<Badge />` - Status indicators
- `<Tabs />` - Tab navigation

---

### Mobile Components (React Native)

**Navigation:**
- `<BottomTabNavigator />` - 5-tab navigation
- `<StackNavigator />` - Screen transitions
- `<Header />` - Screen header

**Data Display:**
- `<Card />` - Container component
- `<StatCard />` - KPI display
- `<LeadCard />` - Lead in list
- `<ActivityItem />` - Feed item
- `<BadgeDisplay />` - Achievement badge

**Forms:**
- `<TextInput />` - Single-line input
- `<TextArea />` - Multi-line input
- `<Slider />` - Range selector
- `<CategoryChips />` - Selectable chips
- `<Picker />` - Dropdown (native)

**Feedback:**
- `<Toast />` - Bottom toast
- `<Modal />` - Bottom sheet or center modal
- `<Alert />` - Native alert dialog
- `<ActivityIndicator />` - Spinner
- `<EmptyState />` - No data view

**Actions:**
- `<Button />` - All variants
- `<IconButton />` - Icon-only
- `<FAB />` - Floating action button
- `<Badge />` - Notification badge

---

## 8. Content Guidelines

### 8.1 Microcopy Patterns

**CTAs (Buttons):**
- Action-oriented verbs
- Specific, not generic
- Examples:
  - ✅ "Purchase Lead" (not "Submit")
  - ✅ "Submit Lead" (not "Send")
  - ✅ "Request Payout" (not "Withdraw")

**Form Labels:**
- Clear and concise
- No jargon
- Examples:
  - "Lead Title" (not "Opportunity Name")
  - "Estimated Budget" (not "Budget Range")
  - "Company Name" (not "Organization")

**Error Messages:**
- Explain what went wrong
- Provide next steps
- Examples:
  - ❌ "Invalid input"
  - ✅ "Title must be at least 10 characters"

  - ❌ "Error 500"
  - ✅ "Unable to load leads. Please try again."

**Success Messages:**
- Positive tone
- Confirm action
- Examples:
  - "Lead purchased! Contact info revealed."
  - "Lead submitted successfully. We'll review it soon."
  - "Payout of 100€ sent to your bank account."

---

### 8.2 Tone by Context

**Scout-facing (Mobile):**
- Friendly, encouraging
- Gamification language ("Achievement unlocked!", "You're on fire!")
- Earnings-focused ("Earn up to 25€", "Total earned: 1,245€")

**Company-facing (Web):**
- Professional, trustworthy
- ROI-focused ("Save 80% on lead gen", "Pre-qualified leads")
- Data-driven ("Conversion rate: 65%", "Avg cost per lead: 24€")

**Admin:**
- Neutral, factual
- Action-oriented ("Approve", "Reject", "Flag")
- Data-heavy (metrics, trends, funnels)

---

## 9. Implementation Priorities (MVP)

### Phase 1: Core Flows
1. **Scout mobile app:**
   - Auth (Clerk)
   - Submit lead flow (4 steps)
   - Dashboard (earnings, stats)

2. **Company web app:**
   - Auth (Clerk)
   - Subscription (Stripe Checkout)
   - Lead marketplace (browse, purchase)
   - My purchases table

3. **Admin:**
   - Moderation queue (approve/reject)

### Phase 2: Enhancements
1. Analytics dashboards (company + admin)
2. Gamification (badges, leaderboard)
3. Payout automation (Stripe Connect + scheduled function)

### Phase 3: Polish
1. Dark mode (both platforms)
2. Advanced filters (marketplace)
3. Email notifications
4. Push notifications

---

## 10. Handoff to Developers

### Web (Next.js) Developers

**Setup:**
```bash
npx create-next-app@latest leadscout-web
cd leadscout-web
npm install @clerk/nextjs convex stripe @radix-ui/react-* recharts
npx shadcn-ui@latest init
```

**Environment Variables (.env.local):**
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Convex
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOY_KEY=...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Key Files to Create:**
- `app/layout.tsx` - Root layout with Clerk + Convex providers
- `app/dashboard/layout.tsx` - Dashboard shell (sidebar + header)
- `app/dashboard/page.tsx` - Dashboard overview
- `app/dashboard/marketplace/page.tsx` - Lead marketplace
- `components/ui/` - Shadcn components
- `lib/stripe.ts` - Stripe client
- `convex/` - Convex schema and functions

---

### Mobile (React Native) Developers

**Setup:**
```bash
npx create-expo-app leadscout-mobile
cd leadscout-mobile
npx expo install @clerk/clerk-expo convex expo-notifications
```

**Environment Variables (.env):**
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_CONVEX_URL=https://...convex.cloud
```

**Key Files to Create:**
- `app/_layout.tsx` - Root layout with Clerk + Convex
- `app/(tabs)/_layout.tsx` - Bottom tab navigator
- `app/(tabs)/index.tsx` - Dashboard (home)
- `app/(tabs)/leads.tsx` - My leads
- `app/(tabs)/wallet.tsx` - Earnings
- `app/(tabs)/profile.tsx` - Profile
- `app/submit-lead.tsx` - Multi-step form (stack navigator)
- `components/` - Reusable components
- `convex/` - Shared with web app

---

## Conclusion

This design specification provides complete, production-ready designs for all pages and flows in LeadScout. Developers can implement pixel-perfect UIs directly from this document without design clarification.

**Key Takeaways:**
- Dual-platform design (web for companies, mobile for scouts)
- Consistent design system across platforms
- Accessibility-first approach (WCAG AA)
- Clear component specifications with variants and states
- Detailed user flows and interactions
- Environment variable strategy (no hardcodes)
- Ready for Convex + Stripe + Clerk integration

All designs follow the brand identity (professional, rewarding, trustworthy) and implement the design system (Inter font, blue/teal palette, 4px grid).

**Next Steps:**
- Pass to software-architect for technical implementation plan
- Pass to frontend-dev for UI implementation
- Pass to backend-dev for Convex functions
- Pass to qa-engineer for test scenarios

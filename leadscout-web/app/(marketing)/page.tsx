import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/Logo";
import {
  CheckCircle,
  TrendingUp,
  Shield,
  DollarSign,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Split Design */}
      <section className="border-b">
        <div className="container grid lg:grid-cols-2 gap-0">
          {/* For Scouts */}
          <div className="relative bg-gradient-to-br from-teal-50 to-blue-50 px-8 py-16 lg:py-24">
            <div className="max-w-xl">
              <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">
                For Scouts
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Your Network,
                <br />
                Your Revenue
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Turn LinkedIn connections into{" "}
                <span className="font-semibold text-accent">500-2000€/month</span>
                . Submit qualified leads from your network and earn on every sale.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-white"
                  asChild
                >
                  <Link href="#download-app">
                    Download App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                  <span className="px-3 py-1 rounded-full bg-white/50">iOS</span>
                  <span className="px-3 py-1 rounded-full bg-white/50">Android</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">Weekly Payouts</p>
                  <p className="text-sm text-muted-foreground">
                    Get paid every Friday, minimum 20€
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* For Companies */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 px-8 py-16 lg:py-24 border-l">
            <div className="max-w-xl">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                For Companies
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Human-Verified
                <br />
                Leads at Scale
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Stop wasting budget on unqualified leads. Access{" "}
                <span className="font-semibold text-primary">
                  pre-verified opportunities
                </span>{" "}
                from real professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button size="lg" asChild>
                  <Link href="/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <div className="flex items-center text-sm text-muted-foreground">
                  99€/month, 20 leads
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Quality Guaranteed</p>
                  <p className="text-sm text-muted-foreground">
                    Every lead manually verified before publishing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple process for both scouts and companies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Scouts */}
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                  S
                </span>
                For Scouts
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Submit Lead",
                    description:
                      "Found a company that needs a service? Submit it through our mobile app with details",
                  },
                  {
                    step: "2",
                    title: "We Verify",
                    description:
                      "Our team reviews your submission within 24 hours for quality and accuracy",
                  },
                  {
                    step: "3",
                    title: "Get Paid Weekly",
                    description:
                      "When a company purchases your lead, you earn 50% of the price. Paid every Friday",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Companies */}
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  C
                </span>
                For Companies
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Subscribe to Plan",
                    description:
                      "Choose your monthly plan based on lead volume needs (Starter, Growth, or Scale)",
                  },
                  {
                    step: "2",
                    title: "Browse Leads",
                    description:
                      "Filter verified leads by category, budget, and timeline to find perfect matches",
                  },
                  {
                    step: "3",
                    title: "Purchase with Credits",
                    description:
                      "Use 1 credit to unlock full contact details and reach out to prospects directly",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">
                      "Generated 1,200€ in first month"
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      I was skeptical at first, but LeadScout made it incredibly easy
                      to monetize my network. The verification process is smooth and
                      payouts are reliable.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-accent/20" />
                      <div className="text-sm">
                        <p className="font-medium">Marc D.</p>
                        <p className="text-muted-foreground">Scout, Luxembourg</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">
                      "80% cheaper than our old lead gen"
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      We've cut our lead acquisition costs dramatically while
                      improving quality. Every lead is pre-qualified and comes from a
                      real person's network.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20" />
                      <div className="text-sm">
                        <p className="font-medium">Sophie L.</p>
                        <p className="text-muted-foreground">CEO, IT Services</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Why Choose LeadScout
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Quality Verified",
                description:
                  "Every lead manually reviewed by our team before going live in the marketplace",
              },
              {
                icon: Zap,
                title: "Weekly Payouts",
                description:
                  "Scouts get paid every Friday automatically via Stripe. No minimum thresholds, no delays",
              },
              {
                icon: Users,
                title: "Fair Pricing",
                description:
                  "Transparent credit-based system. Companies pay only for leads they need, scouts earn 50%",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-2">
                <CardContent className="pt-6">
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to Start?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our network of professional scouts and forward-thinking companies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
              <Link href="#download-app">
                Scouts: Download App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-up">
                Companies: Start Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-foreground">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <Logo className="mb-4" />
              <p className="text-sm text-muted-foreground">
                Connecting professionals with opportunities
              </p>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} LeadScout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

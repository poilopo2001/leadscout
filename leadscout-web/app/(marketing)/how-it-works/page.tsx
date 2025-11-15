import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  CreditCard,
  Download,
  Upload,
  DollarSign,
  UserCheck,
  Smartphone,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/30 to-background py-20">
        <div className="container max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="outline">
              How It Works
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              Two-Sided Marketplace for B2B Leads
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              LeadScout connects scouts who submit quality leads with companies
              looking for qualified business opportunities
            </p>
          </div>
        </div>
      </section>

      {/* Tabbed Content */}
      <section className="py-20">
        <div className="container max-w-6xl">
          <Tabs defaultValue="companies" className="space-y-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="companies">For Companies</TabsTrigger>
              <TabsTrigger value="scouts">For Scouts</TabsTrigger>
            </TabsList>

            {/* For Companies */}
            <TabsContent value="companies" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  Get Qualified Leads in 3 Simple Steps
                </h2>
                <p className="text-lg text-muted-foreground">
                  Access pre-qualified business opportunities from real people
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <Card className="relative border-2">
                  <div className="absolute -top-4 left-6">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                      1
                    </div>
                  </div>
                  <CardContent className="pt-10">
                    <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Choose Your Plan
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Select a subscription plan that fits your needs. Start with
                      20 credits/month for €99 or scale up to 150 credits for
                      €499.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>No setup fees</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Cancel anytime</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Credits renew monthly</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="relative border-2">
                  <div className="absolute -top-4 left-6">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                      2
                    </div>
                  </div>
                  <CardContent className="pt-10">
                    <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Browse Verified Leads
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Explore our marketplace of human-verified leads. Filter by
                      category, budget range, and quality score to find the
                      perfect match.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>All leads manually reviewed</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Quality score ratings</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Real-time updates</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="relative border-2">
                  <div className="absolute -top-4 left-6">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                      3
                    </div>
                  </div>
                  <CardContent className="pt-10">
                    <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Purchase & Contact
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Use 1 credit to purchase a lead and get instant access to
                      full contact details. Reach out directly to close the deal.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Instant contact reveal</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Purchase history tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Export to CRM</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center pt-8">
                <Button size="lg" asChild>
                  <Link href="/sign-up">Start Free Trial</Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  No credit card required
                </p>
              </div>
            </TabsContent>

            {/* For Scouts */}
            <TabsContent value="scouts" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  Turn Your Network into Revenue
                </h2>
                <p className="text-lg text-muted-foreground">
                  Earn €500-€2,000 per month by submitting quality business
                  leads
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <Card className="relative border-2">
                  <div className="absolute -top-4 left-6">
                    <div className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold">
                      1
                    </div>
                  </div>
                  <CardContent className="pt-10">
                    <div className="mb-4 h-12 w-12 rounded-lg bg-teal-600/10 flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Download the App
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Get the LeadScout mobile app for iOS or Android. Sign up
                      in seconds and start submitting leads immediately.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Free to join</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>No upfront costs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Easy onboarding</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="relative border-2">
                  <div className="absolute -top-4 left-6">
                    <div className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold">
                      2
                    </div>
                  </div>
                  <CardContent className="pt-10">
                    <div className="mb-4 h-12 w-12 rounded-lg bg-teal-600/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Submit Quality Leads
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Use your professional network to identify companies looking
                      for services. Submit detailed lead information through our
                      simple 4-step form.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Takes less than 2 minutes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Attach photos/documents</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Track submission status</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="relative border-2">
                  <div className="absolute -top-4 left-6">
                    <div className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold">
                      3
                    </div>
                  </div>
                  <CardContent className="pt-10">
                    <div className="mb-4 h-12 w-12 rounded-lg bg-teal-600/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Get Paid Weekly
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Earn 50% commission when your lead sells. Get paid
                      automatically every Friday via Stripe to your bank account.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Automated payouts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Minimum €20 payout</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Bank-level security</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center pt-8">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                  <Download className="h-5 w-5 mr-2" />
                  Download App
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Available on iOS and Android
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why LeadScout Works</h2>
            <p className="text-lg text-muted-foreground">
              Built on trust, quality, and transparency
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Human-Verified Quality
                </h3>
                <p className="text-sm text-muted-foreground">
                  Every lead is manually reviewed by our team before going live to
                  ensure accuracy and relevance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fair Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Pay-as-you-go credit system. Only pay for leads you want, with
                  transparent pricing and no hidden fees.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Quality Guarantee
                </h3>
                <p className="text-sm text-muted-foreground">
                  Unhappy with a lead? Contact us within 48 hours for a full
                  credit refund. Your satisfaction is guaranteed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of companies and scouts already using LeadScout
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">For Companies →</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
              <Download className="h-5 w-5 mr-2" />
              For Scouts
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

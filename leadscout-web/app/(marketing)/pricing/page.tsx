import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { PRICING, type PlanType } from "@/lib/constants";

export const metadata = {
  title: "Pricing",
  description: "Choose the perfect plan for your lead generation needs",
};

export default function PricingPage() {
  const plans: Array<{
    key: PlanType;
    cta: string;
    ctaVariant: "default" | "outline";
  }> = [
    { key: "starter", cta: "Start Trial", ctaVariant: "outline" },
    { key: "growth", cta: "Start Trial", ctaVariant: "default" },
    { key: "scale", cta: "Contact Sales", ctaVariant: "outline" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center">
          <Link href="/" className="text-lg font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>

      <main className="flex-1">
        <section className="py-16 lg:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Choose Your Plan
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transparent pricing. No hidden fees. Cancel anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map(({ key, cta, ctaVariant }) => {
                const plan = PRICING[key];
                const isPopular = plan.popular;

                return (
                  <Card
                    key={key}
                    className={isPopular ? "border-primary border-2 relative" : ""}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">€{plan.price}</span>
                        <span className="text-muted-foreground">/{plan.interval}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.credits} lead credits per month
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full mb-6"
                        variant={ctaVariant}
                        asChild
                      >
                        <Link href="/sign-up">{cta}</Link>
                      </Button>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto space-y-6 text-left">
                {[
                  {
                    q: "What happens if I don't use all my credits?",
                    a: "Credits expire at the end of each billing cycle and do not roll over. We recommend choosing a plan that matches your typical monthly needs.",
                  },
                  {
                    q: "Can I upgrade or downgrade anytime?",
                    a: "Yes! You can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.",
                  },
                  {
                    q: "How are leads verified?",
                    a: "Every lead is manually reviewed by our team within 24 hours. We verify contact information, budget estimates, and ensure the opportunity is legitimate before publishing.",
                  },
                  {
                    q: "Is there a free trial?",
                    a: "We offer a 7-day free trial on the Starter plan so you can explore the marketplace and see the quality of leads before committing.",
                  },
                ].map((faq) => (
                  <div key={faq.q} className="border-b pb-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

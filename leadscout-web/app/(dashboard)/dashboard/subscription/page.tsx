"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING, PlanType } from "@/lib/constants";
import { Check, CreditCard, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SubscriptionPage() {
  const company = useQuery(api.queries.companies.getCurrentUser);
  const billingHistory = useQuery(api.queries.companies.getBillingHistory);
  const createCheckout = useAction(api.actions.stripe.createCheckoutSession);
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (company === undefined || billingHistory === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentPlan = company.plan;

  const handleUpgrade = async (plan: PlanType) => {
    if (plan === currentPlan) {
      toast.info("You're already on this plan");
      return;
    }

    setIsUpgrading(true);
    try {
      const checkoutUrl = await createCheckout({ planSlug: plan });
      window.location.href = checkoutUrl;
    } catch (error: any) {
      toast.error("Failed to create checkout session", {
        description: error.message,
      });
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const portalUrl = await createCheckout({ planSlug: currentPlan! });
      window.open(portalUrl, "_blank");
    } catch (error: any) {
      toast.error("Failed to open billing portal", {
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Button variant="outline" onClick={handleManageSubscription}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage in Stripe
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {PRICING[currentPlan].name} Plan
                  </h3>
                  <p className="text-3xl font-bold text-primary mt-1">
                    €{PRICING[currentPlan].price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  Active
                </Badge>
              </div>

              <div className="grid gap-2">
                {PRICING[currentPlan].features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next billing:</span>
                  <span className="font-medium">
                    {company.nextRenewalDate
                      ? new Date(company.nextRenewalDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">
                    Credits renew:
                  </span>
                  <span className="font-medium">
                    {company.nextRenewalDate
                      ? new Date(company.nextRenewalDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Options */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {currentPlan ? "Upgrade Your Plan" : "Choose Your Plan"}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(PRICING) as PlanType[]).map((planKey) => {
            const plan = PRICING[planKey];
            const isCurrent = planKey === currentPlan;
            const isPopular = plan.popular;

            return (
              <Card
                key={planKey}
                className={
                  isPopular
                    ? "border-primary relative"
                    : isCurrent
                    ? "border-2 border-green-600"
                    : ""
                }
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.credits} credits per month
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || isUpgrading}
                    onClick={() => handleUpgrade(planKey)}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : isUpgrading
                      ? "Loading..."
                      : planKey === "scale"
                      ? "Contact Sales"
                      : "Upgrade Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {billingHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No billing history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {billingHistory.map((invoice: any) => (
                <div
                  key={invoice._id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">€{invoice.amount.toFixed(2)}</p>
                      <Badge variant="outline" className="mt-1">
                        {invoice.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

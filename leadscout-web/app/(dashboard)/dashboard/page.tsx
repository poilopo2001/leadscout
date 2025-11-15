"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CreditCard, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";

export default function DashboardPage() {
  // Use getMyAnalytics for dashboard stats (last 30 days)
  const startDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const endDate = Date.now();

  const analytics = useQuery(api.queries.companies.getMyAnalytics, {
    startDate,
    endDate,
  });

  const purchasesData = useQuery(api.queries.companies.getMyPurchases, {
    limit: 5,
  });

  if (analytics === undefined || purchasesData === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Map analytics data to stats format expected by components
  const stats = {
    creditsRemaining: analytics.overview.creditsRemaining,
    creditsAllocated: analytics.overview.creditsAllocated,
    totalLeadsPurchased: analytics.overview.totalPurchases,
    totalSpend: analytics.overview.totalSpent,
    avgLeadCost: analytics.overview.avgPricePerLead,
  };

  const recentPurchases = purchasesData.purchases;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your overview
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Credits Remaining"
          value={stats.creditsRemaining}
          subtitle={`of ${stats.creditsAllocated} total`}
          icon={CreditCard}
        />
        <StatCard
          title="Leads Purchased"
          value={stats.totalLeadsPurchased}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Spent"
          value={`€${stats.totalSpend.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Avg Cost/Lead"
          value={`€${stats.avgLeadCost.toFixed(2)}`}
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard/marketplace">Browse New Leads</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/purchases">View Purchases</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/subscription">Upgrade Plan</Link>
        </Button>
      </div>

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Purchases</CardTitle>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/purchases">View All →</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentPurchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No purchases yet</p>
              <Button variant="link" asChild>
                <Link href="/dashboard/marketplace">Browse Leads</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPurchases.map((purchase: any) => (
                <div
                  key={purchase._id}
                  className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{purchase.lead?.title || "Lead"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{purchase.lead?.category || "Unknown"}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/purchases#${purchase._id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Alert */}
      {stats.creditsRemaining < stats.creditsAllocated * 0.2 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-warning/10 p-3">
                <CreditCard className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Running Low on Credits</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You have {stats.creditsRemaining} credits remaining. Consider
                  upgrading your plan to continue accessing quality leads.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/subscription">Upgrade Now</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

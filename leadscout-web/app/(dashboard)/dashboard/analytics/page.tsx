"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Target } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0066FF", "#00B8A9", "#FF6B35", "#10B981", "#3B82F6", "#F59E0B"];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");

  const startDate =
    Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000;
  const endDate = Date.now();

  const analytics = useQuery(api.queries.companies.getMyAnalytics, {
    startDate,
    endDate,
  });

  if (analytics === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { summary, categoryPerformance, spendingTrend } = analytics;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your lead purchasing activity
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={summary.totalLeadsPurchased}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Spent"
          value={`€${summary.totalSpend.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Avg Lead Cost"
          value={`€${summary.avgLeadCost.toFixed(2)}`}
          icon={Target}
        />
        <StatCard
          title="Avg Quality"
          value={`${summary.avgLeadQuality.toFixed(1)}/10`}
          icon={TrendingUp}
        />
      </div>

      {/* Spending Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {spendingTrend.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No spending data available for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `€${value.toFixed(2)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke="#0066FF"
                  strokeWidth={2}
                  name="Spending (€)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryPerformance.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No category data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leadsCount" fill="#0066FF" name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryPerformance.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No category data available
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      dataKey="totalSpend"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `€${value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {categoryPerformance.map((cat, index) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{cat.category}</span>
                      </div>
                      <div className="flex gap-4 text-muted-foreground">
                        <span>{cat.leadsCount} leads</span>
                        <span>€{cat.totalSpend.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryPerformance.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No category data available
            </div>
          ) : (
            <div className="space-y-3">
              {categoryPerformance.map((cat, index) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {cat.leadsCount}
                    </div>
                    <div>
                      <p className="font-semibold">{cat.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {cat.leadsCount} leads purchased
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{cat.totalSpend.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: €{cat.avgCost.toFixed(2)}/lead
                    </p>
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

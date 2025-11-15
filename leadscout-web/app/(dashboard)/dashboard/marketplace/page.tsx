"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LeadCard } from "@/components/dashboard/LeadCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LEAD_CATEGORIES } from "@/lib/constants";
import { Search } from "lucide-react";

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [budgetMin, setBudgetMin] = useState<number | undefined>();
  const [budgetMax, setBudgetMax] = useState<number | undefined>();

  const leads = useQuery(api.queries.leads.listAvailable, {
    category: selectedCategory,
    budgetMin,
    budgetMax,
  });

  const resetFilters = () => {
    setSelectedCategory(undefined);
    setBudgetMin(undefined);
    setBudgetMax(undefined);
  };

  if (leads === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Filters Sidebar */}
      <aside className="w-64 shrink-0 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Category
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-categories"
                      checked={!selectedCategory}
                      onCheckedChange={() => setSelectedCategory(undefined)}
                    />
                    <label
                      htmlFor="all-categories"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      All Categories
                    </label>
                  </div>
                  {LEAD_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={selectedCategory === category}
                        onCheckedChange={(checked) =>
                          setSelectedCategory(checked ? category : undefined)
                        }
                      />
                      <label
                        htmlFor={`cat-${category}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">
                  Budget Range
                </Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min (€)"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={budgetMin || ""}
                      onChange={(e) =>
                        setBudgetMin(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Max (€)"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={budgetMax || ""}
                      onChange={(e) =>
                        setBudgetMax(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Lead Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Lead Marketplace</h1>
            <p className="text-muted-foreground mt-1">
              {leads.length} lead{leads.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option>Sort: Newest First</option>
            <option>Sort: Budget (High to Low)</option>
            <option>Sort: Budget (Low to High)</option>
            <option>Sort: Quality Score</option>
          </select>
        </div>

        {leads.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No leads found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or check back later for new opportunities
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead: any) => (
              <LeadCard key={lead._id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

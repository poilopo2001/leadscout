"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LEAD_CATEGORIES } from "@/lib/constants";
import { useState } from "react";
import { X } from "lucide-react";

interface MarketplaceFiltersProps {
  filters: {
    category?: string;
    budgetMin?: number;
    budgetMax?: number;
    minQualityScore?: number;
  };
  onChange: (filters: any) => void;
}

export function MarketplaceFilters({
  filters,
  onChange,
}: MarketplaceFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.category ? [filters.category] : []
  );

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [category]; // Single selection for now

    setSelectedCategories(newCategories);
    onChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories[0] : undefined,
    });
  };

  const handleBudgetChange = (min?: number, max?: number) => {
    onChange({
      ...filters,
      budgetMin: min,
      budgetMax: max,
    });
  };

  const handleQualityChange = (score: number) => {
    onChange({
      ...filters,
      minQualityScore: score,
    });
  };

  const handleReset = () => {
    setSelectedCategories([]);
    onChange({
      category: undefined,
      budgetMin: undefined,
      budgetMax: undefined,
      minQualityScore: undefined,
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.budgetMin ||
    filters.budgetMax ||
    filters.minQualityScore;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Category</Label>
            <div className="space-y-2">
              {LEAD_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`filter-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={`filter-${category}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Budget Range (€)</Label>
            <div className="space-y-2">
              <div>
                <Label htmlFor="budgetMin" className="text-xs text-muted-foreground">
                  Minimum
                </Label>
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="0"
                  value={filters.budgetMin || ""}
                  onChange={(e) =>
                    handleBudgetChange(
                      e.target.value ? parseInt(e.target.value) : undefined,
                      filters.budgetMax
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="budgetMax" className="text-xs text-muted-foreground">
                  Maximum
                </Label>
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="100000"
                  value={filters.budgetMax || ""}
                  onChange={(e) =>
                    handleBudgetChange(
                      filters.budgetMin,
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Quality Score Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Minimum Quality Score
            </Label>
            <div className="space-y-2">
              <Input
                type="number"
                min={0}
                max={10}
                step={0.5}
                placeholder="e.g. 7.5"
                value={filters.minQualityScore || ""}
                onChange={(e) =>
                  handleQualityChange(
                    e.target.value ? parseFloat(e.target.value) : 0
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Filter leads with quality score of {filters.minQualityScore || 0}
                + out of 10
              </p>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Active filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                    <span>{filters.category}</span>
                    <button
                      onClick={() =>
                        onChange({ ...filters, category: undefined })
                      }
                      className="hover:text-primary/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {(filters.budgetMin || filters.budgetMax) && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                    <span>
                      €{filters.budgetMin || 0} - €
                      {filters.budgetMax || "∞"}
                    </span>
                    <button
                      onClick={() =>
                        handleBudgetChange(undefined, undefined)
                      }
                      className="hover:text-primary/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.minQualityScore && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                    <span>Quality {filters.minQualityScore}+</span>
                    <button
                      onClick={() => handleQualityChange(0)}
                      className="hover:text-primary/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

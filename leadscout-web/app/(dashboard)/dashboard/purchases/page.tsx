"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Search, Download, Eye, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function PurchasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const purchasesData = useQuery(api.queries.companies.getMyPurchases, {
    limit: 100,
  });

  if (purchasesData === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredPurchases = purchasesData.purchases.filter((purchase) => {
    const leadTitle = purchase.lead?.title || "";
    const category = purchase.lead?.category || "";

    const matchesSearch =
      !searchQuery ||
      leadTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || purchase.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ["Date", "Title", "Category", "Budget", "Contact", "Status"];
    const rows = filteredPurchases.map((p) => [
      new Date(p.createdAt).toLocaleDateString(),
      p.lead?.title || "Lead",
      p.lead?.category || "Unknown",
      `€${p.lead?.estimatedBudget || 0}`,
      p.lead?.contactEmail || "",
      p.status || "completed",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leadscout-purchases-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Purchases</h1>
          <p className="text-muted-foreground">
            View and manage all your purchased leads
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search purchases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      {filteredPurchases.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No purchases found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Browse the marketplace to find qualified leads"}
              </p>
              <Button asChild>
                <Link href="/dashboard/marketplace">Browse Leads</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredPurchases.length} Purchase{filteredPurchases.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Lead Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase._id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {purchase.lead?.title || "Lead"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.lead?.category || "Unknown"}</Badge>
                    </TableCell>
                    <TableCell>€{(purchase.lead?.estimatedBudget || 0).toLocaleString()}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {purchase.lead?.contactEmail || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.status === "completed"
                            ? "default"
                            : purchase.status === "refunded"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {purchase.status || "completed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Show lead details in a dialog
                          alert(`Lead Details:\n\nCompany: ${purchase.lead?.companyName || "N/A"}\nContact: ${purchase.lead?.contactName || "N/A"}\nEmail: ${purchase.lead?.contactEmail || "N/A"}\nPhone: ${purchase.lead?.contactPhone || "N/A"}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

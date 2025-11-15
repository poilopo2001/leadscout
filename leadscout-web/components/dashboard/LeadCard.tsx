"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Briefcase, DollarSign, Calendar } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface LeadCardProps {
  lead: {
    _id: Id<"leads">;
    title: string;
    description: string;
    category: string;
    estimatedBudget: number;
    timeline?: string;
    qualityScore: number;
    companyName: string; // Masked
  };
}

export function LeadCard({ lead }: LeadCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const purchaseLead = useMutation(api.mutations.leads.purchase);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await purchaseLead({ leadId: lead._id });
      toast.success("Lead purchased!", {
        description: "Contact info has been revealed. Check My Purchases.",
      });
      setShowModal(false);
    } catch (error: any) {
      toast.error("Purchase failed", {
        description: error.message || "Unable to purchase lead. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowModal(true)}
      >
        <CardContent className="p-4">
          <Badge className="mb-2">{lead.category}</Badge>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
            {lead.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {lead.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Budget: €{lead.estimatedBudget.toLocaleString()}</span>
            </div>
            {lead.timeline && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{lead.timeline}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{lead.companyName}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {lead.qualityScore}
              </div>
              <span className="text-xs text-muted-foreground">Quality Score</span>
            </div>
            <Button size="sm" onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}>
              Purchase (1 credit)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{lead.title}</DialogTitle>
            <DialogDescription>
              Review lead details before purchasing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category
              </label>
              <div className="mt-1">
                <Badge>{lead.category}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="mt-1 text-sm">{lead.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Estimated Budget
                </label>
                <p className="mt-1 text-lg font-semibold">
                  €{lead.estimatedBudget.toLocaleString()}
                </p>
              </div>
              {lead.timeline && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Timeline
                  </label>
                  <p className="mt-1">{lead.timeline}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Company Information
              </label>
              <div className="mt-2 rounded-lg border p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Name:</strong> {lead.companyName}
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Full contact details will be revealed after purchase
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Purchase this lead for 1 credit</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Credits remaining after purchase: [Your credits - 1]
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Purchasing...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

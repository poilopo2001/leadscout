/**
 * Lead Mutations
 *
 * Write operations for lead creation, purchase, and moderation.
 * These mutations handle the core marketplace transactions.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  getCurrentScout,
  getCurrentCompany,
  requireRole,
  deductCredits,
  creditScoutEarnings,
  createNotification,
  canPurchaseLead,
  recordModerationAction,
  updateScoutBadge,
  generateLeadPrice,
  calculateScoutEarning,
  calculatePlatformCommission,
} from "../helpers";

/**
 * Create new lead (scout submission)
 * Validates input and creates lead in pending_review status
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    companyName: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    companyWebsite: v.optional(v.string()),
    estimatedBudget: v.number(),
    timeline: v.optional(v.string()),
    photos: v.array(v.string()), // Convex storage IDs
  },
  handler: async (ctx, args) => {
    const scout = await getCurrentScout(ctx);

    // Calculate sale price based on category
    const salePrice = generateLeadPrice(args.category, args.estimatedBudget);
    const estimatedEarnings = calculateScoutEarning(salePrice);

    // Calculate initial quality score
    const qualityFactors = {
      descriptionLength: Math.min(args.description.length / 500, 1) * 2, // 0-2 points
      contactCompleteness:
        args.contactName &&
        args.contactEmail &&
        args.contactPhone
          ? 2
          : 1, // 0-2 points
      budgetAccuracy: args.estimatedBudget >= 100 ? 2 : 1, // 0-2 points
      photoCount: Math.min(args.photos.length / 3, 1) * 2, // 0-2 points
      scoutReputation: (scout.qualityScore / 10) * 2, // 0-2 points based on scout's score
    };

    const qualityScore = Object.values(qualityFactors).reduce(
      (sum, val) => sum + val,
      0
    );

    // Create lead
    const leadId = await ctx.db.insert("leads", {
      scoutId: scout._id,
      title: args.title,
      description: args.description,
      category: args.category,
      companyName: args.companyName,
      contactName: args.contactName,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      companyWebsite: args.companyWebsite,
      estimatedBudget: args.estimatedBudget,
      timeline: args.timeline,
      photos: args.photos,
      status: "pending_review",
      moderationStatus: "pending",
      qualityScore,
      qualityFactors,
      salePrice,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update scout stats
    await ctx.db.patch(scout._id, {
      totalLeadsSubmitted: scout.totalLeadsSubmitted + 1,
    });

    // Create notification
    const scoutUser = await ctx.db.get(scout.userId);
    if (scoutUser) {
      await createNotification(
        ctx,
        scoutUser._id,
        "lead_approved",
        "Lead Submitted",
        `Your lead "${args.title}" has been submitted for review. You'll be notified when it's approved.`,
        { leadId, estimatedEarnings }
      );
    }

    return {
      leadId,
      estimatedEarnings,
      qualityScore,
    };
  },
});

/**
 * Purchase lead (company action)
 * Handles full transaction: deduct credits, mark sold, credit scout, notifications
 */
export const purchase = mutation({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const company = await getCurrentCompany(ctx);

    // Validate purchase eligibility
    const { canPurchase, reason } = await canPurchaseLead(
      ctx,
      args.leadId,
      company._id
    );

    if (!canPurchase) {
      throw new Error(reason ?? "Cannot purchase this lead");
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Calculate earnings
    const scoutEarning = calculateScoutEarning(lead.salePrice);
    const platformCommission = calculatePlatformCommission(lead.salePrice);

    // Execute transaction
    try {
      // 1. Deduct credit from company
      const newBalance = await deductCredits(
        ctx,
        company._id,
        1,
        `Purchase lead: ${lead.title}`,
        undefined // will set after creating purchase
      );

      // 2. Mark lead as sold
      await ctx.db.patch(args.leadId, {
        status: "sold",
        purchasedBy: company._id,
        purchasedAt: Date.now(),
        updatedAt: Date.now(),
      });

      // 3. Create purchase record
      const purchaseId = await ctx.db.insert("purchases", {
        companyId: company._id,
        leadId: args.leadId,
        scoutId: lead.scoutId,
        creditsUsed: 1,
        purchasePrice: lead.salePrice,
        scoutEarning,
        platformCommission,
        status: "completed",
        createdAt: Date.now(),
      });

      // 4. Update credit transaction with purchase ID
      const lastTransaction = await ctx.db
        .query("creditTransactions")
        .withIndex("by_company", (q) => q.eq("companyId", company._id))
        .order("desc")
        .first();

      if (lastTransaction) {
        await ctx.db.patch(lastTransaction._id, {
          relatedPurchaseId: purchaseId,
        });
      }

      // 5. Credit scout's pending earnings
      await creditScoutEarnings(ctx, lead.scoutId, scoutEarning);

      // 6. Update scout badge if threshold reached
      await updateScoutBadge(ctx, lead.scoutId);

      // 7. Create notifications
      const scout = await ctx.db.get(lead.scoutId);
      if (scout) {
        const scoutUser = await ctx.db.get(scout.userId);
        if (scoutUser) {
          await createNotification(
            ctx,
            scoutUser._id,
            "lead_sold",
            "Lead Sold!",
            `Your lead "${lead.title}" was purchased for ${lead.salePrice}€. You earned ${scoutEarning}€!`,
            {
              leadId: args.leadId,
              earnings: scoutEarning,
            }
          );
        }
      }

      const companyUser = await ctx.db.get(company.userId);
      if (companyUser) {
        await createNotification(
          ctx,
          companyUser._id,
          "new_matching_lead",
          "Lead Purchased",
          `You successfully purchased "${lead.title}". Contact details are now available.`,
          {
            leadId: args.leadId,
          }
        );
      }

      // Check if company is low on credits
      if (newBalance < 5) {
        await createNotification(
          ctx,
          companyUser!._id,
          "low_credits",
          "Low Credits",
          `You have ${newBalance} credits remaining. Consider upgrading your plan or purchasing more credits.`,
          { creditsRemaining: newBalance }
        );
      }

      // Return full lead details (contact info now revealed)
      return {
        purchaseId,
        lead: {
          ...lead,
          purchasedAt: Date.now(),
        },
        creditsRemaining: newBalance,
        earnings: scoutEarning,
      };
    } catch (error) {
      console.error("Purchase failed:", error);
      throw new Error("Failed to complete purchase. Please try again.");
    }
  },
});

/**
 * Approve lead (admin moderation)
 * Publishes lead to marketplace
 */
export const approve = mutation({
  args: {
    leadId: v.id("leads"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin"]);

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    if (lead.moderationStatus === "approved") {
      throw new Error("Lead already approved");
    }

    // Update lead status
    await ctx.db.patch(args.leadId, {
      status: "approved",
      moderationStatus: "approved",
      moderatedBy: admin._id,
      moderatedAt: Date.now(),
      moderationNotes: args.notes,
      updatedAt: Date.now(),
    });

    // Record moderation action
    await recordModerationAction(ctx, admin._id, args.leadId, "approved", args.notes);

    // Notify scout
    const scout = await ctx.db.get(lead.scoutId);
    if (scout) {
      const scoutUser = await ctx.db.get(scout.userId);
      if (scoutUser) {
        await createNotification(
          ctx,
          scoutUser._id,
          "lead_approved",
          "Lead Approved!",
          `Your lead "${lead.title}" has been approved and is now live in the marketplace!`,
          { leadId: args.leadId }
        );
      }
    }

    return { success: true };
  },
});

/**
 * Reject lead (admin moderation)
 * Removes lead from marketplace with reason
 */
export const reject = mutation({
  args: {
    leadId: v.id("leads"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin"]);

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Update lead status
    await ctx.db.patch(args.leadId, {
      status: "rejected",
      moderationStatus: "rejected",
      moderatedBy: admin._id,
      moderatedAt: Date.now(),
      moderationNotes: args.reason,
      updatedAt: Date.now(),
    });

    // Record moderation action
    await recordModerationAction(ctx, admin._id, args.leadId, "rejected", args.reason);

    // Notify scout
    const scout = await ctx.db.get(lead.scoutId);
    if (scout) {
      const scoutUser = await ctx.db.get(scout.userId);
      if (scoutUser) {
        await createNotification(
          ctx,
          scoutUser._id,
          "lead_approved", // Using same type for now
          "Lead Rejected",
          `Your lead "${lead.title}" was not approved. Reason: ${args.reason}`,
          { leadId: args.leadId, reason: args.reason }
        );
      }
    }

    return { success: true };
  },
});

/**
 * Request changes to lead (admin moderation)
 * Asks scout to revise and resubmit
 */
export const requestChanges = mutation({
  args: {
    leadId: v.id("leads"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin"]);

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Update lead status
    await ctx.db.patch(args.leadId, {
      moderationStatus: "changes_requested",
      moderatedBy: admin._id,
      moderatedAt: Date.now(),
      moderationNotes: args.notes,
      updatedAt: Date.now(),
    });

    // Record moderation action
    await recordModerationAction(
      ctx,
      admin._id,
      args.leadId,
      "changes_requested",
      args.notes
    );

    // Notify scout
    const scout = await ctx.db.get(lead.scoutId);
    if (scout) {
      const scoutUser = await ctx.db.get(scout.userId);
      if (scoutUser) {
        await createNotification(
          ctx,
          scoutUser._id,
          "lead_approved", // Using same type for now
          "Changes Requested",
          `Please revise your lead "${lead.title}". ${args.notes}`,
          { leadId: args.leadId, notes: args.notes }
        );
      }
    }

    return { success: true };
  },
});

/**
 * Update lead (scout revision after changes requested)
 * Scout can update lead based on admin feedback
 */
export const update = mutation({
  args: {
    leadId: v.id("leads"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    estimatedBudget: v.optional(v.number()),
    timeline: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const scout = await getCurrentScout(ctx);

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Verify ownership
    if (lead.scoutId !== scout._id) {
      throw new Error("Unauthorized: You can only edit your own leads");
    }

    // Can only update if changes requested or pending review
    if (
      lead.moderationStatus !== "changes_requested" &&
      lead.moderationStatus !== "pending"
    ) {
      throw new Error("Cannot edit this lead");
    }

    // Update lead
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title) updates.title = args.title;
    if (args.description) updates.description = args.description;
    if (args.contactName) updates.contactName = args.contactName;
    if (args.contactEmail) updates.contactEmail = args.contactEmail;
    if (args.contactPhone) updates.contactPhone = args.contactPhone;
    if (args.companyWebsite !== undefined)
      updates.companyWebsite = args.companyWebsite;
    if (args.estimatedBudget) updates.estimatedBudget = args.estimatedBudget;
    if (args.timeline !== undefined) updates.timeline = args.timeline;
    if (args.photos) updates.photos = args.photos;

    // Reset moderation status to pending
    updates.moderationStatus = "pending";
    updates.status = "pending_review";

    await ctx.db.patch(args.leadId, updates);

    return { success: true };
  },
});

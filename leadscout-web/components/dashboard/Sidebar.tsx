"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { DASHBOARD_NAV } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  ShoppingCart,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react";

const iconMap = {
  Home,
  Search,
  ShoppingCart,
  BarChart3,
  CreditCard,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const company = useQuery(api.queries.companies.getCurrentUser);

  return (
    <aside className="w-64 border-r bg-background flex flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Logo />
      </div>

      <nav className="space-y-1 p-4 flex-1">
        {DASHBOARD_NAV.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Credits Remaining
          </p>
          <p className="text-2xl font-bold text-foreground">
            {company?.company.creditsRemaining ?? "..."}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              /{company?.company.creditsAllocated ?? "..."}
            </span>
          </p>
          <Button size="sm" variant="outline" className="w-full mt-3" asChild>
            <Link href="/dashboard/subscription">Upgrade Plan</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}

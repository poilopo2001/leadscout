import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
        L
      </div>
      <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
    </Link>
  );
}

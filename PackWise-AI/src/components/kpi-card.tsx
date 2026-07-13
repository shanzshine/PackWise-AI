import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  hint?: string;
}

export function KpiCard({ label, value, delta, trend = "up", icon: Icon, hint }: KpiCardProps) {
  const positive = trend === "up";
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
            <Icon className="h-4 w-4" />
          </div>
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                positive ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : "bg-destructive/10 text-destructive",
              )}
            >
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {delta}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
import { cn } from "@/lib/utils";

export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex flex-col leading-none">
        <span className="text-[16px] font-bold tracking-tight text-foreground">
          Pack<span className="text-primary">Wise</span>
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/60">
          AI Platform
        </span>
      </div>
    </div>
  );
}
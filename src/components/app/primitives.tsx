import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Eye, TrendingUp, Lightbulb } from "lucide-react";
import { useContent } from "@/lib/content-repository";

export function DemoBadge({ className }: { className?: string }) {
  return <Badge variant="demo" className={className}>DEMO DATA</Badge>;
}

const evidence = {
  observed: { label: "Observed data", icon: Eye },
  pattern: { label: "Data-supported pattern", icon: TrendingUp },
  hypothesis: { label: "Hypothesis", icon: Lightbulb },
} as const;
export type EvidenceKind = keyof typeof evidence;

export function EvidenceTag({ kind }: { kind: EvidenceKind }) {
  const E = evidence[kind];
  return (
    <Badge variant={kind} className="gap-1 font-medium">
      <E.icon className="h-3 w-3" /> {E.label}
    </Badge>
  );
}

export function EvidenceItem({ kind, children, meta }: { kind: EvidenceKind; children: ReactNode; meta?: string }) {
  return (
    <div className="flex flex-col gap-2 border-b py-3.5 last:border-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="w-48 shrink-0"><EvidenceTag kind={kind} /></div>
      <div className="min-w-0 flex-1 text-sm leading-relaxed">{children}</div>
      {meta && <span className="shrink-0 font-mono text-xs text-muted-foreground">{meta}</span>}
    </div>
  );
}

export function Panel({ title, description, action, children, className, bodyClassName }: {
  title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-lg border bg-card shadow-card", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate font-sans text-sm font-semibold tracking-normal">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
          <SourceBadge />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

export function Metric({ label, value, delta, hint }: { label: string; value: string; delta?: string; hint?: string }) {
  return (
    <div className="min-w-0 px-4 py-3">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular">{value}</p>
      {(delta || hint) && <p className="mt-0.5 truncate text-xs text-muted-foreground">{delta && <span className="text-success">{delta}</span>} {hint}</p>}
    </div>
  );
}

export function SourceBadge() {
  const { source } = useContent();
  if (source === "demo") return <DemoBadge />;
  if (source === "imported") return <Badge variant="outline" className="text-muted-foreground" title="Kept in this browser only until storage is connected">TEMPORARY DATA</Badge>;
  return null;
}

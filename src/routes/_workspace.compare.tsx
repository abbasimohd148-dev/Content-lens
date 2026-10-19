import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader, Panel, EvidenceItem } from "@/components/app/primitives";
import { AiPlaceholder, EmptyContentState, InsufficientData } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContent } from "@/lib/content-repository";
import { engagementRate, fmt, fmtDuration, pct, type ContentItem } from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/compare")({
  head: () => ({ meta: [{ title: "Compare — ContentLens" }, { name: "description", content: "Compare two pieces of content side by side." }] }),
  component: Compare,
});

const rows: [string, (c: ContentItem) => string][] = [
  ["Views", (c) => fmt(c.views)],
  ["Retention", (c) => pct(c.retention)],
  ["Engagement", (c) => pct(engagementRate(c)?.value, 1)],
  ["Avg. watch", (c) => fmtDuration(c.avgWatchSec)],
  ["Duration", (c) => fmtDuration(c.durationSec)],
  ["Platform", (c) => c.platform ?? "—"],
  ["Topic", (c) => c.topic ?? "—"],
  ["Hook", (c) => (c.hook ? `"${c.hook}"` : "—")],
];

function Compare() {
  const { items } = useContent();
  const [a, setA] = useState<string>();
  const [b, setB] = useState<string>();
  const header = <PageHeader title="Compare" description="Why did these two pieces of content perform differently?"
    actions={<Button disabled title="Available once AI analysis is configured"><Sparkles /> Explain difference</Button>} />;
  if (items.length < 2) return <>{header}<EmptyContentState title="Need at least two items" body="Import content with two or more posts to compare them." /></>;
  const A = items.find((c) => c.id === a) ?? items[0]!;
  const B = items.find((c) => c.id === b) ?? items[1]!;
  const diffs: string[] = [];
  if (A.views !== null && B.views) diffs.push(`A received ${(A.views / B.views).toFixed(1)}× the views of B.`);
  if (A.retention !== null && B.retention !== null) diffs.push(`Retention differs by ${Math.abs(A.retention - B.retention).toFixed(0)} points (${A.retention >= B.retention ? "A" : "B"} higher).`);
  if (A.durationSec !== null && B.durationSec !== null) diffs.push(`A runs ${fmtDuration(A.durationSec)}; B runs ${fmtDuration(B.durationSec)}.`);

  return (
    <>
      {header}
      <Panel bodyClassName="p-0">
        <div className="grid grid-cols-[6rem_1fr_1fr] border-b text-sm sm:grid-cols-[7rem_1fr_1fr]">
          <div className="p-3" />
          {([[A.id, setA, "A"], [B.id, setB, "B"]] as const).map(([v, set, l]) => (
            <div key={l} className="min-w-0 border-l p-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Content {l}</p>
              <Select value={v} onValueChange={set}>
                <SelectTrigger aria-label={`Content ${l}`}><SelectValue /></SelectTrigger>
                <SelectContent>{items.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ))}
        </div>
        {rows.map(([label, f]) => (
          <div key={label} className="grid grid-cols-[6rem_1fr_1fr] border-b text-sm last:border-0 sm:grid-cols-[7rem_1fr_1fr]">
            <div className="p-3 text-xs text-muted-foreground">{label}</div>
            <div className="min-w-0 break-words border-l p-3 tabular">{f(A)}</div>
            <div className="min-w-0 break-words border-l p-3 tabular">{f(B)}</div>
          </div>
        ))}
      </Panel>
      <Panel title="Measured differences" className="mt-4" bodyClassName="py-0">
        {diffs.length ? diffs.map((d) => <EvidenceItem key={d} kind="observed">{d}</EvidenceItem>) : <InsufficientData>These items don't share enough metrics to compare.</InsufficientData>}
      </Panel>
      <Panel title="Why they differed" className="mt-4"><AiPlaceholder /></Panel>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader, Panel, EvidenceItem } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEMO_CONTENT, engagement, fmt, fmtDuration, type DemoContent } from "@/lib/demo-data";

export const Route = createFileRoute("/_workspace/compare")({
  head: () => ({ meta: [{ title: "Compare — ContentLens" }, { name: "description", content: "Compare two pieces of content side by side." }] }),
  component: Compare,
});

const rows: [string, (c: DemoContent) => string][] = [
  ["Views", (c) => fmt(c.views)],
  ["Retention", (c) => `${c.retention}%`],
  ["Engagement", (c) => `${engagement(c).toFixed(1)}%`],
  ["Duration", (c) => fmtDuration(c.durationSec)],
  ["Topic", (c) => c.topic],
  ["Hook", (c) => `"${c.hook}"`],
];

function Compare() {
  const [a, setA] = useState("6");
  const [b, setB] = useState("10");
  const A = DEMO_CONTENT.find((c) => c.id === a)!;
  const B = DEMO_CONTENT.find((c) => c.id === b)!;
  return (
    <>
      <PageHeader title="Compare" description="Why did these two pieces of content perform differently?"
        actions={<Button disabled title="AI analysis is available once the backend is connected"><Sparkles /> Explain difference</Button>} />
      <Panel bodyClassName="p-0">
        <div className="grid grid-cols-[7rem_1fr_1fr] border-b text-sm">
          <div className="p-3" />
          {[[a, setA], [b, setB]].map(([v, set], i) => (
            <div key={i} className="min-w-0 border-l p-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Content {i ? "B" : "A"}</p>
              <Select value={v as string} onValueChange={set as (v: string) => void}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEMO_CONTENT.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ))}
        </div>
        {rows.map(([label, f]) => (
          <div key={label} className="grid grid-cols-[7rem_1fr_1fr] border-b text-sm last:border-0">
            <div className="p-3 text-xs text-muted-foreground">{label}</div>
            <div className="min-w-0 border-l p-3 tabular">{f(A)}</div>
            <div className="min-w-0 border-l p-3 tabular">{f(B)}</div>
          </div>
        ))}
      </Panel>
      <Panel title="Major differences" description="Example analysis — illustrative layout" className="mt-4" bodyClassName="py-0">
        <EvidenceItem kind="observed">A received {(A.views / B.views).toFixed(1)}× the views of B, with {A.retention - B.retention} points higher retention.</EvidenceItem>
        <EvidenceItem kind="observed">A runs {fmtDuration(A.durationSec)}; B runs {fmtDuration(B.durationSec)}.</EvidenceItem>
        <EvidenceItem kind="pattern" meta="n=24">In your dataset, shorter tutorials tend to retain viewers longer than long-form reflections.</EvidenceItem>
        <EvidenceItem kind="hypothesis">A's hook previews the outcome; B's opens with context. That may explain part of the gap — test it before concluding.</EvidenceItem>
      </Panel>
    </>
  );
}

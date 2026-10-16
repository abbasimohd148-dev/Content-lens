import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader, Panel, Metric, EvidenceItem } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEMO_CONTENT, engagement, fmt, fmtDuration, median } from "@/lib/demo-data";

export const Route = createFileRoute("/_workspace/diagnosis")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s["id"] === "string" ? s["id"] : undefined }),
  head: () => ({ meta: [{ title: "Diagnosis — ContentLens" }, { name: "description", content: "Understand why a piece of content performed the way it did." }] }),
  component: Diagnosis,
});

function Diagnosis() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const c = DEMO_CONTENT.find((x) => x.id === id) ?? DEMO_CONTENT[0]!;
  const med = median(DEMO_CONTENT.map((x) => x.views));
  const medRet = median(DEMO_CONTENT.map((x) => x.retention));
  const ratio = c.views / med;

  return (
    <>
      <PageHeader title="Diagnosis" description="Why did this content perform this way — and what should you test next?"
        actions={<Button disabled title="AI analysis is available once the backend is connected"><Sparkles /> Analyze Performance</Button>} />
      <Select value={c.id} onValueChange={(v) => navigate({ search: { id: v } })}>
        <SelectTrigger className="mb-4 w-full sm:w-96"><SelectValue /></SelectTrigger>
        <SelectContent>{DEMO_CONTENT.map((x) => <SelectItem key={x.id} value={x.id}>{x.title}</SelectItem>)}</SelectContent>
      </Select>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={c.title} description={`${c.platform} · ${c.topic} · ${fmtDuration(c.durationSec)}`} className="lg:col-span-1">
          <p className="text-xs text-muted-foreground">Hook</p>
          <p className="mt-1 text-sm">"{c.hook}"</p>
          <div className="-mx-4 mt-4 grid grid-cols-3 divide-x border-t">
            <Metric label="Views" value={fmt(c.views)} />
            <Metric label="Retention" value={`${c.retention}%`} />
            <Metric label="Engage." value={`${engagement(c).toFixed(1)}%`} />
          </div>
        </Panel>
        <Panel title="Performance summary" description="Example analysis — illustrative layout" className="lg:col-span-2" bodyClassName="py-0">
          <EvidenceItem kind="observed" meta={`median ${fmt(med)}`}>This post received <b>{ratio.toFixed(1)}×</b> your median views.</EvidenceItem>
          <EvidenceItem kind="observed" meta={`median ${medRet}%`}>Retention was {c.retention}%, {c.retention >= medRet ? "above" : "below"} your historical median of {medRet}%.</EvidenceItem>
          <EvidenceItem kind="pattern" meta={`n=${DEMO_CONTENT.filter((x) => x.topic === c.topic).length}`}>Posts in {c.topic} have {c.topic === "AI Tutorials" ? "higher" : "different"} median retention than your other topics in this dataset.</EvidenceItem>
          <EvidenceItem kind="hypothesis">The hook states a concrete outcome up front, which may have helped early retention. This is correlation, not proof.</EvidenceItem>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Panel title="What likely helped"><ul className="list-disc space-y-1.5 pl-4 text-sm text-muted-foreground"><li>Specific, measurable promise in the hook</li><li>Duration close to your best-performing range</li></ul></Panel>
        <Panel title="What likely hurt"><ul className="list-disc space-y-1.5 pl-4 text-sm text-muted-foreground"><li>Slower middle section (drop-off around 40%)</li><li>Topic overlap with a recent upload</li></ul></Panel>
        <Panel title="What to test next" className="border-primary/30"><p className="text-sm">Open with the finished result before explaining the process, and keep it under 10 minutes.</p></Panel>
      </div>
    </>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader, Panel, Metric, EvidenceItem } from "@/components/app/primitives";
import { AiPlaceholder, EmptyContentState } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContent } from "@/lib/content-repository";
import { byTopic, engagementRate, fmt, fmtDuration, median, pct } from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/diagnosis")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s["id"] === "string" ? s["id"] : undefined }),
  head: () => ({ meta: [{ title: "Diagnosis — ContentLens" }, { name: "description", content: "Understand why a piece of content performed the way it did." }] }),
  component: Diagnosis,
});

function Diagnosis() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { items } = useContent();
  const header = <PageHeader title="Diagnosis" description="Why did this content perform this way — and what should you test next?"
    actions={<Button disabled title="Available once AI analysis is configured"><Sparkles /> Analyze Performance</Button>} />;
  if (!items.length) return <>{header}<EmptyContentState /></>;

  const c = items.find((x) => x.id === id) ?? items[0]!;
  const others = items.filter((x) => x.id !== c.id);
  const medViews = median(others.map((x) => x.views).filter((v): v is number => v !== null));
  const medRet = median(others.map((x) => x.retention).filter((v): v is number => v !== null));
  const topic = c.topic ? byTopic(items).find((t) => t.key === c.topic) : undefined;
  const eng = engagementRate(c);

  return (
    <>
      {header}
      <Select value={c.id} onValueChange={(v) => navigate({ search: { id: v } })}>
        <SelectTrigger className="mb-4 w-full sm:w-96" aria-label="Select content"><SelectValue /></SelectTrigger>
        <SelectContent>{items.map((x) => <SelectItem key={x.id} value={x.id}>{x.title}</SelectItem>)}</SelectContent>
      </Select>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={c.title} description={[c.platform, c.topic, fmtDuration(c.durationSec)].filter((x) => x && x !== "—").join(" · ")}>
          {c.hook && <><p className="text-xs text-muted-foreground">Hook</p><p className="mt-1 text-sm">"{c.hook}"</p></>}
          <div className="-mx-4 mt-4 grid grid-cols-3 divide-x border-t">
            <Metric label="Views" value={fmt(c.views)} />
            <Metric label="Retention" value={pct(c.retention)} />
            <Metric label="Engage." value={pct(eng?.value, 1)} hint={eng && eng.fieldsUsed < 4 ? `${eng.fieldsUsed}/4 fields` : undefined} />
          </div>
        </Panel>
        <Panel title="Performance summary" description="Calculated from your data" className="lg:col-span-2" bodyClassName="py-0">
          {c.views !== null && medViews ? <EvidenceItem kind="observed" meta={`median ${fmt(medViews)}`}>This post received <b>{(c.views / medViews).toFixed(1)}×</b> the median views of your other content.</EvidenceItem> : null}
          {c.retention !== null && medRet !== null ? <EvidenceItem kind="observed" meta={`median ${pct(medRet)}`}>Retention was {pct(c.retention)}, {c.retention >= medRet ? "above" : "below"} the median of your other content.</EvidenceItem> : null}
          {topic && !topic.lowSample && topic.lift ? <EvidenceItem kind="pattern" meta={`n=${topic.n}`}>{topic.key} posts have {topic.lift.toFixed(1)}× your overall median views.</EvidenceItem> : null}
          {(c.views === null || !medViews) && <p className="py-4 text-sm text-muted-foreground">Not enough comparable data to summarise this post yet.</p>}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Panel title="What likely helped"><AiPlaceholder /></Panel>
        <Panel title="What likely hurt"><AiPlaceholder /></Panel>
        <Panel title="What to test next"><AiPlaceholder /></Panel>
      </div>
    </>
  );
}

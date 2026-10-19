import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader, Panel, EvidenceItem, EvidenceTag } from "@/components/app/primitives";
import { AiPlaceholder, EmptyContentState, InsufficientData } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/content-repository";
import { byDuration, byPlatform, byTopic, pct } from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/recommendations")({
  head: () => ({ meta: [{ title: "Recommendations — ContentLens" }, { name: "description", content: "What should you create next, grounded in your data." }] }),
  component: Recs,
});

function Recs() {
  const { items } = useContent();
  const header = <PageHeader title="What should I create next?" description="Ideas grounded in your own history. Suggestions to test — never guarantees."
    actions={<Button disabled title="Available once AI analysis is configured"><Sparkles /> Generate ideas</Button>} />;
  if (!items.length) return <>{header}<EmptyContentState /></>;
  const reliable = <T extends { lowSample: boolean }>(g: T[]) => g.filter((x) => !x.lowSample);
  const topic = reliable(byTopic(items))[0];
  const dur = reliable(byDuration(items)).sort((a, b) => (b.medianRetention ?? -1) - (a.medianRetention ?? -1))[0];
  const plat = reliable(byPlatform(items))[0];

  return (
    <>
      {header}
      <Panel title="Starting points from your data" description="Calculated, not AI-generated" bodyClassName="py-0">
        {topic?.lift ? <EvidenceItem kind="pattern" meta={`n=${topic.n}`}>Strongest topic: <b>{topic.key}</b> ({topic.lift.toFixed(1)}× median views).</EvidenceItem> : null}
        {dur?.medianRetention != null ? <EvidenceItem kind="pattern" meta={`n=${dur.n}`}>Best-retaining length: <b>{dur.key}</b> ({pct(dur.medianRetention)} median retention).</EvidenceItem> : null}
        {plat?.lift ? <EvidenceItem kind="pattern" meta={`n=${plat.n}`}>Strongest platform: <b>{plat.key}</b> ({plat.lift.toFixed(1)}× median views).</EvidenceItem> : null}
        {!topic && !dur && !plat && <InsufficientData>Not enough posts per group for reliable starting points yet.</InsufficientData>}
      </Panel>

      <h2 className="mb-3 mt-8 font-sans text-sm font-semibold tracking-normal">Content ideas</h2>
      <article className="grid gap-4 rounded-lg border bg-card p-5 shadow-card md:grid-cols-[1fr_16rem]">
        <div className="space-y-3">
          <AiPlaceholder title="Ideas will be generated after AI is configured">Each idea will include a suggested hook, format, length and the evidence behind it, labelled as:</AiPlaceholder>
          <div className="flex flex-wrap gap-2"><EvidenceTag kind="observed" /><EvidenceTag kind="pattern" /><EvidenceTag kind="hypothesis" /></div>
        </div>
        <dl className="grid grid-cols-2 gap-2 self-start rounded-md bg-muted/60 p-3 text-xs md:grid-cols-1">
          {["Idea", "Suggested hook", "Format", "Duration", "Supporting evidence"].map((k) => (
            <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium text-muted-foreground">—</dd></div>
          ))}
        </dl>
      </article>
    </>
  );
}

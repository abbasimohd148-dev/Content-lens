import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, EvidenceItem } from "@/components/app/primitives";
import { Badge } from "@/components/ui/badge";
import { byTopic, DEMO_CONTENT, fmt, median } from "@/lib/demo-data";

export const Route = createFileRoute("/_workspace/patterns")({
  head: () => ({ meta: [{ title: "Winning Patterns — ContentLens" }, { name: "description", content: "Patterns across your historical content, with sample sizes." }] }),
  component: Patterns,
});

const ranges = [
  ["Under 1 min", 0, 60], ["1–5 min", 60, 300], ["5–10 min", 300, 600], ["10+ min", 600, 99999],
] as const;

function Patterns() {
  const topics = byTopic();
  const durations = ranges.map(([label, lo, hi]) => {
    const l = DEMO_CONTENT.filter((c) => c.durationSec >= lo && c.durationSec < hi);
    return { label, n: l.length, views: l.length ? median(l.map((c) => c.views)) : 0, ret: l.length ? median(l.map((c) => c.retention)) : 0 };
  });
  return (
    <>
      <PageHeader title="Winning Patterns" description="What tends to work for your audience. Every pattern shows its sample size." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="By topic" bodyClassName="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-4 py-2 font-medium">Topic</th><th className="px-4 py-2 text-right font-medium">Median views</th><th className="px-4 py-2 text-right font-medium">Lift</th><th className="px-4 py-2 text-right font-medium">n</th></tr></thead>
            <tbody>{topics.map((t) => (
              <tr key={t.topic} className="border-b last:border-0">
                <td className="px-4 py-2.5">{t.topic} {t.n < 3 && <Badge variant="outline" className="ml-1 text-[10px] text-muted-foreground">low sample</Badge>}</td>
                <td className="px-4 py-2.5 text-right tabular">{fmt(t.medianViews)}</td>
                <td className={`px-4 py-2.5 text-right tabular ${t.lift >= 1 ? "text-success" : "text-muted-foreground"}`}>{t.lift.toFixed(1)}×</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{t.n}</td>
              </tr>))}
            </tbody>
          </table>
        </Panel>
        <Panel title="By duration" bodyClassName="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-4 py-2 font-medium">Range</th><th className="px-4 py-2 text-right font-medium">Median views</th><th className="px-4 py-2 text-right font-medium">Retention</th><th className="px-4 py-2 text-right font-medium">n</th></tr></thead>
            <tbody>{durations.map((d) => (
              <tr key={d.label} className="border-b last:border-0">
                <td className="px-4 py-2.5">{d.label}</td>
                <td className="px-4 py-2.5 text-right tabular">{fmt(d.views)}</td>
                <td className="px-4 py-2.5 text-right tabular">{d.ret}%</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{d.n}</td>
              </tr>))}
            </tbody>
          </table>
        </Panel>
      </div>
      <Panel title="Interpretation" description="Example analysis — illustrative layout" className="mt-4" bodyClassName="py-0">
        <EvidenceItem kind="pattern" meta={`n=${topics[0].n}`}>{topics[0].topic} has {topics[0].lift.toFixed(1)}× the median views of your content overall.</EvidenceItem>
        <EvidenceItem kind="pattern" meta="n=24">Hooks that name a number or outcome appear more often in your top quartile.</EvidenceItem>
        <EvidenceItem kind="hypothesis">Opinion pieces may underperform because they lack a concrete promise. Not enough data yet for a reliable conclusion.</EvidenceItem>
      </Panel>
    </>
  );
}

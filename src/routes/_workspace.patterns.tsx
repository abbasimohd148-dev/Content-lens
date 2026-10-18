import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/primitives";
import { AiPlaceholder, EmptyContentState, InsufficientData } from "@/components/app/states";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/lib/content-repository";
import { byDuration, byPlatform, byTopic, fmt, pct, MIN_SAMPLE, type Group } from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/patterns")({
  head: () => ({ meta: [{ title: "Winning Patterns — ContentLens" }, { name: "description", content: "Patterns across your historical content, with sample sizes." }] }),
  component: Patterns,
});

function Patterns() {
  const { items } = useContent();
  const header = <PageHeader title="Winning Patterns" description={`What tends to work for your audience. Groups under ${MIN_SAMPLE} posts are flagged as low sample.`} />;
  if (!items.length) return <>{header}<EmptyContentState /></>;
  return (
    <>
      {header}
      <div className="grid gap-4 lg:grid-cols-2">
        <GroupTable title="By topic" groups={byTopic(items)} />
        <GroupTable title="By duration" groups={byDuration(items)} />
        <GroupTable title="By platform" groups={byPlatform(items)} />
        <Panel title="Interpretation"><AiPlaceholder>AI-written interpretation of these patterns will appear here once the AI service is connected. The tables are calculated directly from your data.</AiPlaceholder></Panel>
      </div>
    </>
  );
}

function GroupTable({ title, groups }: { title: string; groups: Group[] }) {
  return (
    <Panel title={title} bodyClassName="p-0">
      {!groups.length ? <InsufficientData>No data for this dimension.</InsufficientData> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-4 py-2 font-medium">Group</th><th className="px-4 py-2 text-right font-medium">Median views</th><th className="px-4 py-2 text-right font-medium">Retention</th><th className="px-4 py-2 text-right font-medium">Engage.</th><th className="px-4 py-2 text-right font-medium">Lift</th><th className="px-4 py-2 text-right font-medium">n</th></tr></thead>
            <tbody>{groups.map((t) => (
              <tr key={t.key} className="border-b last:border-0">
                <td className="px-4 py-2.5">{t.key} {t.lowSample && <Badge variant="outline" className="ml-1 text-[10px] text-muted-foreground">low sample</Badge>}</td>
                <td className="px-4 py-2.5 text-right tabular">{fmt(t.medianViews)}</td>
                <td className="px-4 py-2.5 text-right tabular">{pct(t.medianRetention)}</td>
                <td className="px-4 py-2.5 text-right tabular">{pct(t.avgEngagement, 1)}</td>
                <td className={`px-4 py-2.5 text-right tabular ${t.lift !== null && t.lift >= 1 ? "text-success" : "text-muted-foreground"}`}>{t.lift === null ? "—" : `${t.lift.toFixed(1)}×`}</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{t.n}</td>
              </tr>))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

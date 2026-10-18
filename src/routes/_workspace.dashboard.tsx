import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader, Panel, Metric, EvidenceItem } from "@/components/app/primitives";
import { PerformanceChart, GroupBars } from "@/components/app/PerformanceChart";
import { ContentTable } from "@/components/app/ContentTable";
import { EmptyContentState, InsufficientData } from "@/components/app/states";
import { useContent } from "@/lib/content-repository";
import { byDuration, byPlatform, byTopic, fmt, pct, summarize, timeline, topAndBottom, MIN_SAMPLE } from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ContentLens" }, { name: "description", content: "Your content performance overview." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { items } = useContent();
  if (!items.length) return (<><PageHeader title="Dashboard" description="How your content is performing, and where to look next." /><EmptyContentState /></>);

  const s = summarize(items);
  const { top, bottom } = topAndBottom(items);
  const topics = byTopic(items);
  const durations = byDuration(items);
  const platforms = byPlatform(items);
  const series = timeline(items);
  const best = topics.find((t) => !t.lowSample);
  const bestDur = [...durations].filter((d) => !d.lowSample).sort((a, b) => (b.medianRetention ?? -1) - (a.medianRetention ?? -1))[0];

  return (
    <>
      <PageHeader title="Dashboard" description="How your content is performing, and where to look next." />
      <div className="grid grid-cols-2 divide-x divide-y rounded-lg border bg-card shadow-card sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        <Metric label="Total views" value={fmt(s.totalViews)} hint={s.withViews < s.count ? `${s.withViews}/${s.count} with views` : undefined} />
        <Metric label="Average views" value={fmt(s.avgViews)} />
        <Metric label="Median views" value={fmt(s.medianViews)} />
        <Metric label="Avg. retention" value={pct(s.avgRetention)} hint={s.retentionN < s.count ? `n=${s.retentionN}` : undefined} />
        <Metric label="Engagement rate" value={pct(s.engagementRate, 1)} hint={s.engagementFields.length < 4 ? `uses ${s.engagementFields.join(", ") || "no fields"}` : "(L+C+S+S) ÷ views"} />
        <Metric label="Content analyzed" value={String(s.count)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Performance over time" description="Views per post by publish date" className="lg:col-span-2">
          {series.length >= 2 ? <PerformanceChart data={series} /> : <InsufficientData>Needs at least 2 posts with a date and views.</InsufficientData>}
        </Panel>
        <Panel title="Topic performance" description="Median views vs. your overall median" action={<Link to="/patterns" className="text-xs text-primary hover:underline">All</Link>}>
          {topics.length ? <GroupBars rows={topics.slice(0, 6)} /> : <InsufficientData>No topic column in your data.</InsufficientData>}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Performance by duration">{durations.length ? <GroupBars rows={durations} /> : <InsufficientData>No duration data.</InsufficientData>}</Panel>
        <Panel title="Platform performance">{platforms.length ? <GroupBars rows={platforms} /> : <InsufficientData>No platform data.</InsufficientData>}</Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top performing" bodyClassName="p-0">{top.length ? <ContentTable items={top} compact /> : <InsufficientData>Need at least 2 posts with views.</InsufficientData>}</Panel>
        <Panel title="Underperforming" bodyClassName="p-0">{bottom.length ? <ContentTable items={bottom} compact /> : <InsufficientData>Need at least 2 posts with views.</InsufficientData>}</Panel>
      </div>

      <Panel title="Winning patterns & opportunities" description={`Calculated from your data. Groups with fewer than ${MIN_SAMPLE} posts are excluded.`} className="mt-4" bodyClassName="py-0">
        {best?.lift ? <EvidenceItem kind="pattern" meta={`n=${best.n}`}>{best.key} has {best.lift.toFixed(1)}× your overall median views.</EvidenceItem> : null}
        {bestDur?.medianRetention != null ? <EvidenceItem kind="pattern" meta={`n=${bestDur.n}`}>{bestDur.key} posts have the highest median retention ({pct(bestDur.medianRetention)}).</EvidenceItem> : null}
        {!best && !bestDur && <InsufficientData>Not enough data per group yet to identify reliable patterns.</InsufficientData>}
        <div className="py-3">
          <Link to="/recommendations" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">See what to create next <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </Panel>
    </>
  );
}

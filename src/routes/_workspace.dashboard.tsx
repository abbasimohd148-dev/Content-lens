import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader, Panel, Metric, EvidenceItem } from "@/components/app/primitives";
import { PerformanceChart } from "@/components/app/PerformanceChart";
import { ContentTable } from "@/components/app/ContentTable";
import { DEMO_CONTENT, byTopic, fmt, summary } from "@/lib/demo-data";

export const Route = createFileRoute("/_workspace/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ContentLens" }, { name: "description", content: "Your content performance overview." }] }),
  component: Dashboard,
});

function Dashboard() {
  const s = summary();
  const sorted = [...DEMO_CONTENT].sort((a, b) => b.views - a.views);
  const topics = byTopic();
  return (
    <>
      <PageHeader title="Dashboard" description="How your content is performing, and where to look next." />
      <div className="grid grid-cols-2 divide-x divide-y rounded-lg border bg-card shadow-card sm:grid-cols-5 sm:divide-y-0">
        <Metric label="Total views" value={fmt(s.totalViews)} />
        <Metric label="Median views" value={fmt(s.medianViews)} />
        <Metric label="Avg. retention" value={`${s.avgRetention.toFixed(0)}%`} />
        <Metric label="Engagement rate" value={`${s.avgEngagement.toFixed(1)}%`} hint="(L+C+S+S) ÷ views" />
        <Metric label="Content analyzed" value={String(s.count)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Performance over time" description="Views per post, Mar – Jun" className="lg:col-span-2">
          <PerformanceChart />
        </Panel>
        <Panel title="Winning patterns" description="Topic median views vs. your overall median" action={<Link to="/patterns" className="text-xs text-primary hover:underline">All</Link>} bodyClassName="space-y-3">
          {topics.slice(0, 5).map((t) => (
            <div key={t.topic}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="truncate">{t.topic}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{t.lift.toFixed(1)}× · n={t.n}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (t.lift / topics[0].lift) * 100)}%` }} />
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top performing" bodyClassName="p-0"><ContentTable items={sorted.slice(0, 5)} compact /></Panel>
        <Panel title="Underperforming" bodyClassName="p-0"><ContentTable items={sorted.slice(-5).reverse()} compact /></Panel>
      </div>

      <Panel title="Biggest opportunities" className="mt-4" bodyClassName="py-0">
        <EvidenceItem kind="observed" meta="n=24">Videos over 12 minutes sit at a median 39% retention, versus 63% for 8–10 minute videos.</EvidenceItem>
        <EvidenceItem kind="pattern" meta="n=8">AI Tutorials earn about {topics[0].lift.toFixed(1)}× your median views — your strongest topic in this dataset.</EvidenceItem>
        <EvidenceItem kind="hypothesis">Hooks that show the finished result first may hold attention better. Test this on your next two uploads.</EvidenceItem>
        <div className="py-3">
          <Link to="/recommendations" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">See what to create next <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </Panel>
    </>
  );
}

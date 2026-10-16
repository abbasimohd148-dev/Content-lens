import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, FileUp, LineChart, Sparkles, Lightbulb } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { DemoBadge, EvidenceItem, Metric } from "@/components/app/primitives";
import { PerformanceChart } from "@/components/app/PerformanceChart";
import { byTopic, fmt, summary } from "@/lib/demo-data";
import { PLANS, PLAN_ORDER } from "@/config/pricing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ContentLens — Stop guessing what your audience wants" },
      { name: "description", content: "ContentLens learns from your own content performance data, explains what worked, and tells you what to create next." },
      { property: "og:title", content: "ContentLens — Stop guessing what your audience wants" },
      { property: "og:description", content: "An AI content performance copilot grounded in your own data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const scrollToHow = (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
};

const steps = [
  { icon: FileUp, t: "Import Content", d: "Upload a CSV of your posts and their metrics." },
  { icon: LineChart, t: "Analyze Performance", d: "Medians, retention and engagement — calculated, not guessed." },
  { icon: Sparkles, t: "Discover Patterns", d: "What tends to work for your audience, with sample sizes." },
  { icon: Lightbulb, t: "Decide What's Next", d: "Ideas and hooks grounded in your own history." },
];

function Landing() {
  const s = summary();
  const topics = byTopic();
  return (
    <div className="min-h-screen">
      <SiteNav />

      <section id="product" className="relative scroll-mt-16 overflow-hidden border-b">
        <div className="dot-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-24">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-primary">AI Content Performance Copilot</p>
            <h1 className="text-4xl font-semibold leading-[1.08] md:text-5xl">Stop guessing what your audience wants.</h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              ContentLens learns from your own performance data, explains why each post did what it did, and tells you what to test next.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-5"><Link to="/signup">Analyze My Content <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline" className="px-5"><a href="#how" onClick={scrollToHow}>See How It Works</a></Button>
            </div>
          </div>

          {/* Product preview */}
          <div className="mt-14 overflow-hidden rounded-xl border bg-card shadow-float">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="ml-3 text-xs text-muted-foreground">ContentLens · Dashboard</span>
              <DemoBadge className="ml-auto" />
            </div>
            <div className="grid grid-cols-2 divide-x border-b sm:grid-cols-4">
              <Metric label="Total views" value={fmt(s.totalViews)} />
              <Metric label="Median views" value={fmt(s.medianViews)} />
              <Metric label="Avg. retention" value={`${s.avgRetention.toFixed(0)}%`} />
              <Metric label="Content analyzed" value={String(s.count)} />
            </div>
            <div className="grid md:grid-cols-[1.6fr_1fr]">
              <div className="border-b p-4 md:border-b-0 md:border-r">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Views per post</p>
                <PerformanceChart height={190} />
              </div>
              <div className="space-y-3 p-4">
                <p className="text-xs font-medium text-muted-foreground">Top topics vs. your median</p>
                {topics.slice(0, 4).map((t) => (
                  <div key={t.topic}>
                    <div className="flex justify-between text-sm"><span>{t.topic}</span><span className="font-mono text-xs text-muted-foreground">{t.lift.toFixed(1)}× · n={t.n}</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(t.lift / topics[0].lift) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-16 border-b">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold md:text-3xl">How it works</h2>
          <p className="mt-2 text-muted-foreground">One loop, built on your own numbers.</p>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
            {steps.map((st, i) => (
              <li key={st.t} className="bg-card p-5">
                <div className="flex items-center justify-between">
                  <st.icon className="h-5 w-5 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-sans text-sm font-semibold tracking-normal">{st.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{st.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto max-w-6xl space-y-20 px-6 py-20">
          <Feature eyebrow="Performance Diagnosis" title="Know why a post performed — not just that it did."
            body="Every diagnosis separates what was observed, what your data supports, and what's only a hypothesis. No causal claims your data can't back.">
            <div className="rounded-lg border bg-card px-4 shadow-card">
              <EvidenceItem kind="observed" meta="median 24k">This video received 3.0× your median views.</EvidenceItem>
              <EvidenceItem kind="pattern" meta="n=8">AI Tutorials have higher median retention in your dataset.</EvidenceItem>
              <EvidenceItem kind="hypothesis">Showing the result first may have helped early retention.</EvidenceItem>
            </div>
          </Feature>
          <Feature eyebrow="Winning Patterns" title="See what tends to work for your audience." reverse
            body="Topics, durations and hook styles ranked against your own median — always with sample size, and flagged when the data is thin.">
            <div className="divide-y rounded-lg border bg-card text-sm shadow-card">
              {topics.slice(0, 5).map((t) => (
                <div key={t.topic} className="flex items-center justify-between px-4 py-2.5">
                  <span>{t.topic}</span>
                  <span className="font-mono text-xs"><span className={t.lift >= 1 ? "text-success" : "text-muted-foreground"}>{t.lift.toFixed(1)}×</span> <span className="text-muted-foreground">n={t.n}</span></span>
                </div>
              ))}
            </div>
          </Feature>
          <Feature eyebrow="Next Content Recommendations" title="Decide what to create next."
            body="Five ideas with a suggested hook, format and length — each tied to the historical pattern behind it. Suggestions to test, never guarantees.">
            <div className="rounded-lg border bg-card p-4 shadow-card">
              <p className="font-mono text-xs text-muted-foreground">01</p>
              <p className="mt-1 font-semibold">Show 3 AI tools that automate a real workflow</p>
              <p className="mt-1 text-sm text-muted-foreground">Hook: "I automated 4 hours of work — watch the result first."</p>
              <div className="mt-3 flex gap-2 text-xs"><span className="rounded bg-muted px-2 py-1">Tutorial</span><span className="rounded bg-muted px-2 py-1">8–10 min</span></div>
            </div>
          </Feature>
        </div>
      </section>

      <section className="border-b bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><h2 className="text-2xl font-semibold md:text-3xl">Simple monthly pricing</h2><p className="mt-2 text-muted-foreground">Start free. Upgrade when you need more analyses.</p></div>
            <Link to="/pricing" className="text-sm font-medium text-primary hover:underline">Compare plans →</Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PLAN_ORDER.map((id) => {
              const p = PLANS[id];
              return (
                <div key={id} className={`rounded-lg border bg-card p-5 shadow-card ${id === "pro" ? "border-primary/50" : ""}`}>
                  <div className="flex items-center justify-between"><h3 className="font-sans text-sm font-semibold tracking-normal">{p.name}</h3>{p.label && id === "pro" && <span className="text-xs text-primary">{p.label}</span>}</div>
                  <p className="mt-3"><span className="font-display text-3xl font-semibold">${p.price}</span><span className="text-sm text-muted-foreground">/month</span></p>
                  <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{p.limits.projects} project{p.limits.projects > 1 ? "s" : ""}, {p.limits.contentItems.toLocaleString()} items</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{p.limits.diagnosesPerMonth} AI diagnoses / month</li>
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">Your data already knows what works.</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">Import your content and let ContentLens show you the patterns — and what to try next.</p>
          <Button asChild size="lg" className="mt-8 px-6"><Link to="/signup">Analyze My Content <ArrowRight /></Link></Button>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Feature({ eyebrow, title, body, children, reverse }: { eyebrow: string; title: string; body: string; children: React.ReactNode; reverse?: boolean }) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      <div className={reverse ? "md:order-2" : ""}>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
        <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
        <p className="mt-3 text-muted-foreground">{body}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HookForge — Stop guessing what content works" },
      { name: "description", content: "HookForge analyzes your content performance, finds what works for your audience, and tells you what to create next." },
      { property: "og:title", content: "HookForge — Stop guessing what content works" },
      { property: "og:description", content: "Analyze your content data, understand why it performed, and get grounded next-content recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const flow = [
  { k: "Content", v: "42 videos imported" },
  { k: "Performance", v: "Median 18.4k views · 58% retention" },
  { k: "AI Diagnosis", v: "Observed: 3.2× your median views" },
  { k: "Winning Patterns", v: "Tutorials: 2.1× median views (n=18)" },
  { k: "Next Content", v: "Lead with the result, then the process" },
];

const steps = [
  ["Import your content data", "Upload a CSV with titles, hooks, topics and metrics."],
  ["HookForge analyzes your performance", "Medians, engagement, retention and distribution — calculated, not guessed."],
  ["AI identifies your winning patterns", "Every pattern shows its sample size, and separates evidence from hypothesis."],
  ["Get recommendations for what's next", "Ideas, hooks and formats grounded in your own history."],
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <section id="product" className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col justify-center">
          <span className="mb-5 w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">AI Content Performance Copilot</span>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Stop guessing what your audience wants.</h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            HookForge analyzes your content performance, finds what actually works for your audience, and tells you what to create next.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/pricing" className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90">Analyze My Content</Link>
            <a href="#how" className="rounded-lg border px-5 py-3 font-medium hover:bg-secondary">See How It Works</a>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Example · demo data</p>
          <ol className="space-y-2">
            {flow.map((f, i) => (
              <li key={f.k}>
                <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                  <span className="font-display text-sm font-semibold">{f.k}</span>
                  <span className="text-right text-sm text-muted-foreground">{f.v}</span>
                </div>
                {i < flow.length - 1 && <div className="mx-auto h-3 w-px bg-border" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="how" className="border-t bg-secondary/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-semibold">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map(([t, d], i) => (
              <div key={t} className="rounded-xl border bg-card p-6">
                <span className="font-display text-sm text-primary">0{i + 1}</span>
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted-foreground">HookForge shows correlations in your data — it never promises viral results.</p>
        </div>
      </section>
    </div>
  );
}

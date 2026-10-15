import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/primitives";
import { EvidenceTag } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_workspace/recommendations")({
  head: () => ({ meta: [{ title: "Recommendations — ContentLens" }, { name: "description", content: "What should you create next, grounded in your data." }] }),
  component: Recs,
});

const recs = [
  { idea: "Show 3 AI tools that automate a real workflow", hook: "I automated 4 hours of work — watch the result first.", format: "Tutorial", duration: "8–10 min", why: "Matches your strongest topic and duration range.", evidence: "AI Tutorials: 2.6× median views (n=8)" },
  { idea: "Side-by-side test of 3 caption tools", hook: "Same clip, three tools. One is clearly better.", format: "Comparison", duration: "Under 1 min", why: "Short comparisons hold retention on TikTok/Instagram.", evidence: "Tool Comparisons: 1.5× median views (n=3)" },
  { idea: "Before/after: rebuilding a thumbnail with AI", hook: "This thumbnail got 3× the clicks. Here's the redo.", format: "Before/after", duration: "Under 1 min", why: "Visual result-first hooks appear in your top quartile.", evidence: "Top quartile: 5 of 6 open with a result" },
  { idea: "Budget lighting setup, step by step", hook: "Three lights, $50, no studio.", format: "Tutorial", duration: "1–5 min", why: "Gear content with a price anchor performs above median.", evidence: "Gear: 1.1× median views (n=5)" },
  { idea: "One video into ten posts — full workflow", hook: "One recording, ten posts. Here's every step.", format: "Workflow", duration: "8–10 min", why: "Repurposing posts were among your highest retention.", evidence: "65% retention vs 55% median" },
];

function Recs() {
  return (
    <>
      <PageHeader title="What should I create next?" description="Five ideas grounded in your own history. Suggestions to test — not guarantees."
        actions={<Button disabled title="AI generation is available once the backend is connected"><Sparkles /> Generate new</Button>} />
      <div className="divide-y rounded-lg border bg-card shadow-card">
        {recs.map((r, i) => (
          <article key={r.idea} className="grid gap-4 p-5 md:grid-cols-[2rem_1fr_16rem]">
            <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
            <div className="min-w-0">
              <h2 className="font-sans text-base font-semibold tracking-normal">{r.idea}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Hook: <span className="text-foreground">"{r.hook}"</span></p>
              <p className="mt-2 text-sm text-muted-foreground">{r.why}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <EvidenceTag kind="pattern" /><span className="font-mono text-muted-foreground">{r.evidence}</span>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 self-start rounded-md bg-muted/60 p-3 text-xs md:grid-cols-1">
              <div><dt className="text-muted-foreground">Format</dt><dd className="font-medium">{r.format}</dd></div>
              <div><dt className="text-muted-foreground">Duration</dt><dd className="font-medium">{r.duration}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}

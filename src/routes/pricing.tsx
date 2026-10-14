import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { PLANS, PLAN_ORDER } from "@/config/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ContentLens" },
      { name: "description", content: "Free, Pro ($19/mo) and Business ($49/mo) plans for ContentLens. Monthly billing." },
      { property: "og:title", content: "Pricing — ContentLens" },
      { property: "og:description", content: "Simple monthly plans for creators and small teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-4xl font-semibold">Pricing</h1>
        <p className="mt-3 text-muted-foreground">Monthly billing. Cancel anytime.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const p = PLANS[id];
            const featured = id === "pro";
            return (
              <div key={id} className={`flex flex-col rounded-2xl border bg-card p-7 ${featured ? "border-primary ring-1 ring-primary" : ""}`}>
                <h2 className="text-xl font-semibold">{p.name}</h2>
                {p.label && <p className="mt-1 text-sm text-primary">{p.label}</p>}
                <p className="mt-5"><span className="font-display text-4xl font-semibold">${p.price}</span><span className="text-muted-foreground">/month</span></p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li>{p.limits.projects} project{p.limits.projects > 1 ? "s" : ""}</li>
                  <li>{p.limits.contentItems.toLocaleString()} content items</li>
                  <li>{p.limits.diagnosesPerMonth} AI diagnoses / month</li>
                  <li>{p.limits.comparisonsPerMonth} AI comparisons / month</li>
                  <li>{p.limits.recommendationsPerMonth} AI recommendations / month</li>
                  {p.features.map((f) => <li key={f} className="text-muted-foreground">{f}</li>)}
                </ul>
                <button className={`mt-8 rounded-lg px-4 py-3 font-medium ${featured ? "bg-primary text-primary-foreground" : "bg-ink text-ink-foreground"} hover:opacity-90`}>{p.cta}</button>
              </div>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

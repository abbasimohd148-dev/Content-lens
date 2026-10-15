import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PLANS } from "@/config/pricing";

export const Route = createFileRoute("/_workspace/billing")({
  head: () => ({ meta: [{ title: "Billing — ContentLens" }, { name: "description", content: "Your plan and monthly usage." }] }),
  component: Billing,
});

function Billing() {
  const p = PLANS.free;
  const usage: [string, number, number][] = [
    ["AI diagnoses", 1, p.limits.diagnosesPerMonth],
    ["AI comparisons", 0, p.limits.comparisonsPerMonth],
    ["Recommendations", 2, p.limits.recommendationsPerMonth],
    ["Content items", 24, p.limits.contentItems],
    ["Projects", 1, p.limits.projects],
  ];
  return (
    <>
      <PageHeader title="Billing" description="Your current plan and usage this month." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Current plan">
          <p className="font-display text-2xl font-semibold">{p.name} <span className="text-base font-normal text-muted-foreground">${p.price}/month</span></p>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild><Link to="/pricing">Upgrade Plan</Link></Button>
            <p className="text-xs text-muted-foreground">Checkout isn't configured yet. Manage and cancel options appear once a payment provider is connected.</p>
          </div>
        </Panel>
        <Panel title="Monthly usage" className="lg:col-span-2" bodyClassName="space-y-4">
          {usage.map(([label, used, limit]) => (
            <div key={label}>
              <div className="flex justify-between text-sm"><span>{label}</span><span className="tabular text-muted-foreground">{used} / {limit}</span></div>
              <Progress value={(used / limit) * 100} className="mt-1.5 h-1.5" />
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

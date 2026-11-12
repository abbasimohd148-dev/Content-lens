import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { PageHeader, Panel } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PLANS, type PlanId } from "@/config/pricing";

export const Route = createFileRoute("/_workspace/billing")({
  head: () => ({
    meta: [
      { title: "Billing — ContentLens" },
      { name: "description", content: "Your plan and monthly usage." },
    ],
  }),
  component: Billing,
});

type UsageData = {
  diagnoses: number;
  comparisons: number;
  recommendations: number;
  contentItems: number;
};

type BillingResponse = {
  plan_id: string;
  diagnoses_used: number;
  comparisons_used: number;
  recommendations_used: number;
  content_items_used: number;
  diagnoses_limit: number;
  comparisons_limit: number;
  recommendations_limit: number;
  content_items_limit: number;
};

function Billing() {
  const [planId, setPlanId] = useState<PlanId>("free");

  const [usage, setUsage] = useState<UsageData>({
    diagnoses: 0,
    comparisons: 0,
    recommendations: 0,
    contentItems: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBillingData() {
      setLoading(true);
      setError("");

      try {
        const {
          data,
          error: billingError,
        } = await supabase.rpc("get_my_billing_usage");

        if (billingError) {
          throw billingError;
        }

        const billing = Array.isArray(data)
          ? (data[0] as BillingResponse | undefined)
          : (data as BillingResponse | null);

        if (!billing) {
          throw new Error(
            "Billing information was not returned. Please refresh the page.",
          );
        }

        const validPlans: PlanId[] = [
          "free",
          "pro",
          "business",
        ];

        const selectedPlan: PlanId = validPlans.includes(
          billing.plan_id as PlanId,
        )
          ? (billing.plan_id as PlanId)
          : "free";

        if (cancelled) return;

        setPlanId(selectedPlan);

        setUsage({
          diagnoses: Number(billing.diagnoses_used ?? 0),
          comparisons: Number(billing.comparisons_used ?? 0),
          recommendations: Number(
            billing.recommendations_used ?? 0,
          ),
          contentItems: Number(billing.content_items_used ?? 0),
        });
      } catch (err) {
        console.error("Billing data loading failed:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load billing information.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBillingData();

    return () => {
      cancelled = true;
    };
  }, []);

  const plan = PLANS[planId];

  const usageRows: [string, number, number][] = [
    [
      "AI diagnoses",
      usage.diagnoses,
      plan.limits.diagnosesPerMonth,
    ],
    [
      "AI comparisons",
      usage.comparisons,
      plan.limits.comparisonsPerMonth,
    ],
    [
      "Recommendations",
      usage.recommendations,
      plan.limits.recommendationsPerMonth,
    ],
    [
      "Content items",
      usage.contentItems,
      plan.limits.contentItems,
    ],
  ];

  return (
    <>
      <PageHeader
        title="Billing"
        description="Your current plan and usage this month."
      />

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          Could not load billing information: {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Current plan">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading plan...
            </p>
          ) : (
            <>
              <p className="font-display text-2xl font-semibold">
                {plan.name}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  ${plan.price}/month
                </span>
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <Button asChild>
                  <Link to="/pricing">
                    Upgrade Plan
                  </Link>
                </Button>

                <p className="text-xs text-muted-foreground">
                  Checkout isn't configured yet. Manage and cancel
                  options will appear once a payment provider is connected.
                </p>
              </div>
            </>
          )}
        </Panel>

        <Panel
          title="Monthly usage"
          className="lg:col-span-2"
          bodyClassName="space-y-4"
        >
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading usage...
            </p>
          ) : (
            usageRows.map(([label, used, limit]) => (
              <div key={label}>
                <div className="flex justify-between gap-3 text-sm">
                  <span>{label}</span>

                  <span className="tabular text-muted-foreground">
                    {used} / {limit}
                  </span>
                </div>

                <Progress
                  value={
                    limit > 0
                      ? Math.min((used / limit) * 100, 100)
                      : 0
                  }
                  className="mt-1.5 h-1.5"
                />
              </div>
            ))
          )}
        </Panel>
      </div>
    </>
  );
}
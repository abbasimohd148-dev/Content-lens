export type PlanId = "free" | "pro" | "business";

export interface PlanLimits {
  projects: number;
  contentItems: number;
  diagnosesPerMonth: number;
  comparisonsPerMonth: number;
  recommendationsPerMonth: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  currency: "USD";
  interval: "month";
  label?: string;
  cta: string;
  features: string[];
  limits: PlanLimits;
  // Provider IDs are read from env server-side; keys here name the env vars.
  providerPriceEnv: { razorpay?: string; paddle?: string };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    cta: "Get Started",
    features: ["CSV import", "Basic analytics", "Basic winning-pattern analysis", "ContentLens branding"],
    limits: { projects: 1, contentItems: 30, diagnosesPerMonth: 3, comparisonsPerMonth: 3, recommendationsPerMonth: 5 },
    providerPriceEnv: {},
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 19,
    currency: "USD",
    interval: "month",
    label: "Best for creators",
    cta: "Upgrade to Pro",
    features: ["Advanced analytics", "Winning-pattern analysis", "Remove ContentLens branding", "Priority AI processing", "Full analysis history"],
    limits: { projects: 5, contentItems: 500, diagnosesPerMonth: 50, comparisonsPerMonth: 50, recommendationsPerMonth: 100 },
    providerPriceEnv: { razorpay: "RAZORPAY_PLAN_PRO", paddle: "PADDLE_PRICE_PRO" },
  },
  business: {
    id: "business",
    name: "Business",
    price: 49,
    currency: "USD",
    interval: "month",
    label: "Best for professional creators and small teams",
    cta: "Upgrade to Business",
    features: ["Advanced analytics", "Unlimited winning-pattern analysis", "Remove ContentLens branding", "Priority AI processing", "Full AI analysis history", "Multiple content projects"],
    limits: { projects: 20, contentItems: 5000, diagnosesPerMonth: 200, comparisonsPerMonth: 200, recommendationsPerMonth: 500 },
    providerPriceEnv: { razorpay: "RAZORPAY_PLAN_BUSINESS", paddle: "PADDLE_PRICE_BUSINESS" },
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "business"];

// Pure analytics calculations — no AI, no I/O. Safe with missing metrics and zero views.

export interface ContentItem {
  id: string;
  title: string;
  hook: string | null;
  platform: string | null;
  topic: string | null;
  durationSec: number | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  avgWatchSec: number | null;
  retention: number | null;
  postedAt: string | null; // ISO date (YYYY-MM-DD)
}

export const MIN_SAMPLE = 3;
export const ENGAGEMENT_FIELDS = ["likes", "comments", "shares", "saves"] as const;

const known = (xs: (number | null | undefined)[]) =>
  xs.filter((x): x is number => typeof x === "number" && Number.isFinite(x));

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : null);
export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

/** (likes + comments + shares + saves) / views × 100, using only the fields present. */
export function engagementRate(c: ContentItem): { value: number; fieldsUsed: number } | null {
  if (!c.views || c.views <= 0) return null;
  const parts = known(ENGAGEMENT_FIELDS.map((f) => c[f]));
  if (!parts.length) return null;
  return { value: (sum(parts) / c.views) * 100, fieldsUsed: parts.length };
}

export interface Summary {
  count: number;
  withViews: number;
  totalViews: number | null;
  avgViews: number | null;
  medianViews: number | null;
  avgRetention: number | null;
  retentionN: number;
  engagementRate: number | null;
  engagementN: number;
  engagementFields: string[]; // engagement fields present in at least one item
}

export function summarize(items: ContentItem[]): Summary {
  const views = known(items.map((c) => c.views));
  const ret = known(items.map((c) => c.retention));
  const engaged = items.filter((c) => engagementRate(c));
  const interactions = sum(engaged.map((c) => sum(known(ENGAGEMENT_FIELDS.map((f) => c[f])))));
  const engagedViews = sum(engaged.map((c) => c.views!));
  return {
    count: items.length,
    withViews: views.length,
    totalViews: views.length ? sum(views) : null,
    avgViews: mean(views),
    medianViews: median(views),
    avgRetention: mean(ret),
    retentionN: ret.length,
    engagementRate: engagedViews > 0 ? (interactions / engagedViews) * 100 : null,
    engagementN: engaged.length,
    engagementFields: ENGAGEMENT_FIELDS.filter((f) => items.some((c) => typeof c[f] === "number")),
  };
}

export interface Group {
  key: string;
  n: number;
  medianViews: number | null;
  medianRetention: number | null;
  avgEngagement: number | null;
  lift: number | null; // group median views ÷ overall median views
  lowSample: boolean;
}

export function groupBy(items: ContentItem[], keyOf: (c: ContentItem) => string | null): Group[] {
  const overall = median(known(items.map((c) => c.views)));
  const groups = new Map<string, ContentItem[]>();
  for (const c of items) {
    const k = keyOf(c);
    if (!k) continue;
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  return [...groups.entries()]
    .map(([key, list]) => {
      const mv = median(known(list.map((c) => c.views)));
      return {
        key,
        n: list.length,
        medianViews: mv,
        medianRetention: median(known(list.map((c) => c.retention))),
        avgEngagement: mean(list.map(engagementRate).filter(Boolean).map((e) => e!.value)),
        lift: mv !== null && overall ? mv / overall : null,
        lowSample: list.length < MIN_SAMPLE,
      };
    })
    .sort((a, b) => (b.lift ?? -1) - (a.lift ?? -1));
}

export const DURATION_RANGES = [
  { label: "Under 1 min", lo: 0, hi: 60 },
  { label: "1–5 min", lo: 60, hi: 300 },
  { label: "5–10 min", lo: 300, hi: 600 },
  { label: "10+ min", lo: 600, hi: Infinity },
] as const;

export const durationBucket = (c: ContentItem) =>
  c.durationSec === null ? null : DURATION_RANGES.find((r) => c.durationSec! >= r.lo && c.durationSec! < r.hi)?.label ?? null;

export const byTopic = (items: ContentItem[]) => groupBy(items, (c) => c.topic);
export const byPlatform = (items: ContentItem[]) => groupBy(items, (c) => c.platform);
export function byDuration(items: ContentItem[]): Group[] {
  const g = groupBy(items, durationBucket);
  return DURATION_RANGES.map((r) => g.find((x) => x.key === r.label)).filter((x): x is Group => !!x);
}

export function timeline(items: ContentItem[]) {
  return items
    .filter((c) => c.postedAt && typeof c.views === "number")
    .sort((a, b) => a.postedAt!.localeCompare(b.postedAt!))
    .map((c) => ({ date: c.postedAt!.slice(5), views: c.views!, title: c.title }));
}

export function rankByViews(items: ContentItem[]) {
  return items.filter((c) => typeof c.views === "number").sort((a, b) => b.views! - a.views!);
}

/** Top and bottom n without overlap. */
export function topAndBottom(items: ContentItem[], n = 5) {
  const r = rankByViews(items);
  const k = Math.min(n, Math.floor(r.length / 2));
  return { top: r.slice(0, k), bottom: r.slice(r.length - k).reverse() };
}

export const fmt = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(Math.round(n));
export const pct = (n: number | null | undefined, d = 0) => (n === null || n === undefined ? "—" : `${n.toFixed(d)}%`);
export const fmtDuration = (s: number | null) =>
  s === null ? "—" : s < 60 ? `${Math.round(s)}s` : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

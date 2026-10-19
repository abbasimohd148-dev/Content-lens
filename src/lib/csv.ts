import type { ContentItem } from "./analytics";

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (q) {
      if (ch === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

export type FieldKey =
  | "title" | "hook" | "platform" | "topic" | "duration_seconds" | "views" | "likes" | "comments"
  | "shares" | "saves" | "average_watch_time_seconds" | "retention_percent" | "posted_at";

export const FIELDS: { key: FieldKey; label: string; required?: boolean; numeric?: boolean; aliases: string[] }[] = [
  { key: "title", label: "Title", required: true, aliases: ["title", "name", "video title", "post title"] },
  { key: "hook", label: "Hook", aliases: ["hook", "opening", "intro"] },
  { key: "platform", label: "Platform", aliases: ["platform", "channel", "network"] },
  { key: "topic", label: "Topic", aliases: ["topic", "category", "theme"] },
  { key: "duration_seconds", label: "Duration (s)", numeric: true, aliases: ["duration_seconds", "duration", "length", "seconds"] },
  { key: "views", label: "Views", numeric: true, aliases: ["views", "view count", "impressions", "plays"] },
  { key: "likes", label: "Likes", numeric: true, aliases: ["likes", "like count"] },
  { key: "comments", label: "Comments", numeric: true, aliases: ["comments", "comment count"] },
  { key: "shares", label: "Shares", numeric: true, aliases: ["shares", "share count", "reposts"] },
  { key: "saves", label: "Saves", numeric: true, aliases: ["saves", "save count", "bookmarks"] },
  { key: "average_watch_time_seconds", label: "Avg. watch time (s)", numeric: true, aliases: ["average_watch_time_seconds", "avg watch time", "average watch time", "watch time"] },
  { key: "retention_percent", label: "Retention %", numeric: true, aliases: ["retention_percent", "retention", "avg retention", "average percentage viewed"] },
  { key: "posted_at", label: "Posted at", aliases: ["posted_at", "date", "published", "publish date", "posted"] },
];

export type Mapping = Partial<Record<FieldKey, number>>; // field -> column index

const norm = (s: string) => s.toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();

export function detectMapping(headers: string[]): Mapping {
  const h = headers.map(norm);
  const m: Mapping = {};
  for (const f of FIELDS) {
    const idx = h.findIndex((x) => f.aliases.some((a) => norm(a) === x));
    const fuzzy = idx >= 0 ? idx : h.findIndex((x) => f.aliases.some((a) => x.includes(norm(a))));
    if (fuzzy >= 0 && !Object.values(m).includes(fuzzy)) m[f.key] = fuzzy;
  }
  return m;
}

export interface RowIssue { row: number; message: string }

function toNum(v: string | undefined): number | null | "invalid" {
  if (v === undefined) return null;
  const t = v.replace(/[,%\s]/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : "invalid";
}

function toDate(v: string | undefined): string | null | "invalid" {
  if (!v?.trim()) return null;
  const d = new Date(v.trim());
  return isNaN(+d) ? "invalid" : d.toISOString().slice(0, 10);
}

export function buildItems(rows: string[][], mapping: Mapping) {
  const items: ContentItem[] = [];
  const errors: RowIssue[] = [];
  const get = (r: string[], k: FieldKey) => (mapping[k] === undefined ? undefined : r[mapping[k]!]);
  rows.forEach((r, i) => {
    const rowNo = i + 2; // +1 header, +1 human index
    const title = get(r, "title")?.trim();
    if (!title) { errors.push({ row: rowNo, message: "Missing title" }); return; }
    const nums: Record<string, number | null> = {};
    let bad = false;
    for (const f of FIELDS.filter((f) => f.numeric)) {
      const n = toNum(get(r, f.key));
      if (n === "invalid") { errors.push({ row: rowNo, message: `${f.label} is not a valid non-negative number` }); bad = true; }
      else nums[f.key] = n;
    }
    const date = toDate(get(r, "posted_at"));
    if (date === "invalid") { errors.push({ row: rowNo, message: "Posted at is not a recognisable date" }); bad = true; }
    if (bad) return;
    const ret = nums["retention_percent"] ?? null;
    if (ret !== null && ret > 100) { errors.push({ row: rowNo, message: "Retention % above 100" }); return; }
    const txt = (k: FieldKey) => get(r, k)?.trim() || null;
    items.push({
      id: `imp-${Date.now().toString(36)}-${i}`,
      title, hook: txt("hook"), platform: txt("platform"), topic: txt("topic"),
      durationSec: nums["duration_seconds"] ?? null, views: nums["views"] ?? null,
      likes: nums["likes"] ?? null, comments: nums["comments"] ?? null, shares: nums["shares"] ?? null, saves: nums["saves"] ?? null,
      avgWatchSec: nums["average_watch_time_seconds"] ?? null, retention: ret, postedAt: date as string | null,
    });
  });
  return { items, errors };
}

export const SAMPLE_CSV = `${FIELDS.map((f) => f.key).join(",")}\n"My first video","Watch this first",YouTube,Tutorials,480,12000,600,45,30,80,240,50,2026-01-15\n`;

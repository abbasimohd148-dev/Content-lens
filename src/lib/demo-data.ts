// DEMO DATA — fictional records for illustrating the interface only.
export interface DemoContent {
  id: string;
  title: string;
  hook: string;
  topic: string;
  platform: "YouTube" | "Instagram" | "TikTok" | "LinkedIn";
  durationSec: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  retention: number;
  postedAt: string;
}

const raw: [string, string, string, DemoContent["platform"], number, number, number, string][] = [
  ["3 AI tools that replaced my editor", "I cut my editing time by 70% — here's how.", "AI Tutorials", "YouTube", 540, 61200, 68, "2026-03-04"],
  ["Automating my inbox with one prompt", "This prompt answers 80% of my email.", "AI Tutorials", "YouTube", 480, 48900, 64, "2026-03-11"],
  ["My honest studio tour", "Everything I own, ranked.", "Behind the Scenes", "YouTube", 900, 12400, 41, "2026-03-15"],
  ["Notion vs Obsidian in 60s", "One of these wastes your time.", "Tool Comparisons", "TikTok", 58, 39100, 72, "2026-03-18"],
  ["Why I quit posting daily", "Let me explain what happened.", "Creator Life", "YouTube", 720, 9800, 38, "2026-03-22"],
  ["Build a GPT agent in 10 minutes", "Watch the finished agent first.", "AI Tutorials", "YouTube", 610, 72300, 66, "2026-03-29"],
  ["5 camera settings I wish I knew", "Setting #3 changed everything.", "Gear", "Instagram", 45, 21800, 59, "2026-04-02"],
  ["Day in the life: solo creator", "Here is my morning routine.", "Creator Life", "Instagram", 75, 8700, 44, "2026-04-06"],
  ["ChatGPT for thumbnails", "Before and after, side by side.", "AI Tutorials", "TikTok", 52, 54100, 70, "2026-04-09"],
  ["Lessons from 100k subscribers", "Today I want to talk about growth.", "Creator Life", "YouTube", 1020, 15600, 39, "2026-04-13"],
  ["Cheapest mic that sounds pro", "Listen to this for $40.", "Gear", "YouTube", 420, 27300, 57, "2026-04-17"],
  ["Script to video in one workflow", "Here's the finished video first.", "AI Tutorials", "YouTube", 560, 58800, 63, "2026-04-21"],
  ["How I plan a month of content", "So in this video I'll walk through.", "Productivity", "LinkedIn", 180, 7300, 46, "2026-04-24"],
  ["Canva vs Figma for creators", "The answer surprised me.", "Tool Comparisons", "YouTube", 600, 24100, 52, "2026-04-28"],
  ["My batching system", "I film 8 videos in one day.", "Productivity", "YouTube", 660, 19900, 55, "2026-05-02"],
  ["Lighting on a $50 budget", "Three lights, no studio.", "Gear", "TikTok", 49, 30600, 68, "2026-05-06"],
  ["Is AI replacing creators?", "Let's discuss the future.", "Opinion", "YouTube", 840, 11200, 36, "2026-05-10"],
  ["Auto-captions in 2 clicks", "Captions done before you blink.", "AI Tutorials", "Instagram", 38, 46700, 74, "2026-05-14"],
  ["What I earn from YouTube", "Full numbers, no fluff.", "Creator Life", "YouTube", 780, 33800, 49, "2026-05-18"],
  ["Weekly review template", "Steal my exact template.", "Productivity", "LinkedIn", 120, 9100, 51, "2026-05-22"],
  ["Repurpose one video into ten", "One video, ten posts — watch.", "AI Tutorials", "YouTube", 590, 64500, 65, "2026-05-26"],
  ["Gear I regret buying", "Don't make my mistakes.", "Gear", "YouTube", 510, 18200, 50, "2026-05-30"],
  ["Hot take: hooks are overrated", "Hear me out on this one.", "Opinion", "TikTok", 62, 13400, 42, "2026-06-03"],
  ["AI voiceover test: 4 tools", "Can you tell which is real?", "Tool Comparisons", "YouTube", 630, 41900, 61, "2026-06-07"],
];

export const DEMO_CONTENT: DemoContent[] = raw.map(([title, hook, topic, platform, durationSec, views, retention, postedAt], i) => ({
  id: String(i + 1),
  title, hook, topic, platform, durationSec, views, retention, postedAt,
  likes: Math.round(views * (0.03 + (i % 5) * 0.004)),
  comments: Math.round(views * (0.004 + (i % 3) * 0.001)),
  shares: Math.round(views * (0.003 + (i % 4) * 0.0015)),
  saves: Math.round(views * (0.005 + (i % 6) * 0.002)),
}));

export const engagement = (c: DemoContent) =>
  ((c.likes + c.comments + c.shares + c.saves) / c.views) * 100;

export const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  if (!s.length) return 0;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

export const fmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(Math.round(n));

export const fmtDuration = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

export function summary(items = DEMO_CONTENT) {
  const views = items.map((c) => c.views);
  const total = views.reduce((a, b) => a + b, 0);
  return {
    count: items.length,
    totalViews: total,
    medianViews: median(views),
    avgRetention: items.reduce((a, c) => a + c.retention, 0) / items.length,
    avgEngagement: items.reduce((a, c) => a + engagement(c), 0) / items.length,
  };
}

export function byTopic(items = DEMO_CONTENT) {
  const overall = median(items.map((c) => c.views));
  const groups = new Map<string, DemoContent[]>();
  items.forEach((c) => groups.set(c.topic, [...(groups.get(c.topic) ?? []), c]));
  return [...groups.entries()]
    .map(([topic, list]) => ({
      topic,
      n: list.length,
      medianViews: median(list.map((c) => c.views)),
      medianRetention: median(list.map((c) => c.retention)),
      lift: median(list.map((c) => c.views)) / overall,
    }))
    .sort((a, b) => b.lift - a.lift);
}

export const byMonth = () => {
  const m = new Map<string, number>();
  DEMO_CONTENT.forEach((c) => {
    const k = c.postedAt.slice(0, 7);
    m.set(k, (m.get(k) ?? 0) + c.views);
  });
  return [...m.entries()].map(([k, views]) => ({
    month: new Date(k + "-01").toLocaleString("en", { month: "short" }),
    views,
  }));
};

export const byWeek = () =>
  DEMO_CONTENT.map((c) => ({ date: c.postedAt.slice(5), views: c.views, retention: c.retention }));

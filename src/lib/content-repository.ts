// Temporary content data layer (browser-only, this device). Swap the internals for a
// persistent backend later — UI only depends on useContent() and the action functions.
import { useSyncExternalStore } from "react";
import type { ContentItem } from "./analytics";
import { DEMO_CONTENT } from "./demo-data";

export type DataSource = "demo" | "imported" | "empty";
interface State { source: DataSource; items: ContentItem[] }

const KEY = "contentlens.temporary-content.v1";

export const DEMO_ITEMS: ContentItem[] = DEMO_CONTENT.map((c) => ({
  id: `demo-${c.id}`,
  title: c.title,
  hook: c.hook,
  platform: c.platform,
  topic: c.topic,
  durationSec: c.durationSec,
  views: c.views,
  likes: c.likes,
  comments: c.comments,
  shares: c.shares,
  saves: c.saves,
  avgWatchSec: Math.round((c.durationSec * c.retention) / 100),
  retention: c.retention,
  postedAt: c.postedAt,
}));

const initial: State = { source: "demo", items: DEMO_ITEMS };
let state: State = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  try {
    if (next.source === "demo") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* storage unavailable — keep in memory */ }
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (Array.isArray(parsed.items)) { state = parsed; listeners.forEach((l) => l()); }
    }
  } catch { /* ignore corrupt data */ }
}

function subscribe(l: () => void) {
  listeners.add(l);
  queueMicrotask(hydrate);
  return () => listeners.delete(l);
}

export function useContent() {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

export const contentRepo = {
  importItems(items: ContentItem[], mode: "replace" | "append") {
    const base = mode === "append" && state.source === "imported" ? state.items : [];
    set({ source: "imported", items: [...base, ...items] });
  },
  loadDemo() { set(initial); },
  clear() { set({ source: "empty", items: [] }); },
};

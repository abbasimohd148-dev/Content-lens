import { useSyncExternalStore } from "react";
import type { ContentItem } from "./analytics";
import { supabase } from "@/lib/supabase";

export type DataSource = "demo" | "imported" | "empty";

interface State {
  source: DataSource;
  items: ContentItem[];
}

const KEY = "contentlens.temporary-content.v1";
const EMPTY_STATE: State = { source: "empty", items: [] };

let state: State = EMPTY_STATE;
let hydrated = false;
let loadRequest = 0;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function set(next: State) {
  state = next;

  try {
    if (next.source === "empty" || next.source === "demo") {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, JSON.stringify(next));
    }
  } catch {
    // Browser storage may be unavailable.
  }

  notify();
}

function toDatabaseRow(item: ContentItem) {
  return {
    title: item.title,
    hook: item.hook,
    platform: item.platform,
    topic: item.topic,
    duration_sec: item.durationSec,
    views: item.views,
    likes: item.likes,
    comments: item.comments,
    shares: item.shares,
    saves: item.saves,
    avg_watch_sec: item.avgWatchSec,
    retention: item.retention,
    posted_at: item.postedAt || null,
  };
}

function fromDatabaseRow(row: Record<string, unknown>): ContentItem {
  const nullableString = (value: unknown): string | null =>
    typeof value === "string" ? value : null;

  const nullableNumber = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value)
      ? value
      : null;

  return {
    id: String(row["id"] ?? ""),
    title: String(row["title"] ?? ""),
    hook: nullableString(row["hook"]),
    platform: nullableString(row["platform"]),
    topic: nullableString(row["topic"]),
    durationSec: nullableNumber(row["duration_sec"]),
    views: nullableNumber(row["views"]),
    likes: nullableNumber(row["likes"]),
    comments: nullableNumber(row["comments"]),
    shares: nullableNumber(row["shares"]),
    saves: nullableNumber(row["saves"]),
    avgWatchSec: nullableNumber(row["avg_watch_sec"]),
    retention: nullableNumber(row["retention"]),
    postedAt: nullableString(row["posted_at"]),
  };
}

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data.user?.id ?? null;
}

async function loadFromSupabase() {
  const request = ++loadRequest;

  try {
    const userId = await getCurrentUserId();

    if (request !== loadRequest) return;

    if (!userId) {
      set(EMPTY_STATE);
      return;
    }

    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (request !== loadRequest) return;

    const items = (data ?? []).map((row) =>
      fromDatabaseRow(row as Record<string, unknown>)
    );

    set({
      source: items.length > 0 ? "imported" : "empty",
      items,
    });
  } catch (error) {
    console.error("Could not load ContentLens data:", error);

    try {
      const raw = localStorage.getItem(KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as State;

        if (
          Array.isArray(parsed.items) &&
          (parsed.source === "imported" || parsed.source === "empty")
        ) {
          set(parsed);
          return;
        }
      }
    } catch {
      // Ignore invalid browser data.
    }

    set(EMPTY_STATE);
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;

  hydrated = true;
  void loadFromSupabase();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  queueMicrotask(hydrate);

  return () => {
    listeners.delete(listener);
  };
}

export function useContent() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY_STATE
  );
}

export const contentRepo = {
  async refresh() {
    await loadFromSupabase();
  },

  async importItems(
    items: ContentItem[],
    mode: "replace" | "append"
  ) {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("Please sign in before importing content.");
    }

    const rows = items.map(toDatabaseRow);

    const { data, error } = await supabase.rpc(
      "import_content_items",
      {
        p_items: rows,
        p_mode: mode,
      }
    );

    if (error) {
      const message = error.message || "The import could not be completed.";

      throw new Error(
        message.includes("CONTENT_LIMIT_EXCEEDED")
          ? message.replace("CONTENT_LIMIT_EXCEEDED: ", "")
          : message
      );
    }

    if (Number(data) !== rows.length) {
      throw new Error(
        "The database did not confirm that all content items were imported."
      );
    }

    await loadFromSupabase();
  },

  loadDemo() {
    set(EMPTY_STATE);
  },

  async clear() {
    const userId = await getCurrentUserId();

    if (!userId) {
      set(EMPTY_STATE);
      return;
    }

    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;

    await loadFromSupabase();
  },
};
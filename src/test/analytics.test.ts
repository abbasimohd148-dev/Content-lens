import { describe, it, expect } from "vitest";
import { engagementRate, summarize, type ContentItem } from "@/lib/analytics";
const base: ContentItem = { id: "1", title: "t", hook: null, platform: null, topic: null, durationSec: null, views: 1000, likes: 50, comments: 20, shares: 10, saves: 20, avgWatchSec: null, retention: null, postedAt: null };
describe("engagement rate", () => {
  it("is (likes+comments+shares+saves)/views*100", () => expect(engagementRate(base)?.value).toBe(10));
  it("is null for zero views", () => expect(engagementRate({ ...base, views: 0 })).toBeNull());
  it("uses only available fields", () => { const e = engagementRate({ ...base, saves: null, shares: null })!; expect(e.value).toBeCloseTo(7); expect(e.fieldsUsed).toBe(2); });
  it("summary handles no retention", () => expect(summarize([base]).avgRetention).toBeNull());
});

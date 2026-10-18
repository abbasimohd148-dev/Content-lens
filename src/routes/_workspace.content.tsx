import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import { ContentTable } from "@/components/app/ContentTable";
import { EmptyContentState } from "@/components/app/states";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { contentRepo, useContent } from "@/lib/content-repository";
import { engagementRate, fmt, fmtDuration, pct, type ContentItem } from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/content")({
  head: () => ({ meta: [{ title: "Content — ContentLens" }, { name: "description", content: "All imported content and metrics." }] }),
  component: ContentPage,
});

const sorters: Record<string, (c: ContentItem) => number> = {
  views: (c) => c.views ?? -1,
  retention: (c) => c.retention ?? -1,
  engagement: (c) => engagementRate(c)?.value ?? -1,
  date: (c) => (c.postedAt ? +new Date(c.postedAt) : 0),
};

function ContentPage() {
  const { items: all, source } = useContent();
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState("views");
  const [sel, setSel] = useState<ContentItem | null>(null);
  const topics = useMemo(() => [...new Set(all.map((c) => c.topic).filter(Boolean))] as string[], [all]);
  const platforms = useMemo(() => [...new Set(all.map((c) => c.platform).filter(Boolean))] as string[], [all]);
  const items = useMemo(() => all
    .filter((c) => (c.title + " " + (c.hook ?? "")).toLowerCase().includes(q.toLowerCase()) && (topic === "all" || c.topic === topic) && (platform === "all" || c.platform === platform))
    .sort((a, b) => sorters[sort]!(b) - sorters[sort]!(a)), [all, q, topic, platform, sort]);

  return (
    <>
      <PageHeader title="Content" description="Everything you've imported. Select a title for details."
        actions={source !== "empty" ? <Button variant="outline" size="sm" onClick={() => contentRepo.clear()}><Trash2 /> Clear data</Button> : undefined} />
      {!all.length ? <EmptyContentState /> : (
        <Panel bodyClassName="p-0">
          <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:flex-wrap">
            <div className="relative flex-1 sm:min-w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles and hooks" className="pl-8" aria-label="Search content" />
            </div>
            <Filter value={platform} onChange={setPlatform} all="All platforms" options={platforms} />
            <Filter value={topic} onChange={setTopic} all="All topics" options={topics} />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="sm:w-40" aria-label="Sort"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Sort: Views</SelectItem>
                <SelectItem value="retention">Sort: Retention</SelectItem>
                <SelectItem value="engagement">Sort: Engagement</SelectItem>
                <SelectItem value="date">Sort: Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {items.length ? <ContentTable items={items} onSelect={setSel} /> : <p className="p-10 text-center text-sm text-muted-foreground">No content matches these filters.</p>}
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">{items.length} of {all.length} items{source === "imported" && " · stored temporarily in this browser"}</p>
        </Panel>
      )}
      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="overflow-y-auto">
          {sel && <>
            <SheetHeader><SheetTitle>{sel.title}</SheetTitle><SheetDescription>{[sel.platform, sel.topic, sel.postedAt].filter(Boolean).join(" · ") || "No metadata"}</SheetDescription></SheetHeader>
            <div className="space-y-4 px-4">
              {sel.hook && <div><p className="text-xs text-muted-foreground">Hook</p><p className="mt-1 text-sm">"{sel.hook}"</p></div>}
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border text-sm">
                {([["Views", fmt(sel.views)], ["Retention", pct(sel.retention)], ["Engagement", pct(engagementRate(sel)?.value, 1)], ["Duration", fmtDuration(sel.durationSec)],
                  ["Avg. watch", fmtDuration(sel.avgWatchSec)], ["Likes", fmt(sel.likes)], ["Comments", fmt(sel.comments)], ["Shares", fmt(sel.shares)], ["Saves", fmt(sel.saves)]] as const).map(([k, v]) => (
                  <div key={k} className="bg-card p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 font-medium tabular">{v}</dd></div>
                ))}
              </dl>
              <Button asChild className="w-full"><Link to="/diagnosis" search={{ id: sel.id }}>Open diagnosis</Link></Button>
            </div>
          </>}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Filter({ value, onChange, all, options }: { value: string; onChange: (v: string) => void; all: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="sm:w-40" aria-label={all}><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{all}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

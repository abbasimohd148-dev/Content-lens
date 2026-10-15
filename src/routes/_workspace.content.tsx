import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import { ContentTable } from "@/components/app/ContentTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEMO_CONTENT, engagement } from "@/lib/demo-data";

export const Route = createFileRoute("/_workspace/content")({
  head: () => ({ meta: [{ title: "Content — ContentLens" }, { name: "description", content: "All imported content and metrics." }] }),
  component: ContentPage,
});

const topics = [...new Set(DEMO_CONTENT.map((c) => c.topic))];
const platforms = [...new Set(DEMO_CONTENT.map((c) => c.platform))];

function ContentPage() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState("views");
  const items = useMemo(() => {
    const list = DEMO_CONTENT.filter((c) =>
      c.title.toLowerCase().includes(q.toLowerCase()) && (topic === "all" || c.topic === topic) && (platform === "all" || c.platform === platform));
    const key: Record<string, (c: (typeof list)[number]) => number> = {
      views: (c) => c.views, retention: (c) => c.retention, engagement, date: (c) => +new Date(c.postedAt),
    };
    return list.sort((a, b) => key[sort](b) - key[sort](a));
  }, [q, topic, platform, sort]);

  return (
    <>
      <PageHeader title="Content" description="Everything you've imported. Click a title to diagnose it." />
      <Panel bodyClassName="p-0">
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles" className="pl-8" />
          </div>
          <Filter value={platform} onChange={setPlatform} all="All platforms" options={platforms} />
          <Filter value={topic} onChange={setTopic} all="All topics" options={topics} />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="views">Sort: Views</SelectItem>
              <SelectItem value="retention">Sort: Retention</SelectItem>
              <SelectItem value="engagement">Sort: Engagement</SelectItem>
              <SelectItem value="date">Sort: Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {items.length ? <ContentTable items={items} /> : <p className="p-10 text-center text-sm text-muted-foreground">No content matches these filters.</p>}
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">{items.length} of {DEMO_CONTENT.length} items</p>
      </Panel>
    </>
  );
}

function Filter({ value, onChange, all, options }: { value: string; onChange: (v: string) => void; all: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{all}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

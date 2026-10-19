import { Link } from "@tanstack/react-router";
import { engagementRate, fmt, pct, type ContentItem } from "@/lib/analytics";

export function ContentTable({ items, compact, onSelect }: { items: ContentItem[]; compact?: boolean; onSelect?: (c: ContentItem) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] table-fixed text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className={`px-4 py-2 font-medium ${compact ? "w-[46%]" : "w-[36%]"}`}>Title</th>
            {!compact && <th className="px-4 py-2 font-medium">Topic</th>}
            {!compact && <th className="px-4 py-2 font-medium">Platform</th>}
            <th className="px-4 py-2 text-right font-medium">Views</th>
            <th className="px-4 py-2 text-right font-medium">Retention</th>
            <th className="px-4 py-2 text-right font-medium">{compact ? "Engage." : "Engagement"}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="px-4 py-2.5">
                {onSelect ? (
                  <button type="button" onClick={() => onSelect(c)} className="block w-full truncate text-left font-medium hover:text-primary focus-visible:outline-none focus-visible:underline">{c.title}</button>
                ) : (
                  <Link to="/diagnosis" search={{ id: c.id }} className="block truncate font-medium hover:text-primary">{c.title}</Link>
                )}
                {compact && <span className="block truncate text-xs text-muted-foreground">{c.topic ?? "No topic"}</span>}
              </td>
              {!compact && <td className="truncate px-4 py-2.5 text-muted-foreground">{c.topic ?? "—"}</td>}
              {!compact && <td className="truncate px-4 py-2.5 text-muted-foreground">{c.platform ?? "—"}</td>}
              <td className="px-4 py-2.5 text-right tabular">{fmt(c.views)}</td>
              <td className="px-4 py-2.5 text-right tabular">{pct(c.retention)}</td>
              <td className="px-4 py-2.5 text-right tabular">{pct(engagementRate(c)?.value, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

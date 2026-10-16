import { Link } from "@tanstack/react-router";
import { engagement, fmt, type DemoContent } from "@/lib/demo-data";

export function ContentTable({ items, compact }: { items: DemoContent[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className={`px-4 py-2 font-medium ${compact ? "w-[46%]" : "w-[40%]"}`}>Title</th>
            {!compact && <th className="px-4 py-2 font-medium">Topic</th>}
            <th className="px-4 py-2 text-right font-medium">Views</th>
            <th className="px-4 py-2 text-right font-medium">Retention</th>
            <th className="px-4 py-2 text-right font-medium">{compact ? "Engage." : "Engagement"}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="px-4 py-2.5">
                <Link to="/diagnosis" search={{ id: c.id }} className="block truncate font-medium hover:text-primary">{c.title}</Link>
                {compact && <span className="block truncate text-xs text-muted-foreground">{c.topic}</span>}
              </td>
              {!compact && <td className="truncate px-4 py-2.5 text-muted-foreground">{c.topic}</td>}
              <td className="px-4 py-2.5 text-right tabular">{fmt(c.views)}</td>
              <td className="px-4 py-2.5 text-right tabular">{c.retention}%</td>
              <td className="px-4 py-2.5 text-right tabular">{engagement(c).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

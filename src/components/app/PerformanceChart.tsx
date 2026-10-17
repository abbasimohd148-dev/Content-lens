import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmt } from "@/lib/analytics";

export function PerformanceChart({ data, height = 220 }: { data: { date: string; views: number }[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="cl-views" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => fmt(v)} />
          <Tooltip
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
            formatter={(v: number) => [v.toLocaleString(), "Views"]}
          />
          <Area type="monotone" dataKey="views" stroke="var(--chart-1)" strokeWidth={1.75} fill="url(#cl-views)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GroupBars({ rows }: { rows: { key: string; n: number; lift: number | null; lowSample: boolean }[] }) {
  const max = Math.max(...rows.map((r) => r.lift ?? 0), 1);
  return (
    <div className="space-y-3">
      {rows.map((t) => (
        <div key={t.key}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate">{t.key}{t.lowSample && <span className="ml-1.5 text-[10px] text-muted-foreground">low sample</span>}</span>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">{t.lift === null ? "—" : `${t.lift.toFixed(1)}×`} · n={t.n}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-muted">
            <div className={`h-full rounded-full ${t.lowSample ? "bg-chart-2" : "bg-primary"}`} style={{ width: `${Math.min(100, ((t.lift ?? 0) / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

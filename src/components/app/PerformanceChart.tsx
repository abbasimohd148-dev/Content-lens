import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmt } from "@/lib/analytics";

export function PerformanceChart({ data, height = 220 }: { data: { date: string; views: number }[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="cl-views" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} width={48} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => fmt(v)} />
          <Tooltip
            cursor={{ stroke: "var(--chart-1)", strokeOpacity: 0.3, strokeWidth: 1 }}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, boxShadow: "var(--shadow-float)", padding: "8px 12px", color: "var(--foreground)" }}
            labelStyle={{ color: "var(--muted-foreground)", marginBottom: 2 }}
            formatter={(v: number) => [v.toLocaleString(), "Views"]}
          />
          <Area type="monotone" dataKey="views" stroke="var(--chart-1)" strokeWidth={2.25} fill="url(#cl-views)" activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)", fill: "var(--chart-1)" }} />
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
          <div className="mt-1.5 h-2 rounded-full bg-muted">
            <div className={`h-full rounded-full ${t.lowSample ? "bg-chart-2/40" : "bg-gradient-to-r from-primary/70 to-primary"}`} style={{ width: `${Math.min(100, ((t.lift ?? 0) / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

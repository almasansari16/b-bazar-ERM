import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend as RLegend, ComposedChart } from 'recharts';
import { CHART, axisProps, tooltipStyle, Legend } from './index';
import { formatPKRCompact, formatPKR, formatCompact } from '@/utils/format';
import type { SeriesPoint } from '@/utils/analytics';

export function RevenueChart({ data, metric = 'revenue', color = CHART.indigo, compare }: { data: SeriesPoint[]; metric?: 'revenue' | 'orders' | 'aov' | 'customers'; color?: string; compare?: boolean }) {
  const money = metric === 'revenue' || metric === 'aov';
  const id = `g-${metric}-${color.slice(1)}`;
  const withPrev = compare ? data.map((d, i) => ({ ...d, prev: Math.round((data[Math.max(0, i - 1)]?.[metric] ?? d[metric]) * (0.82 + ((i * 37) % 17) / 100)) })) : data;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={withPrev} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.22} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} width={money ? 64 : 40} tickFormatter={(v) => (money ? formatPKRCompact(v).replace('Rs. ', '') : formatCompact(v))} />
        <Tooltip {...tooltipStyle} formatter={(raw, nm) => { const v = Number(raw); const n = String(nm); return [money ? formatPKR(v) : v.toLocaleString(), n === 'prev' ? 'Previous period' : metric === 'aov' ? 'Avg. order value' : metric[0].toUpperCase() + metric.slice(1)]; }} />
        {compare && <Area type="monotone" dataKey="prev" stroke={CHART.slate} strokeDasharray="4 4" fill="none" strokeWidth={1.5} dot={false} />}
        <Area type="monotone" dataKey={metric} stroke={color} strokeWidth={2.5} fill={`url(#${id})`} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueOrdersCombo({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs><linearGradient id="combo-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART.indigo} stopOpacity={0.2} /><stop offset="100%" stopColor={CHART.indigo} stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={24} />
        <YAxis yAxisId="l" {...axisProps} width={60} tickFormatter={(v) => formatPKRCompact(v).replace('Rs. ', '')} />
        <YAxis yAxisId="r" orientation="right" {...axisProps} width={36} />
        <Tooltip {...tooltipStyle} formatter={(raw, nm) => { const v = Number(raw); const n = String(nm); return [n === 'revenue' ? formatPKR(v) : v.toLocaleString(), n === 'revenue' ? 'Revenue' : 'Orders']; }} />
        <RLegend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={(v) => (v === 'revenue' ? 'Revenue' : 'Orders')} />
        <Bar yAxisId="r" dataKey="orders" fill={CHART.cyan} radius={[4, 4, 0, 0]} maxBarSize={18} opacity={0.85} />
        <Area yAxisId="l" type="monotone" dataKey="revenue" stroke={CHART.indigo} strokeWidth={2.5} fill="url(#combo-rev)" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function SimpleBars({ data, dataKey, nameKey, color = CHART.indigo, money, horizontal, colors }: { data: object[]; dataKey: string; nameKey: string; color?: string; money?: boolean; horizontal?: boolean; colors?: string[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 4, right: 12, left: horizontal ? 8 : 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} horizontal={!horizontal} vertical={!!horizontal} />
        {horizontal ? <><XAxis type="number" {...axisProps} tickFormatter={(v) => (money ? formatPKRCompact(v).replace('Rs. ', '') : formatCompact(v))} /><YAxis type="category" dataKey={nameKey} {...axisProps} width={110} /></>
          : <><XAxis dataKey={nameKey} {...axisProps} interval={0} tick={{ ...axisProps.tick, fontSize: 10 }} /><YAxis {...axisProps} width={money ? 56 : 36} tickFormatter={(v) => (money ? formatPKRCompact(v).replace('Rs. ', '') : formatCompact(v))} /></>}
        <Tooltip {...tooltipStyle} cursor={{ fill: '#F1F5F9' }} formatter={(raw) => { const v = Number(raw); return [money ? formatPKR(v) : v.toLocaleString(), '']; }} />
        <Bar dataKey={dataKey} fill={color} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={horizontal ? 18 : 36}>
          {colors && data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, money, center }: { data: { name: string; value: number; color?: string }[]; money?: boolean; center?: { label: string; value: string } }) {
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <div className="grid h-full grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_1fr]">
      <div className="relative h-full min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%" paddingAngle={2} stroke="none">
              {data.map((d, i) => <Cell key={d.name} fill={d.color ?? CHART.series[i % CHART.series.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={(raw, nm) => { const v = Number(raw); const n = String(nm); return [`${money ? formatPKR(v) : v.toLocaleString()} (${((v / total) * 100).toFixed(1)}%)`, n]; }} />
          </PieChart>
        </ResponsiveContainer>
        {center && <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-lg font-extrabold leading-none">{center.value}</p><p className="mt-1 text-[11px] text-ink-soft">{center.label}</p></div></div>}
      </div>
      <Legend items={data.map((d, i) => ({ label: d.name, color: d.color ?? CHART.series[i % CHART.series.length], value: `${((d.value / total) * 100).toFixed(0)}%` }))} />
    </div>
  );
}

export function MultiLine({ data, lines }: { data: object[]; lines: { key: string; name: string; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} width={40} tickFormatter={(v) => formatCompact(v)} />
        <Tooltip {...tooltipStyle} />
        <RLegend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        {lines.map((l) => <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.2} dot={false} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

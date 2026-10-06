import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useMarket } from '@/store/useMarket';
import { useCategoryMap } from '@/hooks/useCatalog';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader, ChartCard, RangeFilter, CHART } from '@/components/dashboard';
import { RevenueOrdersCombo, SimpleBars, Donut, RevenueChart } from '@/components/dashboard/Charts';
import { Card, CardHeader } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { buildSeries, sumSeries, categoryBreakdown, cityBreakdown, paymentBreakdown, RANGE_DAYS, type RangeKey } from '@/utils/analytics';
import { formatPKR, formatNumber } from '@/utils/format';
import { downloadCSV } from '@/utils/csv';

export default function AdminReports() {
  usePageMeta('Reports · Admin');
  const orders = useMarket((s) => s.orders);
  const cats = useCategoryMap();
  const loading = useSimulatedLoad('arep', 500);
  const [range, setRange] = useState<RangeKey>('12m');
  const series = useMemo(() => buildSeries(orders, RANGE_DAYS[range]), [orders, range]);
  const t = sumSeries(series);
  const catData = categoryBreakdown(orders, t.revenue, Object.fromEntries(Object.values(cats).map((c) => [c.slug, c.short])));
  const cityData = cityBreakdown(orders, t.revenue);
  const reports = [
    ['Sales summary', 'GMV, orders and AOV by day', () => series.map((s) => ({ period: s.label, gmv: s.revenue, orders: s.orders, aov: s.aov }))],
    ['Category performance', 'GMV by category', () => catData.map((c) => ({ category: c.name, gmv: c.value }))],
    ['Sales by city', 'Regional distribution', () => cityData.map((c) => ({ city: c.city, gmv: c.value }))],
    ['Order export', 'All recent orders', () => orders.map((o) => ({ id: o.id, customer: o.customerName, city: o.address.city, total: o.total, status: o.status }))],
  ] as const;
  return (
    <>
      <PageHeader title="Reports" subtitle={`${formatPKR(t.revenue)} GMV · ${formatNumber(t.orders)} orders in period`} actions={<RangeFilter value={range} onChange={setRange} options={['7d', '30d', '3m', '12m']} />} />
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard loading={loading} title="GMV & Orders" height={300}><RevenueOrdersCombo data={series} /></ChartCard>
        <ChartCard loading={loading} title="Average Order Value" height={300}><RevenueChart data={series} metric="aov" color={CHART.violet} /></ChartCard>
        <ChartCard loading={loading} title="Category Performance" height={320}><SimpleBars data={catData.slice(0, 10)} dataKey="value" nameKey="name" horizontal money colors={CHART.series} /></ChartCard>
        <ChartCard loading={loading} title="Payment Mix" height={320}><Donut data={paymentBreakdown(orders, t.orders)} center={{ label: 'orders', value: formatNumber(t.orders) }} /></ChartCard>
      </div>
      <Card className="mt-4">
        <CardHeader title="Export reports" subtitle="CSV exports generated in the browser" />
        <ul className="mt-3 grid gap-3 p-5 pt-2 sm:grid-cols-2">
          {reports.map(([title, desc, rows]) => (
            <li key={title} className="flex items-center gap-3 rounded-xl border border-line p-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><FileSpreadsheet className="h-5 w-5" /></span>
              <div className="flex-1"><p className="text-sm font-semibold">{title}</p><p className="text-xs text-ink-soft">{desc}</p></div>
              <Button size="sm" variant="outline" onClick={() => { downloadCSV(`${title.toLowerCase().replace(/\s/g, '-')}.csv`, rows() as Record<string, unknown>[]); toast.success(`${title} exported.`); }}><Download className="h-4 w-4" />CSV</Button>
            </li>
          ))}
          <li className="flex items-center gap-3 rounded-xl border border-dashed border-line p-4 sm:col-span-2"><span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600"><FileText className="h-5 w-5" /></span><div className="flex-1"><p className="text-sm font-semibold">Scheduled board pack</p><p className="text-xs text-ink-soft">Monthly PDF emailed to leadership on the 1st</p></div><Button size="sm" variant="secondary" onClick={() => toast.success('Schedule saved.')}>Schedule</Button></li>
        </ul>
      </Card>
    </>
  );
}

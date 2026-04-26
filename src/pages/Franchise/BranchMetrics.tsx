import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';
import {
  Activity, TrendingUp, Users, ShoppingCart,
  Loader2, RefreshCw, DollarSign, Package, Clock,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const BranchMetrics = () => {
  const { organization, branches } = useOrganization();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [daysBack, setDaysBack] = useState(30);
  const [calculating, setCalculating] = useState(false);

  const dateStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    return d.toISOString().split('T')[0];
  }, [daysBack]);

  const branchIds = branches.map(b => b.id);
  const filterIds = selectedBranch === 'all' ? branchIds : [selectedBranch];

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['branch-metrics', organization?.id, selectedBranch, dateStart],
    queryFn: async () => {
      if (filterIds.length === 0) return [];

      const { data, error } = await supabase
        .from('branch_metrics')
        .select('*, restaurants!inner(name, branch_code)')
        .in('restaurant_id', filterIds)
        .gte('metric_date', dateStart)
        .order('metric_date', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: branchIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const handleRunAggregation = async () => {
    setCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke('aggregate-branch-metrics', {
        body: { date: new Date().toISOString().split('T')[0] },
      });
      if (error) throw error;
      toast.success(`Metrics aggregated for ${data?.restaurants_processed || 0} branches`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Aggregation failed');
    } finally {
      setCalculating(false);
    }
  };

  // Aggregate KPIs
  const kpis = useMemo(() => {
    if (!metrics?.length) return { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, avgCheck: 0, avgPrepTime: 0, inventoryValue: 0, daysTracked: 0 };

    const totalRevenue = metrics.reduce((s, m) => s + (Number(m.daily_revenue) || 0), 0);
    const totalOrders = metrics.reduce((s, m) => s + (Number(m.daily_orders) || 0), 0);
    const totalCustomers = metrics.reduce((s, m) => s + (Number(m.daily_customers) || 0), 0);
    const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const prepTimes = metrics.filter(m => m.avg_prep_time != null);
    const avgPrepTime = prepTimes.length > 0
      ? Math.round(prepTimes.reduce((s, m) => s + Number(m.avg_prep_time), 0) / prepTimes.length)
      : 0;
    const latestPerBranch = new Map<string, number>();
    metrics.forEach(m => latestPerBranch.set(m.restaurant_id, Number(m.inventory_value) || 0));
    const inventoryValue = Array.from(latestPerBranch.values()).reduce((s, v) => s + v, 0);
    const uniqueDates = new Set(metrics.map(m => m.metric_date));

    return { totalRevenue, totalOrders, totalCustomers, avgCheck, avgPrepTime, inventoryValue, daysTracked: uniqueDates.size };
  }, [metrics]);

  // Chart data — aggregate by date
  const chartData = useMemo(() => {
    if (!metrics?.length) return [];
    const byDate = new Map<string, { date: string; revenue: number; orders: number; customers: number }>();
    metrics.forEach(m => {
      const existing = byDate.get(m.metric_date) || { date: m.metric_date, revenue: 0, orders: 0, customers: 0 };
      existing.revenue += Number(m.daily_revenue) || 0;
      existing.orders += Number(m.daily_orders) || 0;
      existing.customers += Number(m.daily_customers) || 0;
      byDate.set(m.metric_date, existing);
    });
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [metrics]);

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-indigo-400" size={24} /> Branch Metrics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Daily KPIs across all franchise locations</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={daysBack}
            onChange={e => setDaysBack(Number(e.target.value))}
            className="bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={90}>90 Days</option>
          </select>
          <button
            onClick={handleRunAggregation}
            disabled={calculating}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
          >
            {calculating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Aggregate Today
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Revenue', value: fmt(kpis.totalRevenue), icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', sub: `${kpis.daysTracked} days` },
          { label: 'Total Orders', value: kpis.totalOrders.toLocaleString(), icon: ShoppingCart, gradient: 'from-blue-500 to-indigo-600', sub: `${kpis.daysTracked} days` },
          { label: 'Unique Customers', value: kpis.totalCustomers.toLocaleString(), icon: Users, gradient: 'from-violet-500 to-purple-600', sub: 'cumulative' },
          { label: 'Avg Check', value: fmt(kpis.avgCheck), icon: TrendingUp, gradient: 'from-amber-500 to-orange-600', sub: 'per order' },
          { label: 'Avg Prep Time', value: `${kpis.avgPrepTime} min`, icon: Clock, gradient: 'from-cyan-500 to-teal-600', sub: 'kitchen avg' },
          { label: 'Inventory Value', value: fmt(kpis.inventoryValue), icon: Package, gradient: 'from-rose-500 to-red-600', sub: 'current stock' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${card.gradient} shadow-xl`}>
              <div className="absolute top-0 right-0 p-2 opacity-10"><Icon size={32} className="text-white" /></div>
              <div className="text-lg font-bold text-white leading-tight">{isLoading ? '...' : card.value}</div>
              <div className="text-white/70 text-[10px] mt-0.5">{card.label}</div>
              <div className="text-white/50 text-[9px]">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue trend chart */}
      {chartData.length > 1 && (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Revenue Trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={d => d.slice(5)} />
                <YAxis yAxisId="rev" stroke="#10b981" fontSize={10} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="ord" orientation="right" stroke="#6366f1" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number, name: string) => [name === 'revenue' ? fmt(v) : v, name === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} />
                <Area yAxisId="ord" type="monotone" dataKey="orders" stroke="#6366f1" fill="url(#ordGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Metrics table */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Daily Metrics Log</h3>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-slate-500 uppercase">Branch</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">Revenue</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">Orders</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">Customers</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">Avg Check</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Inventory</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400"><Loader2 size={20} className="animate-spin inline mr-2" />Loading...</td></tr>
              ) : !metrics?.length ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No metrics yet — click "Aggregate Today"</td></tr>
              ) : (
                [...metrics].reverse().map((m: any) => (
                  <tr key={m.id} className="border-b border-slate-50 dark:border-white/3 hover:bg-slate-50/50 dark:hover:bg-white/3">
                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-mono text-xs">{m.metric_date}</td>
                    <td className="px-3 py-2.5 text-slate-800 dark:text-white font-medium text-xs">{m.restaurants?.name || '—'}</td>
                    <td className="px-3 py-2.5 text-right text-emerald-500 font-semibold">{fmt(Number(m.daily_revenue) || 0)}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300">{m.daily_orders ?? 0}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300">{m.daily_customers ?? 0}</td>
                    <td className="px-3 py-2.5 text-right text-amber-400">{fmt(Number(m.avg_check) || 0)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-500">{fmt(Number(m.inventory_value) || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BranchMetrics;

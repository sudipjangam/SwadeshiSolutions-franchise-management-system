import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import {
  IndianRupee, TrendingUp, TrendingDown, BarChart3,
  Loader2, ArrowUpRight, ArrowDownRight, Store,
  Receipt, Package, Percent,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface BranchPnL {
  id: string;
  name: string;
  fullName: string;
  isHQ: boolean;
  revenue: number;
  expenses: number;
  cogs: number;
  commission: number;
  royalty: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
}

const CrossBranchPnL = () => {
  const { organization, branches } = useOrganization();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const { dateStart, monthStr } = useMemo(() => {
    const d = new Date();
    if (period === 'month') d.setDate(1);
    else if (period === 'quarter') d.setMonth(d.getMonth() - 3, 1);
    else d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    const ms = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    return { dateStart: d.toISOString(), monthStr: ms };
  }, [period]);

  const branchIds = branches.map(b => b.id);

  const { data: pnlData, isLoading } = useQuery({
    queryKey: ['franchise-pnl-v2', organization?.id, dateStart, period],
    queryFn: async () => {
      if (branchIds.length === 0) return { branches: [], totals: emptyTotals() };

      const [ordersRes, expensesRes, cogsRes, commissionsRes] = await Promise.all([
        // Revenue from completed orders
        supabase
          .from('orders')
          .select('restaurant_id, total')
          .in('restaurant_id', branchIds)
          .gte('created_at', dateStart)
          .eq('status', 'completed'),

        // Operating expenses
        supabase
          .from('expenses')
          .select('restaurant_id, amount')
          .in('restaurant_id', branchIds)
          .gte('expense_date', dateStart.split('T')[0]),

        // COGS from inventory usage transactions
        supabase
          .from('inventory_transactions')
          .select('restaurant_id, total_cost')
          .in('restaurant_id', branchIds)
          .gte('created_at', dateStart)
          .eq('transaction_type', 'usage'),

        // Commission/royalty from commission_transactions
        supabase
          .from('commission_transactions')
          .select('restaurant_id, commission_amount, royalty_amount, payment_status')
          .in('restaurant_id', branchIds)
          .gte('commission_month', monthStr),
      ]);

      const orders = ordersRes.data ?? [];
      const expenses = expensesRes.data ?? [];
      const cogsItems = cogsRes.data ?? [];
      const commissions = commissionsRes.data ?? [];

      const branchPnL: BranchPnL[] = branches.map(branch => {
        const rev = orders
          .filter(o => o.restaurant_id === branch.id)
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const exp = expenses
          .filter(e => e.restaurant_id === branch.id)
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const cogs = cogsItems
          .filter(c => c.restaurant_id === branch.id)
          .reduce((sum, c) => sum + Math.abs(Number(c.total_cost) || 0), 0);

        const branchCommissions = commissions.filter(c => c.restaurant_id === branch.id);
        const commission = branchCommissions.reduce((sum, c) => sum + (Number(c.commission_amount) || 0), 0);
        const royalty = branchCommissions.reduce((sum, c) => sum + (Number(c.royalty_amount) || 0), 0);

        const grossProfit = rev - cogs;
        const netProfit = grossProfit - exp - commission - royalty;
        const margin = rev > 0 ? (netProfit / rev) * 100 : 0;

        return {
          id: branch.id,
          name: branch.branch_code || branch.name.slice(0, 12),
          fullName: branch.name,
          isHQ: branch.is_headquarters,
          revenue: rev,
          expenses: exp,
          cogs,
          commission,
          royalty,
          grossProfit,
          netProfit,
          margin: Math.round(margin * 10) / 10,
        };
      }).sort((a, b) => b.netProfit - a.netProfit);

      const totals = {
        revenue: branchPnL.reduce((s, b) => s + b.revenue, 0),
        expenses: branchPnL.reduce((s, b) => s + b.expenses, 0),
        cogs: branchPnL.reduce((s, b) => s + b.cogs, 0),
        commission: branchPnL.reduce((s, b) => s + b.commission, 0),
        royalty: branchPnL.reduce((s, b) => s + b.royalty, 0),
        grossProfit: branchPnL.reduce((s, b) => s + b.grossProfit, 0),
        netProfit: branchPnL.reduce((s, b) => s + b.netProfit, 0),
        margin: 0,
      };
      totals.margin = totals.revenue > 0 ? Math.round((totals.netProfit / totals.revenue) * 1000) / 10 : 0;

      return { branches: branchPnL, totals };
    },
    enabled: branchIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const totals = pnlData?.totals ?? emptyTotals();
  const branchRows = pnlData?.branches ?? [];

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cross-Branch P&L</h1>
          <p className="text-sm text-slate-500 mt-0.5">Profit & Loss with commission and COGS deductions</p>
        </div>
        <div className="flex gap-1 bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 rounded-xl p-1">
          {(['month', 'quarter', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${period === p ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
              {p === 'month' ? 'This Month' : p === 'quarter' ? 'Quarter' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards — 7 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { label: 'Revenue', value: fmt(totals.revenue), icon: IndianRupee, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'COGS', value: fmt(totals.cogs), icon: Package, gradient: 'from-orange-500 to-amber-600' },
          { label: 'Gross Profit', value: fmt(totals.grossProfit), icon: TrendingUp, gradient: totals.grossProfit >= 0 ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-rose-600' },
          { label: 'Expenses', value: fmt(totals.expenses), icon: TrendingDown, gradient: 'from-red-500 to-rose-600' },
          { label: 'Commission', value: fmt(totals.commission), icon: Receipt, gradient: 'from-violet-500 to-purple-600' },
          { label: 'Royalty', value: fmt(totals.royalty), icon: Percent, gradient: 'from-cyan-500 to-teal-600' },
          { label: 'Net Profit', value: fmt(totals.netProfit), icon: BarChart3, gradient: totals.netProfit >= 0 ? 'from-indigo-500 to-violet-600' : 'from-red-600 to-red-700' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${s.gradient} shadow-xl`}>
              <div className="absolute top-0 right-0 p-2 opacity-10"><Icon size={36} className="text-white" /></div>
              <div className="text-lg font-bold text-white leading-tight">{isLoading ? '...' : s.value}</div>
              <div className="text-white/70 text-[10px] mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Comparison chart */}
      {branchRows.length > 1 && (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">P&L by Branch</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number, name: string) => [fmt(v), name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')]}
                />
                <Legend formatter={v => {
                  const labels: Record<string, string> = { revenue: 'Revenue', cogs: 'COGS', expenses: 'OpEx', commission: 'Commission', netProfit: 'Net Profit' };
                  return labels[v] || v;
                }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cogs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="netProfit" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* P&L table */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Branch-wise P&L Statement</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Branch</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">Revenue</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">COGS</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">Gross</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">OpEx</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">Commission</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">Royalty</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 uppercase">Net Profit</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Margin</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400"><Loader2 size={20} className="animate-spin inline mr-2" />Loading...</td></tr>
              ) : branchRows.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400">No data</td></tr>
              ) : (
                <>
                  {branchRows.map(row => (
                    <tr key={row.id} className="border-b border-slate-50 dark:border-white/3 hover:bg-slate-50/50 dark:hover:bg-white/3">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Store size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-800 dark:text-white">{row.fullName}</span>
                          {row.isHQ && <span className="text-[10px] px-1 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">HQ</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">{fmt(row.revenue)}</td>
                      <td className="px-3 py-3 text-right text-amber-500">{fmt(row.cogs)}</td>
                      <td className="px-3 py-3 text-right font-semibold">
                        <span className={row.grossProfit >= 0 ? 'text-blue-500' : 'text-red-500'}>{fmt(row.grossProfit)}</span>
                      </td>
                      <td className="px-3 py-3 text-right text-red-500">{fmt(row.expenses)}</td>
                      <td className="px-3 py-3 text-right text-violet-400">{fmt(row.commission)}</td>
                      <td className="px-3 py-3 text-right text-cyan-400">{fmt(row.royalty)}</td>
                      <td className="px-3 py-3 text-right font-bold">
                        <span className={row.netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600'}>
                          {row.netProfit >= 0 ? '+' : ''}{fmt(row.netProfit)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {row.margin >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {row.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals */}
                  <tr className="bg-slate-50 dark:bg-white/3 font-bold">
                    <td className="px-5 py-3 text-slate-800 dark:text-white">TOTAL</td>
                    <td className="px-3 py-3 text-right text-emerald-600 dark:text-emerald-400">{fmt(totals.revenue)}</td>
                    <td className="px-3 py-3 text-right text-amber-500">{fmt(totals.cogs)}</td>
                    <td className="px-3 py-3 text-right text-blue-500">{fmt(totals.grossProfit)}</td>
                    <td className="px-3 py-3 text-right text-red-500">{fmt(totals.expenses)}</td>
                    <td className="px-3 py-3 text-right text-violet-400">{fmt(totals.commission)}</td>
                    <td className="px-3 py-3 text-right text-cyan-400">{fmt(totals.royalty)}</td>
                    <td className="px-3 py-3 text-right text-indigo-600 dark:text-indigo-400">
                      {totals.netProfit >= 0 ? '+' : ''}{fmt(totals.netProfit)}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-500">{totals.margin}%</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* P&L waterfall explanation */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">P&L Formula</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">Revenue</span>
          <span>−</span>
          <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded">COGS</span>
          <span>=</span>
          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded">Gross Profit</span>
          <span>−</span>
          <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded">OpEx</span>
          <span>−</span>
          <span className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded">Commission</span>
          <span>−</span>
          <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded">Royalty</span>
          <span>=</span>
          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded font-bold">Net Profit</span>
        </div>
      </div>
    </div>
  );
};

function emptyTotals() {
  return { revenue: 0, expenses: 0, cogs: 0, commission: 0, royalty: 0, grossProfit: 0, netProfit: 0, margin: 0 };
}

export default CrossBranchPnL;

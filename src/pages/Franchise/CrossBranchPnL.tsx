import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import {
  IndianRupee, TrendingUp, TrendingDown, BarChart3,
  Loader2, ArrowUpRight, ArrowDownRight, Store,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CrossBranchPnL = () => {
  const { organization, branches } = useOrganization();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const dateStart = useMemo(() => {
    const d = new Date();
    if (period === 'month') d.setDate(1);
    else if (period === 'quarter') d.setMonth(d.getMonth() - 3, 1);
    else d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [period]);

  const branchIds = branches.map(b => b.id);

  const { data: pnlData, isLoading } = useQuery({
    queryKey: ['franchise-pnl', organization?.id, dateStart],
    queryFn: async () => {
      if (branchIds.length === 0) return { branches: [], totals: { revenue: 0, expenses: 0, profit: 0, margin: 0 } };

      const [ordersRes, expensesRes] = await Promise.all([
        supabase
          .from('orders')
          .select('restaurant_id, total_amount')
          .in('restaurant_id', branchIds)
          .gte('created_at', dateStart)
          .eq('status', 'completed'),
        supabase
          .from('expenses')
          .select('restaurant_id, amount')
          .in('restaurant_id', branchIds)
          .gte('date', dateStart.split('T')[0]),
      ]);

      const orders = ordersRes.data ?? [];
      const expenses = expensesRes.data ?? [];

      const branchPnL = branches.map(branch => {
        const rev = orders
          .filter(o => o.restaurant_id === branch.id)
          .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const exp = expenses
          .filter(e => e.restaurant_id === branch.id)
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const profit = rev - exp;
        const margin = rev > 0 ? (profit / rev) * 100 : 0;

        return {
          id: branch.id,
          name: branch.branch_code || branch.name.slice(0, 12),
          fullName: branch.name,
          isHQ: branch.is_headquarters,
          revenue: rev,
          expenses: exp,
          profit,
          margin: Math.round(margin * 10) / 10,
        };
      }).sort((a, b) => b.profit - a.profit);

      const totals = {
        revenue: branchPnL.reduce((s, b) => s + b.revenue, 0),
        expenses: branchPnL.reduce((s, b) => s + b.expenses, 0),
        profit: branchPnL.reduce((s, b) => s + b.profit, 0),
        margin: 0,
      };
      totals.margin = totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 1000) / 10 : 0;

      return { branches: branchPnL, totals };
    },
    enabled: branchIds.length > 0,
  });

  const totals = pnlData?.totals ?? { revenue: 0, expenses: 0, profit: 0, margin: 0 };
  const branchRows = pnlData?.branches ?? [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cross-Branch P&L</h1>
          <p className="text-sm text-slate-500 mt-0.5">Profit & Loss across all branches</p>
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totals.revenue.toLocaleString()}`, icon: IndianRupee, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Total Expenses', value: `₹${totals.expenses.toLocaleString()}`, icon: TrendingDown, gradient: 'from-red-500 to-rose-600' },
          { label: 'Net Profit', value: `₹${totals.profit.toLocaleString()}`, icon: TrendingUp, gradient: totals.profit >= 0 ? 'from-indigo-500 to-violet-600' : 'from-red-600 to-red-700' },
          { label: 'Profit Margin', value: `${totals.margin}%`, icon: BarChart3, gradient: 'from-amber-500 to-orange-600' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${s.gradient} shadow-xl`}>
              <div className="absolute top-0 right-0 p-3 opacity-10"><Icon size={48} className="text-white" /></div>
              <div className="text-2xl font-bold text-white">{isLoading ? '...' : s.value}</div>
              <div className="text-white/70 text-xs mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Comparison chart */}
      {branchRows.length > 1 && (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Revenue vs Expenses by Branch</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number, name: string) => [`₹${v.toLocaleString()}`, name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit']}
                />
                <Legend formatter={v => v.charAt(0).toUpperCase() + v.slice(1)} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Branch P&L table */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Branch-wise Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Branch</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Expenses</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Profit</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Margin</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400"><Loader2 size={20} className="animate-spin inline mr-2" />Loading...</td></tr>
              ) : branchRows.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">No data</td></tr>
              ) : (
                <>
                  {branchRows.map(row => (
                    <tr key={row.id} className="border-b border-slate-50 dark:border-white/3 hover:bg-slate-50/50 dark:hover:bg-white/3">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Store size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-800 dark:text-white">{row.fullName}</span>
                          {row.isHQ && <span className="text-[10px] px-1 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">HQ</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">₹{row.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-500 font-semibold">₹{row.expenses.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold">
                        <span className={row.profit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600'}>
                          {row.profit >= 0 ? '+' : ''}₹{row.profit.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {row.margin >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {row.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-slate-50 dark:bg-white/3 font-bold">
                    <td className="px-6 py-3 text-slate-800 dark:text-white">TOTAL</td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">₹{totals.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-500">₹{totals.expenses.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-indigo-600 dark:text-indigo-400">
                      {totals.profit >= 0 ? '+' : ''}₹{totals.profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right text-emerald-500">{totals.margin}%</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CrossBranchPnL;

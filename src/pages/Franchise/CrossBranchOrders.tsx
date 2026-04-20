import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useBranchSwitcher } from '@/hooks/useBranchSwitcher';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag, IndianRupee, TrendingUp, Store,
  Loader2, Search, Filter,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  preparing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  delivered: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

const CrossBranchOrders = () => {
  const { organization, branches } = useOrganization();
  const { currentBranch, isAllBranches } = useBranchSwitcher();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('month');

  const restaurantIds = useMemo(() =>
    isAllBranches ? branches.map(b => b.id) : [currentBranch].filter(Boolean) as string[],
    [isAllBranches, branches, currentBranch]
  );

  const dateStart = useMemo(() => {
    const d = new Date();
    if (dateRange === 'today') d.setHours(0, 0, 0, 0);
    else if (dateRange === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(1);
    return d.toISOString();
  }, [dateRange]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['franchise-orders', organization?.id, restaurantIds, dateStart, statusFilter],
    queryFn: async () => {
      if (restaurantIds.length === 0) return [];
      let query = supabase
        .from('orders')
        .select('id, order_number, total_amount, status, order_type, restaurant_id, created_at, customer_name')
        .in('restaurant_id', restaurantIds)
        .gte('created_at', dateStart)
        .order('created_at', { ascending: false })
        .limit(500);

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: restaurantIds.length > 0,
  });

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const avgOrder = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  // Branch breakdown for pie chart
  const branchBreakdown = branches.map(b => ({
    name: b.branch_code || b.name.slice(0, 12),
    value: orders.filter(o => o.restaurant_id === b.id).length,
  })).filter(b => b.value > 0);

  // Filtered for search
  const filtered = orders.filter(o =>
    !search || (o.order_number?.toLowerCase().includes(search.toLowerCase()))
    || (o.customer_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const getBranchName = (rid: string) => {
    const b = branches.find(x => x.id === rid);
    return b?.branch_code || b?.name?.slice(0, 15) || '—';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cross-Branch Orders</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {isAllBranches ? 'All branches' : getBranchName(currentBranch as string)} · {orders.length} orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length.toLocaleString(), icon: ShoppingBag, gradient: 'from-violet-500 to-purple-600' },
          { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Avg Order', value: `₹${avgOrder.toLocaleString()}`, icon: TrendingUp, gradient: 'from-indigo-500 to-blue-600' },
          { label: 'Completed', value: completedOrders.toLocaleString(), icon: Store, gradient: 'from-amber-500 to-orange-600' },
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

      {/* Filters + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search order # or customer..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="flex gap-1.5 bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 rounded-xl p-1">
              {(['today', 'week', 'month'] as const).map(r => (
                <button key={r} onClick={() => setDateRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${dateRange === r ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 rounded-xl p-1">
              {['all', 'completed', 'pending', 'preparing', 'cancelled'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Order #</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Branch</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Customer</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400"><Loader2 size={20} className="animate-spin inline mr-2" />Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">No orders found</td></tr>
                  ) : (
                    filtered.slice(0, 100).map(order => (
                      <tr key={order.id} className="border-b border-slate-50 dark:border-white/3 hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                          {order.order_number || order.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded border border-indigo-500/20 font-mono">
                            {getBranchName(order.restaurant_id)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                          {order.customer_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-sm text-slate-800 dark:text-white">
                          ₹{(Number(order.total_amount) || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`text-[10px] capitalize border ${statusColors[order.status] || 'bg-gray-500/10 text-gray-400'}`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 100 && (
              <div className="px-4 py-2 text-xs text-slate-500 border-t border-white/5">Showing 100 of {filtered.length} orders</div>
            )}
          </div>
        </div>

        {/* Pie chart */}
        {isAllBranches && branchBreakdown.length > 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Orders by Branch</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={branchBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={70} innerRadius={40} paddingAngle={3}>
                    {branchBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    formatter={(v: number) => [v, 'Orders']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-3">
              {branchBreakdown.map((b, i) => (
                <div key={b.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-500 flex-1">{b.name}</span>
                  <span className="font-semibold text-slate-700 dark:text-white">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossBranchOrders;

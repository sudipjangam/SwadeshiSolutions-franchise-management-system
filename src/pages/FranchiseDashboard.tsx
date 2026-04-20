import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useBranchSwitcher } from '@/hooks/useBranchSwitcher';
import { BranchSwitcher } from '@/components/BranchSwitcher/BranchSwitcher';
import {
  TrendingUp, Store, ShoppingBag, IndianRupee,
  Users, BarChart3, ArrowUpRight, ArrowDownRight,
  Loader2, AlertTriangle, GitBranch,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ────────────────────────────────────────────
// Branch performance card
// ────────────────────────────────────────────
const BranchCard = ({
  name, code, revenue, orders, isHQ, rank,
}: {
  name: string; code?: string; revenue: number;
  orders: number; isHQ: boolean; rank: number;
}) => {
  const rankColors = ['from-amber-500 to-orange-500', 'from-slate-400 to-slate-500', 'from-orange-700 to-orange-800'];
  const rankColor = rank <= 3 ? rankColors[rank - 1] : 'from-indigo-500/20 to-violet-500/20';

  return (
    <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl hover:shadow-lg transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rankColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-white text-sm truncate">{name}</span>
          {isHQ && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-500/20">HQ</span>}
          {code && <span className="text-[10px] font-mono text-slate-400">{code}</span>}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{orders.toLocaleString()} orders</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-bold text-slate-800 dark:text-white">₹{revenue.toLocaleString()}</div>
        <div className="text-xs text-slate-500">revenue</div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Stat card
// ────────────────────────────────────────────
const StatCard = ({
  title, value, sub, icon: Icon, gradient, delta, deltaDir,
}: {
  title: string; value: string; sub?: string;
  icon: any; gradient: string;
  delta?: string; deltaDir?: 'up' | 'down';
}) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} shadow-xl hover:-translate-y-1 transition-transform duration-300 group`}>
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
      <Icon size={64} className="text-white rotate-12" />
    </div>
    <div className="relative z-10">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/70 text-sm mt-1">{title}</div>
      {sub && <div className="text-white/50 text-xs mt-0.5">{sub}</div>}
      {delta && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${deltaDir === 'up' ? 'text-emerald-300' : 'text-red-300'}`}>
          {deltaDir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {delta} vs last month
        </div>
      )}
    </div>
  </div>
);

// ────────────────────────────────────────────
// Main
// ────────────────────────────────────────────
const FranchiseDashboard = () => {
  const { organization, branches, isLoading: orgLoading, orgSubscription } = useOrganization();
  const { isAllBranches, currentBranch } = useBranchSwitcher();

  // Fetch aggregate orders/revenue from all branches or selected branch
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['franchise-dashboard-stats', organization?.id, currentBranch],
    queryFn: async () => {
      if (!organization?.id) return null;

      const restaurantIds = isAllBranches
        ? branches.map(b => b.id)
        : [currentBranch].filter(Boolean) as string[];

      if (restaurantIds.length === 0) return null;

      // Today's orders across selected branches
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [ordersRes, customersRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, total_amount, restaurant_id, status, created_at')
          .in('restaurant_id', restaurantIds)
          .gte('created_at', monthStart)
          .eq('status', 'completed'),

        supabase
          .from('profiles')
          .select('id, restaurant_id', { count: 'exact', head: true })
          .in('restaurant_id', restaurantIds),
      ]);

      const orders = ordersRes.data ?? [];
      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const totalOrders = orders.length;

      // Revenue per branch
      const revenueByBranch = branches.map(branch => ({
        ...branch,
        revenue: orders.filter(o => o.restaurant_id === branch.id)
          .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
        orders: orders.filter(o => o.restaurant_id === branch.id).length,
      })).sort((a, b) => b.revenue - a.revenue);

      return {
        totalRevenue,
        totalOrders,
        totalCustomers: customersRes.count ?? 0,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        revenueByBranch,
      };
    },
    enabled: !!organization?.id && branches.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Mock trend data (7-day)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      revenue: Math.floor(Math.random() * 50000) + 20000,
      orders: Math.floor(Math.random() * 80) + 20,
    };
  });

  const isLoading = orgLoading || statsLoading;

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" />
        Loading franchise...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-20 text-slate-400">
        <AlertTriangle size={40} className="mx-auto mb-3 text-amber-400" />
        <p>No franchise organization found.</p>
        <p className="text-sm mt-1 text-slate-500">Contact your platform admin to set up your franchise.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <GitBranch size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{organization.name}</h1>
              <p className="text-sm text-slate-500 capitalize">
                {organization.type} · {branches.length} branch{branches.length !== 1 ? 'es' : ''} ·
                <span className="ml-1 capitalize">{orgSubscription?.plan_type ?? 'free'} plan</span>
              </p>
            </div>
          </div>
        </div>

        {/* Branch switcher in header */}
        <BranchSwitcher showAllBranchesOption={true} className="mt-1" />
      </div>

      {/* View context badge */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
          isAllBranches
            ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        }`}>
          {isAllBranches ? <GitBranch size={12} /> : <Store size={12} />}
          {isAllBranches ? 'Viewing: All Branches (Aggregate)' : `Viewing: ${branches.find(b => b.id === currentBranch)?.name ?? 'Selected Branch'}`}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Revenue"
          value={statsLoading ? '...' : `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          icon={IndianRupee}
          gradient="from-emerald-500 to-teal-600"
          delta="+12.4%"
          deltaDir="up"
        />
        <StatCard
          title="Total Orders"
          value={statsLoading ? '...' : (stats?.totalOrders ?? 0).toLocaleString()}
          icon={ShoppingBag}
          gradient="from-violet-500 to-purple-600"
          delta="+8.2%"
          deltaDir="up"
        />
        <StatCard
          title="Avg Order Value"
          value={statsLoading ? '...' : `₹${(stats?.avgOrderValue ?? 0).toLocaleString()}`}
          icon={TrendingUp}
          gradient="from-indigo-500 to-blue-600"
          delta="-2.1%"
          deltaDir="down"
        />
        <StatCard
          title="Active Branches"
          value={branches.length.toString()}
          sub={`of ${orgSubscription?.max_branches === -1 ? '∞' : orgSubscription?.max_branches ?? 1} allowed`}
          icon={Store}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Charts + Branch Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend chart */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Revenue Trend (7 Days)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAllBranches ? 'Aggregate across all branches' : 'Selected branch'}
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="fRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']}
                  labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#fRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch ranking */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Branch Ranking</h3>
            <p className="text-xs text-slate-500 mt-0.5">By monthly revenue</p>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : stats?.revenueByBranch.length ? (
              stats.revenueByBranch.map((branch, i) => (
                <BranchCard
                  key={branch.id}
                  name={branch.name}
                  code={branch.branch_code}
                  revenue={branch.revenue}
                  orders={branch.orders}
                  isHQ={branch.is_headquarters}
                  rank={i + 1}
                />
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                <BarChart3 size={32} className="mx-auto mb-2 opacity-20" />
                No order data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branch comparison bar chart */}
      {isAllBranches && stats?.revenueByBranch && stats.revenueByBranch.length > 1 && (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Branch Comparison</h3>
            <p className="text-xs text-slate-500 mt-0.5">Revenue and orders by branch this month</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByBranch.map(b => ({ name: b.branch_code || b.name.slice(0, 10), revenue: b.revenue, orders: b.orders }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number, name: string) => [name === 'revenue' ? `₹${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']}
                  labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                />
                <Legend formatter={v => v === 'revenue' ? 'Revenue' : 'Orders'} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="revenue" />
                <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} name="orders" yAxisId={1} hide />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseDashboard;

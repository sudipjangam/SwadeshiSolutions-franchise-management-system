import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import {
  IndianRupee, Calculator, CheckCircle2, Clock, AlertTriangle,
  Loader2, Download, RefreshCw, ChevronDown, ChevronUp,
  Calendar, Building2, Receipt, CreditCard, TrendingUp,
  FileText, MoreVertical,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ─────── Types ───────
interface CommissionRow {
  id: string;
  restaurant_id: string;
  organization_id: string;
  commission_month: string;
  total_revenue: number;
  commission_percentage: number;
  commission_amount: number;
  royalty_percentage: number;
  royalty_amount: number;
  total_owed: number;
  payment_status: string;
  payment_date: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  restaurants?: { name: string; branch_code: string; is_headquarters: boolean };
}

// ─────── Helpers ───────
const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', icon: Clock },
  paid: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
  overdue: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: AlertTriangle },
  partial: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: CreditCard },
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const formatMonth = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const formatCurrency = (v: number) => `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─────── Stat Card ───────
const StatCard = ({ title, value, icon: Icon, gradient, sub }: {
  title: string; value: string; icon: any; gradient: string; sub?: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} shadow-xl hover:-translate-y-1 transition-transform duration-300 group`}>
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
      <Icon size={56} className="text-white rotate-12" />
    </div>
    <div className="relative z-10">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-white/70 text-xs mt-1">{title}</div>
      {sub && <div className="text-white/50 text-[10px] mt-0.5">{sub}</div>}
    </div>
  </div>
);

// ─────── Commission Dashboard ───────
const CommissionDashboard = () => {
  const { organization, branches } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  // Fetch commissions
  const { data: commissions, isLoading } = useQuery({
    queryKey: ['commission-transactions', organization?.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!organization?.id) return [];
      const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;

      const { data, error } = await supabase
        .from('commission_transactions')
        .select('*, restaurants(name, branch_code, is_headquarters)')
        .eq('organization_id', organization.id)
        .eq('commission_month', monthStr)
        .order('total_revenue', { ascending: false });

      if (error) throw error;
      return (data ?? []) as CommissionRow[];
    },
    enabled: !!organization?.id,
  });

  // Calculate commission
  const calculateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('calculate-monthly-commission', {
        body: {
          organization_id: organization?.id,
          month: selectedMonth,
          year: selectedYear,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['commission-transactions'] });
      toast({
        title: 'Commission Calculated',
        description: `${data.branches_processed} branches processed. Total owed: ${formatCurrency(data.total_owed)}`,
      });
    },
    onError: (err: any) => {
      toast({ title: 'Calculation Failed', description: err.message, variant: 'destructive' });
    },
  });

  // Mark as paid
  const markPaidMutation = useMutation({
    mutationFn: async (commissionId: string) => {
      setMarkingPaid(commissionId);
      const { error } = await supabase
        .from('commission_transactions')
        .update({
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', commissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-transactions'] });
      toast({ title: 'Payment Recorded' });
      setMarkingPaid(null);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setMarkingPaid(null);
    },
  });

  // Aggregate stats
  const totalRevenue = commissions?.reduce((s, c) => s + Number(c.total_revenue), 0) ?? 0;
  const totalCommission = commissions?.reduce((s, c) => s + Number(c.commission_amount), 0) ?? 0;
  const totalRoyalty = commissions?.reduce((s, c) => s + Number(c.royalty_amount), 0) ?? 0;
  const totalOwed = commissions?.reduce((s, c) => s + Number(c.total_owed), 0) ?? 0;
  const totalPaid = commissions?.filter(c => c.payment_status === 'paid').reduce((s, c) => s + Number(c.total_owed), 0) ?? 0;
  const totalPending = totalOwed - totalPaid;

  // Chart data
  const barData = commissions?.map(c => ({
    name: c.restaurants?.branch_code || c.restaurants?.name?.slice(0, 8) || 'Branch',
    revenue: Number(c.total_revenue),
    commission: Number(c.commission_amount),
    royalty: Number(c.royalty_amount),
  })) ?? [];

  const pieData = [
    { name: 'Paid', value: totalPaid },
    { name: 'Pending', value: totalPending },
  ].filter(d => d.value > 0);

  // Month picker
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2026, i).toLocaleDateString('en', { month: 'short' }),
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="text-indigo-500" size={24} />
            Commission & Royalty
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Track payments across all branches</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month/Year picker */}
          <div className="flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl px-3 py-2">
            <Calendar size={14} className="text-slate-400" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Calculate button */}
          <button
            onClick={() => calculateMutation.mutate()}
            disabled={calculateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50"
          >
            {calculateMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Calculator size={14} />
            )}
            {calculateMutation.isPending ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={IndianRupee}
          gradient="from-emerald-500 to-teal-600"
          sub={`${commissions?.length ?? 0} branches`}
        />
        <StatCard
          title="Commission"
          value={formatCurrency(totalCommission)}
          icon={TrendingUp}
          gradient="from-violet-500 to-purple-600"
        />
        <StatCard
          title="Royalty"
          value={formatCurrency(totalRoyalty)}
          icon={Receipt}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Total Owed"
          value={formatCurrency(totalOwed)}
          icon={FileText}
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard
          title="Pending"
          value={formatCurrency(totalPending)}
          icon={Clock}
          gradient="from-red-500 to-rose-600"
          sub={`${formatCurrency(totalPaid)} paid`}
        />
      </div>

      {/* Charts row */}
      {commissions && commissions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Revenue & Commission by Branch</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    formatter={(v: number, name: string) => [formatCurrency(v), name.charAt(0).toUpperCase() + name.slice(1)]}
                    labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="Revenue" />
                  <Bar dataKey="commission" fill="#10b981" radius={[6, 6, 0, 0]} name="Commission" />
                  <Bar dataKey="royalty" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Royalty" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Payment Status</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={5} dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Commission Table */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Commission Details — {formatMonth(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`)}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading...
          </div>
        ) : !commissions || commissions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Calculator size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No commission data for this month</p>
            <p className="text-xs text-slate-500 mt-1">Click "Calculate" to generate commissions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-white/5">
                  <th className="px-5 py-3 font-medium">Branch</th>
                  <th className="px-5 py-3 font-medium text-right">Revenue</th>
                  <th className="px-5 py-3 font-medium text-right">Commission</th>
                  <th className="px-5 py-3 font-medium text-right">Royalty</th>
                  <th className="px-5 py-3 font-medium text-right">Total Owed</th>
                  <th className="px-5 py-3 font-medium text-center">Status</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map(c => {
                  const status = STATUS_STYLES[c.payment_status] ?? STATUS_STYLES.pending;
                  const StatusIcon = status.icon;
                  const isExpanded = expandedRow === c.id;

                  return (
                    <>
                      <tr
                        key={c.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : c.id)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-800 dark:text-white">
                              {c.restaurants?.name ?? 'Branch'}
                            </span>
                            {c.restaurants?.is_headquarters && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-500/20">
                                HQ
                              </span>
                            )}
                            {c.restaurants?.branch_code && (
                              <span className="text-[10px] font-mono text-slate-400">{c.restaurants.branch_code}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-slate-800 dark:text-white">
                          {formatCurrency(Number(c.total_revenue))}
                        </td>
                        <td className="px-5 py-3.5 text-right text-emerald-500">
                          {formatCurrency(Number(c.commission_amount))}
                          <span className="text-[10px] text-slate-400 ml-1">({c.commission_percentage}%)</span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-blue-400">
                          {formatCurrency(Number(c.royalty_amount))}
                          <span className="text-[10px] text-slate-400 ml-1">({c.royalty_percentage}%)</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-800 dark:text-white">
                          {formatCurrency(Number(c.total_owed))}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${status.bg} ${status.text}`}>
                            <StatusIcon size={12} />
                            {c.payment_status.charAt(0).toUpperCase() + c.payment_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {c.payment_status !== 'paid' && (
                              <button
                                onClick={e => { e.stopPropagation(); markPaidMutation.mutate(c.id); }}
                                disabled={markingPaid === c.id}
                                className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                              >
                                {markingPaid === c.id ? <Loader2 size={12} className="animate-spin" /> : 'Mark Paid'}
                              </button>
                            )}
                            {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${c.id}-detail`} className="bg-slate-50/50 dark:bg-slate-800/30">
                          <td colSpan={7} className="px-5 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-slate-400">Commission Month</span>
                                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">{formatMonth(c.commission_month)}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Payment Date</span>
                                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                                  {c.payment_date ? new Date(c.payment_date).toLocaleDateString('en-IN') : '—'}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-400">Payment Reference</span>
                                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">{c.payment_reference || '—'}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Notes</span>
                                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">{c.notes || '—'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>

              {/* Totals footer */}
              <tfoot>
                <tr className="bg-slate-100/50 dark:bg-slate-800/50 font-bold text-sm">
                  <td className="px-5 py-3 text-slate-800 dark:text-white">TOTAL</td>
                  <td className="px-5 py-3 text-right text-slate-800 dark:text-white">{formatCurrency(totalRevenue)}</td>
                  <td className="px-5 py-3 text-right text-emerald-500">{formatCurrency(totalCommission)}</td>
                  <td className="px-5 py-3 text-right text-blue-400">{formatCurrency(totalRoyalty)}</td>
                  <td className="px-5 py-3 text-right text-slate-800 dark:text-white">{formatCurrency(totalOwed)}</td>
                  <td className="px-5 py-3" colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionDashboard;

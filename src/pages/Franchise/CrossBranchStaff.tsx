import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useBranchSwitcher } from '@/hooks/useBranchSwitcher';
import { BranchSwitcher } from '@/components/BranchSwitcher/BranchSwitcher';
import {
  Users, Loader2, Search, Store, UserCheck, Clock,
  Phone, Mail, Briefcase, BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState, useMemo } from 'react';

// ─────────────────────────────────────────────
interface StaffRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  restaurant_id: string;
  department: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────
const CrossBranchStaff = () => {
  const { organization, branches, isLoading: orgLoading } = useOrganization();
  const { isAllBranches, currentBranch } = useBranchSwitcher();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const restaurantIds = isAllBranches
    ? branches.map(b => b.id)
    : [currentBranch].filter(Boolean) as string[];

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['cross-branch-staff', organization?.id, restaurantIds],
    queryFn: async () => {
      if (restaurantIds.length === 0) return [];

      const { data, error } = await supabase
        .from('staff')
        .select('id, name, email, phone, role, status, restaurant_id, department, created_at')
        .in('restaurant_id', restaurantIds)
        .order('name');

      if (error) throw error;
      return (data || []) as StaffRow[];
    },
    enabled: !!organization?.id && restaurantIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Stats
  const stats = useMemo(() => {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'active').length;
    const roles = [...new Set(staff.map(s => s.role))];
    return { total, active, inactive: total - active, roleCount: roles.length };
  }, [staff]);

  // Roles for filter
  const allRoles = useMemo(() => [...new Set(staff.map(s => s.role))].sort(), [staff]);

  // Branch distribution chart
  const branchChartData = useMemo(() => {
    return branches.map(branch => {
      const branchStaff = staff.filter(s => s.restaurant_id === branch.id);
      return {
        name: branch.branch_code || branch.name.slice(0, 10),
        total: branchStaff.length,
        active: branchStaff.filter(s => s.status === 'active').length,
      };
    });
  }, [staff, branches]);

  // Filter/search
  const filtered = useMemo(() => {
    let items = [...staff];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
      );
    }
    if (filterRole !== 'all') {
      items = items.filter(s => s.role === filterRole);
    }
    return items;
  }, [staff, search, filterRole]);

  // Branch name lookup
  const branchName = (rid: string) => {
    const b = branches.find(br => br.id === rid);
    return b?.branch_code || b?.name?.slice(0, 12) || '—';
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" /> Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cross-Branch Staff</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isAllBranches ? 'All branches' : branches.find(b => b.id === currentBranch)?.name || 'Selected branch'}
          </p>
        </div>
        <BranchSwitcher showAllBranchesOption className="mt-1" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: stats.total, icon: Users, gradient: 'from-indigo-500 to-blue-600' },
          { label: 'Active', value: stats.active, icon: UserCheck, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Inactive', value: stats.inactive, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
          { label: 'Roles', value: stats.roleCount, icon: Briefcase, gradient: 'from-violet-500 to-purple-600' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${stat.gradient} shadow-xl`}>
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Icon size={48} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : stat.value}
              </div>
              <div className="text-white/70 text-xs font-medium mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Staff distribution chart */}
      {isAllBranches && branchChartData.length > 1 && (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl p-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Staff Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Headcount by branch</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                />
                <Bar dataKey="active" fill="#10b981" radius={[6, 6, 0, 0]} name="Active" />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search staff..."
            className="w-full bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/40 backdrop-blur-xl" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none backdrop-blur-xl">
          <option value="all">All Roles</option>
          {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Staff table */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                {isAllBranches && <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Branch</th>}
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400"><Loader2 size={20} className="animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  No staff found
                </td></tr>
              ) : filtered.slice(0, 100).map(s => (
                <tr key={s.id} className="border-b border-slate-50 dark:border-white/3 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-white">{s.name}</div>
                        {s.department && <div className="text-[10px] text-slate-400">{s.department}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 capitalize">
                      {s.role}
                    </Badge>
                  </td>
                  {isAllBranches && (
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Store size={12} /> {branchName(s.restaurant_id)}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {s.email && <div className="flex items-center gap-1 text-xs text-slate-500"><Mail size={10} />{s.email}</div>}
                      {s.phone && <div className="flex items-center gap-1 text-xs text-slate-500"><Phone size={10} />{s.phone}</div>}
                      {!s.email && !s.phone && <span className="text-xs text-slate-400">—</span>}
                    </div>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                      s.status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CrossBranchStaff;

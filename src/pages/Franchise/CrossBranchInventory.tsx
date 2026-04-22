import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useBranchSwitcher } from '@/hooks/useBranchSwitcher';
import { BranchSwitcher } from '@/components/BranchSwitcher/BranchSwitcher';
import {
  Package, AlertTriangle, TrendingDown, TrendingUp,
  Loader2, Search, Store, BarChart3, ArrowUpDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useState, useMemo } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface InventoryRow {
  id: string;
  name: string;
  current_stock: number;
  min_stock_level: number;
  unit: string;
  restaurant_id: string;
  category: string | null;
  cost_per_unit: number | null;
  updated_at: string;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
const CrossBranchInventory = () => {
  const { organization, branches, isLoading: orgLoading } = useOrganization();
  const { isAllBranches, currentBranch } = useBranchSwitcher();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value'>('name');
  const [filterLow, setFilterLow] = useState(false);

  const restaurantIds = isAllBranches
    ? branches.map(b => b.id)
    : [currentBranch].filter(Boolean) as string[];

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['cross-branch-inventory', organization?.id, restaurantIds],
    queryFn: async () => {
      if (restaurantIds.length === 0) return [];

      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, current_stock, min_stock_level, unit, restaurant_id, category, cost_per_unit, updated_at')
        .in('restaurant_id', restaurantIds)
        .order('name');

      if (error) throw error;
      return (data || []) as InventoryRow[];
    },
    enabled: !!organization?.id && restaurantIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Aggregate stats
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStock = inventory.filter(i => i.current_stock <= i.min_stock_level && i.current_stock > 0).length;
    const outOfStock = inventory.filter(i => i.current_stock <= 0).length;
    const totalValue = inventory.reduce((sum, i) => sum + (i.current_stock * (i.cost_per_unit || 0)), 0);
    return { totalItems, lowStock, outOfStock, totalValue };
  }, [inventory]);

  // Branch comparison chart data
  const branchChartData = useMemo(() => {
    return branches.map(branch => {
      const items = inventory.filter(i => i.restaurant_id === branch.id);
      const value = items.reduce((sum, i) => sum + (i.current_stock * (i.cost_per_unit || 0)), 0);
      const lowCount = items.filter(i => i.current_stock <= i.min_stock_level).length;
      return {
        name: branch.branch_code || branch.name.slice(0, 10),
        items: items.length,
        value: Math.round(value),
        lowStock: lowCount,
      };
    });
  }, [inventory, branches]);

  // Filtered and sorted items
  const filtered = useMemo(() => {
    let items = [...inventory];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q));
    }

    if (filterLow) {
      items = items.filter(i => i.current_stock <= i.min_stock_level);
    }

    items.sort((a, b) => {
      if (sortBy === 'stock') return a.current_stock - b.current_stock;
      if (sortBy === 'value') return (b.current_stock * (b.cost_per_unit || 0)) - (a.current_stock * (a.cost_per_unit || 0));
      return a.name.localeCompare(b.name);
    });

    return items;
  }, [inventory, search, filterLow, sortBy]);

  // Group by item name for cross-branch comparison
  const groupedItems = useMemo(() => {
    if (!isAllBranches) return null;

    const groups: Record<string, { name: string; branches: Record<string, InventoryRow> }> = {};
    for (const item of inventory) {
      if (!groups[item.name]) {
        groups[item.name] = { name: item.name, branches: {} };
      }
      groups[item.name].branches[item.restaurant_id] = item;
    }
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, isAllBranches]);

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cross-Branch Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isAllBranches ? 'Aggregate view across all branches' : `Viewing: ${branches.find(b => b.id === currentBranch)?.name || 'Selected branch'}`}
          </p>
        </div>
        <BranchSwitcher showAllBranchesOption className="mt-1" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: stats.totalItems, icon: Package, gradient: 'from-indigo-500 to-blue-600' },
          { label: 'Low Stock', value: stats.lowStock, icon: TrendingDown, gradient: 'from-amber-500 to-orange-600' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, gradient: 'from-red-500 to-rose-600' },
          { label: 'Total Value', value: `₹${stats.totalValue.toLocaleString()}`, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600' },
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

      {/* Branch comparison chart */}
      {isAllBranches && branchChartData.length > 1 && (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl p-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Inventory Value by Branch</h3>
          <p className="text-xs text-slate-500 mb-4">Stock value comparison across branches</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v: number, name: string) => [name === 'value' ? `₹${v.toLocaleString()}` : v, name === 'value' ? 'Stock Value' : name === 'items' ? 'Items' : 'Low Stock']}
                  labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                />
                <Legend formatter={v => v === 'value' ? 'Stock Value' : v === 'items' ? 'Total Items' : 'Low Stock'} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} name="value" />
                <Bar dataKey="lowStock" fill="#f59e0b" radius={[6, 6, 0, 0]} name="lowStock" />
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
            placeholder="Search items..."
            className="w-full bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/40 backdrop-blur-xl" />
        </div>
        <button onClick={() => setFilterLow(!filterLow)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            filterLow ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-white/20 dark:border-white/10'
          }`}>
          <AlertTriangle size={14} /> Low Stock Only
        </button>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl text-sm bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none backdrop-blur-xl">
          <option value="name">Sort: Name</option>
          <option value="stock">Sort: Stock Level</option>
          <option value="value">Sort: Value</option>
        </select>
      </div>

      {/* Cross-branch comparison table */}
      {isAllBranches && groupedItems ? (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                  {branches.map(b => (
                    <th key={b.id} className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {b.branch_code || b.name.slice(0, 8)}
                      {b.is_headquarters && <span className="ml-1 text-amber-500">★</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedItems.filter(g => {
                  if (!search.trim()) return filterLow ? Object.values(g.branches).some(b => b.current_stock <= b.min_stock_level) : true;
                  return g.name.toLowerCase().includes(search.toLowerCase());
                }).slice(0, 50).map(group => (
                  <tr key={group.name} className="border-b border-slate-50 dark:border-white/3 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{group.name}</td>
                    {branches.map(b => {
                      const item = group.branches[b.id];
                      if (!item) return <td key={b.id} className="text-center px-4 py-3 text-slate-300 dark:text-gray-600">—</td>;
                      const isLow = item.current_stock <= item.min_stock_level;
                      const isOut = item.current_stock <= 0;
                      return (
                        <td key={b.id} className="text-center px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${
                            isOut ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
                            isLow ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                            'text-slate-700 dark:text-slate-300'
                          }`}>
                            {item.current_stock} {item.unit}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {groupedItems.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              No inventory data
            </div>
          )}
        </div>
      ) : (
        /* Single branch list */
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Min Level</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map(item => {
                  const isLow = item.current_stock <= item.min_stock_level;
                  const isOut = item.current_stock <= 0;
                  return (
                    <tr key={item.id} className="border-b border-slate-50 dark:border-white/3 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{item.name}</td>
                      <td className="px-4 py-3 text-slate-500">{item.category || '—'}</td>
                      <td className="text-center px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          isOut ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
                          isLow ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.current_stock} {item.unit}
                        </span>
                      </td>
                      <td className="text-center px-4 py-3 text-slate-500">{item.min_stock_level} {item.unit}</td>
                      <td className="text-right px-5 py-3 text-slate-700 dark:text-slate-300">
                        ₹{(item.current_stock * (item.cost_per_unit || 0)).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              No inventory items found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CrossBranchInventory;

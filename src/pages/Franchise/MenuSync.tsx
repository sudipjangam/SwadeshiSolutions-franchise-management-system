import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw, Store, CheckCircle, AlertTriangle, Clock,
  Loader2, ChevronDown, ArrowRight, Info, Lock,
} from 'lucide-react';

const MenuSync = () => {
  const queryClient = useQueryClient();
  const { organization, branches, menuMode } = useOrganization();
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);

  const hqBranch = branches.find(b => b.is_headquarters);
  const nonHqBranches = branches.filter(b => !b.is_headquarters);

  // Fetch master menu from HQ
  const { data: masterItems = [], isLoading: masterLoading } = useQuery({
    queryKey: ['master-menu', hqBranch?.id],
    queryFn: async () => {
      if (!hqBranch) return [];
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, category, price, is_available, image_url, updated_at')
        .eq('restaurant_id', hqBranch.id)
        .order('category')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!hqBranch?.id,
  });

  // Fetch sync status per branch (inherited items count + staleness)
  const { data: branchSyncStatus = [], isLoading: statusLoading } = useQuery({
    queryKey: ['branch-sync-status', organization?.id, masterItems.length],
    queryFn: async () => {
      if (!organization?.id || !hqBranch) return [];

      const results = await Promise.all(
        nonHqBranches.map(async branch => {
          const { data: branchItems } = await supabase
            .from('menu_items')
            .select('id, name, source_item_id, origin, price, updated_at')
            .eq('restaurant_id', branch.id);

          const items = branchItems || [];
          const inherited = items.filter(i => i.origin === 'inherited' || i.source_item_id);
          const localOnly = items.filter(i => i.origin === 'branch' && !i.source_item_id);
          const synced = inherited.filter(i => {
            const master = masterItems.find(m => m.id === i.source_item_id);
            return master && new Date(i.updated_at) >= new Date(master.updated_at);
          });
          const stale = inherited.length - synced.length;

          return {
            branch,
            totalItems: items.length,
            inherited: inherited.length,
            localOnly: localOnly.length,
            synced: synced.length,
            stale,
            missing: masterItems.length - inherited.length,
          };
        })
      );
      return results;
    },
    enabled: !!organization?.id && !!hqBranch && masterItems.length > 0,
  });

  // Sync master menu to selected branches
  const handleSync = async () => {
    if (selectedBranches.length === 0 || !hqBranch) return;
    setSyncing(true);
    setSyncResult(null);

    let success = 0;
    let failed = 0;

    for (const branchId of selectedBranches) {
      try {
        for (const masterItem of masterItems) {
          // Check if branch already has this item inherited
          const { data: existing } = await supabase
            .from('menu_items')
            .select('id, price, origin')
            .eq('restaurant_id', branchId)
            .eq('source_item_id', masterItem.id)
            .single();

          if (existing) {
            // Update inherited item — skip if branch has overridden price (hybrid mode)
            if (menuMode === 'hybrid' && existing.origin === 'branch') {
              // Skip overridden items in hybrid mode
              continue;
            }
            await supabase
              .from('menu_items')
              .update({
                name: masterItem.name,
                category: masterItem.category,
                price: masterItem.price,
                is_available: masterItem.is_available,
                image_url: masterItem.image_url,
                origin: 'inherited',
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id);
          } else {
            // Insert new inherited item
            await supabase
              .from('menu_items')
              .insert({
                name: masterItem.name,
                category: masterItem.category,
                price: masterItem.price,
                is_available: masterItem.is_available,
                image_url: masterItem.image_url,
                restaurant_id: branchId,
                origin: 'inherited',
                source_item_id: masterItem.id,
              });
          }
        }
        success++;
      } catch {
        failed++;
      }
    }

    setSyncResult({ success, failed });
    setSyncing(false);
    setSelectedBranches([]);
    queryClient.invalidateQueries({ queryKey: ['branch-sync-status'] });
  };

  const toggleBranch = (id: string) => {
    setSelectedBranches(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedBranches(nonHqBranches.map(b => b.id));
  const deselectAll = () => setSelectedBranches([]);

  const isIndependent = menuMode === 'independent';

  const categories = [...new Set(masterItems.map(i => i.category))].sort();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Menu Sync</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Push master menu from HQ to branches · Mode: <span className="capitalize text-indigo-500 dark:text-indigo-400 font-medium">{menuMode}</span>
          </p>
        </div>
        {!isIndependent && (
          <Button
            onClick={handleSync}
            disabled={syncing || selectedBranches.length === 0}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl px-5"
          >
            {syncing ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
            {syncing ? 'Syncing...' : `Sync to ${selectedBranches.length} branch${selectedBranches.length !== 1 ? 'es' : ''}`}
          </Button>
        )}
      </div>

      {/* Independent mode info */}
      {isIndependent && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
          <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-300 text-sm">Independent Menu Mode</h3>
            <p className="text-xs text-amber-400/70 mt-1">
              Each branch manages its own menu independently. Switch to <strong>Hybrid</strong> or <strong>Shared</strong> mode in Franchise Settings to enable menu sync.
            </p>
          </div>
        </div>
      )}

      {/* Sync result */}
      {syncResult && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${syncResult.failed ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
          <CheckCircle size={18} className={syncResult.failed ? 'text-amber-400' : 'text-emerald-400'} />
          <span className="text-sm text-slate-300">
            Synced to {syncResult.success} branch{syncResult.success !== 1 ? 'es' : ''}.
            {syncResult.failed > 0 && ` ${syncResult.failed} failed.`}
          </span>
        </div>
      )}

      {/* Master menu summary */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Master Menu ({hqBranch?.name ?? 'HQ'})</h3>
              <p className="text-xs text-slate-500">{masterItems.length} items · {categories.length} categories</p>
            </div>
          </div>
          {menuMode === 'shared' && (
            <Badge className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 gap-1">
              <Lock size={10} /> Shared (locked at branches)
            </Badge>
          )}
        </div>

        {masterLoading ? (
          <div className="flex justify-center py-6 text-slate-400"><Loader2 size={20} className="animate-spin" /></div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const count = masterItems.filter(i => i.category === cat).length;
              return (
                <span key={cat} className="text-xs px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                  {cat} <span className="text-indigo-300 font-bold ml-1">{count}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Branch sync status */}
      {!isIndependent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Branch Sync Status</h2>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-indigo-400 hover:text-indigo-300">Select All</button>
              <span className="text-xs text-slate-600">|</span>
              <button onClick={deselectAll} className="text-xs text-slate-500 hover:text-slate-300">Deselect</button>
            </div>
          </div>

          {statusLoading ? (
            <div className="flex justify-center py-8 text-slate-400"><Loader2 size={20} className="animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branchSyncStatus.map(item => {
                const isSelected = selectedBranches.includes(item.branch.id);
                const allSynced = item.stale === 0 && item.missing === 0;

                return (
                  <div
                    key={item.branch.id}
                    onClick={() => toggleBranch(item.branch.id)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500/40 bg-indigo-500/5 shadow-lg shadow-indigo-500/5'
                        : 'border-white/10 bg-white/60 dark:bg-slate-900/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isSelected} readOnly
                          className="w-4 h-4 rounded border-gray-500 text-indigo-600 focus:ring-indigo-500" />
                        <span className="font-semibold text-sm text-slate-800 dark:text-white">{item.branch.name}</span>
                        {item.branch.branch_code && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{item.branch.branch_code}</span>
                        )}
                      </div>
                      {allSynced ? (
                        <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1">
                          <CheckCircle size={10} /> Synced
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 gap-1">
                          <Clock size={10} /> Needs Sync
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center bg-slate-50 dark:bg-white/3 rounded-lg p-2">
                        <div className="text-sm font-bold text-slate-800 dark:text-white">{item.totalItems}</div>
                        <div className="text-[10px] text-slate-500">Total</div>
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-white/3 rounded-lg p-2">
                        <div className="text-sm font-bold text-emerald-500">{item.synced}</div>
                        <div className="text-[10px] text-slate-500">Synced</div>
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-white/3 rounded-lg p-2">
                        <div className="text-sm font-bold text-amber-500">{item.stale + item.missing}</div>
                        <div className="text-[10px] text-slate-500">Pending</div>
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-white/3 rounded-lg p-2">
                        <div className="text-sm font-bold text-violet-500">{item.localOnly}</div>
                        <div className="text-[10px] text-slate-500">Local</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Menu mode info */}
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-3">Menu Mode: <span className="capitalize text-indigo-500">{menuMode}</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className={`p-3 rounded-xl border ${menuMode === 'shared' ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/5'}`}>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Shared</p>
            <p className="text-slate-500">Master items locked at branches. Branches can add local specials only.</p>
          </div>
          <div className={`p-3 rounded-xl border ${menuMode === 'hybrid' ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/5'}`}>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Hybrid</p>
            <p className="text-slate-500">Branches inherit master + can override prices + add local items.</p>
          </div>
          <div className={`p-3 rounded-xl border ${menuMode === 'independent' ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/5'}`}>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Independent</p>
            <p className="text-slate-500">Each branch has fully separate menu. No sync.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuSync;

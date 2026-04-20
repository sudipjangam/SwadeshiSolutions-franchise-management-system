import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Store, Plus, Star, Phone, MapPin, Edit3, Power,
  Loader2, AlertTriangle, X, CheckCircle, Crown,
} from 'lucide-react';

// ────── Add/Edit Branch Dialog ──────
const BranchDialog = ({
  orgId, branch, onClose, onSuccess,
}: { orgId: string; branch?: any; onClose: () => void; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: branch?.name ?? '',
    branch_code: branch?.branch_code ?? '',
    phone: branch?.phone ?? '',
    address: branch?.address ?? '',
  });

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 transition-all text-sm';
  const isEdit = !!branch;

  const handleSubmit = async () => {
    if (!form.name) return;
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        const { error } = await supabase.from('restaurants').update({
          name: form.name,
          branch_code: form.branch_code || null,
          phone: form.phone || null,
          address: form.address || null,
        }).eq('id', branch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('restaurants').insert({
          name: form.name,
          branch_code: form.branch_code || null,
          phone: form.phone || null,
          address: form.address || null,
          organization_id: orgId,
          is_headquarters: false,
          is_active: true,
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{isEdit ? 'Edit Branch' : 'Add Branch'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Branch Name *" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Branch Code (e.g. BR2)" value={form.branch_code}
              onChange={e => setForm(p => ({ ...p, branch_code: e.target.value.toUpperCase() }))} />
            <input className={inputCls} placeholder="Phone" value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <input className={inputCls} placeholder="Address" value={form.address}
            onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-white px-4 py-2">Cancel</button>
          <Button onClick={handleSubmit} disabled={loading || !form.name}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl px-5">
            {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : isEdit ? <Edit3 size={14} className="mr-2" /> : <Plus size={14} className="mr-2" />}
            {isEdit ? 'Save' : 'Add Branch'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ────── Main Page ──────
const BranchManagement = () => {
  const queryClient = useQueryClient();
  const { organization, orgSubscription } = useOrganization();
  const [showDialog, setShowDialog] = useState(false);
  const [editBranch, setEditBranch] = useState<any>(null);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['franchise-branches', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('organization_id', organization.id)
        .order('is_headquarters', { ascending: false })
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!organization?.id,
  });

  const maxBranches = orgSubscription?.max_branches ?? 1;
  const atLimit = maxBranches > 0 && branches.length >= maxBranches;

  const setHQMutation = useMutation({
    mutationFn: async (branchId: string) => {
      await supabase.from('restaurants').update({ is_headquarters: false }).eq('organization_id', organization!.id);
      await supabase.from('restaurants').update({ is_headquarters: true }).eq('id', branchId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['franchise-branches'] }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await supabase.from('restaurants').update({ is_active: active }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['franchise-branches'] }),
  });

  const handleSuccess = () => {
    setShowDialog(false);
    setEditBranch(null);
    queryClient.invalidateQueries({ queryKey: ['franchise-branches'] });
    queryClient.invalidateQueries({ queryKey: ['org-branches'] });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Branch Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {branches.length} branch{branches.length !== 1 ? 'es' : ''} · {maxBranches > 0 ? `${maxBranches - branches.length} slot${maxBranches - branches.length !== 1 ? 's' : ''} remaining` : 'unlimited'}
          </p>
        </div>
        <Button
          onClick={() => { setEditBranch(null); setShowDialog(true); }}
          disabled={atLimit}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl px-5"
        >
          <Plus size={16} className="mr-2" /> Add Branch
        </Button>
      </div>

      {/* Usage bar */}
      {maxBranches > 0 && (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 dark:text-slate-400">Branch Usage</span>
            <span className="font-bold text-slate-800 dark:text-white">{branches.length} / {maxBranches}</span>
          </div>
          <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                branches.length / maxBranches > 0.8 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
              }`}
              style={{ width: `${Math.min(100, (branches.length / maxBranches) * 100)}%` }}
            />
          </div>
          {atLimit && (
            <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> Plan limit reached. Upgrade to add more branches.
            </p>
          )}
        </div>
      )}

      {/* Branch cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading branches...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((branch: any) => (
            <div key={branch.id}
              className={`relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 group
                ${branch.is_active ? 'border-white/20 dark:border-white/10 hover:shadow-xl hover:border-indigo-500/30' : 'border-red-500/20 opacity-60'}`}
            >
              {/* HQ badge */}
              {branch.is_headquarters && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Crown size={12} className="text-white" />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                  branch.is_headquarters ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                }`}>
                  <Store size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{branch.name}</h3>
                    {branch.branch_code && (
                      <span className="text-xs font-mono px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded border border-indigo-500/20">{branch.branch_code}</span>
                    )}
                  </div>
                  {branch.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-0.5"><Phone size={10} />{branch.phone}</p>
                  )}
                  {branch.address && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate"><MapPin size={10} />{branch.address}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={`w-2 h-2 rounded-full ${branch.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="text-xs text-slate-500">{branch.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => { setEditBranch(branch); setShowDialog(true); }}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-500 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-500/5"
                >
                  <Edit3 size={12} /> Edit
                </button>
                {!branch.is_headquarters && (
                  <>
                    <button
                      onClick={() => setHQMutation.mutate(branch.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-500 transition-colors px-2 py-1 rounded-lg hover:bg-amber-500/5"
                    >
                      <Star size={12} /> Set as HQ
                    </button>
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: branch.id, active: !branch.is_active })}
                      className={`flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-lg ${
                        branch.is_active ? 'text-slate-500 hover:text-red-500 hover:bg-red-500/5' : 'text-emerald-500 hover:bg-emerald-500/5'
                      }`}
                    >
                      <Power size={12} /> {branch.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <BranchDialog
          orgId={organization!.id}
          branch={editBranch}
          onClose={() => { setShowDialog(false); setEditBranch(null); }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default BranchManagement;

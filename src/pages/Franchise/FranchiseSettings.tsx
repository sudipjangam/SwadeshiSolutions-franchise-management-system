import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings, Edit3, Save, Loader2, AlertTriangle,
  RefreshCw, Lock, Store, CreditCard, Users, Info, CheckCircle,
} from 'lucide-react';
import type { OrgMenuMode } from '@/types/auth';

const planColors: Record<string, string> = {
  free: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  starter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const FranchiseSettings = () => {
  const queryClient = useQueryClient();
  const { organization, branches, orgSubscription, menuMode } = useOrganization();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: organization?.name ?? '', slug: organization?.slug ?? '' });
  const [showMenuModeConfirm, setShowMenuModeConfirm] = useState<OrgMenuMode | null>(null);

  const inputCls = 'w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 transition-all text-sm';

  // Update org profile
  const profileMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('organizations').update({
        name: profileForm.name,
        slug: profileForm.slug,
      }).eq('id', organization!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });

  // Change menu mode
  const menuModeMutation = useMutation({
    mutationFn: async (newMode: OrgMenuMode) => {
      const { error } = await supabase.from('organizations').update({
        menu_mode: newMode,
      }).eq('id', organization!.id);
      if (error) throw error;

      // If switching to shared: reset overridden inherited items back to master prices
      if (newMode === 'shared') {
        const hq = branches.find(b => b.is_headquarters);
        if (hq) {
          // Get master items
          const { data: masterItems } = await supabase
            .from('menu_items')
            .select('id, price')
            .eq('restaurant_id', hq.id);

          if (masterItems) {
            for (const master of masterItems) {
              // Reset inherited items to master price (but keep branch-local items)
              await supabase
                .from('menu_items')
                .update({ price: master.price, origin: 'inherited' })
                .eq('source_item_id', master.id)
                .neq('restaurant_id', hq.id);
            }
          }
        }
      }
    },
    onSuccess: () => {
      setShowMenuModeConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });

  const sub = orgSubscription;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Franchise Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Organization profile, menu mode, subscription</p>
      </div>

      {/* Org Profile */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Settings size={16} /> Organization Profile</h2>
          {!editingProfile ? (
            <button onClick={() => { setProfileForm({ name: organization?.name ?? '', slug: organization?.slug ?? '' }); setEditingProfile(true); }}
              className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1"><Edit3 size={12} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditingProfile(false)} className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1">Cancel</button>
              <Button size="sm" onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending}
                className="bg-indigo-600 text-white rounded-lg text-xs px-3">
                {profileMutation.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : <Save size={12} className="mr-1" />}
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Organization Name</label>
            {editingProfile ? (
              <input className={inputCls} value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
            ) : (
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{organization?.name}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">URL Slug</label>
            {editingProfile ? (
              <input className={inputCls} value={profileForm.slug} onChange={e => setProfileForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
            ) : (
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400">/{organization?.slug || '—'}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Type</label>
            <p className="text-sm capitalize text-slate-800 dark:text-white">{organization?.type}</p>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Created</label>
            <p className="text-sm text-slate-600 dark:text-slate-400">{organization?.created_at ? new Date(organization.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</p>
          </div>
        </div>
      </div>

      {/* Menu Mode */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5"><RefreshCw size={16} /> Menu Mode</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([
            { mode: 'shared' as OrgMenuMode, title: 'Shared', desc: 'Master menu locked at branches. Branches can add local specials only. Price overrides not allowed.', icon: Lock },
            { mode: 'hybrid' as OrgMenuMode, title: 'Hybrid', desc: 'Branches inherit master menu + can override prices + add their own local items.', icon: RefreshCw },
            { mode: 'independent' as OrgMenuMode, title: 'Independent', desc: 'Each branch manages fully separate menu. No sync between branches.', icon: Store },
          ]).map(opt => {
            const Icon = opt.icon;
            const isActive = menuMode === opt.mode;
            return (
              <button key={opt.mode}
                onClick={() => !isActive && setShowMenuModeConfirm(opt.mode)}
                className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                  isActive ? 'border-indigo-500/40 bg-indigo-500/10 shadow-lg' : 'border-white/10 hover:border-white/20 hover:bg-white/3'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                  <span className="font-semibold text-sm text-slate-800 dark:text-white">{opt.title}</span>
                  {isActive && <CheckCircle size={14} className="text-indigo-400 ml-auto" />}
                </div>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Confirmation dialog */}
        {showMenuModeConfirm && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-300 font-medium">
                  Switch to <span className="capitalize">{showMenuModeConfirm}</span> mode?
                </p>
                <p className="text-xs text-amber-400/70 mt-1">
                  {showMenuModeConfirm === 'shared' && 'Price overrides on inherited items will be reset to master prices. Branch-local items will be kept.'}
                  {showMenuModeConfirm === 'hybrid' && 'Branches will be able to override inherited item prices and add local items.'}
                  {showMenuModeConfirm === 'independent' && 'Menu sync will be disabled. Branches will manage menus independently.'}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => menuModeMutation.mutate(showMenuModeConfirm)}
                    disabled={menuModeMutation.isPending}
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs px-4">
                    {menuModeMutation.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                    Confirm Change
                  </Button>
                  <button onClick={() => setShowMenuModeConfirm(null)} className="text-xs text-slate-500 hover:text-slate-300 px-3">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5"><CreditCard size={16} /> Subscription</h2>

        {sub ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={`text-sm px-3 py-1 border capitalize ${planColors[sub.plan_type]}`}>
                {sub.plan_type} Plan
              </Badge>
              <Badge className={`text-xs border ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                {sub.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-white/3 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Base Price</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">₹{sub.base_price.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-white/3 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Per Branch</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">₹{sub.per_branch_price.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-white/3 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Max Branches</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{sub.max_branches === -1 ? '∞' : sub.max_branches}</p>
              </div>
              <div className="bg-slate-50 dark:bg-white/3 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Total Monthly</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{(sub.base_price + sub.per_branch_price * branches.length).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Info size={12} /> Contact platform admin to change your plan.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No subscription found.</p>
        )}
      </div>
    </div>
  );
};

export default FranchiseSettings;

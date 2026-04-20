import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Store, Users, CreditCard, Globe, GitBranch,
  Crown, Plus, Settings, Loader2, AlertTriangle, CheckCircle,
  ChevronRight, Edit3, Trash2, Phone, MapPin, Star, X, Building2,
} from 'lucide-react';
import type { Organization, Branch, OrganizationMember, OrganizationSubscription } from '@/types/auth';

// ────────────────────────────────────────────
// Add Branch Dialog
// ────────────────────────────────────────────
const AddBranchDialog = ({
  orgId,
  onClose,
  onSuccess,
}: { orgId: string; onClose: () => void; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', branch_code: '', phone: '', address: '' });

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 transition-all text-sm';

  const handleAdd = async () => {
    if (!form.name) return;
    setLoading(true);
    setError(null);
    try {
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
          <h3 className="text-lg font-bold text-white">Add Branch</h3>
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
          <Button onClick={handleAdd} disabled={loading || !form.name}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl px-5">
            {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Plus size={14} className="mr-2" />}
            Add Branch
          </Button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Stat Card
// ────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, gradient }: {
  icon: any; label: string; value: string | number; sub?: string; gradient: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} shadow-xl`}>
    <div className="absolute top-0 right-0 p-3 opacity-10">
      <Icon size={48} className="text-white" />
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-white/70 text-sm font-medium mt-1">{label}</div>
    {sub && <div className="text-white/50 text-xs mt-0.5">{sub}</div>}
  </div>
);

// ────────────────────────────────────────────
// Branch list item
// ────────────────────────────────────────────
const BranchItem = ({ branch, onSetHQ }: { branch: any; onSetHQ: () => void }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-indigo-500/30 hover:bg-white/5 transition-all group">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
      <Store size={18} className="text-indigo-400" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-white text-sm truncate">{branch.name}</h4>
        {branch.is_headquarters && (
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-medium">HQ</span>
        )}
        {branch.branch_code && (
          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono">{branch.branch_code}</span>
        )}
      </div>
      <div className="flex items-center gap-4 mt-0.5">
        {branch.phone && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Phone size={10} />{branch.phone}
          </span>
        )}
        {branch.address && (
          <span className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[200px]">
            <MapPin size={10} />{branch.address}
          </span>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {!branch.is_headquarters && (
        <button onClick={onSetHQ} title="Set as HQ"
          className="text-gray-500 hover:text-amber-400 transition-colors p-1.5 rounded-lg hover:bg-amber-500/10">
          <Star size={14} />
        </button>
      )}
      <div className={`w-2 h-2 rounded-full ${branch.is_active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
    </div>
  </div>
);

// ────────────────────────────────────────────
// Plan badge colors
// ────────────────────────────────────────────
const planColors: Record<string, string> = {
  free:         'bg-gray-500/10 text-gray-400 border-gray-500/20',
  starter:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  enterprise:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

// ────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────
const FranchiseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [activeTab, setActiveTab] = useState<'branches' | 'members' | 'subscription'>('branches');

  const { data, isLoading, error } = useQuery({
    queryKey: ['franchise-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No org ID');

      const [orgRes, membersRes, subRes] = await Promise.all([
        // Org + branches
        supabase
          .from('organizations')
          .select(`
            *,
            restaurants!organization_id (
              id, name, branch_code, is_headquarters, is_active,
              phone, address, created_at
            )
          `)
          .eq('id', id)
          .single(),

        // Members
        supabase
          .from('organization_members')
          .select(`
            *,
            profiles (id, first_name, last_name, email, phone, role, avatar_url)
          `)
          .eq('organization_id', id),

        // Subscription
        supabase
          .from('organization_subscriptions')
          .select('*')
          .eq('organization_id', id)
          .single(),
      ]);

      if (orgRes.error) throw orgRes.error;

      return {
        organization: orgRes.data as Organization,
        branches: (orgRes.data?.restaurants || []) as Branch[],
        members: (membersRes.data || []),
        subscription: subRes.data as OrganizationSubscription | null,
      };
    },
    enabled: !!id,
  });

  const setHQMutation = useMutation({
    mutationFn: async (branchId: string) => {
      // Unset all HQ in this org
      await supabase
        .from('restaurants')
        .update({ is_headquarters: false })
        .eq('organization_id', id!);
      // Set new HQ
      await supabase
        .from('restaurants')
        .update({ is_headquarters: true })
        .eq('id', branchId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['franchise-detail', id] }),
  });

  const inviteOwnerMutation = useMutation({
    mutationFn: async (email: string) => {
      const hqBranch = data?.branches?.find((b: any) => b.is_headquarters);
      const { data: resData, error } = await supabase.functions.invoke('invite-franchise-owner', {
        body: {
          email,
          organization_id: id,
          hq_restaurant_id: hqBranch?.id,
        }
      });
      if (error) throw error;
      if (resData.error) throw new Error(resData.error);
      return resData;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['franchise-detail', id] }),
  });

  const forceSetupMutation = useMutation({
    mutationFn: async (email: string) => {
      const hqBranch = data?.branches?.find((b: any) => b.is_headquarters);
      const { data: resData, error } = await supabase.functions.invoke('invite-franchise-owner', {
        body: {
          email,
          organization_id: id,
          hq_restaurant_id: hqBranch?.id,
          auto_confirm: true
        }
      });
      if (error) throw error;
      if (resData.error) throw new Error(resData.error);
      return resData;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['franchise-detail', id] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" />
        Loading franchise details...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 text-slate-400">
        <AlertTriangle size={40} className="mx-auto mb-3 text-red-400" />
        <p>Failed to load franchise.</p>
        <Button variant="ghost" onClick={() => navigate('/platform/franchises')} className="mt-2">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
      </div>
    );
  }

  const { organization, branches, members, subscription } = data;
  const planKey = subscription?.plan_type ?? 'free';
  const maxBranches = subscription?.max_branches ?? 1;
  const pendingOwnerEmail = (organization.settings as any)?.pending_owner_email;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/platform/franchises')}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {organization.name}
              </h1>
              <Badge className={`text-xs px-2 py-0.5 border capitalize ${planColors[planKey]}`}>
                {planKey}
              </Badge>
              <Badge className="text-xs px-2 py-0.5 border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 capitalize">
                {organization.type}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {organization.slug && <span className="font-mono text-gray-600">/{organization.slug} · </span>}
              Menu: <span className="capitalize text-gray-400">{organization.menu_mode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Pending owner warning */}
      {pendingOwnerEmail && !members.find((m: any) => m.role === 'owner') && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-300 font-medium">Owner invite pending</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Waiting for <strong>{pendingOwnerEmail}</strong> to setup their account.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => forceSetupMutation.mutate(pendingOwnerEmail)}
              disabled={forceSetupMutation.isPending || inviteOwnerMutation.isPending}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs rounded-lg px-3">
              {forceSetupMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <CheckCircle size={14} className="mr-1" />}
              Fast Setup
            </Button>
            <Button 
              size="sm" 
              onClick={() => inviteOwnerMutation.mutate(pendingOwnerEmail)}
              disabled={inviteOwnerMutation.isPending || forceSetupMutation.isPending}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs rounded-lg px-3">
              {inviteOwnerMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Resend Invite
            </Button>
          </div>
        </div>
      )}

      {/* Invite new owner if none exists and no pending */}
      {!pendingOwnerEmail && !members.find((m: any) => m.role === 'owner') && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <Crown size={18} className="text-indigo-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-indigo-300 font-medium">Invite Franchise Owner</p>
            <p className="text-xs text-indigo-400/70 mt-0.5">
              Enter the owner's email to send them an onboarding invite link or fast-setup.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <input 
              id="owner-email"
              type="email" 
              placeholder="owner@example.com" 
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/60"
            />
            <Button
              size="sm"
              className="bg-indigo-600/50 text-indigo-200 hover:bg-indigo-600 text-xs rounded-lg px-3 border border-indigo-500/30"
              onClick={() => {
                const email = (document.getElementById('owner-email') as HTMLInputElement).value;
                if (email) inviteOwnerMutation.mutate(email);
              }}
              disabled={inviteOwnerMutation.isPending || forceSetupMutation.isPending}
            >
              {inviteOwnerMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Send Invite
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs rounded-lg px-3"
              onClick={() => {
                const email = (document.getElementById('owner-email') as HTMLInputElement).value;
                if (email) forceSetupMutation.mutate(email);
              }}
              disabled={forceSetupMutation.isPending || inviteOwnerMutation.isPending}
            >
              {forceSetupMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <CheckCircle size={14} className="mr-1" />}
              Fast Setup
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Store} label="Branches" gradient="from-indigo-500 to-blue-600"
          value={branches.length}
          sub={maxBranches > 0 ? `of ${maxBranches} max` : 'unlimited'} />
        <StatCard icon={Users} label="Members" gradient="from-emerald-500 to-teal-600"
          value={members.length} />
        <StatCard icon={CreditCard} label="Plan Revenue" gradient="from-violet-500 to-purple-600"
          value={subscription ? `₹${(subscription.base_price + (subscription.per_branch_price * branches.length)).toLocaleString()}` : '₹0'}
          sub="monthly" />
        <StatCard icon={Building2} label="Menu Mode" gradient="from-amber-500 to-orange-600"
          value={organization.menu_mode.charAt(0).toUpperCase() + organization.menu_mode.slice(1)} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/3 border border-white/5 rounded-xl p-1 w-fit">
        {(['branches', 'members', 'subscription'] as const).map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
            <span className="ml-2 text-xs opacity-60">
              {tab === 'branches' && `(${branches.length})`}
              {tab === 'members' && `(${members.length})`}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{branches.length} branches · {maxBranches > 0 ? `${maxBranches - branches.length} slots remaining` : 'unlimited capacity'}</p>
            <Button
              onClick={() => setShowAddBranch(true)}
              disabled={maxBranches > 0 && branches.length >= maxBranches}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl px-4 h-9 text-sm"
            >
              <Plus size={14} className="mr-2" /> Add Branch
            </Button>
          </div>

          {/* Usage bar */}
          {maxBranches > 0 && (
            <div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    branches.length / maxBranches > 0.8 ? 'bg-amber-400' : 'bg-indigo-400'
                  }`}
                  style={{ width: `${Math.min(100, (branches.length / maxBranches) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {branches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Store size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No branches yet</p>
              </div>
            ) : (
              branches.map(branch => (
                <BranchItem
                  key={branch.id}
                  branch={branch}
                  onSetHQ={() => setHQMutation.mutate(branch.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-2">
          {members.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No members yet. Owner invite is pending.</p>
            </div>
          ) : (
            members.map((m: any) => {
              const profile = m.profiles ?? {};
              return (
                <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm">
                    {profile.first_name?.[0] ?? profile.email?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">
                      {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">{profile.email}</div>
                  </div>
                  <Badge className={`text-xs border capitalize ${
                    m.role === 'owner' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    m.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {m.role === 'owner' && <Crown size={10} className="mr-1" />}
                    {m.role}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'subscription' && (
        <div className="space-y-4">
          {subscription ? (
            <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">{subscription.plan_type} Plan</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Status: <span className={subscription.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}>{subscription.status}</span>
                  </p>
                </div>
                <Badge className={`text-sm px-3 py-1 border capitalize ${planColors[planKey]}`}>
                  {planKey}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Base Price</p>
                  <p className="text-xl font-bold text-white">₹{subscription.base_price.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Per Branch</p>
                  <p className="text-xl font-bold text-white">₹{subscription.per_branch_price.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Branch Limit</p>
                  <p className="text-xl font-bold text-white">{subscription.max_branches === -1 ? 'Unlimited' : subscription.max_branches}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Total Monthly</p>
                  <p className="text-xl font-bold text-indigo-300">
                    ₹{(subscription.base_price + subscription.per_branch_price * branches.length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No subscription found</p>
            </div>
          )}
        </div>
      )}

      {/* Add Branch dialog */}
      {showAddBranch && (
        <AddBranchDialog
          orgId={id!}
          onClose={() => setShowAddBranch(false)}
          onSuccess={() => {
            setShowAddBranch(false);
            queryClient.invalidateQueries({ queryKey: ['franchise-detail', id] });
          }}
        />
      )}
    </div>
  );
};

export default FranchiseDetail;

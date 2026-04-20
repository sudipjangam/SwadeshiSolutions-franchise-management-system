import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GitBranch,
  Plus,
  Building2,
  ChevronRight,
  Store,
  Crown,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  X,
  Loader2,
  Users,
  CreditCard,
  Globe,
  Megaphone,
} from 'lucide-react';
import type { Organization, Branch, OrganizationSubscription } from '@/types/auth';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface OrgWithDetails extends Organization {
  branches: Branch[];
  subscription: OrganizationSubscription | null;
  memberCount: number;
}

// ─────────────────────────────────────────────
// Onboarding Wizard — Create Franchise
// ─────────────────────────────────────────────
const STEPS = ['Organization', 'First Branch', 'Owner Account', 'Subscription'];

const CreateFranchiseWizard = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orgData, setOrgData] = useState({
    name: '',
    slug: '',
    type: 'franchise' as 'franchise' | 'chain' | 'single',
    menu_mode: 'hybrid' as 'shared' | 'hybrid' | 'independent',
  });

  const [branchData, setBranchData] = useState({
    name: '',
    branch_code: '',
    address: '',
    phone: '',
  });

  const [ownerData, setOwnerData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [planData, setPlanData] = useState({
    plan_type: 'starter' as 'free' | 'starter' | 'professional' | 'enterprise',
    max_branches: 3,
  });

  const planPricing = {
    free:         { base: 0,    per: 0,   max: 1,  label: 'Free' },
    starter:      { base: 999,  per: 499, max: 3,  label: 'Starter' },
    professional: { base: 2499, per: 799, max: 10, label: 'Professional' },
    enterprise:   { base: 4999, per: 599, max: -1, label: 'Enterprise' },
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('create_franchise_organization', {
        p_org_name:          orgData.name,
        p_org_slug:          orgData.slug || null,
        p_org_type:          orgData.type,
        p_org_menu_mode:     orgData.menu_mode,
        p_branch_name:       branchData.name || null,
        p_branch_code:       branchData.branch_code || 'HQ',
        p_branch_address:    branchData.address || null,
        p_branch_phone:      branchData.phone || null,
        p_plan_type:         planData.plan_type,
        p_owner_email:       ownerData.email || null,
        p_owner_first_name:  ownerData.first_name || null,
        p_owner_last_name:   ownerData.last_name || null,
        p_owner_phone:       ownerData.phone || null,
      });

      if (error) throw new Error(error.message);
      if (data && !data.success) throw new Error(data.error || 'Creation failed');

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm';
  const labelCls = 'text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5 block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <GitBranch size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Onboard Franchise</h2>
                <p className="text-xs text-gray-500">Step {step + 1} of {STEPS.length}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Steps indicator */}
          <div className="flex gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-indigo-500' : 'bg-white/5'}`} />
                <p className={`text-[10px] mt-1.5 font-medium ${i === step ? 'text-indigo-400' : 'text-gray-600'}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 min-h-[280px]">
          {/* Step 0: Organization */}
          {step === 0 && (
            <>
              <div>
                <label className={labelCls}>Franchise / Chain Name *</label>
                <input className={inputCls} placeholder="e.g. Biryani House Franchise" value={orgData.name}
                  onChange={e => setOrgData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Slug (URL identifier)</label>
                <input className={inputCls} placeholder="e.g. biryani-house" value={orgData.slug}
                  onChange={e => setOrgData(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Organization Type</label>
                  <select className={inputCls} value={orgData.type}
                    onChange={e => setOrgData(p => ({ ...p, type: e.target.value as any }))}>
                    <option value="franchise">Franchise</option>
                    <option value="chain">Chain</option>
                    <option value="single">Single</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Menu Model</label>
                  <select className={inputCls} value={orgData.menu_mode}
                    onChange={e => setOrgData(p => ({ ...p, menu_mode: e.target.value as any }))}>
                    <option value="hybrid">Hybrid (Master + Branch)</option>
                    <option value="shared">Shared Master Only</option>
                    <option value="independent">Independent Each Branch</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 1: First Branch */}
          {step === 1 && (
            <>
              <p className="text-xs text-gray-500 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                This will be the <span className="text-indigo-400 font-semibold">Headquarters</span> branch. More branches can be added later.
              </p>
              <div>
                <label className={labelCls}>Branch Name *</label>
                <input className={inputCls} placeholder="e.g. Biryani House - Main" value={branchData.name}
                  onChange={e => setBranchData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Branch Code</label>
                  <input className={inputCls} placeholder="e.g. HQ, BR1" value={branchData.branch_code}
                    onChange={e => setBranchData(p => ({ ...p, branch_code: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input className={inputCls} placeholder="+91 98765 43210" value={branchData.phone}
                    onChange={e => setBranchData(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <input className={inputCls} placeholder="Branch address" value={branchData.address}
                  onChange={e => setBranchData(p => ({ ...p, address: e.target.value }))} />
              </div>
            </>
          )}

          {/* Step 2: Owner */}
          {step === 2 && (
            <>
              <p className="text-xs text-gray-500 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                Owner will receive an <span className="text-amber-400 font-semibold">invite email</span> to set up their password. They get full edit access to all branches.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input className={inputCls} placeholder="Rahul" value={ownerData.first_name}
                    onChange={e => setOwnerData(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input className={inputCls} placeholder="Sharma" value={ownerData.last_name}
                    onChange={e => setOwnerData(p => ({ ...p, last_name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email Address *</label>
                <input type="email" className={inputCls} placeholder="owner@franchise.com" value={ownerData.email}
                  onChange={e => setOwnerData(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} placeholder="+91 98765 43210" value={ownerData.phone}
                  onChange={e => setOwnerData(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </>
          )}

          {/* Step 3: Subscription */}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(planPricing) as Array<[string, typeof planPricing.free]>).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setPlanData({ plan_type: key as any, max_branches: p.max })}
                  className={`
                    p-4 rounded-xl border text-left transition-all duration-200
                    ${planData.plan_type === key
                      ? 'border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                      : 'border-white/5 bg-white/3 hover:border-white/15 hover:bg-white/5'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{p.label}</span>
                    {key === 'professional' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded border border-violet-500/20">Popular</span>
                    )}
                  </div>
                  <div className="text-lg font-bold text-indigo-300">
                    {p.base === 0 ? 'Free' : `₹${p.base}/mo`}
                  </div>
                  {p.per > 0 && <div className="text-xs text-gray-500">+₹{p.per}/branch</div>}
                  <div className="text-xs text-gray-400 mt-2">
                    {p.max === -1 ? 'Unlimited branches' : `Up to ${p.max} branch${p.max > 1 ? 'es' : ''}`}
                  </div>
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            className="text-sm text-gray-500 hover:text-white transition-colors px-4 py-2"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && !orgData.name}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl px-6"
            >
              Next <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl px-6"
            >
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />}
              {loading ? 'Creating...' : 'Create Franchise'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Org Card
// ─────────────────────────────────────────────
const planColors: Record<string, string> = {
  free: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  starter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const OrgCard = ({ org, onClick }: { org: OrgWithDetails; onClick: () => void }) => {
  const planKey = org.subscription?.plan_type ?? 'free';
  const branchCount = org.branches.length;
  const maxBranches = org.subscription?.max_branches ?? 1;

  return (
    <div
      onClick={onClick}
      className="group bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-indigo-500/40 hover:bg-white/8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Globe size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">{org.name}</h3>
            <p className="text-xs text-gray-500 font-mono">{org.slug || '-'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge className={`text-[10px] px-2 py-0.5 border capitalize ${planColors[planKey]}`}>
            {planKey}
          </Badge>
          <Badge className={`text-[10px] px-2 py-0.5 border capitalize ${
            org.type === 'franchise' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
          }`}>
            {org.type}
          </Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/3 rounded-lg p-2.5 text-center">
          <Store size={14} className="text-gray-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-white">{branchCount}</div>
          <div className="text-[10px] text-gray-500">Branches</div>
        </div>
        <div className="bg-white/3 rounded-lg p-2.5 text-center">
          <Users size={14} className="text-gray-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-white">{org.memberCount}</div>
          <div className="text-[10px] text-gray-500">Members</div>
        </div>
        <div className="bg-white/3 rounded-lg p-2.5 text-center">
          <CreditCard size={14} className="text-gray-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-white">
            {org.subscription?.base_price ? `₹${org.subscription.base_price}` : '—'}
          </div>
          <div className="text-[10px] text-gray-500">Base/mo</div>
        </div>
      </div>

      {/* Branch usage bar */}
      {maxBranches > 0 && (
        <div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Branch Usage</span>
            <span>{branchCount}/{maxBranches}</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                branchCount / maxBranches > 0.8 ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
              style={{ width: `${Math.min(100, (branchCount / maxBranches) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <ChevronRight size={16} className="text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-3 ml-auto" />
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const FranchiseManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showWizard, setShowWizard] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'franchise' | 'chain' | 'single'>('all');

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['platform-orgs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          restaurants!organization_id(id, name, branch_code, is_headquarters),
          organization_members!organization_id(id),
          organization_subscriptions!organization_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((org: any) => ({
        ...org,
        branches: org.restaurants || [],
        memberCount: (org.organization_members || []).length,
        subscription: Array.isArray(org.organization_subscriptions)
          ? org.organization_subscriptions[0] ?? null
          : org.organization_subscriptions ?? null,
      })) as OrgWithDetails[];
    },
  });

  const franchiseCount = orgs.filter(o => o.type !== 'single').length;
  const totalBranches = orgs.reduce((sum, o) => sum + o.branches.length, 0);
  const activeEnterprise = orgs.filter(o => o.subscription?.plan_type === 'enterprise').length;

  const filtered = filterType === 'all' ? orgs : orgs.filter(o => o.type === filterType);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Franchise Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Onboard and manage franchise organizations
          </p>
        </div>
        <Button
          onClick={() => setShowWizard(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-violet-500/25 transition-all duration-300 rounded-xl px-6 h-11"
        >
          <Plus size={18} className="mr-2" />
          Onboard Franchise
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Organizations', value: orgs.length, icon: Globe, gradient: 'from-violet-500 to-purple-600' },
          { label: 'Franchise / Chains', value: franchiseCount, icon: GitBranch, gradient: 'from-indigo-500 to-blue-600' },
          { label: 'Total Branches', value: totalBranches, icon: Store, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Enterprise Clients', value: activeEnterprise, icon: Crown, gradient: 'from-amber-500 to-orange-600' },
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

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'franchise', 'chain', 'single'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
              filterType === type
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            {type === 'all' ? `All (${orgs.length})` : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Org Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin mr-3" />
          Loading organizations...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <GitBranch size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">No organizations yet</h3>
          <p className="text-sm text-slate-400 mt-1">Onboard your first franchise to get started</p>
          <Button
            onClick={() => setShowWizard(true)}
            className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl"
          >
            <Plus size={16} className="mr-2" />
            Onboard Franchise
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(org => (
            <OrgCard
              key={org.id}
              org={org}
              onClick={() => navigate(`/platform/franchises/${org.id}`)}
            />
          ))}
        </div>
      )}

      {/* How franchise onboarding works — info banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Megaphone size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">How Franchise Onboarding Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Create Organization', desc: 'Define franchise name, type, and menu model (Hybrid/Shared/Independent)' },
                { step: '2', title: 'Add HQ Branch', desc: 'First branch is auto-set as Headquarters. More branches added later.' },
                { step: '3', title: 'Assign Owner', desc: 'Owner gets invite email with full edit access across all branches.' },
                { step: '4', title: 'Set Plan', desc: 'Choose franchise plan tier. Each branch also gets its own module subscription.' },
              ].map(item => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wizard */}
      {showWizard && (
        <CreateFranchiseWizard
          onClose={() => setShowWizard(false)}
          onSuccess={() => {
            setShowWizard(false);
            queryClient.invalidateQueries({ queryKey: ['platform-orgs'] });
          }}
        />
      )}
    </div>
  );
};

export default FranchiseManagement;

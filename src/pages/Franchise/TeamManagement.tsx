import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Plus, Trash2, Edit2, Shield, Store, Crown,
  Loader2, AlertTriangle, X, Check, UserPlus, Mail,
  ChevronDown, Search,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface OrgMember {
  id: string;
  user_id: string;
  role: string;
  accessible_branches: string[] | null;
  created_at: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    email?: string;
    role: string;
    restaurant_id: string;
  } | null;
}

const ROLE_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  owner:   { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Crown,  label: 'Owner' },
  admin:   { color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: Shield, label: 'Admin' },
  manager: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Store,  label: 'Branch Manager' },
  member:  { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Users,  label: 'Member' },
};

// ─────────────────────────────────────────────
// Invite Modal
// ─────────────────────────────────────────────
const InviteMemberModal = ({
  orgId, branches, onClose, onSuccess,
}: {
  orgId: string;
  branches: any[];
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'member'>('manager');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleBranch = (id: string) => {
    setSelectedBranches(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleInvite = async () => {
    if (!email.trim()) { setError('Email required'); return; }
    setLoading(true);
    setError(null);

    try {
      // Call edge function to invite
      const { data, error: fnErr } = await supabase.functions.invoke('invite-franchise-owner', {
        body: {
          organization_id: orgId,
          email: email.trim(),
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          role,
          accessible_branches: role === 'manager' ? selectedBranches : null,
        },
      });

      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invite failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm';
  const labelCls = 'text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1.5 block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <UserPlus size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invite Team Member</h2>
                <p className="text-xs text-slate-500">Send invite to join franchise</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First Name</label>
              <input className={inputCls} placeholder="Rahul" value={firstName}
                onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input className={inputCls} placeholder="Sharma" value={lastName}
                onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Email Address *</label>
            <input type="email" className={inputCls} placeholder="manager@branch.com" value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'manager', 'member'] as const).map(r => {
                const cfg = ROLE_CONFIG[r];
                const Icon = cfg.icon;
                return (
                  <button key={r} onClick={() => setRole(r)}
                    className={`p-3 rounded-xl border text-left transition-all text-sm ${
                      role === r
                        ? 'border-indigo-500/60 bg-indigo-500/10 shadow-lg'
                        : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                    }`}>
                    <Icon size={16} className={role === r ? 'text-indigo-400 mb-1' : 'text-slate-400 dark:text-gray-500 mb-1'} />
                    <div className="font-semibold text-slate-800 dark:text-white text-xs">{cfg.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Branch access — only for managers */}
          {role === 'manager' && (
            <div>
              <label className={labelCls}>Branch Access</label>
              <p className="text-xs text-slate-400 dark:text-gray-500 mb-2">Select branches this manager can access</p>
              <div className="space-y-2">
                {branches.map(branch => (
                  <button key={branch.id}
                    onClick={() => toggleBranch(branch.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedBranches.includes(branch.id)
                        ? 'border-indigo-500/60 bg-indigo-500/5'
                        : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                    }`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedBranches.includes(branch.id)
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-slate-300 dark:border-gray-600'
                    }`}>
                      {selectedBranches.includes(branch.id) && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-white">{branch.name}</div>
                      {branch.branch_code && <div className="text-[10px] font-mono text-slate-400">{branch.branch_code}</div>}
                    </div>
                    {branch.is_headquarters && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-500/20">HQ</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={handleInvite} disabled={loading || !email.trim()}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl px-6">
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Mail size={16} className="mr-2" />}
            {loading ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Member Card
// ─────────────────────────────────────────────
const MemberCard = ({
  member, branches, isCurrentUser, onRemove, onUpdateRole,
}: {
  member: OrgMember;
  branches: any[];
  isCurrentUser: boolean;
  onRemove: () => void;
  onUpdateRole: (newRole: string) => void;
}) => {
  const cfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;
  const Icon = cfg.icon;
  const displayName = member.profile
    ? [member.profile.first_name, member.profile.last_name].filter(Boolean).join(' ') || 'Unnamed'
    : 'Unknown User';

  const accessibleBranches = member.accessible_branches
    ? branches.filter(b => member.accessible_branches!.includes(b.id))
    : branches; // null = all branches

  return (
    <div className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-white text-sm">{displayName}</span>
              {isCurrentUser && (
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-200 dark:border-emerald-500/20">You</span>
              )}
            </div>
            <div className="text-xs text-slate-400 dark:text-gray-500">{member.profile?.email || member.user_id.slice(0, 8)}</div>
          </div>
        </div>
        <Badge className={`text-[10px] px-2 py-0.5 border capitalize ${cfg.color}`}>
          <Icon size={10} className="mr-1" />
          {cfg.label}
        </Badge>
      </div>

      {/* Branch access */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-500 font-medium mb-1.5">Branch Access</div>
        <div className="flex flex-wrap gap-1.5">
          {member.accessible_branches === null ? (
            <span className="text-[10px] px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
              All Branches
            </span>
          ) : accessibleBranches.length > 0 ? (
            accessibleBranches.map(b => (
              <span key={b.id} className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 rounded-lg border border-slate-200 dark:border-white/10">
                {b.branch_code || b.name.slice(0, 12)}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400">No branches assigned</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isCurrentUser && member.role !== 'owner' && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
          <select
            value={member.role}
            onChange={e => onUpdateRole(e.target.value)}
            className="text-xs bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-slate-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="admin">Admin</option>
            <option value="manager">Branch Manager</option>
            <option value="member">Member</option>
          </select>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onRemove}
            className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 px-3 rounded-lg">
            <Trash2 size={14} className="mr-1" /> Remove
          </Button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
const TeamManagement = () => {
  const { organization, branches, orgRole, isLoading: orgLoading } = useOrganization();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['org-members', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          user_id,
          role,
          accessible_branches,
          created_at,
          profiles!user_id (
            first_name, last_name, role, restaurant_id
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((m: any) => ({
        ...m,
        profile: m.profiles ?? null,
      })) as OrgMember[];
    },
    enabled: !!organization?.id,
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-id'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['org-members'] }),
  });

  const updateRole = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: string }) => {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['org-members'] }),
  });

  const canManage = orgRole === 'owner' || orgRole === 'admin';

  const filtered = members.filter(m => {
    if (!search.trim()) return true;
    const name = [m.profile?.first_name, m.profile?.last_name].filter(Boolean).join(' ').toLowerCase();
    return name.includes(search.toLowerCase()) || m.role.includes(search.toLowerCase());
  });

  const roleStats = {
    owner: members.filter(m => m.role === 'owner').length,
    admin: members.filter(m => m.role === 'admin').length,
    manager: members.filter(m => m.role === 'manager').length,
    member: members.filter(m => m.role === 'member').length,
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''} across {branches.length} branch{branches.length !== 1 ? 'es' : ''}</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowInvite(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl px-5 h-10 shadow-lg hover:shadow-indigo-500/25">
            <UserPlus size={16} className="mr-2" /> Invite Member
          </Button>
        )}
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.color}`}>
                <Icon size={16} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 dark:text-white">{roleStats[key as keyof typeof roleStats]}</div>
                <div className="text-xs text-slate-500">{cfg.label}s</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 backdrop-blur-xl"
        />
      </div>

      {/* Members grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Users size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500">No members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              branches={branches}
              isCurrentUser={member.user_id === currentUser}
              onRemove={() => removeMember.mutate(member.id)}
              onUpdateRole={(newRole) => updateRole.mutate({ memberId: member.id, newRole })}
            />
          ))}
        </div>
      )}

      {/* Invite modal */}
      {showInvite && organization && (
        <InviteMemberModal
          orgId={organization.id}
          branches={branches}
          onClose={() => setShowInvite(false)}
          onSuccess={() => {
            setShowInvite(false);
            queryClient.invalidateQueries({ queryKey: ['org-members'] });
          }}
        />
      )}
    </div>
  );
};

export default TeamManagement;

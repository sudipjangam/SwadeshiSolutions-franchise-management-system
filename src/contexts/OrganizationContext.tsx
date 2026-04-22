import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type {
  Organization,
  Branch,
  OrgMemberRole,
  OrgMenuMode,
  OrganizationSubscription,
  OrganizationContextType,
} from '@/types/auth';

const BRANCH_STORAGE_KEY = 'franchise-current-branch';

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
  const { user } = useAuth();
  const [currentBranch, setCurrentBranch] = useState<string | 'all'>(() => {
    return localStorage.getItem(BRANCH_STORAGE_KEY) || 'default';
  });

  // Fetch user's organization and membership
  // Handles users who belong to multiple orgs — prefers franchise/chain over single
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['organization', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: members, error: memberErr } = await supabase
        .from('organization_members')
        .select(`
          role,
          accessible_branches,
          organization_id,
          organizations (
            id, name, slug, type, owner_user_id, logo_url, menu_mode, settings, created_at, updated_at
          )
        `)
        .eq('user_id', user.id);

      if (memberErr || !members || members.length === 0) return null;

      // Pick best org: prefer franchise/chain, then match profile restaurant, then first
      let best = members[0];
      for (const m of members) {
        const org = m.organizations as Organization;
        if (!org) continue;
        // Prefer franchise or chain type over single
        if (org.type === 'franchise' || org.type === 'chain') {
          best = m;
          break;
        }
        // Or match the user's profile restaurant
        if (user.restaurant_id) {
          const { count } = await supabase
            .from('restaurants')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', org.id)
            .eq('id', user.restaurant_id);
          if (count && count > 0) {
            best = m;
          }
        }
      }

      return {
        organization: best.organizations as Organization,
        orgRole: best.role as OrgMemberRole,
        accessibleBranches: best.accessible_branches as string[] | null,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 min
  });

  // Fetch all branches in the org
  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ['org-branches', orgData?.organization?.id],
    queryFn: async () => {
      if (!orgData?.organization?.id) return [];

      let query = supabase
        .from('restaurants')
        .select('id, name, branch_code, is_headquarters, organization_id, address, phone, logo_url, is_active')
        .eq('organization_id', orgData.organization.id)
        .eq('is_active', true)
        .order('is_headquarters', { ascending: false })
        .order('name');

      // If user has restricted branch access
      if (orgData.accessibleBranches && orgData.accessibleBranches.length > 0) {
        query = query.in('id', orgData.accessibleBranches);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Branch[];
    },
    enabled: !!orgData?.organization?.id,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch org subscription
  const { data: orgSubscription = null } = useQuery({
    queryKey: ['org-subscription', orgData?.organization?.id],
    queryFn: async () => {
      if (!orgData?.organization?.id) return null;

      const { data, error } = await supabase
        .from('organization_subscriptions')
        .select('*')
        .eq('organization_id', orgData.organization.id)
        .single();

      if (error) return null;
      return data as OrganizationSubscription;
    },
    enabled: !!orgData?.organization?.id,
    staleTime: 1000 * 60 * 15,
  });

  // Set default branch when branches load
  useEffect(() => {
    if (branches.length === 0) return;

    const stored = localStorage.getItem(BRANCH_STORAGE_KEY);

    // Validate stored branch still exists
    if (stored && stored !== 'all') {
      const exists = branches.find(b => b.id === stored);
      if (!exists) {
        // Stored branch no longer accessible — reset to HQ or first branch
        const hq = branches.find(b => b.is_headquarters) || branches[0];
        setCurrentBranch(hq.id);
        localStorage.setItem(BRANCH_STORAGE_KEY, hq.id);
      }
    } else if (!stored || stored === 'default') {
      // No stored branch — set to profile's restaurant or HQ
      const profileBranch = branches.find(b => b.id === user?.restaurant_id);
      const hq = branches.find(b => b.is_headquarters) || branches[0];
      const defaultBranch = profileBranch || hq;
      setCurrentBranch(defaultBranch.id);
      localStorage.setItem(BRANCH_STORAGE_KEY, defaultBranch.id);
    }
  }, [branches, user?.restaurant_id]);

  const switchBranch = useCallback((branchId: string | 'all') => {
    setCurrentBranch(branchId);
    localStorage.setItem(BRANCH_STORAGE_KEY, branchId);
  }, []);

  const isMultiBranch = branches.length > 1;
  const organization = orgData?.organization ?? null;
  const orgRole = orgData?.orgRole ?? null;
  const menuMode: OrgMenuMode = organization?.menu_mode ?? 'independent';
  const isLoading = orgLoading || branchesLoading;

  const value: OrganizationContextType = {
    organization,
    branches,
    currentBranch,
    switchBranch,
    isMultiBranch,
    orgRole,
    menuMode,
    orgSubscription,
    isLoading,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizationContext = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within OrganizationProvider');
  }
  return context;
};

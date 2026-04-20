import { useOrganizationContext } from '@/contexts/OrganizationContext';
import type { Branch } from '@/types/auth';

export interface BranchSwitcherState {
  currentBranch: string | 'all';
  currentBranchData: Branch | null;
  branches: Branch[];
  isMultiBranch: boolean;
  isAllBranches: boolean;
  switchBranch: (branchId: string | 'all') => void;
  switchToAll: () => void;
  switchToHQ: () => void;
}

/**
 * useBranchSwitcher — manages branch switching UI state
 * Provides helpers for common switching operations
 */
export const useBranchSwitcher = (): BranchSwitcherState => {
  const { branches, currentBranch, switchBranch, isMultiBranch } = useOrganizationContext();

  const currentBranchData = currentBranch === 'all'
    ? null
    : (branches.find(b => b.id === currentBranch) ?? null);

  const isAllBranches = currentBranch === 'all';

  const switchToAll = () => switchBranch('all');

  const switchToHQ = () => {
    const hq = branches.find(b => b.is_headquarters) ?? branches[0];
    if (hq) switchBranch(hq.id);
  };

  return {
    currentBranch,
    currentBranchData,
    branches,
    isMultiBranch,
    isAllBranches,
    switchBranch,
    switchToAll,
    switchToHQ,
  };
};

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { Loader2 } from 'lucide-react';

/**
 * FranchiseGuard — blocks access to /franchise/* unless user is
 * a multi-branch org member with owner or admin role.
 */
export const FranchiseGuard = ({ children }: { children: React.ReactNode }) => {
  const { isMultiBranch, orgRole, isLoading, organization } = useOrganizationContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  const isFranchiseOrg = organization?.type === 'franchise' || organization?.type === 'chain';
  const hasAccess = (isMultiBranch || isFranchiseOrg) && !!orgRole && ['owner', 'admin'].includes(orgRole);

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, GitBranch, Store, LayoutDashboard } from 'lucide-react';
import { useBranchSwitcher } from '@/hooks/useBranchSwitcher';
import type { Branch } from '@/types/auth';

interface BranchSwitcherProps {
  className?: string;
  showAllBranchesOption?: boolean; // only for franchise owners
}

const BranchItem = ({
  branch,
  isSelected,
  onClick,
}: {
  branch: Branch;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
      transition-all duration-150
      ${isSelected
        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
        : 'text-gray-300 hover:bg-white/5 border border-transparent'
      }
    `}
  >
    <div className={`
      w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0
      ${isSelected ? 'bg-indigo-500/30' : 'bg-white/5'}
    `}>
      <Store size={14} className={isSelected ? 'text-indigo-300' : 'text-gray-400'} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{branch.name}</p>
      {branch.branch_code && (
        <p className="text-xs text-gray-500 font-mono">{branch.branch_code}</p>
      )}
    </div>
    {branch.is_headquarters && (
      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
        HQ
      </span>
    )}
    {isSelected && (
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
    )}
  </button>
);

export const BranchSwitcher = ({ className = '', showAllBranchesOption = false }: BranchSwitcherProps) => {
  const { currentBranch, currentBranchData, branches, isMultiBranch, isAllBranches, switchBranch } = useBranchSwitcher();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Don't render if single restaurant
  if (!isMultiBranch) return null;

  const displayName = isAllBranches
    ? 'All Branches'
    : (currentBranchData?.name ?? 'Select Branch');

  const displayIcon = isAllBranches ? (
    <LayoutDashboard size={14} className="text-violet-300" />
  ) : (
    <Store size={14} className="text-indigo-300" />
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-white/5 border border-white/10
          hover:bg-white/10 hover:border-white/20
          transition-all duration-200
          text-gray-200 text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        `}
      >
        <div className="w-5 h-5 rounded flex items-center justify-center">
          {displayIcon}
        </div>
        <span className="max-w-[120px] truncate">{displayName}</span>
        {!isAllBranches && currentBranchData?.branch_code && (
          <span className="text-xs font-mono text-gray-500 hidden sm:block">
            [{currentBranchData.branch_code}]
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="
          absolute top-full left-0 mt-2 w-64 z-50
          rounded-xl overflow-hidden
          bg-gray-900/95 backdrop-blur-xl
          border border-white/10 shadow-2xl
          animate-in fade-in slide-in-from-top-2 duration-150
        ">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
            <GitBranch size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Switch Branch
            </span>
          </div>

          {/* Branch list */}
          <div className="p-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
            {showAllBranchesOption && (
              <>
                <button
                  onClick={() => { switchBranch('all'); setOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-all duration-150
                    ${isAllBranches
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'text-gray-300 hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isAllBranches ? 'bg-violet-500/30' : 'bg-white/5'}`}>
                    <LayoutDashboard size={14} className={isAllBranches ? 'text-violet-300' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">All Branches</p>
                    <p className="text-xs text-gray-500">Franchise overview</p>
                  </div>
                  {isAllBranches && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                </button>
                <div className="h-px bg-white/5 my-1" />
              </>
            )}

            {branches.map(branch => (
              <BranchItem
                key={branch.id}
                branch={branch}
                isSelected={!isAllBranches && currentBranch === branch.id}
                onClick={() => { switchBranch(branch.id); setOpen(false); }}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-white/5">
            <p className="text-xs text-gray-600">
              {branches.length} branch{branches.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSwitcher;

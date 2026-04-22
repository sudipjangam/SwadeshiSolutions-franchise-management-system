import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { BranchSwitcher } from '@/components/BranchSwitcher/BranchSwitcher';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Store, RefreshCw, ShoppingBag,
  TrendingUp, Settings, ArrowLeft, GitBranch, Loader2,
  Users, Package, UserCheck,
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/franchise', icon: LayoutDashboard },
  { title: 'Branches', href: '/franchise/branches', icon: Store },
  { title: 'Team', href: '/franchise/team', icon: Users },
  { title: 'Menu Sync', href: '/franchise/menu-sync', icon: RefreshCw },
  { title: 'Orders', href: '/franchise/orders', icon: ShoppingBag },
  { title: 'Inventory', href: '/franchise/inventory', icon: Package },
  { title: 'Staff', href: '/franchise/staff', icon: UserCheck },
  { title: 'P&L', href: '/franchise/pnl', icon: TrendingUp },
  { title: 'Settings', href: '/franchise/settings', icon: Settings },
];

const planColors: Record<string, string> = {
  free: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  starter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  professional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  enterprise: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const FranchiseLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organization, branches, orgRole, orgSubscription, isLoading } = useOrganizationContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-400">
        <Loader2 size={32} className="animate-spin mr-3" />
        Loading franchise...
      </div>
    );
  }

  const planKey = orgSubscription?.plan_type ?? 'free';

  const isActive = (href: string) => {
    if (href === '/franchise') return location.pathname === '/franchise';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex-shrink-0 hidden md:flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-3"
          >
            <ArrowLeft size={12} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <GitBranch size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white truncate">{organization?.name ?? 'Franchise'}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge className={`text-[9px] px-1.5 py-0 border capitalize ${planColors[planKey]}`}>
                  {planKey}
                </Badge>
                <span className="text-[10px] text-gray-500">{branches.length} branches</span>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Switcher */}
        <div className="px-3 py-3 border-b border-white/5">
          <BranchSwitcher
            showAllBranchesOption={orgRole === 'owner' || orgRole === 'admin'}
            className="w-full"
          />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200',
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent',
                )}
              >
                <Icon size={16} className={active ? 'text-indigo-400' : 'text-gray-500'} />
                <span className="text-sm font-medium">{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/5">
          <div className="text-[10px] text-gray-600">
            Role: <span className="text-gray-400 capitalize">{orgRole}</span>
          </div>
        </div>
      </div>

      {/* Mobile nav - horizontal scroll */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-2 py-2 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => navigate('/')}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"
        >
          <ArrowLeft size={14} />
        </button>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                active
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-gray-500 hover:text-gray-300',
              )}
            >
              <Icon size={12} />
              {item.title}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-16 md:pt-8">
        <Outlet />
      </div>
    </div>
  );
};

export default FranchiseLayout;

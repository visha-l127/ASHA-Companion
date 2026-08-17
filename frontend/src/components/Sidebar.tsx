import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Baby, 
  Heart, 
  Activity, 
  Layers, 
  ClipboardList, 
  TrendingUp, 
  ShieldAlert, 
  AlertTriangle,
  Package, 
  ThermometerSnowflake, 
  FileCheck, 
  Settings, 
  UserCog, 
  ShieldCheck, 
  LayoutDashboard,
  LogOut,
  Signal,
  Calendar,
  Building2,
  Shield,
  BarChart3,
  History,
  Home,
  Apple,
  Pill,
  RefreshCw,
  UserCheck,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavGroup {
  groupName?: string;
  items: {
    to: string;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, networkStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'asha';

  const handleLogout = () => {
    logout();
    navigate('/landing', { replace: true });
  };

  const isLinkActive = (linkTo: string) => {
    const currentFullPath = location.pathname + location.search;
    if (linkTo === '/asha/priority-cases') {
      return location.pathname === '/asha/priority-cases' || (location.pathname === '/asha/visits' && location.search.includes('referral=yes'));
    }
    if (linkTo === '/asha/todays-visits') {
      return location.pathname === '/asha/todays-visits' || (location.pathname === '/asha/visits' && !location.search.includes('referral=yes'));
    }
    if (linkTo === '/asha/maternal-care') {
      return location.pathname === '/asha/maternal-care' || location.pathname === '/asha/maternal';
    }
    if (linkTo === '/asha/child-immunization') {
      return location.pathname === '/asha/child-immunization' || location.pathname === '/asha/immunization';
    }
    if (linkTo.includes('?')) {
      return currentFullPath === linkTo;
    }
    return location.pathname === linkTo;
  };

  const getNavGroups = (): NavGroup[] => {
    switch (role) {
      case 'admin':
        return [
          {
            items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
          },
          {
            groupName: 'Management',
            items: [
              { to: '/admin/phc', label: 'PHC Management', icon: Building2 },
              { to: '/admin/supervisors', label: 'Supervisors', icon: UserCheck },
              { to: '/admin/users', label: 'System Users', icon: Users },
            ]
          },
          {
            groupName: 'System',
            items: [
              { to: '/admin/roles', label: 'Roles & Permissions', icon: Shield },
              { to: '/admin/audit', label: 'Audit Logs', icon: History },
              { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
              { to: '/admin/settings', label: 'Settings', icon: Settings },
            ]
          }
        ];

      case 'supervisor':
        return [
          {
            items: [{ to: '/supervisor/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
          },
          {
            groupName: 'Operations',
            items: [
              { to: '/supervisor/ashas', label: 'ASHA Workers', icon: Users },
              { to: '/supervisor/pharmacists', label: 'Pharmacists', icon: UserCheck },
              { to: '/supervisor/patients', label: 'Patient Monitoring', icon: Activity },
              { to: '/supervisor/visits', label: 'Priority Visits', icon: ClipboardList },
            ]
          },
          {
            groupName: 'Monitoring',
            items: [
              { to: '/supervisor/alerts', label: 'Alerts', icon: ShieldAlert },
              { to: '/supervisor/analytics', label: 'Analytics', icon: TrendingUp },
              { to: '/supervisor/reports', label: 'Reports', icon: BarChart3 },
            ]
          }
        ];

      case 'asha':
        return [
          {
            items: [{ to: '/asha/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
          },
          {
            groupName: 'MY WORK',
            items: [
              { to: '/asha/todays-visits', label: "Today's Visits", icon: Calendar },
              { to: '/asha/priority-cases', label: 'Priority Cases', icon: AlertTriangle },
            ]
          },
          {
            groupName: 'PEOPLE',
            items: [
              { to: '/asha/households', label: 'Households', icon: Home },
              { to: '/asha/patients', label: 'Patients', icon: Users },
            ]
          },
          {
            groupName: 'HEALTH',
            items: [
              { to: '/asha/maternal-care', label: 'Maternal Care', icon: Heart },
              { to: '/asha/child-immunization', label: 'Child & Immunization', icon: Baby },
              { to: '/asha/nutrition', label: 'Nutrition', icon: Apple },
            ]
          },
          {
            groupName: 'SYNC & ACCOUNT',
            items: [
              { to: '/asha/sync', label: 'Data Sync', icon: RefreshCw },
              { to: '/asha/profile', label: 'Profile', icon: User }
            ]
          }
        ];

      case 'pharmacist':
        return [
          {
            items: [{ to: '/pharmacist/dashboard', label: 'Pharmacy Analytics', icon: LayoutDashboard }]
          },
          {
            groupName: 'Inventory',
            items: [
              { to: '/pharmacist/medicines', label: 'Medicines', icon: Pill },
              { to: '/pharmacist/batches', label: 'Batches', icon: Layers },
              { to: '/pharmacist/transactions', label: 'Transactions', icon: RefreshCw },
              { to: '/pharmacist/requests', label: 'Medicine Requests', icon: ClipboardList },
              { to: '/pharmacist/visits', label: 'Priority Visits', icon: ClipboardList },
            ]
          },
          {
            groupName: 'Analytics',
            items: [
              { to: '/pharmacist/forecast', label: 'Demand Forecast', icon: TrendingUp },
              { to: '/pharmacist/alerts', label: 'Alerts', icon: ShieldAlert },
              { to: '/pharmacist/reports', label: 'Reports', icon: BarChart3 },
            ]
          },
          {
            groupName: 'SYNC & ACCOUNT',
            items: [
              { to: '/pharmacist/profile', label: 'Profile', icon: User }
            ]
          }
        ];

      default:
        return [];
    }
  };

  const navGroups = getNavGroups();

  const getRoleBadge = () => {
    return 'bg-teal-900/60 text-teal-200 border-teal-700/50';
  };

  const activeClassName = 'flex items-center space-x-3 bg-teal-800 text-white px-3.5 py-2.5 rounded-xl transition-all duration-150 font-bold text-xs shadow-xs';
  const inactiveClassName = 'flex items-center space-x-3 text-teal-100 hover:bg-teal-800/60 hover:text-white px-3.5 py-2.5 rounded-xl transition-all duration-150 font-semibold text-xs';

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-teal-950 transition-transform duration-200 md:static md:h-screen shrink-0 md:translate-x-0 border-r border-teal-900/50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand / Logo */}
        <div className="flex h-16 items-center space-x-3 px-5 border-b border-teal-900/60 shrink-0">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center text-teal-950 font-extrabold shrink-0 shadow-sm">
            {role.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight text-base">EHR Companion</h1>
            <p className="text-[9px] font-bold text-teal-400 tracking-widest uppercase">Health Information System</p>
          </div>
        </div>

        {/* Active User Banner */}
        <div className="px-5 py-3.5 border-b border-teal-900/60 bg-teal-900/30 flex items-center space-x-3 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider">Active Workspace</p>
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Authorized User'}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRoleBadge()}`}>
              {role} role
            </span>
          </div>
        </div>

        {/* Menu Navigation Links */}
        <nav className="flex-1 min-h-0 space-y-2.5 px-3 py-3 overflow-y-auto pb-4">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.groupName && (
                <p className="px-3 pt-1.5 text-[10px] font-bold text-teal-400/90 uppercase tracking-widest mb-1">
                  {group.groupName}
                </p>
              )}
              {group.items.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.to);
                return (
                  <NavLink
                    key={`${link.to}-${link.label}`}
                    to={link.to}
                    onClick={onClose}
                    className={active ? activeClassName : inactiveClassName}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-90" />
                    <span className="flex-1 truncate">{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-500 text-white">
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Connection status footer */}
        <div className="px-4 py-2 bg-teal-950 border-t border-teal-900/60 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${networkStatus === 'offline' ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-[10px] text-teal-200 uppercase tracking-widest font-bold">
              {networkStatus === 'offline' ? 'Offline' : networkStatus === 'poor' ? 'Weak Signal' : 'Online Sync'}
            </span>
          </div>
          <span className="text-[9px] text-teal-400/80 font-medium">
            {networkStatus === 'offline' ? 'Local Vault' : 'Live'}
          </span>
        </div>

        {/* Logout Bottom Footer */}
        <div className="border-t border-teal-900/80 p-2.5 bg-teal-950/90 shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/30 hover:text-rose-200 transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

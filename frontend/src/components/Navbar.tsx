import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Badge, Button } from './ui';
import { Wifi, WifiOff, RefreshCw, LogOut, Shield, ChevronDown, User, ArrowLeft } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, networkStatus, setNetworkStatus, syncStats, syncPendingRecords, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const hasHistory = Boolean(
    window.history.state &&
    typeof window.history.state.idx === 'number' &&
    window.history.state.idx > 0
  );

  const handleBack = () => {
    if (hasHistory) {
      navigate(-1);
    }
  };

  const handleSync = async () => {
    try {
      setSyncError(null);
      setIsSyncing(true);
      await syncPendingRecords();
    } catch (err: any) {
      setSyncError(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const getNetworkIcon = () => {
    switch (networkStatus) {
      case 'online':
        return <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-amber-500 animate-pulse" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-rose-500 animate-pulse" />;
    }
  };

  const getNetworkBadge = () => {
    switch (networkStatus) {
      case 'online':
        return <Badge variant="success">Online (3G/4G)</Badge>;
      case 'poor':
        return <Badge variant="warning">Poor Connection</Badge>;
      case 'offline':
        return <Badge variant="danger">Offline Mode</Badge>;
    }
  };

  const roleLabels: Record<string, string> = {
    admin: 'District Administrator',
    supervisor: 'Medical Officer / ANM',
    asha: 'ASHA Companion',
    pharmacist: 'PHC Pharmacist',
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white px-4 md:px-6 shadow-xs shrink-0">
      {/* Left side: Back Button + Brand/Facility Info */}
      <div className="flex items-center space-x-3">
        <button
          id="global-header-back-button"
          onClick={handleBack}
          disabled={!hasHistory}
          className={`flex items-center justify-center w-8 h-8 rounded-full bg-teal-700 text-white transition-all duration-150 shadow-xs border border-teal-600/30 shrink-0 ${
            hasHistory
              ? 'hover:bg-teal-800 active:scale-95 cursor-pointer opacity-100'
              : 'opacity-40 cursor-not-allowed'
          }`}
          title={hasHistory ? "Go Back" : "No Previous Page"}
          aria-label="Go Back"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Mobile Menu Spacer or Left Area */}
        <div className="flex items-center space-x-3">
          <div className="md:hidden flex items-center space-x-1">
            <Shield className="h-5 w-5 text-brand-600" />
            <span className="font-bold text-xs tracking-tight text-slate-900">EHR ASHA</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility Hub</span>
            <span className="text-sm font-bold text-slate-800">{user?.facilityName || 'Health Center'}</span>
          </div>
        </div>
      </div>

      {/* Sync and Internet simulation actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Network state toggler - Crucial for demo */}
        <div className="flex items-center space-x-1.5 border border-slate-200 bg-slate-50 px-2.5 py-1.2 rounded-lg">
          {getNetworkIcon()}
          <span className="hidden lg:inline text-xs font-semibold text-slate-600">Simulate:</span>
          <select
            value={networkStatus}
            onChange={(e) => setNetworkStatus(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer border-none p-0 focus:ring-0"
          >
            <option value="online">Online (Good)</option>
            <option value="poor">Poor (Weak signal)</option>
            <option value="offline">Offline (None)</option>
          </select>
        </div>

        {/* Sync queue indicator */}
        <div className="flex items-center space-x-1">
          {syncStats.pendingCount > 0 ? (
            <Button
              variant={networkStatus === 'offline' ? 'outline' : 'primary'}
              size="sm"
              onClick={handleSync}
              disabled={networkStatus === 'offline' || isSyncing}
              className={`text-xs gap-1 py-1 px-2.5 ${networkStatus === 'offline' ? 'opacity-50' : 'sync-pulse'}`}
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Queue</span>
              <span className="bg-white text-brand-700 font-bold px-1.5 py-0.2 rounded-md text-[10px]">
                {syncStats.pendingCount}
              </span>
            </Button>
          ) : (
            <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />
              <span>Synced</span>
            </div>
          )}
        </div>

        {/* User Info dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors duration-150 text-left focus:outline-none"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                {user?.name.substring(0, 2).toUpperCase() || 'AW'}
              </div>
            )}
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</span>
              <span className="text-[10px] text-slate-400 leading-none">{roleLabels[user?.role || 'asha']}</span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden md:block" />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-slate-100 bg-white p-2 shadow-lg ring-1 ring-black/5 z-40 animate-in fade-in-50 duration-100">
                <div className="px-3 py-2 border-b border-slate-50">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                  <p className="text-[10px] font-semibold mt-1 text-slate-500">
                    Location: <span className="font-bold text-slate-700">{user?.location}</span>
                  </p>
                </div>
                
                <div className="py-1">
                  <div className="px-3 py-1.5 flex items-center justify-between text-xs text-slate-500">
                    <span>Sync Status</span>
                    {getNetworkBadge()}
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                      navigate('/landing', { replace: true });
                    }}
                    className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors duration-150"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

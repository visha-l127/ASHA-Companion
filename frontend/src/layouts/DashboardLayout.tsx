import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Menu, WifiOff, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { networkStatus, syncStats, syncPendingRecords } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await syncPendingRecords();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/70">
      {/* Sidebar - responsive component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden h-full min-h-0">
        {/* Connection status banner - friendly, non-alarming indicator */}
        {networkStatus === 'offline' && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top duration-200 border-b border-amber-600/30">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4 shrink-0 text-slate-900" />
              <span>
                <strong>● Offline Mode:</strong> Records are saved safely on this device and will sync automatically when internet returns.
              </span>
            </div>
            {syncStats.pendingCount > 0 && (
              <span className="bg-amber-900/20 text-slate-950 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] shrink-0 border border-amber-900/30">
                {syncStats.pendingCount} record(s) queued
              </span>
            )}
          </div>
        )}

        {networkStatus === 'poor' && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>
                <strong>Weak Mobile Signal detected:</strong> PHC network signal is poor. The companion app has pre-emptively activated light-data payloads and local queuing to prevent form submission loss.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {syncStats.pendingCount > 0 && (
                <button 
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="bg-amber-600 hover:bg-amber-700 transition-colors px-2 py-0.5 rounded-md font-bold flex items-center space-x-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Queue ({syncStats.pendingCount})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Global sticky bar for active pending queue (even if online, to alert user they need to sync) */}
        {networkStatus === 'online' && syncStats.pendingCount > 0 && (
          <div className="bg-emerald-500 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Network Restored! You have {syncStats.pendingCount} record(s) in your local queue waiting to be uploaded to district servers.</span>
            </div>
            <button 
              onClick={handleManualSync}
              disabled={isSyncing}
              className="bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all text-[10px] px-2.5 py-1 rounded-md font-bold flex items-center space-x-1"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Upload Records Now</span>
            </button>
          </div>
        )}

        {/* Navbar */}
        <div className="flex items-center border-b border-slate-100 bg-white md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-4 py-4 text-slate-500 hover:text-slate-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <Navbar />
          </div>
        </div>

        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Dynamic Nested Route Outlet with scrolling wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

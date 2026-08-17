import React, { useState, useEffect } from 'react';
import { 
  getSyncStats, 
  syncAllPending, 
  isOfflineModeEnabled, 
  setOfflineModeEnabled,
  loadAllAshaData
} from './localAshaHelper';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar,
  User,
  Heart,
  Baby,
  Apple,
  Pill,
  Home,
  FileText,
  RotateCcw
} from 'lucide-react';

export default function SyncPage() {
  const { networkStatus, syncPendingRecords } = useAuth();

  // Offline toggle and data states
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [stats, setStats] = useState<{ total: number; pending: number; synced: number; failed: number }>({ 
    total: 0, 
    pending: 0, 
    synced: 0, 
    failed: 0 
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStepProgress, setSyncStepProgress] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [syncSuccessCount, setSyncSuccessCount] = useState<number>(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);

  // Pending records list for UI display
  const [pendingRecordsList, setPendingRecordsList] = useState<any[]>([]);

  const loadData = async () => {
    const isOfflineActive = isOfflineModeEnabled();
    setOfflineMode(isOfflineActive);

    const syncStats = getSyncStats();

    const savedSyncTime = localStorage.getItem('asha_sync_time_stamp') || localStorage.getItem('asha_ehr_sync_time');
    if (savedSyncTime) {
      setLastSyncDate(savedSyncTime);
    } else {
      setLastSyncDate(null);
    }

    // Collect pending records for display
    const pending: any[] = [];

    const data = await loadAllAshaData();
    const hhs = data.households;
    const pts = data.patients;
    const vsts = data.visits;
    const mats = data.maternal;
    const imms = data.immunizations;
    const nuts = data.nutrition;
    const meds = data.medicines;

    hhs.filter(h => h.status === 'pending').forEach(h => {
      pending.push({
        type: 'Household',
        name: `Household head: ${h.headName}`,
        id: h.id,
        details: `Village: ${h.village} • HH #${h.householdNumber}`,
        date: h.lastUpdated || 'Saved locally'
      });
    });

    pts.filter(p => p.status === 'pending').forEach(p => {
      pending.push({
        type: 'Patient',
        name: p.name,
        id: p.id,
        details: `Age: ${p.age} • HH #${p.householdNumber}`,
        date: p.lastUpdated || 'Saved locally'
      });
    });

    vsts.filter(v => v.status === 'pending').forEach(v => {
      pending.push({
        type: 'Visit',
        name: v.patientName,
        id: v.id,
        details: `Purpose: ${v.purpose}`,
        date: v.visitDate || v.lastUpdated || 'Saved locally'
      });
    });

    mats.filter(m => m.status === 'pending').forEach(m => {
      pending.push({
        type: 'Maternal',
        name: m.patientName,
        id: m.id,
        details: `Gestational Age: ${m.gestationalAgeWeeks} Weeks`,
        date: m.lastUpdated || 'Saved locally'
      });
    });

    imms.filter(i => i.status === 'pending').forEach(i => {
      pending.push({
        type: 'Immunization',
        name: i.patientName,
        id: i.id,
        details: `Vaccine: ${i.vaccineName}`,
        date: i.dateGiven || i.lastUpdated || 'Saved locally'
      });
    });

    nuts.filter(n => n.status === 'pending').forEach(n => {
      pending.push({
        type: 'Nutrition',
        name: n.patientName,
        id: n.id,
        details: `Weight Status: ${n.weightForAgeStatus}`,
        date: n.lastUpdated || 'Saved locally'
      });
    });

    meds.filter(m => m.status === 'pending').forEach(m => {
      pending.push({
        type: 'Medicine',
        name: m.patientName,
        id: m.id,
        details: `Issued: ${m.medicineName} (${m.quantity})`,
        date: m.issueDate || m.lastUpdated || 'Saved locally'
      });
    });

    setPendingRecordsList(pending);

    setStats({
      total: syncStats.total,
      pending: pending.length,
      synced: syncStats.synced,
      failed: 0
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleOffline = () => {
    const newMode = !offlineMode;
    setOfflineMode(newMode);
    setOfflineModeEnabled(newMode);
    setSyncError(null);
    setSyncSuccess(false);
    loadData();
  };

  const isEffectiveOffline = offlineMode || networkStatus === 'offline' || (typeof navigator !== 'undefined' && !navigator.onLine);

  const handleSync = async () => {
    if (isEffectiveOffline) {
      setSyncError("You're offline. Records will sync automatically when internet connection returns.");
      return;
    }

    setIsSyncing(true);
    setSyncSuccess(false);
    setSyncError(null);

    const totalToSync = pendingRecordsList.length;

    try {
      if (totalToSync > 0) {
        setSyncStepProgress(`Syncing 1 of ${totalToSync} records...`);
        await new Promise(r => setTimeout(r, 400));
        if (totalToSync > 1) {
          setSyncStepProgress(`Syncing ${Math.ceil(totalToSync / 2)} of ${totalToSync} records...`);
          await new Promise(r => setTimeout(r, 500));
        }
        setSyncStepProgress(`Syncing ${totalToSync} of ${totalToSync} records...`);
      } else {
        setSyncStepProgress('Syncing your records...');
      }

      // Invoke local storage syncs
      await syncAllPending();
      if (syncPendingRecords) {
        await syncPendingRecords();
      }

      const nowStr = new Date().toLocaleString([], { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      setLastSyncDate(nowStr);
      localStorage.setItem('asha_sync_time_stamp', nowStr);
      localStorage.setItem('asha_ehr_sync_time', nowStr);

      setSyncSuccessCount(totalToSync);
      setSyncSuccess(true);
    } catch (e) {
      console.error(e);
      setSyncError("Sync couldn't be completed. Please try again.");
    } finally {
      setIsSyncing(false);
      setSyncStepProgress(null);
      loadData();
    }
  };

  // Helper for badge styling & icon per record type
  const getRecordTypeBadge = (type: string) => {
    switch (type) {
      case 'Visit':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Calendar };
      case 'Maternal':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Heart };
      case 'Immunization':
        return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: Baby };
      case 'Nutrition':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Apple };
      case 'Medicine':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Pill };
      case 'Household':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Home };
      case 'Patient':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: User };
      default:
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText };
    }
  };

  // Connection State Pill computation
  const getConnectionStatePill = () => {
    if (isSyncing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
          <span>● Syncing</span>
        </span>
      );
    }
    if (syncError) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>● Sync Error</span>
        </span>
      );
    }
    if (isEffectiveOffline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>● Offline</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>● Online</span>
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. PAGE TITLE & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Data Sync</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage records saved on this device and synchronize them when internet connectivity is available.
          </p>
        </div>
        <div className="self-start sm:self-auto shrink-0">
          {getConnectionStatePill()}
        </div>
      </div>

      {/* 12. REASSURING OFFLINE-FIRST MESSAGE BANNER (WHEN OFFLINE) */}
      {isEffectiveOffline && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-900 text-xs font-medium flex items-start gap-3 shadow-xs">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
            <WifiOff className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">You're offline.</h4>
            <p className="text-amber-800 leading-relaxed font-medium">
              Your records are still being saved on this device. They will sync automatically when internet connection returns.
            </p>
          </div>
        </div>
      )}

      {/* 3. COMPACT SYNC SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-lg sm:text-xl font-black ${stats.pending > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {stats.pending}
              </span>
              <span className="text-xs font-bold text-slate-500">records</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Synced</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-black text-emerald-600">
                {stats.synced}
              </span>
              <span className="text-xs font-bold text-slate-500">records</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Failed</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-black text-slate-600">
                {stats.failed > 0 ? `${stats.failed}` : '0'}
              </span>
              <span className="text-xs font-bold text-slate-500">records</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Synced</span>
            <div className="mt-1">
              <span className="text-xs sm:text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug">
                {lastSyncDate ? lastSyncDate : '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. PRIMARY ACTION: MANUAL SYNC & OFFLINE TOGGLE */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 text-sm">Sync Status & Control</h3>
                {stats.pending > 0 && (
                  <Badge variant="warning" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
                    {stats.pending} waiting
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isEffectiveOffline
                  ? "You're offline. Records will sync automatically when internet connection returns."
                  : stats.pending > 0
                  ? "Click Sync Now to upload saved records to the health center."
                  : "All records on this device are currently synced."}
              </p>
            </div>

            {/* Sync Now Button */}
            <Button
              id="btn-trigger-sync"
              variant="primary"
              size="lg"
              onClick={handleSync}
              disabled={isSyncing}
              className={`w-full sm:w-auto px-6 py-3 font-extrabold text-xs flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer ${
                isEffectiveOffline
                  ? 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                  : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? syncStepProgress || 'Syncing records...'
                  : 'Sync Now'}
              </span>
            </Button>
          </div>

          {/* Toggle for Field Device Offline Mode */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs font-bold text-slate-700 block">Simulate Offline Mode</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {offlineMode ? 'Device forced to offline mode.' : 'Automatic online sync active.'}
                </span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleToggleOffline}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                offlineMode ? 'bg-amber-500' : 'bg-slate-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                offlineMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 8. SUCCESS STATE BANNER */}
      {syncSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium flex items-start gap-3 animate-in fade-in duration-200 shadow-xs">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-emerald-950 text-xs sm:text-sm">✓ Sync completed</h4>
            <p className="text-emerald-800 font-medium">
              {syncSuccessCount > 0 
                ? `${syncSuccessCount} record${syncSuccessCount > 1 ? 's' : ''} synchronized successfully.` 
                : 'Everything is up to date.'}
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">
              Last synced: {lastSyncDate || 'Just now'}
            </p>
          </div>
        </div>
      )}

      {/* 9 & 10. FAILED SYNC & RETRY BANNER */}
      {syncError && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">Sync message</h4>
              <p className="text-amber-800 font-medium">{syncError}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {!isEffectiveOffline && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSync}
                className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSyncError(null)}
              className="border-amber-300 text-amber-800 hover:bg-amber-100 font-bold text-xs px-2.5 py-1.5 rounded-lg cursor-pointer"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* 4 & 5 & 16. PENDING RECORDS LIST OR EMPTY STATE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pending Sync ({pendingRecordsList.length})</span>
          </h2>
          <span className="text-[11px] font-bold text-slate-400">Saved on device</span>
        </div>

        {pendingRecordsList.length > 0 ? (
          <div className="space-y-2">
            {pendingRecordsList.map((rec) => {
              const typeConfig = getRecordTypeBadge(rec.type);
              const TypeIcon = typeConfig.icon;

              return (
                <div 
                  key={`pending-${rec.type}-${rec.id}`} 
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${typeConfig.bg}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${typeConfig.bg}`}>
                          {rec.type}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm">{rec.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{rec.details}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Saved: {rec.date}</span>
                      </div>
                    </div>
                  </div>

                  <Badge 
                    variant="warning" 
                    className="self-start sm:self-center text-[10px] font-bold bg-amber-50 text-amber-800 border-amber-200 px-2.5 py-1"
                  >
                    Pending
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          /* 16. EMPTY STATE REQUIRED FORMAT */
          <Card className="border-slate-200 bg-white text-center py-12 px-6">
            <CardContent className="max-w-xs mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">✓ Everything is synced</h3>
              <p className="text-xs text-slate-500 font-medium">
                No records are waiting to be synchronized.
              </p>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">Last synced:</span>
                <span className="text-xs font-extrabold text-slate-700">{lastSyncDate || '—'}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

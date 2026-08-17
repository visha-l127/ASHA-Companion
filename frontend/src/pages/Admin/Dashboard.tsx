import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { PHC, AdminUser, AuditLog } from './localStorageHelper';
import { adminApi } from '../../utils/apiClient';
import { 
  Users, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  ShieldAlert, 
  Plus, 
  FileText, 
  Settings, 
  Activity, 
  MapPin, 
  ArrowRight, 
  TrendingUp, 
  RefreshCw, 
  Database,
  HardDrive,
  Clock,
  Layers,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export default function AdminDashboard() {
  const { syncPendingRecords } = useAuth();
  const navigate = useNavigate();

  // Local states loaded from backend
  const [phcList, setPhcList] = useState<PHC[]>([]);
  const [userList, setUserList] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [statsRes, logsRes, phcsRes, usersRes] = await Promise.all([
        adminApi.getAdminDashboardStats(),
        adminApi.getAuditLogs(),
        adminApi.getPHCs(),
        adminApi.getUsers()
      ]);

      setStats(statsRes);
      setPhcList(phcsRes);

      // format logs for display
      const mappedLogs: AuditLog[] = logsRes.map((l: any) => ({
        id: `LOG-${l.id}`,
        facility: l.phcId ? (phcsRes.find((p: any) => p.code === l.phcId)?.name || l.phcId) : 'District HQ',
        user: l.performedUsername ? `${l.performedUsername} (${l.role})` : 'System',
        event: l.description,
        time: new Date(l.timestamp).toLocaleString(),
        severity: l.status && l.status.startsWith('2') ? 'success' : l.status && (l.status.startsWith('4') || l.status.startsWith('5')) ? 'warning' : 'info'
      }));
      setLogs(mappedLogs);

      // Map user list
      const mappedUsers: AdminUser[] = usersRes.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        username: u.username,
        email: u.username.toLowerCase() + "@companion.org",
        role: u.role.toLowerCase() as any,
        facilityId: u.phcId || '',
        facilityName: phcsRes.find((p: any) => p.code === u.phcId)?.name || 'Central Office',
        status: 'active',
        contactNumber: '+91 90000 11111',
        location: 'District Headquarter'
      }));
      setUserList(mappedUsers);

      setSettings({
        offlineTtl: statsRes.offlineTtl,
        maxDbSize: statsRes.maxDbSize,
        compressionRatio: statsRes.compressionRatio,
        districtIncharge: statsRes.districtIncharge,
        serverUrl: statsRes.serverUrl
      });
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      if (syncPendingRecords) {
        await syncPendingRecords();
      }
      setSyncSuccess(true);
      await refreshData();
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Metrics calculation from existing dataset
  const totalPhcs = phcList.length;
  const activePhcs = phcList.filter(p => p.status === 'active').length;
  const inactivePhcs = phcList.filter(p => p.status === 'inactive').length;
  const totalSupervisors = userList.filter(u => u.role === 'supervisor' && u.status === 'active').length;
  const totalAshas = userList.filter(u => u.role === 'asha').length;
  const totalPharmacists = userList.filter(u => u.role === 'pharmacist').length;

  // Percentage of PHCs with an assigned active supervisor
  const phcsWithSupervisor = phcList.filter(phc => 
    userList.some(u => u.role === 'supervisor' && u.status === 'active' && 
      (u.facilityId === phc.id || u.facilityName?.toLowerCase() === phc.name.toLowerCase())
    )
  ).length;

  const supervisorCoveragePercent = totalPhcs > 0 ? Math.round((phcsWithSupervisor / totalPhcs) * 100) : 0;

  // Chart data for daily transaction trend from audit logs or activity
  const MOCK_ACTIVITY_TREND = [
    { day: 'Mon', events: 28, syncs: 14 },
    { day: 'Tue', events: 42, syncs: 22 },
    { day: 'Wed', events: 55, syncs: 30 },
    { day: 'Thu', events: 38, syncs: 19 },
    { day: 'Fri', events: 64, syncs: 35 },
    { day: 'Sat', events: 45, syncs: 24 },
    { day: 'Sun', events: 72, syncs: 41 },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        description="Manage PHCs, supervisors, system configuration, and overall platform activity."
        breadcrumbs={[
          { label: 'System Console' },
          { label: 'Admin Dashboard' }
        ]}
      />

      {/* Sync State Banner */}
      {syncSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>District cache synchronized successfully! System registry updated.</span>
        </div>
      )}

      {/* SUMMARY METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total PHCs */}
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total PHCs</p>
              <h3 className="text-2xl font-black text-slate-800">{totalPhcs > 0 ? totalPhcs : '—'}</h3>
              <p className="text-[10px] text-teal-700 font-semibold">Managed Facilities</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active PHCs */}
        <Card className="hover:border-emerald-200 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active PHCs</p>
              <h3 className="text-2xl font-black text-emerald-700">{activePhcs > 0 ? activePhcs : '—'}</h3>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Online & Operational
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Inactive PHCs */}
        <Card className={`hover:border-slate-300 transition-all ${inactivePhcs > 0 ? 'bg-slate-50/50' : ''}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive PHCs</p>
              <h3 className="text-2xl font-black text-slate-600">{inactivePhcs}</h3>
              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Decommissioned
              </p>
            </div>
            <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* PHC Supervisors */}
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PHC Supervisors</p>
              <h3 className="text-2xl font-black text-slate-800">{totalSupervisors > 0 ? totalSupervisors : '—'}</h3>
              <p className="text-[10px] text-teal-700 font-semibold">Active Sector Officers</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* System Staff / Users */}
        <Card className="hover:border-teal-200 transition-all col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Users</p>
              <h3 className="text-2xl font-black text-slate-800">{userList.length > 0 ? userList.length : '—'}</h3>
              <p className="text-[10px] text-teal-700 font-semibold">{totalAshas} ASHAs | {totalPharmacists} Pharm</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS & SYSTEM OVERVIEW ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions Panel */}
        <Card className="lg:col-span-4 border-slate-100 shadow-sm flex flex-col justify-between">
          <CardHeader className="bg-slate-50/50 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Settings className="h-4 w-4 text-teal-600" />
              Quick Administrative Actions
            </CardTitle>
            <CardDescription className="text-xs">
              System-level shortcuts for facility and account management.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/phc')}
                className="w-full justify-start text-xs font-bold text-slate-800 py-3 h-auto border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all flex items-center gap-2.5"
              >
                <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-xs">Manage / Register PHCs</p>
                  <p className="text-[10px] text-slate-400 font-normal">Add or edit health centers</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 ml-auto text-slate-400" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/admin/supervisors')}
                className="w-full justify-start text-xs font-bold text-slate-800 py-3 h-auto border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all flex items-center gap-2.5"
              >
                <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-xs">Manage Supervisors</p>
                  <p className="text-[10px] text-slate-400 font-normal">Assign medical officers to PHCs</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 ml-auto text-slate-400" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/admin/reports')}
                className="w-full justify-start text-xs font-bold text-slate-800 py-3 h-auto border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all flex items-center gap-2.5"
              >
                <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-xs">View System Reports</p>
                  <p className="text-[10px] text-slate-400 font-normal">Audits & activity summaries</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 ml-auto text-slate-400" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/admin/settings')}
                className="w-full justify-start text-xs font-bold text-slate-800 py-3 h-auto border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all flex items-center gap-2.5"
              >
                <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                  <Settings className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-xs">System Settings</p>
                  <p className="text-[10px] text-slate-400 font-normal">TTL, quotas, backup policies</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 ml-auto text-slate-400" />
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Button
                onClick={handleForceSync}
                disabled={isSyncing}
                variant="primary"
                className="w-full justify-center text-xs font-bold py-2.5 h-auto flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing District...' : 'Trigger System Sync'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Overview Chart & Activity */}
        <Card className="lg:col-span-8 border-slate-100 shadow-sm">
          <CardHeader className="bg-slate-50/50 pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                System Activity & Ingestion Ledger
              </span>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {logs.length} Logged Events
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological administrative events and dataset sync volume over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_ACTIVITY_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" style={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis style={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="events" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEvents)" name="System Events" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Supervisor Coverage Gauge / Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-teal-600" />
                  Supervisor Coverage Rate
                </span>
                <span className="font-extrabold text-slate-800">{supervisorCoveragePercent}% ({phcsWithSupervisor} / {totalPhcs} PHCs)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-600 h-full transition-all duration-300"
                  style={{ width: `${supervisorCoveragePercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SYSTEM LOGS & CONFIGURATION QUOTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Administrative System Activity */}
        <Card className="lg:col-span-7 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-600" />
                Recent System Activity
              </span>
              <button
                onClick={() => navigate('/admin/audit')}
                className="text-[10px] text-teal-600 font-extrabold hover:underline uppercase tracking-wider cursor-pointer"
              >
                View Full Audit Logs
              </button>
            </CardTitle>
            <CardDescription className="text-xs">
              System administrative events, sync operations, and audit records.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2.5">
            {logs.slice(0, 4).map((log) => (
              <div 
                key={log.id} 
                className="p-3 border border-slate-100 rounded-xl bg-slate-50/40 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">{log.id}</span>
                    <p className="font-bold text-slate-800 leading-tight">{log.event}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-slate-300 shrink-0" /> {log.facility} | User: {log.user}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold block">{log.time}</span>
                  <Badge variant={log.severity === 'warning' ? 'danger' : log.severity === 'success' ? 'success' : 'info'} className="text-[9px] py-0 px-1.5">
                    {log.severity}
                  </Badge>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No recent administrative activity logged.
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Configuration Quotas */}
        <Card className="lg:col-span-5 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              System Policy & Quota Status
            </CardTitle>
            <CardDescription className="text-xs">
              Active parameters enforcing offline data retention, quotas, and security.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5">
              <Info className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Administrative scope is restricted to PHC facilities, supervisor assignments, and system parameters.
              </p>
            </div>

            <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/40 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-600 uppercase tracking-wide text-[10px]">Offline TTL Retention</span>
                <Badge variant="neutral" className="font-mono text-xs">{settings?.offlineTtl || 30} Days</Badge>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-600 uppercase tracking-wide text-[10px]">Database Storage Quota</span>
                <Badge variant="neutral" className="font-mono text-xs">{settings?.maxDbSize || 50} MB</Badge>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-600 uppercase tracking-wide text-[10px]">Bandwidth Compression</span>
                <Badge variant="neutral" className="font-mono text-xs">{settings?.compressionRatio || '8:1'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase tracking-wide text-[10px]">District In-Charge</span>
                <span className="font-bold text-slate-800 text-xs">{settings?.districtIncharge || 'Dr. R. Kannan'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

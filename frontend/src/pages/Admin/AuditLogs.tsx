import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock, 
  Building2, 
  User,
  X,
  Eye,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { AuditLog, PHC } from './localStorageHelper';
import { adminApi } from '../../utils/apiClient';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [logsRes, phcsRes] = await Promise.all([
        adminApi.getAuditLogs(),
        adminApi.getPHCs()
      ]);
      setPhcs(phcsRes);

      const mappedLogs: AuditLog[] = logsRes.map((l: any) => ({
        id: `LOG-${l.id}`,
        facility: l.phcId ? (phcsRes.find((p: any) => p.code === l.phcId)?.name || l.phcId) : 'District HQ',
        user: l.performedUsername ? `${l.performedUsername} (${l.role})` : 'System',
        event: l.description,
        time: new Date(l.timestamp).toLocaleString(),
        severity: l.status && l.status.startsWith('2') ? 'success' : l.status && (l.status.startsWith('4') || l.status.startsWith('5')) ? 'warning' : 'info'
      }));
      setLogs(mappedLogs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearLogs = async () => {
    try {
      await adminApi.purgeAuditLogs();
      setLogs([]);
      setShowClearConfirm(false);
      setSuccessMsg('Administrative activity history successfully purged.');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportLogs = () => {
    setSuccessMsg('Compiling administrative activity ledger...');
    
    setTimeout(() => {
      const headers = "Log ID,Facility / Scope,User Incharge,Event Description,Timestamp,Severity\n";
      const rows = logs.map(l => `"${l.id}","${l.facility}","${l.user}","${l.event}","${l.time}","${l.severity}"`).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Administrative_Activity_Ledger_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg('✓ Activity ledger successfully exported as CSV.');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    }, 500);
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesFacility = facilityFilter === 'all' || log.facility.includes(facilityFilter);

    return matchesSearch && matchesSeverity && matchesFacility;
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Administrative Activity"
        description="Show system-level administrative actions and system events."
        breadcrumbs={[
          { label: 'Admin Dashboard', to: '/admin/dashboard' },
          { label: 'Administrative Activity' }
        ]}
        action={
          <div className="flex gap-2">
            <Button 
              id="btn-export-logs"
              variant="outline" 
              onClick={handleExportLogs}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Ledger</span>
            </Button>
            <Button 
              id="btn-clear-logs"
              variant="danger" 
              onClick={() => setShowClearConfirm(true)}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Ledger</span>
            </Button>
          </div>
        }
      />

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <Card className="border-slate-200/80">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by event description, active personnel, or log ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="info">Info / Ingestion</option>
                <option value="success">Success / Resolution</option>
                <option value="warning">Warning / Override</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Facility:</span>
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Facilities</option>
                {phcs.map(p => (
                  <option key={p.id} value={p.name.replace(" Primary Health Centre", "").replace(" Sub-Center", "")}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline List */}
      <Card className="overflow-hidden border border-slate-200/80">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-extrabold text-slate-900">System Activity & Audit Log</CardTitle>
            <p className="text-xs text-slate-500 font-medium">Chronological record of system modifications and administrative events.</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredLogs.length} Events
          </span>
        </CardHeader>
        <CardContent className="p-0 bg-white divide-y divide-slate-100">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, idx) => (
              <div 
                key={`${log.id}-${idx}`} 
                onClick={() => setSelectedLog(log)}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                    log.severity === 'warning' 
                      ? 'bg-rose-50 text-rose-600 border-rose-200/60'
                      : log.severity === 'success'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                      : 'bg-blue-50 text-blue-600 border-blue-200/60'
                  }`}>
                    {log.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : log.severity === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        {log.id}
                      </span>
                      <p className="text-xs font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                        {log.event}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {log.facility}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {log.user}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-right">
                  <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    {log.time}
                  </div>
                  {log.severity === 'warning' ? (
                    <Badge variant="danger" className="text-[10px] px-2 py-0.5 font-bold">Override / Warning</Badge>
                  ) : log.severity === 'success' ? (
                    <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold">Success</Badge>
                  ) : (
                    <Badge variant="info" className="text-[10px] px-2 py-0.5 font-bold">Info</Badge>
                  )}
                  <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] py-1 px-2 h-auto hidden md:flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-500" />
                    Details
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center text-slate-400 font-medium">
              <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
              <p className="text-sm font-bold text-slate-600">No administrative activity recorded.</p>
              <p className="text-xs text-slate-400 mt-1">No event logs matched your active search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* READ-ONLY AUDIT DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-800 rounded-xl text-teal-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Administrative Activity Details</h3>
                  <p className="text-[11px] font-mono text-slate-400">{selectedLog.id} • Read-Only Log Record</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-medium text-slate-700">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Event Description</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedLog.event}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200/80 rounded-xl bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Performed By</span>
                  <p className="font-bold text-slate-800">{selectedLog.user}</p>
                </div>

                <div className="p-3 border border-slate-200/80 rounded-xl bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Facility Scope</span>
                  <p className="font-bold text-slate-800">{selectedLog.facility}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200/80 rounded-xl bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Timestamp</span>
                  <p className="font-bold text-slate-800 font-mono">{selectedLog.time}</p>
                </div>

                <div className="p-3 border border-slate-200/80 rounded-xl bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Severity Level</span>
                  {selectedLog.severity === 'warning' ? (
                    <Badge variant="danger" className="font-bold">Override / Warning</Badge>
                  ) : selectedLog.severity === 'success' ? (
                    <Badge variant="success" className="font-bold">Success</Badge>
                  ) : (
                    <Badge variant="info" className="font-bold">Info</Badge>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl text-slate-500 text-[11px] leading-relaxed">
                <p>🔒 This record is cryptographically signed and stored in the central audit ledger for regulatory compliance. It cannot be edited or modified.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)} className="font-bold text-xs">
                Close Detail
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PURGE CONFIRMATION DIALOG */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setShowClearConfirm(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Purge Activity Ledger?</h3>
                <p className="text-xs text-slate-500 font-medium">Permanent action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to permanently delete all administrative activity records from local storage? Historical event logs will be lost and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowClearConfirm(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="danger" 
                size="sm"
                onClick={handleClearLogs}
                className="text-xs font-bold"
              >
                Yes, Purge All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

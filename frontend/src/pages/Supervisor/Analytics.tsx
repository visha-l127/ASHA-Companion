import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AshaPerformance
} from './localSupervisorHelper';
import { PageHeader } from '../../components/PageHeader';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Badge, 
  Button 
} from '../../components/ui';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CalendarDays, 
  Download, 
  Printer, 
  Filter, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  Activity,
  MapPin,
  FileSearch,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';

import { adminApi, dashboardApi, priorityVisitApi, ehrRecordApi } from '../../utils/apiClient';

type DatePreset = 'all' | 'today' | 'week' | 'month';

export default function SupervisorAnalytics() {
  const navigate = useNavigate();

  // Filters state
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [selectedAsha, setSelectedAsha] = useState<string>('all');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // React state for raw data sources
  const [ashas, setAshas] = useState<any[]>([]);
  const [highRisk, setHighRisk] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [nutrition, setNutrition] = useState<any[]>([]);
  const [priorityVisits, setPriorityVisits] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, maternalRes, immunizationRes, nutritionRes, visitsRes, ehrRes] = await Promise.all([
        adminApi.getUsers(),
        dashboardApi.getHighRiskPregnancies(),
        dashboardApi.getOverdueImmunizations(),
        dashboardApi.getHighRiskNutrition(),
        priorityVisitApi.getAll(),
        ehrRecordApi.getAll()
      ]);

      const ashaList = usersRes.filter((u: any) => u.role && u.role.toLowerCase() === 'asha');
      setAshas(ashaList);
      setHighRisk(maternalRes || []);
      setDefaulters(immunizationRes || []);
      setNutrition(nutritionRes || []);
      setPriorityVisits(visitsRes || []);
      setRecords((ehrRes || []).map((r: any) => ({ ...r, id: r.recordId })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records by date preset, ASHA worker, record type, and verification status
  const filteredRecords = useMemo(() => {
    let result = [...records];

    // 1. Date preset filter
    if (datePreset !== 'all') {
      const now = new Date();
      const todayStr = now.toISOString().substring(0, 10);
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfWeekStr = startOfWeek.toISOString().substring(0, 10);

      const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      result = result.filter(r => {
        const dateStr = (r.lastUpdated || r.timestamp || '').substring(0, 10);
        if (!dateStr) return true;

        if (datePreset === 'today') {
          return dateStr === todayStr;
        } else if (datePreset === 'week') {
          return dateStr >= startOfWeekStr;
        } else if (datePreset === 'month') {
          return dateStr >= startOfMonthStr;
        }
        return true;
      });
    }

    // 2. ASHA Worker filter
    if (selectedAsha !== 'all') {
      result = result.filter(r => 
        r.workerId === selectedAsha || 
        r.ashaName?.toLowerCase().includes(selectedAsha.toLowerCase())
      );
    }

    // 3. Record Type filter
    if (selectedRecordType !== 'all') {
      result = result.filter(r => (r.type || 'general').toLowerCase() === selectedRecordType.toLowerCase());
    }

    // 4. Verification Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'pending') {
        result = result.filter(r => !r.verificationStatus || r.verificationStatus === 'pending');
      } else {
        result = result.filter(r => r.verificationStatus === selectedStatus);
      }
    }

    return result;
  }, [records, datePreset, selectedAsha, selectedRecordType, selectedStatus]);

  // Derived Summary Metrics
  const totalAshas = selectedAsha !== 'all' ? 1 : ashas.length;
  const totalPatientRecords = filteredRecords.length;

  // Filter priority visits
  const filteredVisits = useMemo(() => {
    let visits = [...priorityVisits];
    if (selectedAsha !== 'all') {
      visits = visits.filter(v => v.ashaId === selectedAsha || v.ashaName?.toLowerCase().includes(selectedAsha.toLowerCase()));
    }
    return visits;
  }, [priorityVisits, selectedAsha]);

  // Total visits (priority visits + monthly visits reported by ASHAs)
  const totalVisitsCount = useMemo(() => {
    if (selectedAsha !== 'all') {
      const matchAsha = ashas.find(a => a.id === selectedAsha || a.name.toLowerCase().includes(selectedAsha.toLowerCase()));
      return matchAsha ? matchAsha.visitsThisMonth : filteredVisits.length;
    }
    const ashaVisitsSum = ashas.reduce((sum, a) => sum + (a.visitsThisMonth || 0), 0);
    return Math.max(ashaVisitsSum, filteredVisits.length);
  }, [ashas, filteredVisits, selectedAsha]);

  // Verification Counts
  const pendingReviewCount = filteredRecords.filter(r => !r.verificationStatus || r.verificationStatus === 'pending').length;
  const verifiedCount = filteredRecords.filter(r => r.verificationStatus === 'verified').length;
  const correctionRequestedCount = filteredRecords.filter(r => r.verificationStatus === 'correction_requested').length;

  // Verification Distribution Data for Charts
  const verificationPieData = [
    { name: 'Pending Review', value: pendingReviewCount, color: '#f59e0b' },
    { name: 'Verified', value: verifiedCount, color: '#0d9488' },
    { name: 'Correction Requested', value: correctionRequestedCount, color: '#e11d48' }
  ].filter(item => item.value > 0);

  // ASHA Activity Breakdown Data for Chart
  const ashaActivityChartData = useMemo(() => {
    return ashas.map(asha => {
      const ashaRecords = records.filter(r => r.workerId === asha.id || r.ashaName === asha.name);
      const recordsCreated = ashaRecords.length;
      const pendingForAsha = ashaRecords.filter(r => !r.verificationStatus || r.verificationStatus === 'pending').length;

      return {
        name: asha.name.split(' ')[0],
        fullName: asha.name,
        'Records Created': recordsCreated,
        'Visits Completed': asha.visitsThisMonth,
        'Pending Review': pendingForAsha
      };
    });
  }, [ashas, records]);

  // Field Activity Over Time (Grouped by Date)
  const fieldActivityOverTime = useMemo(() => {
    const map: Record<string, { date: string; records: number; visits: number }> = {};

    filteredRecords.forEach(r => {
      const d = (r.lastUpdated || r.timestamp || '2026-07-01').substring(0, 10);
      if (!map[d]) {
        map[d] = { date: d, records: 0, visits: 0 };
      }
      map[d].records += 1;
    });

    filteredVisits.forEach(v => {
      const d = (v.assignedDate || '2026-07-01').substring(0, 10);
      if (!map[d]) {
        map[d] = { date: d, records: 0, visits: 0 };
      }
      map[d].visits += 1;
    });

    const sortedKeys = Object.keys(map).sort();
    return sortedKeys.map(k => ({
      date: k.substring(5), // MM-DD
      fullDate: k,
      Records: map[k].records,
      Visits: map[k].visits
    }));
  }, [filteredRecords, filteredVisits]);

  // Attention Items
  const attentionItems = useMemo(() => {
    const items: { id: string; title: string; count: number; description: string; type: 'warning' | 'danger' | 'info'; actionPath: string; actionLabel: string }[] = [];

    if (pendingReviewCount > 0) {
      items.push({
        id: 'att-pending-review',
        title: 'Health Records Pending Verification',
        count: pendingReviewCount,
        description: `${pendingReviewCount} patient record(s) submitted by ASHA Workers require supervisor verification.`,
        type: 'warning',
        actionPath: '/supervisor/patients',
        actionLabel: 'Review Records'
      });
    }

    if (correctionRequestedCount > 0) {
      items.push({
        id: 'att-corrections',
        title: 'Active Correction Requests',
        count: correctionRequestedCount,
        description: `${correctionRequestedCount} record(s) have pending correction requests awaiting ASHA update.`,
        type: 'danger',
        actionPath: '/supervisor/patients',
        actionLabel: 'View Corrections'
      });
    }

    const ashasWithUnsynced = ashas.filter(a => a.pendingCount > 0);
    if (ashasWithUnsynced.length > 0) {
      const totalPendingSync = ashasWithUnsynced.reduce((sum, a) => sum + a.pendingCount, 0);
      items.push({
        id: 'att-unsynced-ashas',
        title: 'In-Field Queued Data',
        count: totalPendingSync,
        description: `${ashasWithUnsynced.length} ASHA Worker(s) have ${totalPendingSync} record(s) queued in field tablets.`,
        type: 'info',
        actionPath: '/supervisor/ashas',
        actionLabel: 'Check ASHAs'
      });
    }

    const unresHrp = highRisk.filter(h => h.status !== 'Resolved').length;
    if (unresHrp > 0) {
      items.push({
        id: 'att-hrp',
        title: 'Active High-Risk Complications',
        count: unresHrp,
        description: `${unresHrp} maternal case(s) flagged with severe anemia or hypertension needing follow-up.`,
        type: 'danger',
        actionPath: '/supervisor/alerts',
        actionLabel: 'View Complications'
      });
    }

    return items;
  }, [pendingReviewCount, correctionRequestedCount, ashas, highRisk]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = ['Record ID', 'Patient Name', 'Type', 'Diagnosis', 'ASHA Worker', 'Last Updated', 'Verification Status', 'Verified By'];
    const rows = filteredRecords.map(r => [
      r.id,
      `"${r.patientName || 'Anonymous'}"`,
      r.type || 'General',
      `"${r.diagnosis || '-'}"`,
      `"${r.ashaName || 'Anjali Sharma'}"`,
      r.lastUpdated || r.timestamp || '-',
      r.verificationStatus || 'pending',
      `"${r.verifiedBy || '-'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PHC_Analytics_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Analytics"
        description="Monitor field activity, record verification, and PHC-level health-service activity."
        breadcrumbs={[
          { label: 'Dashboard', to: '/supervisor/dashboard' },
          { label: 'Analytics' }
        ]}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-teal-700" />
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              Print / PDF
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <Card className="border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 shrink-0">
            <Filter className="h-4 w-4 text-teal-600" />
            <span>Filter Analytics:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            {/* Date Preset */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Period</label>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* ASHA Worker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ASHA Worker</label>
              <select
                value={selectedAsha}
                onChange={(e) => setSelectedAsha(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All ASHA Workers</option>
                {ashas.map((a) => (
                  <option key={`asha-opt-${a.id}`} value={a.id}>
                    {a.name} ({a.sector})
                  </option>
                ))}
              </select>
            </div>

            {/* Record Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Record Type</label>
              <select
                value={selectedRecordType}
                onChange={(e) => setSelectedRecordType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Record Types</option>
                <option value="general">General EHR</option>
                <option value="maternal">Maternal ANC</option>
                <option value="child">Child Care</option>
                <option value="immunization">Immunization</option>
                <option value="nutrition">Nutrition</option>
              </select>
            </div>

            {/* Verification Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="verified">Verified</option>
                <option value="correction_requested">Correction Requested</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total ASHA Workers */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total ASHAs</span>
              <Users className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mt-2">{totalAshas ?? '—'}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Assigned Sector</p>
          </CardContent>
        </Card>

        {/* Patient Records */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Patient Records</span>
              <FileText className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mt-2">{totalPatientRecords ?? '—'}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Matching Filter</p>
          </CardContent>
        </Card>

        {/* Visits */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Visits</span>
              <CalendarDays className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mt-2">{totalVisitsCount ?? '—'}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Field Outreach</p>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Pending Review</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-amber-950 mt-2">{pendingReviewCount ?? '—'}</h3>
            <p className="text-[10px] text-amber-800 font-medium mt-0.5">Awaiting Action</p>
          </CardContent>
        </Card>

        {/* Verified Records */}
        <Card className="border-teal-200 bg-teal-50/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">Verified Records</span>
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="text-xl font-black text-teal-950 mt-2">{verifiedCount ?? '—'}</h3>
            <p className="text-[10px] text-teal-800 font-medium mt-0.5">Approved Quality</p>
          </CardContent>
        </Card>

        {/* Correction Requests */}
        <Card className="border-rose-200 bg-rose-50/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider">Corrections</span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <h3 className="text-xl font-black text-rose-950 mt-2">{correctionRequestedCount ?? '—'}</h3>
            <p className="text-[10px] text-rose-800 font-medium mt-0.5">Requested to ASHA</p>
          </CardContent>
        </Card>
      </div>

      {/* Attention Areas Section */}
      {attentionItems.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/30 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Needs Attention ({attentionItems.reduce((acc, item) => acc + item.count, 0)})
            </h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
              Supervisor Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {attentionItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-amber-200/80 p-3.5 rounded-xl space-y-2 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-800">{item.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      item.type === 'danger' ? 'bg-rose-100 text-rose-800' :
                      item.type === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => navigate(item.actionPath)}
                  className="w-full mt-2 justify-between border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-bold"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Analytics Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Record Verification Distribution */}
        <Card className="lg:col-span-5 border-slate-200 shadow-xs flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-black text-slate-800 flex items-center justify-between">
              <span>Record Verification Distribution</span>
              <Badge variant="neutral" className="text-[9px] font-bold">
                {totalPatientRecords} Total
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Current verification status breakdown of health records submitted by ASHA Workers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
            {totalPatientRecords > 0 ? (
              <>
                <div className="h-52 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verificationPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {verificationPieData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Compact Status Breakdown Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl text-center">
                    <p className="text-[9px] font-extrabold text-amber-800 uppercase">Pending Review</p>
                    <p className="text-lg font-black text-amber-950 mt-0.5">{pendingReviewCount}</p>
                    <p className="text-[9px] text-amber-700 font-bold">
                      {Math.round((pendingReviewCount / (totalPatientRecords || 1)) * 100)}%
                    </p>
                  </div>

                  <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl text-center">
                    <p className="text-[9px] font-extrabold text-teal-800 uppercase">Verified</p>
                    <p className="text-lg font-black text-teal-950 mt-0.5">{verifiedCount}</p>
                    <p className="text-[9px] text-teal-700 font-bold">
                      {Math.round((verifiedCount / (totalPatientRecords || 1)) * 100)}%
                    </p>
                  </div>

                  <div className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-center">
                    <p className="text-[9px] font-extrabold text-rose-800 uppercase">Corrections</p>
                    <p className="text-lg font-black text-rose-950 mt-0.5">{correctionRequestedCount}</p>
                    <p className="text-[9px] text-rose-700 font-bold">
                      {Math.round((correctionRequestedCount / (totalPatientRecords || 1)) * 100)}%
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <FileSearch className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No records found for the selected period.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ASHA Activity Breakdown */}
        <Card className="lg:col-span-7 border-slate-200 shadow-xs flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-black text-slate-800">
              ASHA Field Activity & Record Submission
            </CardTitle>
            <CardDescription className="text-xs">
              Compare record submissions and visits completed across assigned ASHA Workers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 h-72">
            {ashaActivityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ashaActivityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                    labelClassName="font-extrabold text-slate-800"
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="Records Created" fill="#0d9488" radius={[3, 3, 0, 0]} barSize={22} />
                  <Bar dataKey="Visits Completed" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={22} />
                  <Bar dataKey="Pending Review" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <p className="text-xs font-bold">No activity data available.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Field Activity Over Time Chart */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-black text-slate-800">
            Field Activity Trends (Records & Priority Visits)
          </CardTitle>
          <CardDescription className="text-xs">
            Volume of records created and priority visits scheduled over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 h-64">
          {fieldActivityOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fieldActivityOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                  labelClassName="font-extrabold text-slate-800"
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Records" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Visits" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <p className="text-xs font-bold">No activity trends available for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ASHA Performance & Activity Summary Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-black text-slate-800">
              ASHA Worker Activity Summary
            </CardTitle>
            <CardDescription className="text-xs">
              Operational statistics per ASHA Worker in the assigned sector.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/supervisor/ashas')}
            className="text-xs font-bold text-teal-700 border-teal-200 hover:bg-teal-50"
          >
            Manage ASHA Workers <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">ASHA Worker</th>
                  <th className="p-3.5">Assigned Sector</th>
                  <th className="p-3.5 text-center">Total Records</th>
                  <th className="p-3.5 text-center">Pending Review</th>
                  <th className="p-3.5 text-center">Visits (Month)</th>
                  <th className="p-3.5 text-center">In-Field Queue</th>
                  <th className="p-3.5 text-right">Last Sync Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ashas.map((asha) => {
                  const ashaRecords = records.filter(r => r.workerId === asha.id || r.ashaName === asha.name);
                  const totalRecs = ashaRecords.length;
                  const pendingRecs = ashaRecords.filter(r => !r.verificationStatus || r.verificationStatus === 'pending').length;

                  return (
                    <tr key={`asha-summary-${asha.id}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5">
                        <div>
                          <p className="font-extrabold text-slate-800">{asha.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{asha.id}</p>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">
                        <span className="flex items-center text-slate-600">
                          <MapPin className="h-3 w-3 text-slate-400 mr-1 shrink-0" />
                          {asha.sector}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800">
                        {totalRecs}
                      </td>
                      <td className="p-3.5 text-center">
                        {pendingRecs > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-extrabold">
                            {pendingRecs} Pending
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[10px]">✓ Reviewed</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800">
                        {asha.visitsThisMonth}
                      </td>
                      <td className="p-3.5 text-center">
                        {asha.pendingCount > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-extrabold">
                            {asha.pendingCount} Queued
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[10px]">Synced</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono text-[10px] text-slate-500">
                        {asha.lastActive}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

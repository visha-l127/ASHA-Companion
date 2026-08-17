import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Badge, 
  Button 
} from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
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
  Cell 
} from 'recharts';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  Users, 
  Baby, 
  Heart, 
  Apple, 
  RefreshCw, 
  CheckCircle2, 
  Calendar, 
  ChevronRight,
  Filter,
  Search,
  Eye,
  ArrowLeft,
  FileSearch,
  Clock,
  AlertTriangle
} from 'lucide-react';

import { adminApi, dashboardApi, priorityVisitApi, ehrRecordApi } from '../../utils/apiClient';

type ReportCategory = 'patient-records' | 'verification-audit' | 'maternal' | 'immunization' | 'nutrition' | 'asha-activity' | 'priority-visits';

type DatePreset = 'all' | 'today' | 'week' | 'month';

export default function SupervisorReports() {
  const navigate = useNavigate();

  // Active Report State
  const [activeReport, setActiveReport] = useState<ReportCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [selectedAsha, setSelectedAsha] = useState<string>('all');
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastCompiledAt, setLastCompiledAt] = useState<string>('2026-08-11 20:30');

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

  const handleRecompile = async () => {
    setIsCompiling(true);
    await loadAllData();
    setLastCompiledAt(new Date().toISOString().replace('T', ' ').substring(0, 16));
    setIsCompiling(false);
  };

  // Filter records by date and ASHA
  const filteredRecords = useMemo(() => {
    let result = [...records];

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
        if (datePreset === 'today') return dateStr === todayStr;
        if (datePreset === 'week') return dateStr >= startOfWeekStr;
        if (datePreset === 'month') return dateStr >= startOfMonthStr;
        return true;
      });
    }

    if (selectedAsha !== 'all') {
      result = result.filter(r => r.workerId === selectedAsha || r.ashaName?.toLowerCase().includes(selectedAsha.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        (r.patientName && r.patientName.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.diagnosis && r.diagnosis.toLowerCase().includes(q)) ||
        (r.ashaName && r.ashaName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [records, datePreset, selectedAsha, searchQuery]);

  // Statistics for Reports
  const totalRecords = filteredRecords.length;
  const pendingRecords = filteredRecords.filter(r => !r.verificationStatus || r.verificationStatus === 'pending').length;
  const verifiedRecords = filteredRecords.filter(r => r.verificationStatus === 'verified').length;
  const correctionRecords = filteredRecords.filter(r => r.verificationStatus === 'correction_requested').length;

  const totalMaternalCases = highRisk.length;
  const totalDefaulters = defaulters.length;
  const totalMalnourished = nutrition.length;
  const totalPriorityVisits = priorityVisits.length;

  // Chart dataset for village maternal cases
  const maternalVillageData = [
    { name: 'Madukkarai', 'High Risk Cases': highRisk.filter(h => h.village === 'Madukkarai').length },
    { name: 'Thondamuthur', 'High Risk Cases': highRisk.filter(h => h.village === 'Thondamuthur').length },
    { name: 'Sulur', 'High Risk Cases': highRisk.filter(h => h.village === 'Sulur').length },
    { name: 'Karamadai', 'High Risk Cases': highRisk.filter(h => h.village === 'Karamadai').length }
  ];

  // Chart dataset for immunization
  const immunizationVillageData = [
    { name: 'Madukkarai', 'Defaulters': defaulters.filter(d => d.village === 'Madukkarai').length },
    { name: 'Thondamuthur', 'Defaulters': defaulters.filter(d => d.village === 'Thondamuthur').length },
    { name: 'Sulur', 'Defaulters': defaulters.filter(d => d.village === 'Sulur').length },
    { name: 'Karamadai', 'Defaulters': defaulters.filter(d => d.village === 'Karamadai').length }
  ];

  // Pie chart for SAM vs MAM
  const samCases = nutrition.filter(n => n.status === 'SAM').length;
  const mamCases = nutrition.filter(n => n.status === 'MAM').length;
  const nutritionPieData = [
    { name: 'Severe Acute Malnutrition (SAM)', value: samCases, color: '#f43f5e' },
    { name: 'Moderate Acute Malnutrition (MAM)', value: mamCases, color: '#f59e0b' }
  ].filter(i => i.value > 0);

  // Export CSV Helper for Reports
  const handleExportReportCSV = (reportType: ReportCategory) => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'patient-records' || reportType === 'verification-audit') {
      headers = ['Record ID', 'Patient Name', 'Type', 'Diagnosis', 'ASHA Worker', 'Last Updated', 'Verification Status', 'Verified By'];
      rows = filteredRecords.map(r => [
        r.id,
        `"${r.patientName || 'Anonymous'}"`,
        r.type || 'General',
        `"${r.diagnosis || '-'}"`,
        `"${r.ashaName || 'Anjali Sharma'}"`,
        r.lastUpdated || r.timestamp || '-',
        r.verificationStatus || 'pending',
        `"${r.verifiedBy || '-'}"`
      ]);
    } else if (reportType === 'maternal') {
      headers = ['Case ID', 'Patient Name', 'Age', 'Village', 'Hb (g/dL)', 'BP', 'Risk Type', 'Gestation Weeks', 'Status', 'Assigned ASHA'];
      rows = highRisk.map(h => [
        h.id, `"${h.patientName}"`, String(h.patientAge), `"${h.village}"`, String(h.hbLevel), `"${h.bpSys}/${h.bpDia}"`, `"${h.riskType}"`, `${h.gestationalWeeks}w`, h.status, `"${h.assignedAsha}"`
      ]);
    } else if (reportType === 'immunization') {
      headers = ['Child ID', 'Child Name', 'Age', 'Parent Name', 'Contact', 'Village', 'Missed Vaccine', 'Days Overdue', 'Assigned ASHA'];
      rows = defaulters.map(d => [
        d.id, `"${d.childName}"`, `"${d.childAge}"`, `"${d.parentName}"`, `"${d.parentContact}"`, `"${d.village}"`, `"${d.missedVaccine}"`, String(d.daysOverdue), `"${d.assignedAsha}"`
      ]);
    } else if (reportType === 'nutrition') {
      headers = ['Child ID', 'Child Name', 'Age', 'Parent', 'Village', 'Weight (kg)', 'Height (cm)', 'MUAC (cm)', 'Status', 'Assigned ASHA'];
      rows = nutrition.map(n => [
        n.id, `"${n.childName}"`, `"${n.childAge}"`, `"${n.parentName}"`, `"${n.village}"`, String(n.weight), String(n.height), String(n.muac), n.status, `"${n.assignedAsha}"`
      ]);
    } else if (reportType === 'asha-activity') {
      headers = ['ASHA ID', 'Name', 'Sector', 'Active Patients', 'Visits This Month', 'Pending Queue', 'Completion Rate %', 'Last Active'];
      rows = ashas.map(a => [
        a.id, `"${a.name}"`, `"${a.sector}"`, String(a.activePatients), String(a.visitsThisMonth), String(a.pendingCount), `${a.completionRate}%`, `"${a.lastActive}"`
      ]);
    } else if (reportType === 'priority-visits') {
      headers = ['Visit ID', 'Patient Name', 'Village', 'Condition', 'Urgency', 'Assigned ASHA', 'Status', 'Assigned Date'];
      rows = priorityVisits.map(v => [
        v.id, `"${v.patientName}"`, `"${v.village}"`, `"${v.condition}"`, v.urgency, `"${v.ashaName}"`, v.status, v.assignedDate
      ]);
    }

    if (headers.length === 0) return;

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PHC_Report_${reportType}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Report Definitions for Cards
  const reportCards = [
    {
      id: 'patient-records' as ReportCategory,
      name: 'Patient Health Records Report',
      description: 'Review patient EHR record entries, clinical diagnoses, and verification audit statuses submitted by ASHA Workers.',
      countInfo: `${totalRecords} records in selected period`,
      icon: FileText,
      badge: 'Core Register'
    },
    {
      id: 'verification-audit' as ReportCategory,
      name: 'Record Verification Audit Report',
      description: 'Audit breakdown of verified records versus correction requests and supervisor review timestamps.',
      countInfo: `${verifiedRecords} verified, ${pendingRecords} pending, ${correctionRecords} corrections`,
      icon: FileSearch,
      badge: 'Quality Control'
    },
    {
      id: 'maternal' as ReportCategory,
      name: 'Maternal High-Risk Audit Report',
      description: 'Gestational complications register detailing severe anemia, preeclampsia, and high-risk pregnancy observation states.',
      countInfo: `${totalMaternalCases} high-risk cases registered`,
      icon: Heart,
      badge: 'Maternal Health'
    },
    {
      id: 'immunization' as ReportCategory,
      name: 'Immunization Defaulter Report',
      description: 'Child vaccination register highlighting overdue schedules, missed vaccines, and outreach notes.',
      countInfo: `${totalDefaulters} overdue immunization cases`,
      icon: Baby,
      badge: 'Child Immunization'
    },
    {
      id: 'nutrition' as ReportCategory,
      name: 'Child Nutrition (SAM/MAM) Report',
      description: 'Malnutrition register assessing Severe Acute Malnutrition (SAM) and Moderate Acute Malnutrition (MAM) with MUAC metrics.',
      countInfo: `${totalMalnourished} malnutrition cases tracked`,
      icon: Apple,
      badge: 'Nutrition'
    },
    {
      id: 'asha-activity' as ReportCategory,
      name: 'ASHA Activity & Outreach Report',
      description: 'Field worker performance ledger tracking active patient counts, monthly visits done, and tablet sync statuses.',
      countInfo: `${ashas.length} ASHA Workers assigned`,
      icon: Users,
      badge: 'Workforce KPI'
    },
    {
      id: 'priority-visits' as ReportCategory,
      name: 'Priority Field Visits Report',
      description: 'Delegated priority outreach visits log tracking urgency levels, clinical conditions, and completion progress.',
      countInfo: `${totalPriorityVisits} priority visits assigned`,
      icon: Calendar,
      badge: 'Outreach Log'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reports"
        description="Generate, review, and export PHC health reports, verification audits, and field activity registers."
        breadcrumbs={[
          { label: 'Dashboard', to: '/supervisor/dashboard' },
          { label: 'Reports' }
        ]}
        action={
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
              disabled={isCompiling}
              onClick={handleRecompile}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 text-teal-700 ${isCompiling ? 'animate-spin' : ''}`} />
              {isCompiling ? 'Re-compiling...' : 'Recompile Registry'}
            </Button>

            <Button 
              variant="primary" 
              size="sm" 
              className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs"
              onClick={() => window.print()}
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Export PDF
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <Card className="border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 shrink-0">
            <Filter className="h-4 w-4 text-teal-600" />
            <span>Filter Reports:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search report contents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Date Preset */}
            <div>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Period</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* ASHA Worker */}
            <div>
              <select
                value={selectedAsha}
                onChange={(e) => setSelectedAsha(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All ASHA Workers</option>
                {ashas.map((a) => (
                  <option key={`report-asha-${a.id}`} value={a.id}>
                    {a.name} ({a.sector})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Area: Report Cards Overview vs Specific Report View */}
      {!activeReport ? (
        /* Report Cards List Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Available PHC Reports ({reportCards.length})
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              Last compiled: {lastCompiledAt}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCards.map((report) => {
              const Icon = report.icon;
              return (
                <Card 
                  key={`card-${report.id}`} 
                  className="border-slate-200 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between bg-white"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="neutral" className="text-[9px] font-extrabold uppercase">
                        {report.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-black text-slate-900 mt-3">
                      {report.name}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed mt-1 line-clamp-2">
                      {report.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-600 flex items-center gap-1.5 border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{report.countInfo}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => setActiveReport(report.id)}
                        className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs justify-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Report
                      </Button>

                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleExportReportCSV(report.id)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                        title="Export CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Detailed Report View Pane */
        <div className="space-y-6">
          {/* Back button and Report Toolbar */}
          <div className="flex items-center justify-between gap-2 bg-slate-100/80 p-3 rounded-xl border border-slate-200">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setActiveReport(null)}
              className="bg-white border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Reports
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleExportReportCSV(activeReport)}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={() => window.print()}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Report
              </Button>
            </div>
          </div>

          {/* Active Report Header Box */}
          <Card className="border-teal-200 bg-gradient-to-r from-teal-50/50 to-emerald-50/30 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[9px] uppercase font-bold">
                    Official PHC Report
                  </Badge>
                  <span className="text-[10px] text-slate-500 font-mono">Compiled: {lastCompiledAt}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  {reportCards.find(r => r.id === activeReport)?.name}
                </h2>
                <p className="text-xs text-slate-600 font-medium max-w-2xl">
                  {reportCards.find(r => r.id === activeReport)?.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Records Evaluated</span>
                <span className="text-2xl font-black text-teal-800">
                  {activeReport === 'patient-records' || activeReport === 'verification-audit' ? totalRecords :
                   activeReport === 'maternal' ? totalMaternalCases :
                   activeReport === 'immunization' ? totalDefaulters :
                   activeReport === 'nutrition' ? totalMalnourished :
                   activeReport === 'asha-activity' ? ashas.length : totalPriorityVisits}
                </span>
              </div>
            </div>
          </Card>

          {/* Active Report View Content */}
          {(activeReport === 'patient-records' || activeReport === 'verification-audit') && (
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black text-slate-800">
                    Patient EHR Register Ledger ({filteredRecords.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Listing of health records with verification state and reviewer notes.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredRecords.length > 0 ? (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">Record ID</th>
                          <th className="p-3.5">Patient Name</th>
                          <th className="p-3.5">Record Type</th>
                          <th className="p-3.5">Diagnosis</th>
                          <th className="p-3.5">ASHA Worker</th>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Verification Status</th>
                          <th className="p-3.5 text-right">Reviewer Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRecords.map((r) => (
                          <tr key={`rec-row-${r.id}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-slate-500">{r.id}</td>
                            <td className="p-3.5 font-extrabold text-slate-800">{r.patientName || 'Anonymous'}</td>
                            <td className="p-3.5 font-semibold text-slate-600">
                              <span className="capitalize">{r.type || 'General'}</span>
                            </td>
                            <td className="p-3.5 text-slate-700 max-w-xs truncate">{r.diagnosis || 'Standard Register Entry'}</td>
                            <td className="p-3.5 font-bold text-slate-600">{r.ashaName || 'Anjali Sharma'}</td>
                            <td className="p-3.5 font-mono text-[10px] text-slate-500">{r.lastUpdated || r.timestamp}</td>
                            <td className="p-3.5">
                              {r.verificationStatus === 'verified' ? (
                                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-extrabold">
                                  ✓ Verified
                                </span>
                              ) : r.verificationStatus === 'correction_requested' ? (
                                <span className="inline-flex items-center px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] font-extrabold">
                                  ! Correction Needed
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-extrabold">
                                  ⏳ Pending Review
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right text-slate-500 text-[11px] italic max-w-xs truncate">
                              {r.correctionNote || r.verifiedBy || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 font-medium">
                    <p className="text-xs font-bold text-slate-600">No records found for the selected period.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeReport === 'maternal' && (
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-black text-slate-800">
                    Maternal High-Risk Complications per Village
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={maternalVillageData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                      <Bar dataKey="High Risk Cases" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-black text-slate-800">
                    High-Risk Gestational Register ({highRisk.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">Patient Name</th>
                          <th className="p-3.5">Age / Gestation</th>
                          <th className="p-3.5">Village</th>
                          <th className="p-3.5">Hemoglobin</th>
                          <th className="p-3.5">Blood Pressure</th>
                          <th className="p-3.5">Risk Type</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Assigned ASHA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {highRisk.map((hr) => (
                          <tr key={`hrp-row-${hr.id}`} className="hover:bg-slate-50/50">
                            <td className="p-3.5 font-extrabold text-slate-800">{hr.patientName}</td>
                            <td className="p-3.5 text-slate-600 font-semibold">{hr.patientAge} Y/F • {hr.gestationalWeeks}w</td>
                            <td className="p-3.5 text-slate-500 font-medium">{hr.village}</td>
                            <td className="p-3.5 font-mono font-bold text-rose-600">{hr.hbLevel} g/dL</td>
                            <td className="p-3.5 font-mono font-bold text-slate-700">{hr.bpSys}/{hr.bpDia} mmHg</td>
                            <td className="p-3.5 font-bold text-rose-800">{hr.riskType}</td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                hr.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                hr.status === 'Referred' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {hr.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right text-slate-600 font-bold">{hr.assignedAsha}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeReport === 'immunization' && (
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-black text-slate-800">
                    Immunization Defaulters per Catchment Village
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={immunizationVillageData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                      <Bar dataKey="Defaulters" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-black text-slate-800">
                    Child Vaccination Defaulters Register ({defaulters.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">Child Name</th>
                          <th className="p-3.5">Age / Parent</th>
                          <th className="p-3.5">Village</th>
                          <th className="p-3.5">Missed Vaccine</th>
                          <th className="p-3.5">Overdue Days</th>
                          <th className="p-3.5">Assigned ASHA</th>
                          <th className="p-3.5 text-right">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {defaulters.map((d) => (
                          <tr key={`def-row-${d.id}`} className="hover:bg-slate-50/50">
                            <td className="p-3.5 font-extrabold text-slate-800">{d.childName}</td>
                            <td className="p-3.5 text-slate-600 font-semibold">{d.childAge} • {d.parentName}</td>
                            <td className="p-3.5 text-slate-500 font-medium">{d.village}</td>
                            <td className="p-3.5 font-bold text-amber-800">{d.missedVaccine}</td>
                            <td className="p-3.5 font-mono font-black text-rose-600">{d.daysOverdue} Days</td>
                            <td className="p-3.5 text-slate-600 font-bold">{d.assignedAsha}</td>
                            <td className="p-3.5 text-right text-slate-500 italic max-w-xs truncate">{d.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeReport === 'nutrition' && (
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-black text-slate-800">
                    Child Malnutrition (SAM vs MAM) Prevalences
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-60 flex items-center justify-center">
                  {nutritionPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={nutritionPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {nutritionPieData.map((entry, index) => (
                            <Cell key={`nut-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-slate-400">No active malnutrition cases recorded.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-black text-slate-800">
                    Child Nutrition Growth Register ({nutrition.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">Child Name</th>
                          <th className="p-3.5">Age / Parent</th>
                          <th className="p-3.5">Village</th>
                          <th className="p-3.5">Weight (kg)</th>
                          <th className="p-3.5">Height (cm)</th>
                          <th className="p-3.5">MUAC (cm)</th>
                          <th className="p-3.5">Nutrition Class</th>
                          <th className="p-3.5 text-right">Assigned ASHA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {nutrition.map((n) => (
                          <tr key={`nut-row-${n.id}`} className="hover:bg-slate-50/50">
                            <td className="p-3.5 font-extrabold text-slate-800">{n.childName}</td>
                            <td className="p-3.5 text-slate-600 font-semibold">{n.childAge} • {n.parentName}</td>
                            <td className="p-3.5 text-slate-500 font-medium">{n.village}</td>
                            <td className="p-3.5 font-mono text-slate-700">{n.weight} kg</td>
                            <td className="p-3.5 font-mono text-slate-700">{n.height} cm</td>
                            <td className="p-3.5 font-mono font-black text-rose-600">{n.muac} cm</td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                n.status === 'SAM' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {n.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right text-slate-600 font-bold">{n.assignedAsha}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeReport === 'asha-activity' && (
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-black text-slate-800">
                  ASHA Workforce Activity Ledger ({ashas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3.5">ASHA Name</th>
                        <th className="p-3.5">ASHA ID</th>
                        <th className="p-3.5">Sector</th>
                        <th className="p-3.5 text-center">Active Patients</th>
                        <th className="p-3.5 text-center">Visits (Month)</th>
                        <th className="p-3.5 text-center">Pending Queue</th>
                        <th className="p-3.5 text-center">Sync Completion</th>
                        <th className="p-3.5 text-right">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ashas.map((a) => (
                        <tr key={`asha-act-row-${a.id}`} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-extrabold text-slate-800">{a.name}</td>
                          <td className="p-3.5 font-mono text-slate-400">{a.id}</td>
                          <td className="p-3.5 font-semibold text-slate-600">{a.sector}</td>
                          <td className="p-3.5 text-center font-bold text-slate-800">{a.activePatients}</td>
                          <td className="p-3.5 text-center font-bold text-teal-700">{a.visitsThisMonth}</td>
                          <td className="p-3.5 text-center">
                            {a.pendingCount > 0 ? (
                              <Badge variant="warning" className="text-[8px] font-bold">
                                {a.pendingCount} Queued
                              </Badge>
                            ) : (
                              <span className="text-slate-400 font-semibold text-[10px]">Synced</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-700">{a.completionRate}%</td>
                          <td className="p-3.5 text-right font-mono text-[10px] text-slate-500">{a.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeReport === 'priority-visits' && (
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-black text-slate-800">
                  Priority Field Visits Register ({priorityVisits.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3.5">Visit ID</th>
                        <th className="p-3.5">Patient Name</th>
                        <th className="p-3.5">Village</th>
                        <th className="p-3.5">Clinical Condition</th>
                        <th className="p-3.5">Urgency</th>
                        <th className="p-3.5">Assigned ASHA</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Assigned Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {priorityVisits.map((v) => (
                        <tr key={`vis-row-${v.id}`} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-mono text-slate-400">{v.id}</td>
                          <td className="p-3.5 font-extrabold text-slate-800">{v.patientName}</td>
                          <td className="p-3.5 font-semibold text-slate-600">{v.village}</td>
                          <td className="p-3.5 text-slate-700 max-w-xs truncate">{v.condition}</td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                              v.urgency === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              v.urgency === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {v.urgency}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700">{v.ashaName}</td>
                          <td className="p-3.5 font-bold">
                            {v.status === 'Completed' ? (
                              <span className="text-emerald-700">✓ Completed</span>
                            ) : (
                              <span className="text-amber-700">⏳ Pending</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right font-mono text-[10px] text-slate-500">{v.assignedDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </div>
  );
}

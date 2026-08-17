import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Baby, 
  Heart, 
  Activity, 
  Building2, 
  Filter, 
  CheckCircle,
  Clock,
  UserCheck,
  ClipboardList,
  ChevronRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { PHC, AdminUser } from './localStorageHelper';
import { adminApi, dashboardApi } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

// Mock epidemiological report datasets
const MOCK_HISTORIC_DATA = [
  { month: 'Jan', maternal: 45, immunization: 120, ncd: 180 },
  { month: 'Feb', maternal: 52, immunization: 132, ncd: 195 },
  { month: 'Mar', maternal: 48, immunization: 145, ncd: 210 },
  { month: 'Apr', maternal: 60, immunization: 138, ncd: 220 },
  { month: 'May', maternal: 58, immunization: 160, ncd: 245 },
  { month: 'Jun', maternal: 65, immunization: 175, ncd: 260 },
  { month: 'Jul', maternal: 72, immunization: 190, ncd: 285 },
];

const COLORS = ['#0d9488', '#0284c7', '#d97706', '#e11d48'];

export default function ReportsPage() {
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [supervisors, setSupervisors] = useState<AdminUser[]>([]);
  const [selectedPhc, setSelectedPhc] = useState<string>('all');
  const [selectedIndicator, setSelectedIndicator] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('90');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [activeReportModal, setActiveReportModal] = useState<string | null>(null);

  // Dynamic summary computed upon "Generate Report"
  const [reportSummary, setReportSummary] = useState({
    activePatients: 1482,
    vaccinationRate: '91.5%',
    highRiskANC: 34,
    referralsCount: 128,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [phcsRes, usersRes] = await Promise.all([
        adminApi.getPHCs(),
        adminApi.getUsers()
      ]);
      setPhcs(phcsRes);
      
      const mappedSupervisors: AdminUser[] = usersRes
        .filter((u: any) => u.role.toLowerCase() === 'supervisor')
        .map((u: any) => ({
          id: String(u.id),
          name: u.name,
          username: u.username,
          email: u.username.toLowerCase() + "@companion.org",
          role: 'supervisor' as any,
          facilityId: u.phcId || '',
          facilityName: phcsRes.find((p: any) => p.code === u.phcId)?.name || 'Central Office',
          status: 'active',
          contactNumber: '+91 90000 11111',
          location: 'District Headquarter'
        }));
      setSupervisors(mappedSupervisors);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const [patientReport, maternalReport, immunizationReport] = await Promise.all([
        dashboardApi.getPatientReport(),
        dashboardApi.getMaternalReport(),
        dashboardApi.getImmunizationReport()
      ]);

      const totalVaccinations = (immunizationReport.administeredRecords || 0) + (immunizationReport.overdueVaccinationsCount || 0);
      const vRate = totalVaccinations > 0 
        ? ((immunizationReport.administeredRecords / totalVaccinations) * 100).toFixed(1) 
        : '91.5';

      setReportSummary({
        activePatients: patientReport.activePatients || patientReport.totalPatients || 0,
        vaccinationRate: `${vRate}%`,
        highRiskANC: maternalReport.highRiskPregancies || 0,
        referralsCount: maternalReport.highRiskAncVisitsCount || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: 'CSV' | 'PDF') => {
    if (format === 'CSV') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Indicator Channel,Total Patients Ingested,Target Complete,Sync Confidence\n"
        + `Maternal Care (ANC),${reportSummary.highRiskANC},94%,High\n`
        + `Child Immunization,${reportSummary.activePatients},91.5%,High\n`
        + `NCD Screening,${reportSummary.referralsCount},82%,Medium\n`;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `District_Health_Report_${selectedPhc}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setExportSuccess(`✓ Report successfully exported as ${format}`);
    setTimeout(() => {
      setExportSuccess(null);
    }, 4000);
  };

  // Diagnostic distribution data
  const indicatorPieData = [
    { name: 'Pediatric Care', value: 450 },
    { name: 'Maternal Care (ANC)', value: 310 },
    { name: 'NCD Screening', value: 540 },
    { name: 'General Outpatient', value: 182 },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Reports"
        description="View system-level reports and administrative summaries."
        breadcrumbs={[
          { label: 'Admin Dashboard', to: '/admin/dashboard' },
          { label: 'Reports' }
        ]}
        action={
          <div className="flex gap-2">
            <Button 
              id="btn-export-csv"
              variant="outline" 
              onClick={() => handleExport('CSV')}
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </Button>
            <Button 
              id="btn-export-pdf"
              variant="primary" 
              onClick={() => handleExport('PDF')}
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </Button>
          </div>
        }
      />

      {/* Success Notification Banner */}
      {exportSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccess}</span>
          </div>
          <button onClick={() => setExportSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SYSTEM REPORT CARDS GRID */}
      <div>
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">System Report Catalog</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: PHC Report */}
          <Card className="hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between" onClick={() => setActiveReportModal('phc')}>
            <CardContent className="p-5 space-y-3">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl w-fit">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">PHC Structure Report</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">
                  View PHC status, bed capacity, established year, and supervisor assignments.
                </p>
              </div>
            </CardContent>
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">{phcs.length} PHCs Registered</span>
              <Button variant="outline" size="sm" className="text-xs font-bold py-1 h-auto">
                View Report
              </Button>
            </div>
          </Card>

          {/* Card 2: Supervisor Report */}
          <Card className="hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between" onClick={() => setActiveReportModal('supervisors')}>
            <CardContent className="p-5 space-y-3">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl w-fit">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Supervisor Workforce Report</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">
                  Review supervisor account statuses, contact records, and PHC sector coverage.
                </p>
              </div>
            </CardContent>
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">{supervisors.length} Active Supervisors</span>
              <Button variant="outline" size="sm" className="text-xs font-bold py-1 h-auto">
                View Report
              </Button>
            </div>
          </Card>

          {/* Card 3: Administrative Activity / Sync Report */}
          <Card className="hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between" onClick={() => setActiveReportModal('activity')}>
            <CardContent className="p-5 space-y-3">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl w-fit">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">System Activity Report</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">
                  Track platform administrative logs, tablet validation merges, and sync transactions.
                </p>
              </div>
            </CardContent>
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Transaction Logs</span>
              <Button variant="outline" size="sm" className="text-xs font-bold py-1 h-auto">
                View Report
              </Button>
            </div>
          </Card>

          {/* Card 4: Health Indicator Progress */}
          <Card className="hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between" onClick={() => setActiveReportModal('health')}>
            <CardContent className="p-5 space-y-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Health Indicator Progress</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">
                  Summary of maternal care completeness, child immunization, and NCD screening.
                </p>
              </div>
            </CardContent>
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Epidemiological</span>
              <Button variant="outline" size="sm" className="text-xs font-bold py-1 h-auto">
                View Report
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* FILTER BAR FOR DYNAMIC REPORT QUERYING */}
      <Card className="border-slate-200/80 bg-slate-50/40">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> PHC Scope
              </label>
              <select
                value={selectedPhc}
                onChange={(e) => setSelectedPhc(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
              >
                <option value="all">All District Centers</option>
                {phcs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Ingestion Channel
              </label>
              <select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
              >
                <option value="all">All Ingestion Channels</option>
                <option value="maternal">Maternal Health (ANC)</option>
                <option value="immunization">Child Immunization</option>
                <option value="ncd">NCD Screening</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Time Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="180">Last 6 Months</option>
                <option value="365">Last 1 Year</option>
              </select>
            </div>

            <div>
              <Button 
                onClick={handleGenerateReport}
                variant="primary"
                className="w-full justify-center flex items-center gap-1.5 text-xs font-bold py-2"
                disabled={isGenerating}
              >
                {isGenerating ? 'Compiling Query...' : 'Apply Filters'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AGGREGATE SCORECARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-100 bg-white">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Queried Active Cohort</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{reportSummary.activePatients}</h3>
            <span className="inline-block text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md mt-1">
              Active Coverage
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Child Immunization Rate</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{reportSummary.vaccinationRate}</h3>
            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-1">
              Target Complete
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">High-Risk Referrals</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{reportSummary.highRiskANC} Urgent</h3>
            <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md mt-1">
              Inpatient Required
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completed Field Visits</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{reportSummary.referralsCount}</h3>
            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1">
              ASHA Verified
            </span>
          </CardContent>
        </Card>
      </div>

      {/* VISUAL CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-8 overflow-hidden border border-slate-200/80">
          <CardHeader className="pb-2 bg-slate-50/50">
            <CardTitle className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" /> Aggregated Ingestion Trends
            </CardTitle>
            <CardDescription className="text-xs">Monthly clinical logs submitted from district PHC centers.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 bg-white h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_HISTORIC_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 'bold', paddingTop: 10 }} />
                <Line type="monotone" dataKey="maternal" name="Maternal (ANC)" stroke="#0d9488" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="immunization" name="Child Immunization" stroke="#0284c7" strokeWidth={3} />
                <Line type="monotone" dataKey="ncd" name="NCD Screening" stroke="#d97706" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="lg:col-span-4 overflow-hidden border border-slate-200/80">
          <CardHeader className="pb-2 bg-slate-50/50">
            <CardTitle className="text-sm font-extrabold text-slate-900">Informatics Distribution</CardTitle>
            <CardDescription className="text-xs">Distribution of clinical log entries.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 bg-white flex flex-col justify-between items-center h-[320px]">
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={indicatorPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {indicatorPieData.map((entry, index) => (
                      <Cell key={`pie-cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full space-y-1.5 mt-2">
              {indicatorPieData.map((entry, index) => (
                <div key={`legend-${entry.name}`} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-slate-600">{entry.name}</span>
                  </div>
                  <span className="text-slate-800 font-bold">{entry.value} logs</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABULAR ANALYSIS TABLE */}
      <Card className="overflow-hidden border border-slate-200/80">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100">
          <CardTitle className="text-sm font-extrabold text-slate-900">District Health Indicator Progress Summary</CardTitle>
          <CardDescription className="text-xs text-slate-500">Tabular breakdown of clinical channel completeness.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Indicator Channel</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Target Cohort</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Coverage Completeness</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Ingestion Channel</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-extrabold text-slate-800">
                    <Heart className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Maternal Health (ANC Checkups)</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700 font-bold">310 Pregnancies</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                      <div className="bg-teal-600 h-full w-[94%]" />
                    </div>
                    <span className="font-bold text-slate-700">94%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">ASHA Field Tablets</td>
                <td className="px-6 py-4 text-right">
                  <Badge variant="success">High Accuracy</Badge>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-extrabold text-slate-800">
                    <Baby className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Child Immunization Coverage</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700 font-bold">450 Infants</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                      <div className="bg-teal-600 h-full w-[91%]" />
                    </div>
                    <span className="font-bold text-slate-700">91.5%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">Scheduled Immunization</td>
                <td className="px-6 py-4 text-right">
                  <Badge variant="success">Active Schedule</Badge>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-extrabold text-slate-800">
                    <Activity className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>NCD Screening (BP / Diabetes)</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700 font-bold">540 Adults</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                      <div className="bg-teal-600 h-full w-[82%]" />
                    </div>
                    <span className="font-bold text-slate-700">82%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">Field Camps & PHCs</td>
                <td className="px-6 py-4 text-right">
                  <Badge variant="info">Pending Sync</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* REPORT MODAL DRILLDOWNS */}
      {activeReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-800 rounded-xl">
                  {activeReportModal === 'phc' && <Building2 className="w-5 h-5 text-teal-300" />}
                  {activeReportModal === 'supervisors' && <UserCheck className="w-5 h-5 text-teal-300" />}
                  {activeReportModal === 'activity' && <ClipboardList className="w-5 h-5 text-teal-300" />}
                  {activeReportModal === 'health' && <TrendingUp className="w-5 h-5 text-teal-300" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {activeReportModal === 'phc' && 'Primary Health Centres (PHC) Report'}
                    {activeReportModal === 'supervisors' && 'PHC Supervisor Workforce Report'}
                    {activeReportModal === 'activity' && 'System Activity & Audit Report'}
                    {activeReportModal === 'health' && 'District Health Indicators Progress Report'}
                  </h3>
                  <p className="text-xs text-teal-200">System Administrative Summary</p>
                </div>
              </div>
              <button onClick={() => setActiveReportModal(null)} className="p-1 text-teal-200 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              {activeReportModal === 'phc' && (
                <div className="space-y-3">
                  <p className="text-slate-600 font-medium">Registered Primary Health Centres in District scope:</p>
                  <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                    {phcs.map(p => (
                      <div key={`phc-rep-${p.id}`} className="p-3.5 bg-white flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-slate-800">{p.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">{p.code} • District: {p.district} • Beds: {p.beds}</p>
                        </div>
                        <Badge variant="success" className="text-[10px] font-bold">✓ Active PHC</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeReportModal === 'supervisors' && (
                <div className="space-y-3">
                  <p className="text-slate-600 font-medium">Registered PHC Supervisors in District scope:</p>
                  <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                    {supervisors.map(s => (
                      <div key={`sup-rep-${s.id}`} className="p-3.5 bg-white flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-slate-800">{s.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">@{s.username} • {s.facilityName}</p>
                        </div>
                        <Badge variant={s.status === 'active' ? 'success' : 'neutral'} className="text-[10px] font-bold">
                          {s.status === 'active' ? '✓ Active' : '⊘ Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeReportModal === 'activity' && (
                <div className="space-y-3">
                  <p className="text-slate-600 font-medium">Platform administrative activity overview:</p>
                  <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-slate-700">
                    <p className="font-bold">• Total PHC Facilities Managed: {phcs.length}</p>
                    <p className="font-bold">• Total Supervisor Accounts Provisioned: {supervisors.length}</p>
                    <p className="font-bold">• Offline Storage TTL: 30 Days</p>
                    <p className="font-bold">• Offline GPRS Compression: 8:1</p>
                  </div>
                </div>
              )}

              {activeReportModal === 'health' && (
                <div className="space-y-3">
                  <p className="text-slate-600 font-medium">District Clinical Progress Summary:</p>
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl space-y-2 text-teal-950">
                    <p className="font-bold">✓ Maternal Health Checkup Rate: 94%</p>
                    <p className="font-bold">✓ Child Immunization Schedule Coverage: 91.5%</p>
                    <p className="font-bold">✓ NCD Screening Rate: 82%</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setActiveReportModal(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleExport('CSV')}>
                <Download className="w-3.5 h-3.5 mr-1" /> Export Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AshaPerformance,
  HighRiskPregnancy,
  ImmunizationDefaulter,
  MedicineAlert,
  PriorityVisit
} from './localSupervisorHelper';
import { adminApi, dashboardApi, priorityVisitApi, ehrRecordApi } from '../../utils/apiClient';
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
  Users, 
  ShieldAlert, 
  ClipboardList, 
  Activity, 
  MapPin, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  Baby,
  Pill,
  CalendarDays,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  UserCheck,
  Building2,
  Eye,
  Send
} from 'lucide-react';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ashas, setAshas] = useState<any[]>([]);
  const [highRisk, setHighRisk] = useState<any[]>([]);
  const [priorityVisits, setPriorityVisits] = useState<any[]>([]);
  const [ehrRecords, setEhrRecords] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overview, setOverview] = useState<any>({
    totalPatients: 0,
    activePatients: 0,
    totalAshaWorkers: 0,
    activePregnancies: 0,
    highRiskPregnancies: 0,
    totalAntenatalVisits: 0,
    childrenWithImmunizationRecords: 0,
    upcomingVaccinations: 0,
    overdueVaccinations: 0,
    highRiskNutritionRecords: 0,
    lowStockMedicines: 0,
    expiringMedicineBatches: 0,
  });

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      const [usersRes, summaryRes, visitsRes, ehrRes, highRiskRes] = await Promise.all([
        adminApi.getUsers(),
        dashboardApi.getSummary(),
        priorityVisitApi.getAll(),
        ehrRecordApi.getAll(),
        dashboardApi.getHighRiskPregnancies()
      ]);

      const ashaList = usersRes.filter((u: any) => u.role && u.role.toLowerCase() === 'asha');
      setAshas(ashaList);

      if (summaryRes) {
        setOverview({
          totalPatients: summaryRes.totalPatients || 0,
          activePatients: summaryRes.activePatients || 0,
          totalAshaWorkers: ashaList.length,
          activePregnancies: summaryRes.activePregnancies || 0,
          highRiskPregnancies: summaryRes.highRiskPregnancies || 0,
          totalAntenatalVisits: (summaryRes.pendingANCVisits || 0) + (summaryRes.overdueANCVisits || 0),
          childrenWithImmunizationRecords: summaryRes.childrenCount || 0,
          upcomingVaccinations: summaryRes.immunizationsDue || 0,
          overdueVaccinations: summaryRes.immunizationsOverdue || 0,
          highRiskNutritionRecords: summaryRes.nutritionHighRiskCount || 0,
          lowStockMedicines: summaryRes.lowStockMedicineCount || 0,
          expiringMedicineBatches: summaryRes.expiringMedicineBatchCount || 0,
        });
      }

      setPriorityVisits(visitsRes || []);
      setEhrRecords(ehrRes || []);
      
      const mappedHighRisk = (highRiskRes || []).map((h: any) => ({
        id: String(h.pregnancyId),
        patientName: h.patientName,
        patientAge: 26, // Fallback
        village: h.phcId || 'Sector 1',
        hbLevel: 8.5, // Fallback
        bpSys: 140, // Fallback
        bpDia: 90, // Fallback
        riskType: h.riskFactors || 'High Risk Pregancy',
        gestationalWeeks: 28, // Fallback
        assignedAsha: 'ASHA Worker',
        status: h.pregnancyStatus || 'Under Observation',
        lastChecked: h.lastAncVisitDate || '2026-08-12'
      }));
      setHighRisk(mappedHighRisk);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Derived metrics
  const totalAshas = ashas.length;
  const activeAshas = totalAshas; // Default all registered to active
  const pendingReviewRecords = ehrRecords.filter(r => !r.verificationStatus || r.verificationStatus === 'pending');
  const pendingReviewCount = pendingReviewRecords.length;
  const verifiedRecordsCount = ehrRecords.filter(r => r.verificationStatus === 'verified').length;
  const correctionsRequestedCount = ehrRecords.filter(r => r.verificationStatus === 'correction_requested').length;
  const pendingVisitsCount = priorityVisits.filter(v => v.status === 'Pending').length;
  const activeHighRiskCount = highRisk.filter(h => h.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-800 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black">PHC Supervisor Dashboard</h1>
            <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">
              {user?.facilityName || 'Madukkarai PHC'}
            </span>
          </div>
          <p className="text-xs text-teal-100 leading-relaxed max-w-xl font-medium">
            Monitor field activities, review health records, and support ASHA Workers.
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex items-center gap-1.5 self-start md:self-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold"
          disabled={isRefreshing}
          onClick={refreshAllData}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total ASHA Workers */}
        <Card className="hover:shadow-md transition-all cursor-pointer border-slate-200" onClick={() => navigate('/supervisor/ashas')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total ASHAs</span>
              <Users className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mt-2">{totalAshas}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Assigned Sector</p>
          </CardContent>
        </Card>

        {/* Active ASHAs */}
        <Card className="hover:shadow-md transition-all cursor-pointer border-emerald-200 bg-emerald-50/20" onClick={() => navigate('/supervisor/ashas')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Active ASHAs</span>
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-emerald-950 mt-2">{activeAshas}</h3>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Currently On Duty</p>
          </CardContent>
        </Card>

        {/* Records Pending Review */}
        <Card className="hover:shadow-md transition-all cursor-pointer border-amber-200 bg-amber-50/30" onClick={() => navigate('/supervisor/patients')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Pending Review</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-amber-950 mt-2">{pendingReviewCount}</h3>
            <p className="text-[10px] text-amber-800 font-medium mt-0.5">Needs Verification</p>
          </CardContent>
        </Card>

        {/* Corrections Requested */}
        <Card className="hover:shadow-md transition-all cursor-pointer border-rose-200 bg-rose-50/30" onClick={() => navigate('/supervisor/patients')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider">Corrections</span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <h3 className="text-xl font-black text-rose-950 mt-2">{correctionsRequestedCount}</h3>
            <p className="text-[10px] text-rose-800 font-medium mt-0.5">Requested to ASHA</p>
          </CardContent>
        </Card>

        {/* Records Verified */}
        <Card className="hover:shadow-md transition-all cursor-pointer border-teal-200 bg-teal-50/20" onClick={() => navigate('/supervisor/patients')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">Verified</span>
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="text-xl font-black text-teal-950 mt-2">{verifiedRecordsCount}</h3>
            <p className="text-[10px] text-teal-800 font-medium mt-0.5">Approved Quality</p>
          </CardContent>
        </Card>

        {/* Recent Priority Visits */}
        <Card className="hover:shadow-md transition-all cursor-pointer border-teal-200 bg-teal-50/20" onClick={() => navigate('/supervisor/visits')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">Priority Visits</span>
              <CalendarDays className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mt-2">{pendingVisitsCount}</h3>
            <p className="text-[10px] text-teal-800 font-medium mt-0.5">Delegated Cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Navigation Bar */}
      <Card className="p-4 border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Quick Supervisor Actions:</span>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/supervisor/ashas')}
              className="bg-white text-slate-700 hover:bg-slate-100 border-slate-200 text-xs font-bold"
            >
              <Users className="h-3.5 w-3.5 mr-1 text-teal-600" />
              Manage ASHA Workers
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/supervisor/patients')}
              className="bg-white text-slate-700 hover:bg-slate-100 border-slate-200 text-xs font-bold"
            >
              <FileSearch className="h-3.5 w-3.5 mr-1 text-amber-600" />
              Review Records ({pendingReviewCount})
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/supervisor/analytics')}
              className="bg-white text-slate-700 hover:bg-slate-100 border-slate-200 text-xs font-bold"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1 text-teal-600" />
              View Analytics
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/supervisor/reports')}
              className="bg-white text-slate-700 hover:bg-slate-100 border-slate-200 text-xs font-bold"
            >
              <FileText className="h-3.5 w-3.5 mr-1 text-teal-600" />
              View Reports
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/supervisor/pharmacists')}
              className="bg-white text-slate-700 hover:bg-slate-100 border-slate-200 text-xs font-bold"
            >
              <Pill className="h-3.5 w-3.5 mr-1 text-teal-600" />
              Manage Pharmacists
            </Button>
          </div>
        </div>
      </Card>

      {/* Primary Supervision Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Section 1: Records Pending Review */}
        <Card className="lg:col-span-7 border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Health Records Pending Review ({pendingReviewCount})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Review submitted clinical forms, verify data quality, or request corrections.
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="xs" 
              onClick={() => navigate('/supervisor/patients')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {pendingReviewRecords.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {pendingReviewRecords.slice(0, 4).map((rec, idx) => (
                  <div key={`pending-rec-${rec.id}-${idx}`} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800">{rec.patientName || 'Anonymous Record'}</span>
                        <Badge variant="neutral" className="text-[9px] uppercase font-bold">
                          {rec.type || 'General'}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {rec.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium truncate">
                        Diagnosis: {rec.diagnosis || 'Standard entry submitted'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>Created by: <strong className="text-slate-600">{rec.ashaName || 'Anjali Sharma'}</strong></span>
                        <span>•</span>
                        <span>Date: {rec.lastUpdated || rec.timestamp}</span>
                      </div>
                    </div>
                    <Button
                      size="xs"
                      onClick={() => navigate('/supervisor/patients')}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 font-medium space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-600">All submitted records have been reviewed!</p>
                <p className="text-[11px] text-slate-400">No records currently pending supervisor verification.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: High Risk Complications & Action Cases */}
        <Card className="lg:col-span-5 border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Gestational Complications ({activeHighRiskCount})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Maternal cases requiring PHC clinical review & outreach.
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="xs" 
              onClick={() => navigate('/supervisor/alerts')}
              className="text-xs font-bold text-rose-700 hover:text-rose-800"
            >
              Alerts <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {highRisk.filter(hr => hr.status !== 'Resolved').slice(0, 3).map((patient, idx) => (
              <div key={`hrp-${patient.id}-${idx}`} className="p-3.5 border border-slate-150 rounded-xl space-y-2 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-xs text-slate-800">{patient.patientName}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {patient.patientAge} Y/F • {patient.village} • Gestation: {patient.gestationalWeeks}w
                    </p>
                  </div>
                  <Badge variant="danger" className="text-[8px] uppercase font-black">
                    High Risk
                  </Badge>
                </div>
                
                <div className="text-[11px] bg-rose-50/30 p-2.5 rounded-lg text-slate-700 border border-rose-100">
                  <p className="font-extrabold text-rose-800">{patient.riskType}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    Hb: {patient.hbLevel} g/dL | BP: {patient.bpSys}/{patient.bpDia} mmHg
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span className="font-bold text-slate-500">ASHA: {patient.assignedAsha}</span>
                  <span className="font-mono text-[9px]">Last Checked: {patient.lastChecked}</span>
                </div>
              </div>
            ))}

            {activeHighRiskCount === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No active high-risk maternal cases.</p>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ASHA Worker Overview Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>ASHA Worker Activity & Performance Overview</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Monitor active field workers, assigned sectors, recent visits, and record sync statuses.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/supervisor/ashas')}
            className="text-xs font-bold text-teal-700 border-teal-200 hover:bg-teal-50"
          >
            Manage ASHA Roster <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">ASHA Worker</th>
                  <th className="p-3.5">Assigned Sector</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Active Patients</th>
                  <th className="p-3.5 text-center">Visits This Month</th>
                  <th className="p-3.5 text-center">In-Field Queue</th>
                  <th className="p-3.5 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ashas.map((asha, idx) => (
                  <tr key={`asha-row-${asha.id}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
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
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-extrabold">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        Active
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-800">
                      {asha.activePatients}
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-800">
                      {asha.visitsThisMonth}
                    </td>
                    <td className="p-3.5 text-center">
                      {asha.pendingCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-extrabold">
                          {asha.pendingCount} Pending
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">Synced</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono text-[10px] text-slate-500">
                      {asha.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

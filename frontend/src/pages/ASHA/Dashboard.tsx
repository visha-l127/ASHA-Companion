import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  loadAllAshaData,
  getSyncStats, 
  isOfflineModeEnabled,
  syncAllPending
} from './localAshaHelper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { 
  Home, 
  Users, 
  Heart, 
  Baby, 
  Pill, 
  Database, 
  AlertTriangle, 
  Plus, 
  Calendar, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Flame,
  UserCheck,
  CheckCircle,
  ArrowRight,
  User,
  Clock,
  ClipboardList,
  Activity,
  Check,
  Play,
  MapPin,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ASHADashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Stats State
  const [householdCount, setHouseholdCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [maternalCount, setMaternalCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  
  // Today's Work Counts
  const [todaysVisitsCount, setTodaysVisitsCount] = useState(0);
  const [pendingFollowupsCount, setPendingFollowupsCount] = useState(0);

  // Alert pipelines
  const [highRiskMothers, setHighRiskMothers] = useState<any[]>([]);
  const [samChildren, setSamChildren] = useState<any[]>([]);
  const [activeReferrals, setActiveReferrals] = useState<any[]>([]);

  // Chart data
  const [nutritionChartData, setNutritionChartData] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    try {
      const data = await loadAllAshaData();
      const households = data.households;
      const patients = data.patients;
      const maternal = data.maternal;
      const childs = patients.filter(p => p.isChild || p.age <= 12);
      const medicines = data.medicines;
      const syncStats = getSyncStats();
      const visits = data.visits;
      const nutrition = data.nutrition;
      const immunizations = data.immunizations;

      setHouseholdCount(households.length);
      setPatientCount(patients.length);
      setMaternalCount(maternal.length);
      setChildCount(childs.length);
      setMedicineCount(medicines.length);
      setPendingSyncCount(syncStats.pending);
      setIsOffline(isOfflineModeEnabled());

      // Today's Work metrics using actual current date
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysVisits = visits.filter(v => v.visitDate === todayStr);
      setTodaysVisitsCount(todaysVisits.length);

      // Pending followups based on actual pending NCD follow-ups, active referrals, and upcoming immunization boosters
      const today = new Date().toISOString().split('T')[0];
      const pendingVisitsCount = visits.filter(v => (v.purpose === 'NCD Follow-up' || v.referralNeeded) && (v.status === 'pending' || v.verificationStatus === 'correction_requested')).length;
      const pendingImmunizationCount = immunizations.filter(i => i.nextDueDate && i.nextDueDate >= today && i.status === 'pending').length;
      setPendingFollowupsCount(pendingVisitsCount + pendingImmunizationCount);

      // High Risk pregnancy filters
      setHighRiskMothers(maternal.filter(m => m.highRiskFactors.length > 0 && !m.highRiskFactors.includes('None')));
      
      // SAM Children filters
      setSamChildren(nutrition.filter(n => n.samStatus));

      // Active referrals
      setActiveReferrals(visits.filter(v => v.referralNeeded));

      // Nutrition statistics for Recharts
      const normal = nutrition.filter(n => n.weightForAgeStatus === 'normal').length;
      const moderate = nutrition.filter(n => n.weightForAgeStatus === 'moderate').length;
      const severe = nutrition.filter(n => n.weightForAgeStatus === 'severe').length;

      setNutritionChartData([
        { name: 'Normal', value: normal, color: '#10b981' },
        { name: 'Moderate Mal.', value: moderate, color: '#f59e0b' },
        { name: 'Severe SAM', value: severe, color: '#ef4444' }
      ]);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const handleSyncNow = async () => {
    if (isOffline) {
      setSyncError('You are currently in Offline Mode. Enable online Data Sync under the Data Sync section first.');
      return;
    }
    try {
      setIsSyncing(true);
      setSyncDone(false);
      setSyncError(null);
      await syncAllPending();
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 4000);
    } catch (e) {
      console.error(e);
      setSyncError('Data Sync failed. Please check your signal strength and retry.');
    } finally {
      setIsSyncing(false);
      loadDashboardStats();
    }
  };

  const totalPriorityCount = highRiskMothers.length + samChildren.length + activeReferrals.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 p-5 md:p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-teal-700/50">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-700/60 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-200">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                Welcome, {user?.name || 'ASHA Worker'}
              </h1>
              <Badge variant="neutral" className="bg-teal-700/80 text-teal-100 border-teal-500/40 text-[10px] font-extrabold uppercase px-2 py-0.5">
                ASHA Worker
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-teal-200/90 mt-1">
              <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span>{user?.facilityName || user?.location || 'Madukkarai Sector'}</span>
            </div>
          </div>
        </div>

        {/* Compact Connection / Sync Status Indicator */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {isSyncing ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-500/20 border border-sky-400/30 text-sky-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-300" />
              <span>Syncing...</span>
            </span>
          ) : isOffline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-700/80 border border-slate-600 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Offline</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online</span>
            </span>
          )}

          {pendingSyncCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSyncNow}
              disabled={isSyncing || isOffline}
              className="gap-1.5 text-xs text-teal-950 bg-amber-400 hover:bg-amber-300 font-bold border-none shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingSyncCount} pending record{pendingSyncCount > 1 ? 's' : ''}</span>
            </Button>
          )}

          <button
            onClick={() => navigate('/asha/profile')}
            className="text-xs text-teal-200 hover:text-white underline font-semibold px-2 py-1 transition-colors cursor-pointer"
          >
            Profile
          </button>
        </div>
      </div>

      {/* Sync Toasts */}
      {syncDone && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>Data sync completed successfully! All offline pending records are synced.</span>
        </div>
      )}

      {syncError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
            <span>{syncError}</span>
          </div>
          <button 
            onClick={() => setSyncError(null)} 
            className="text-rose-600 hover:text-rose-800 font-extrabold text-xs shrink-0 px-2 py-1 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Today's Work Section */}
      <Card className="border border-teal-100 shadow-sm bg-gradient-to-br from-white to-teal-50/20">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <span>Today's Work</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                What should you do in the field today?
              </CardDescription>
            </div>
            <Button
              onClick={() => navigate('/asha/visits')}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold gap-2 text-xs py-2.5 px-4 shadow-sm w-full sm:w-auto active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Today's Visits</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white border border-teal-100/80 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Visits</p>
                <p className="text-2xl font-black text-slate-900">{todaysVisitsCount}</p>
              </div>
              <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white border border-rose-100/80 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Priority Cases</p>
                <p className="text-2xl font-black text-rose-700">{totalPriorityCount}</p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white border border-amber-100/80 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Follow-ups</p>
                <p className="text-2xl font-black text-amber-800">{pendingFollowupsCount}</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Priority Cases Section */}
      <Card className="border border-slate-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Priority Cases</span>
            </CardTitle>
            {totalPriorityCount > 0 && (
              <Badge variant="warning" className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-xs">
                {totalPriorityCount} Attention Required
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs text-slate-500">
            Patients needing immediate field attention, home visits, or referral tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalPriorityCount === 0 ? (
            <div className="p-6 text-center bg-slate-50 border border-slate-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-xs font-bold text-slate-700">No priority cases right now.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">All urgent maternal, child nutrition, and referral cases are up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* High Risk Pregnant Women */}
              {highRiskMothers.map((m) => (
                <div key={m.id} className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl flex flex-col justify-between gap-3 hover:shadow-xs transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                        🔴 High-Risk Pregnancy
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{m.patientName}</h4>
                    <p className="text-xs font-bold text-rose-800">
                      Factor: {m.highRiskFactors.join(', ')}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Gestational Age: {m.gestationalAgeWeeks} weeks • ANC visit due
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate('/asha/maternal')}
                    className="w-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold gap-1 py-1.5 cursor-pointer"
                  >
                    <span>View Patient</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              {/* SAM Children */}
              {samChildren.map((c) => (
                <div key={c.id} className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col justify-between gap-3 hover:shadow-xs transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                        🟠 Severe Malnutrition (SAM)
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{c.patientName}</h4>
                    <p className="text-xs font-bold text-amber-900">
                      Status: Weight-for-Age Severe
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Requires energy-dense supplement & weight check
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate('/asha/nutrition')}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold gap-1 py-1.5 cursor-pointer"
                  >
                    <span>View Patient</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              {/* Active Referrals */}
              {activeReferrals.map((r) => (
                <div key={r.id} className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl flex flex-col justify-between gap-3 hover:shadow-xs transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                        🔵 Hospital Referral
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{r.patientName}</h4>
                    <p className="text-xs font-bold text-blue-900">
                      Facility: {r.referralFacility || 'PHC Referral'}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate">
                      Symptoms: {r.symptoms || 'Referral follow-up required'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate('/asha/visits')}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold gap-1 py-1.5 cursor-pointer"
                  >
                    <span>View Patient</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Quick Actions */}
      <Card className="border border-slate-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Frequently used field operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button 
              onClick={() => navigate('/asha/households')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-teal-50/80 hover:text-teal-950 border border-slate-200/80 hover:border-teal-300 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[96px] active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800">Register Household</span>
            </button>

            <button 
              onClick={() => navigate('/asha/patients')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-sky-50/80 hover:text-sky-950 border border-slate-200/80 hover:border-sky-300 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[96px] active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800">Register Patient</span>
            </button>

            <button 
              onClick={() => navigate('/asha/visits')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-rose-50/80 hover:text-rose-950 border border-slate-200/80 hover:border-rose-300 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[96px] active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800">Record Visit</span>
            </button>

            <button 
              onClick={() => navigate('/asha/medicine')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-amber-50/80 hover:text-amber-950 border border-slate-200/80 hover:border-amber-300 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[96px] active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800">Issue Medicine</span>
            </button>

            <button 
              onClick={handleSyncNow}
              disabled={isSyncing || isOffline}
              className="p-4 rounded-xl bg-slate-50 hover:bg-teal-50/80 hover:text-teal-950 border border-slate-200/80 hover:border-teal-300 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[96px] active:scale-[0.98] group disabled:opacity-60 disabled:cursor-not-allowed col-span-2 sm:col-span-1"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              </div>
              <span className="font-bold text-xs text-slate-800">Data Sync</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 5. Existing Statistics (Coverage Statistics) */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 px-1">
          Catchment Population Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className="border border-slate-200/80 hover:border-teal-200 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Households</p>
                <h3 className="text-lg font-black text-slate-900">{householdCount}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 hover:border-sky-200 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Registered</p>
                <h3 className="text-lg font-black text-slate-900">{patientCount}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 hover:border-rose-200 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pregnant Women</p>
                <h3 className="text-lg font-black text-slate-900">{maternalCount}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 hover:border-amber-200 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl shrink-0">
                <Baby className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Children</p>
                <h3 className="text-lg font-black text-slate-900">{childCount}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 hover:border-slate-300 transition-colors col-span-2 sm:col-span-1">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Records</p>
                <h3 className="text-lg font-black text-slate-900">{pendingSyncCount}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 6. Existing Charts / Analytics */}
      <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>Child Nutritional Registry</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Weight-for-Age status distribution in catchment area
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[220px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutritionChartData} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: '600' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(15, 118, 110, 0.04)' }} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {nutritionChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

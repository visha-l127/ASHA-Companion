import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  getNutritionRecords, 
  getPatients, 
  getVisits,
  getHouseholds,
  addNutritionRecord, 
  updateNutritionRecord, 
  deleteNutritionRecord, 
  NutritionRecord, 
  AshaPatient, 
  VisitRecord,
  Household,
  isOfflineModeEnabled 
} from './localAshaHelper';
import { patientApi, maternalApi, visitApi } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { 
  Apple, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Wifi,
  WifiOff,
  Flame,
  X,
  ChevronRight,
  User,
  Clock,
  Check,
  Home,
  Scale,
  TrendingUp,
  ArrowRight,
  Calendar,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

const THRUST_OPTIONS = [
  'Take-Home Ration',
  'IFA Tablets',
  'IFA Syrups',
  'Calcium Prophylaxis',
  'Growth Counseling',
  'RUTF Paste distribution'
];

export default function NutritionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Data states
  const [records, setRecords] = useState<NutritionRecord[]>([]);
  const [patients, setPatients] = useState<AshaPatient[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);

  // Selected Patient state
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form Workflow states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [patientId, setPatientId] = useState('');
  const [ageGroup, setAgeGroup] = useState<'infant' | 'child' | 'pregnant' | 'lactating'>('child');
  const [weightForAgeStatus, setWeightForAgeStatus] = useState<'normal' | 'moderate' | 'severe'>('normal');
  const [samStatus, setSamStatus] = useState(false);
  const [selectedThrusts, setSelectedThrusts] = useState<string[]>([]);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const paramPatientId = searchParams.get('patientId');

  const loadData = async () => {
    try {
      const [ptsRaw, pregsRaw, visitsRaw, hhs] = await Promise.all([
        patientApi.getAll(),
        maternalApi.getAllPregnancies(),
        visitApi.getAll(),
        getHouseholds()
      ]);

      const [nutRecords, allPts, vs] = await Promise.all([
        getNutritionRecords(ptsRaw),
        getPatients(ptsRaw, pregsRaw, hhs),
        getVisits(visitsRaw, pregsRaw, ptsRaw)
      ]);

      setRecords(nutRecords);
      setPatients(allPts);
      setVisits(vs);
      setHouseholds(hhs);

      // Auto select patient if specified in URL or default to first patient
      if (paramPatientId) {
        const matchPt = allPts.find(p => p.id === paramPatientId);
        if (matchPt) {
          setSelectedPatientId(matchPt.id);
        } else if (allPts.length > 0 && !selectedPatientId) {
          setSelectedPatientId(allPts[0].id);
        }
      } else if (allPts.length > 0 && !selectedPatientId) {
        setSelectedPatientId(allPts[0].id);
      }
    } catch (e) {
      console.error('Error loading nutrition data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [paramPatientId]);

  // Selected Patient object
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [selectedPatientId, patients]);

  // Household for selected patient
  const selectedHousehold = useMemo(() => {
    if (!selectedPatient) return null;
    return households.find(h => h.id === selectedPatient.householdId) || null;
  }, [selectedPatient, households]);

  // Selected Patient's nutrition records
  const selectedPatientRecords = useMemo(() => {
    if (!selectedPatientId) return [];
    return records.filter(r => r.patientId === selectedPatientId);
  }, [selectedPatientId, records]);

  // Selected Patient's visits with weight
  const selectedPatientVisits = useMemo(() => {
    if (!selectedPatientId) return [];
    return visits.filter(v => v.patientId === selectedPatientId);
  }, [selectedPatientId, visits]);

  // Weight trend data for selected patient (from visits)
  const weightTrendData = useMemo(() => {
    if (!selectedPatientId) return [];
    const patientVisitsWithWeight = visits
      .filter(v => v.patientId === selectedPatientId && v.weight && v.weight > 0)
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());

    return patientVisitsWithWeight.map(v => ({
      date: v.visitDate,
      weight: v.weight,
      purpose: v.purpose
    }));
  }, [selectedPatientId, visits]);

  // Latest nutrition record for selected patient
  const latestNutritionRecord = useMemo(() => {
    if (selectedPatientRecords.length === 0) return null;
    return selectedPatientRecords[0];
  }, [selectedPatientRecords]);

  // Filtered patients list
  const filteredPatients = useMemo(() => {
    return patients.filter(pt => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || pt.name.toLowerCase().includes(q) || pt.id.toLowerCase().includes(q) || pt.householdNumber.toLowerCase().includes(q);

      const ptRecords = records.filter(r => r.patientId === pt.id);
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = ptRecords.some(r => r.weightForAgeStatus === statusFilter);
      }

      let matchesCategory = true;
      if (categoryFilter !== 'all') {
        matchesCategory = ptRecords.some(r => r.ageGroup === categoryFilter);
      }

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [patients, records, searchQuery, statusFilter, categoryFilter]);

  const samCount = records.filter(r => r.samStatus || r.weightForAgeStatus === 'severe').length;

  // Open Add Form Modal
  const handleOpenAdd = (presetPatientId?: string) => {
    setEditingId(null);
    setFormStep(1);

    const targetPid = presetPatientId || selectedPatientId || (patients.length > 0 ? patients[0].id : '');
    setPatientId(targetPid);

    const targetPt = patients.find(p => p.id === targetPid);
    if (targetPt) {
      if (targetPt.isChild) {
        setAgeGroup(targetPt.age <= 1 ? 'infant' : 'child');
      } else if (targetPt.isPregnant) {
        setAgeGroup('pregnant');
      } else {
        setAgeGroup('lactating');
      }
    } else {
      setAgeGroup('child');
    }

    setWeightForAgeStatus('normal');
    setSamStatus(false);
    setSelectedThrusts(['Take-Home Ration']);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit Form Modal
  const handleOpenEdit = (r: NutritionRecord) => {
    setEditingId(r.id);
    setFormStep(1);
    setPatientId(r.patientId);
    setAgeGroup(r.ageGroup);
    setWeightForAgeStatus(r.weightForAgeStatus);
    setSamStatus(r.samStatus);
    setSelectedThrusts(r.thrustAreas || []);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handlePatientSelection = (ptId: string) => {
    setPatientId(ptId);
    const p = patients.find(pat => pat.id === ptId);
    if (p) {
      if (p.isChild) {
        setAgeGroup(p.age <= 1 ? 'infant' : 'child');
      } else if (p.isPregnant) {
        setAgeGroup('pregnant');
      } else {
        setAgeGroup('lactating');
      }
    }
  };

  const handleThrustToggle = (thrust: string) => {
    if (selectedThrusts.includes(thrust)) {
      setSelectedThrusts(selectedThrusts.filter(t => t !== thrust));
    } else {
      setSelectedThrusts([...selectedThrusts, thrust]);
    }
  };

  // Step 1 -> Step 2 validation
  const handleNextToStep2 = () => {
    if (!patientId) {
      setFormError('Please select a beneficiary.');
      return;
    }
    setFormError(null);
    setFormStep(2);
  };

  // Step 2 -> Step 3 (Review) validation
  const handleNextToStep3 = () => {
    if (!weightForAgeStatus) {
      setFormError('Please select a weight-for-age growth status.');
      return;
    }
    setFormError(null);
    setFormStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setFormError('Please select a beneficiary.');
      return;
    }

    const matchedPt = patients.find(p => p.id === patientId);
    const patName = matchedPt ? matchedPt.name : 'Unknown';

    try {
      if (editingId) {
        await updateNutritionRecord(editingId, {
          patientId,
          patientName: patName,
          ageGroup,
          weightForAgeStatus,
          samStatus,
          thrustAreas: selectedThrusts
        });
        setSuccessMsg(`Updated nutrition record for ${patName}`);
      } else {
        await addNutritionRecord({
          patientId,
          patientName: patName,
          ageGroup,
          weightForAgeStatus,
          samStatus,
          thrustAreas: selectedThrusts
        });
        setSuccessMsg(`Logged growth entry for ${patName} successfully!`);
      }

      setIsFormOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setFormError('Failed to save nutrition record.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove nutrition log for ${name}?`)) {
      try {
        await deleteNutritionRecord(id);
        await loadData();
        setSuccessMsg('Growth log entry removed.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        console.error(err);
        setSuccessMsg('Failed to delete growth log entry.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Apple className="w-4 h-4" />
            <span>Nutrition Monitoring</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Nutrition Monitoring</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track existing nutrition-related records and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {isOfflineModeEnabled() ? (
            <Badge variant="warning" className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border-amber-200">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Mode Active</span>
            </Badge>
          ) : (
            <Badge variant="success" className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border-teal-200">
              <Wifi className="w-3.5 h-3.5" />
              <span>Live Synced</span>
            </Badge>
          )}

          <Button 
            id="btn-log-growth"
            variant="primary" 
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Nutrition</span>
          </Button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SEVERE MALNUTRITION (SAM) ALERT BANNER */}
      {samCount > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
          <Flame className="w-5 h-5 text-rose-500 mt-0.5 shrink-0 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide">Severe Acute Malnutrition (SAM) Alert</h4>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5 leading-relaxed">
              {samCount} active beneficiary case(s) currently flagged for Severe Acute Malnutrition (SAM). Provide therapeutic supplementary rations (RUTF), conduct bi-weekly monitoring, and refer to Nutrition Rehabilitation Centres (NRC) if needed.
            </p>
          </div>
        </div>
      )}

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
              <p className="text-lg font-black text-slate-800 mt-0.5">{patients.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Normal Growth</p>
              <p className="text-lg font-black text-teal-800 mt-0.5">
                {records.filter(r => r.weightForAgeStatus === 'normal').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Moderate Underweight</p>
              <p className="text-lg font-black text-amber-700 mt-0.5">
                {records.filter(r => r.weightForAgeStatus === 'moderate').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SAM / High Risk</p>
              <p className="text-lg font-black text-rose-800 mt-0.5">{samCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH AND FILTERS */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search beneficiary name, ID, or household number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Weight Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="normal">Normal Growth</option>
                <option value="moderate">Moderate Underweight</option>
                <option value="severe">Severely Underweight (SAM)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="infant">Infants (0-1Y)</option>
                <option value="child">Children (1-12Y)</option>
                <option value="pregnant">Pregnant Mothers</option>
                <option value="lactating">Lactating Mothers</option>
              </select>
            </div>

            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                className="text-xs text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MAIN WORKSPACE: BENEFICIARY REGISTER LIST (LEFT) & PATIENT NUTRITION DETAILS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: BENEFICIARY REGISTER */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Beneficiaries ({filteredPatients.length})</span>
            </h3>

            {selectedPatient && (
              <button 
                onClick={() => navigate(`/asha/patients?id=${selectedPatient.id}`)}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Profile</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredPatients.map(pt => {
              const isSelected = pt.id === selectedPatientId;
              const ptRecords = records.filter(r => r.patientId === pt.id);
              const latestRec = ptRecords.length > 0 ? ptRecords[0] : null;

              return (
                <div
                  key={pt.id}
                  onClick={() => setSelectedPatientId(pt.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/10 shadow-xs' 
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl text-white shrink-0 mt-0.5 ${isSelected ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug">{pt.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          ID: <span className="font-mono text-slate-700 font-bold">{pt.id}</span> • {pt.age} Yrs ({pt.gender === 'M' ? 'Male' : 'Female'})
                        </p>
                      </div>
                    </div>

                    {latestRec ? (
                      <Badge 
                        variant={
                          latestRec.weightForAgeStatus === 'normal' 
                            ? 'success' 
                            : latestRec.weightForAgeStatus === 'moderate' 
                            ? 'warning' 
                            : 'danger'
                        } 
                        className="text-[10px] shrink-0 font-bold"
                      >
                        {latestRec.weightForAgeStatus === 'normal' ? '🟢 Normal' : latestRec.weightForAgeStatus === 'moderate' ? '🟠 Moderate' : '🔴 SAM'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] shrink-0 font-bold">
                        Unassessed
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Home className="w-3 h-3 text-slate-400" />
                      <span>{pt.householdNumber}</span>
                    </span>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatientId(pt.id);
                        handleOpenAdd(pt.id);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Log Record</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredPatients.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <User className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No beneficiaries found.</p>
                  <p className="text-[11px] text-slate-400">No records match the current search filter.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: SELECTED BENEFICIARY WORKSPACE */}
        <div className="lg:col-span-8 space-y-4">
          {selectedPatient ? (
            <div className="space-y-4">
              
              {/* 2. PATIENT CONTEXT CARD */}
              <Card className="border-emerald-100 bg-white overflow-hidden shadow-xs">
                <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-emerald-100/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xs shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base sm:text-lg font-black text-slate-800">{selectedPatient.name}</h2>
                          <Badge variant="outline" className="font-mono text-[10px] bg-white border-slate-200">
                            {selectedPatient.id}
                          </Badge>
                          <Badge variant="success" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                            Active Beneficiary Context
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Age: <strong className="text-slate-700">{selectedPatient.age} Years</strong> • Gender: <strong className="text-slate-700">{selectedPatient.gender === 'M' ? 'Male' : selectedPatient.gender === 'F' ? 'Female' : 'Other'}</strong> • Household: <strong className="text-slate-700">{selectedPatient.householdNumber}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleOpenAdd(selectedPatient.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Record Nutrition</span>
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/asha/patients?id=${selectedPatient.id}`)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
                      >
                        <span>View Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 3. NUTRITION OVERVIEW & 4. CURRENT STATUS */}
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Status</span>
                      <div className="mt-1">
                        {latestNutritionRecord ? (
                          latestNutritionRecord.weightForAgeStatus === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold text-xs">
                              🟢 Normal Growth
                            </span>
                          ) : latestNutritionRecord.weightForAgeStatus === 'moderate' ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-extrabold text-xs">
                              🟠 Needs Attention
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold text-xs">
                              🔴 High Risk (SAM)
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 font-bold">Unassessed</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Weight-for-Age</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Category Group</span>
                      <span className="font-extrabold text-slate-800 capitalize mt-1 block">
                        {latestNutritionRecord ? latestNutritionRecord.ageGroup : (selectedPatient.isChild ? 'Child' : selectedPatient.isPregnant ? 'Pregnant' : 'General')}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">ICDS Register</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Latest Weight</span>
                      <span className="font-extrabold text-slate-800 mt-1 block">
                        {selectedPatientVisits.length > 0 && selectedPatientVisits[0].weight
                          ? `${selectedPatientVisits[0].weight} kg`
                          : 'Recorded in visit log'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Field measurement</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Assessment</span>
                      <span className="font-extrabold text-slate-800 mt-1 block">
                        {latestNutritionRecord ? latestNutritionRecord.lastUpdated : 'No records yet'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Timestamp</span>
                    </div>
                  </div>

                  {/* ACTIVE INTERVENTIONS / THRUST AREAS */}
                  {latestNutritionRecord && latestNutritionRecord.thrustAreas.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Nutritional Interventions</span>
                      <div className="flex flex-wrap gap-1.5">
                        {latestNutritionRecord.thrustAreas.map((thrust, idx) => (
                          <Badge key={`thrust-${thrust}-${idx}`} variant="outline" className="bg-white text-slate-700 border-slate-200 font-bold text-[10px]">
                            ✓ {thrust}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 6. TREND VISUALIZATION (Weight Trend) */}
              {weightTrendData.length >= 2 ? (
                <Card className="border-slate-200">
                  <CardHeader className="p-4 sm:p-5 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Weight Trend Visualization</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Historical weight progress from field checkup visits for {selectedPatient.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weightTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['dataMin - 1', 'dataMax + 1']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                            formatter={(value: any) => [`${value} kg`, 'Weight']}
                          />
                          <Area type="monotone" dataKey="weight" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#weightGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* 5. NUTRITION HISTORY */}
              <Card className="border-slate-200">
                <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>Nutrition History</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Chronological growth and nutrition assessments for {selectedPatient.name}
                    </CardDescription>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenAdd(selectedPatient.id)}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold text-xs cursor-pointer"
                  >
                    + Record Nutrition
                  </Button>
                </CardHeader>

                <CardContent className="p-0">
                  {selectedPatientRecords.length > 0 ? (
                    <div className="divide-y divide-slate-100 text-xs">
                      {selectedPatientRecords.map((r, idx) => (
                        <div key={`${r.id}-${idx}`} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
                              <Apple className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-slate-800 text-sm">{r.lastUpdated}</span>
                                <Badge 
                                  variant={r.weightForAgeStatus === 'normal' ? 'success' : r.weightForAgeStatus === 'moderate' ? 'warning' : 'danger'} 
                                  className="text-[10px]"
                                >
                                  {r.weightForAgeStatus === 'normal' ? '🟢 Normal Weight' : r.weightForAgeStatus === 'moderate' ? '🟠 Moderate Underweight' : '🔴 Severely Underweight'}
                                </Badge>

                                {r.samStatus && (
                                  <Badge variant="rose" className="bg-rose-100 text-rose-800 font-bold text-[10px]">
                                    🔴 SAM Flagged
                                  </Badge>
                                )}

                                <Badge variant={r.status === 'synced' ? 'success' : 'warning'} className="text-[10px]">
                                  {r.status === 'synced' ? '✓ Synced' : '● Pending Sync'}
                                </Badge>
                              </div>

                              <p className="text-xs text-slate-500 font-medium">
                                Target Group: <strong className="text-slate-700 capitalize">{r.ageGroup}</strong>
                              </p>

                              {r.thrustAreas && r.thrustAreas.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {r.thrustAreas.map((thrust, tidx) => (
                                    <Badge key={`rec-thrust-${r.id}-${tidx}`} variant="outline" className="bg-white text-slate-600 text-[10px]">
                                      ✓ {thrust}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button 
                              onClick={() => handleOpenEdit(r)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(r.id, r.patientName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* 16. EMPTY STATE */
                    <div className="p-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Apple className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-600">No nutrition records available.</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        No growth or nutritional assessments recorded yet for this beneficiary.
                      </p>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleOpenAdd(selectedPatient.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs mt-1 cursor-pointer"
                      >
                        + Record Nutrition
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center space-y-3">
                <Apple className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No beneficiary selected.</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Select a beneficiary from the list on the left to view their nutrition overview, weight history, and interventions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 7, 8, 10. STEPPED RECORD NUTRITION FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 z-10 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                  {editingId ? 'Edit Nutrition Record' : 'Record Nutrition'}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Step {formStep} of 3: {formStep === 1 ? 'Beneficiary Context' : formStep === 2 ? 'Assessment & Interventions' : 'Review Before Save'}
                </p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <div className={`flex-1 py-2 text-center text-[10px] font-bold border-b-2 transition-colors ${
                formStep === 1 ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-400'
              }`}>
                1. Context
              </div>
              <div className={`flex-1 py-2 text-center text-[10px] font-bold border-b-2 transition-colors ${
                formStep === 2 ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-400'
              }`}>
                2. Assessment
              </div>
              <div className={`flex-1 py-2 text-center text-[10px] font-bold border-b-2 transition-colors ${
                formStep === 3 ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-400'
              }`}>
                3. Review & Save
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* STEP 1: BENEFICIARY & CATEGORY */}
              {formStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Select Beneficiary <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={patientId}
                      onChange={(e) => handlePatientSelection(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 bg-white text-slate-800"
                      required
                      disabled={!!editingId}
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id}) • HH: {p.householdNumber}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Target Age / Category Group <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 bg-white text-slate-800"
                    >
                      <option value="infant">Infant (0-1Y)</option>
                      <option value="child">Child (1-12Y)</option>
                      <option value="pregnant">Pregnant Mother (ANC)</option>
                      <option value="lactating">Lactating Mother</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="primary" 
                      onClick={handleNextToStep2}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>Next: Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: ASSESSMENT & INTERVENTIONS */}
              {formStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Growth Index (Weight-for-Age Status) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={weightForAgeStatus}
                      onChange={(e) => {
                        const status = e.target.value as any;
                        setWeightForAgeStatus(status);
                        if (status !== 'severe') setSamStatus(false);
                      }}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 bg-white text-slate-800"
                    >
                      <option value="normal">Normal Weight (Green)</option>
                      <option value="moderate">Moderate Malnutrition (Yellow)</option>
                      <option value="severe">Severe Malnutrition (Red)</option>
                    </select>
                  </div>

                  {weightForAgeStatus === 'severe' && (
                    <div>
                      <label className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                        Severe Acute Malnutrition (SAM) Screening
                      </label>
                      <label className="flex items-center gap-2 border border-rose-200 rounded-xl p-3 bg-rose-50/70 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={samStatus}
                          onChange={(e) => setSamStatus(e.target.checked)}
                          className="h-4.5 w-4.5 text-rose-600 rounded cursor-pointer"
                        />
                        <span className="text-xs font-extrabold text-rose-800">
                          Flag as Severe Acute Malnutrition (SAM) Case
                        </span>
                      </label>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-bold">
                      Assigned Interventions / Thrust Areas
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {THRUST_OPTIONS.map(thrust => {
                        const isChecked = selectedThrusts.includes(thrust);
                        return (
                          <label key={thrust} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${
                            isChecked ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleThrustToggle(thrust)}
                              className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                            />
                            <span className="text-xs">{thrust}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setFormStep(1)}
                      className="text-slate-600 font-bold text-xs"
                    >
                      ← Back
                    </Button>
                    <Button 
                      type="button" 
                      variant="primary" 
                      onClick={handleNextToStep3}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>Next: Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: 10. REVIEW BEFORE SAVE */}
              {formStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Review Nutrition Record Details
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Beneficiary</span>
                        <span className="font-extrabold text-slate-800">
                          {patients.find(p => p.id === patientId)?.name || 'Selected Patient'}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">({patientId})</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Category</span>
                        <span className="font-extrabold text-slate-800 capitalize">{ageGroup}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Weight-for-Age Status</span>
                        <Badge 
                          variant={weightForAgeStatus === 'normal' ? 'success' : weightForAgeStatus === 'moderate' ? 'warning' : 'danger'} 
                          className="font-bold text-[10px] mt-0.5"
                        >
                          {weightForAgeStatus === 'normal' ? '🟢 Normal Weight' : weightForAgeStatus === 'moderate' ? '🟠 Moderate Underweight' : '🔴 Severely Underweight'}
                        </Badge>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">SAM Status</span>
                        <span className={`font-extrabold ${samStatus ? 'text-rose-600' : 'text-slate-600'}`}>
                          {samStatus ? '🔴 SAM Flagged' : 'Clear'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Assigned Interventions</span>
                      {selectedThrusts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedThrusts.map((t, idx) => (
                            <Badge key={`rev-${t}-${idx}`} variant="outline" className="bg-white text-slate-700 font-bold text-[10px]">
                              ✓ {t}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No specific interventions checked</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-800 font-medium">
                    {isOfflineModeEnabled() ? '✓ Record will be saved locally in offline mode.' : '✓ Record will be synchronized to PHC registers.'}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setFormStep(2)}
                      className="text-slate-600 font-bold text-xs"
                    >
                      ← Edit Details
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl"
                    >
                      {editingId ? 'Save Changes' : '✓ Save Nutrition Record'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

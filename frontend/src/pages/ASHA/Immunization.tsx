import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  getImmunizationRecords, 
  getPatients, 
  getVisits,
  getNutritionRecords,
  getHouseholds,
  addImmunizationRecord, 
  updateImmunizationRecord, 
  deleteImmunizationRecord, 
  ImmunizationRecord, 
  AshaPatient, 
  VisitRecord, 
  NutritionRecord, 
  Household, 
  isOfflineModeEnabled 
} from './localAshaHelper';
import { patientApi, maternalApi, visitApi } from '../../utils/apiClient';
import RecordVisitWorkflow from './RecordVisitWorkflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { 
  Baby, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  ShieldCheck, 
  Wifi,
  WifiOff,
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Clock,
  ArrowRight,
  Activity,
  Check,
  FileText,
  HeartPulse,
  Sparkles,
  Eye,
  Home,
  Scale,
  Apple
} from 'lucide-react';

const VACCINE_LIST = [
  { value: 'BCG', label: 'BCG', age: 'At Birth', desc: 'Tuberculosis Protection' },
  { value: 'OPV-0', label: 'Oral Polio Vaccine (OPV-0)', age: 'At Birth', desc: 'Birth dose polio protection' },
  { value: 'HepB-Birth', label: 'Hepatitis B', age: 'At Birth', desc: 'Hep-B Birth Dose within 24h' },
  { value: 'OPV-1', label: 'OPV-1', age: '6 Weeks', desc: 'First routine oral polio dose' },
  { value: 'Pentavalent-1', label: 'Pentavalent-1', age: '6 Weeks', desc: 'DPT, HepB, Hib combination dose 1' },
  { value: 'Rotavirus-1', label: 'Rotavirus RVV-1', age: '6 Weeks', desc: 'Severe diarrhea protection' },
  { value: 'OPV-2', label: 'OPV-2', age: '10 Weeks', desc: 'Second oral polio dose' },
  { value: 'Pentavalent-2', label: 'Pentavalent-2', age: '10 Weeks', desc: 'Combination dose 2' },
  { value: 'OPV-3', label: 'OPV-3', age: '14 Weeks', desc: 'Third oral polio dose' },
  { value: 'Pentavalent-3', label: 'Pentavalent-3', age: '14 Weeks', desc: 'Combination dose 3' },
  { value: 'MR-1', label: 'Measles-Rubella (MR-1)', age: '9-12 Months', desc: 'Measles & Rubella first dose' },
  { value: 'JE-1', label: 'Japanese Encephalitis (JE-1)', age: '9-12 Months', desc: 'Brain fever protection' },
  { value: 'DPT-Booster-1', label: 'DPT Booster-1', age: '16-24 Months', desc: 'First DPT booster dose' },
  { value: 'OPV-Booster', label: 'OPV Booster', age: '16-24 Months', desc: 'Polio booster dose' }
];

export default function ImmunizationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Data states
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [patients, setPatients] = useState<AshaPatient[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [nutritionRecords, setNutritionRecords] = useState<NutritionRecord[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);

  // Selected Child & Active Tab
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'immunization' | 'overview' | 'visits' | 'nutrition'>('immunization');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [vaccineFilter, setVaccineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'completed'>('all');

  // Visit Workflow Modal state
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitModalPatientId, setVisitModalPatientId] = useState<string | undefined>(undefined);

  // Stepped Vaccination Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [patientId, setPatientId] = useState('');
  const [childAgeMonths, setChildAgeMonths] = useState(12);
  const [vaccineName, setVaccineName] = useState('BCG');
  const [dateGiven, setDateGiven] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [administeredBy, setAdministeredBy] = useState('ANM Madukkarai PHC');

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

      const [immRecords, allPts, vs, nut] = await Promise.all([
        getImmunizationRecords(ptsRaw),
        getPatients(ptsRaw, pregsRaw, hhs),
        getVisits(visitsRaw, pregsRaw, ptsRaw),
        getNutritionRecords(ptsRaw)
      ]);

      setRecords(immRecords);

      // Filter pediatric cohort (isChild = true or age <= 12)
      const childList = allPts.filter(p => p.isChild || p.age <= 12);
      setPatients(childList);
      setVisits(vs);
      setNutritionRecords(nut);
      setHouseholds(hhs);

      // Auto select child if specified in URL or default to first child
      if (paramPatientId) {
        const matchChild = childList.find(c => c.id === paramPatientId);
        if (matchChild) {
          setSelectedChildId(matchChild.id);
        } else if (childList.length > 0 && !selectedChildId) {
          setSelectedChildId(childList[0].id);
        }
      } else if (childList.length > 0 && !selectedChildId) {
        setSelectedChildId(childList[0].id);
      }
    } catch (e) {
      console.error('Error loading immunization data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [paramPatientId]);

  // Selected Child object
  const selectedChild = useMemo(() => {
    if (!selectedChildId) return null;
    return patients.find(p => p.id === selectedChildId) || null;
  }, [selectedChildId, patients]);

  // Selected Child's household
  const selectedHousehold = useMemo(() => {
    if (!selectedChild) return null;
    return households.find(h => h.id === selectedChild.householdId) || null;
  }, [selectedChild, households]);

  // Selected Child's immunization records
  const selectedChildVaccinations = useMemo(() => {
    if (!selectedChildId) return [];
    return records.filter(r => r.patientId === selectedChildId);
  }, [selectedChildId, records]);

  // Selected Child's visits
  const selectedChildVisits = useMemo(() => {
    if (!selectedChildId) return [];
    return visits.filter(v => v.patientId === selectedChildId);
  }, [selectedChildId, visits]);

  // Selected Child's nutrition records
  const selectedChildNutrition = useMemo(() => {
    if (!selectedChildId) return [];
    return nutritionRecords.filter(n => n.patientId === selectedChildId);
  }, [selectedChildId, nutritionRecords]);

  // Filtered Children list
  const filteredChildren = useMemo(() => {
    return patients.filter(child => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || child.name.toLowerCase().includes(q) || child.id.toLowerCase().includes(q) || child.householdNumber.toLowerCase().includes(q);
      
      const childImm = records.filter(r => r.patientId === child.id);
      let matchesVaccine = true;
      if (vaccineFilter !== 'all') {
        matchesVaccine = childImm.some(r => r.vaccineName === vaccineFilter);
      }

      let matchesStatus = true;
      if (statusFilter === 'completed') {
        matchesStatus = childImm.length >= 3;
      } else if (statusFilter === 'due') {
        matchesStatus = childImm.length < 3;
      }

      return matchesSearch && matchesVaccine && matchesStatus;
    });
  }, [patients, records, searchQuery, vaccineFilter, statusFilter]);

  // Open Form Modal
  const handleOpenAdd = (presetPatientId?: string, presetVaccine?: string) => {
    setEditingId(null);
    setFormStep(1);

    const targetPid = presetPatientId || selectedChildId || (patients.length > 0 ? patients[0].id : '');
    setPatientId(targetPid);

    const targetChild = patients.find(p => p.id === targetPid);
    if (targetChild) {
      setChildAgeMonths(targetChild.age * 12 || 12);
    } else {
      setChildAgeMonths(12);
    }

    setVaccineName(presetVaccine || 'BCG');

    const today = new Date().toISOString().substring(0, 10);
    setDateGiven(today);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 28);
    setNextDueDate(nextDate.toISOString().substring(0, 10));

    setAdministeredBy('ANM Madukkarai PHC');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (r: ImmunizationRecord) => {
    setEditingId(r.id);
    setFormStep(1);
    setPatientId(r.patientId);
    setChildAgeMonths(r.childAgeMonths);
    setVaccineName(r.vaccineName);
    setDateGiven(r.dateGiven);
    setNextDueDate(r.nextDueDate);
    setAdministeredBy(r.administeredBy);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDateGivenChange = (val: string) => {
    setDateGiven(val);
    if (!val) return;
    const given = new Date(val);
    const due = new Date(given);
    due.setDate(due.getDate() + 28);
    setNextDueDate(due.toISOString().substring(0, 10));
  };

  const handlePatientSelection = (ptId: string) => {
    setPatientId(ptId);
    const p = patients.find(pat => pat.id === ptId);
    if (p) {
      setChildAgeMonths(p.age * 12 || 12);
    }
  };

  // Step 1 -> Step 2 validation
  const handleNextToStep2 = () => {
    if (!patientId) {
      setFormError('Please select a pediatric beneficiary.');
      return;
    }
    if (!vaccineName) {
      setFormError('Please select a vaccine antigen.');
      return;
    }
    setFormError(null);
    setFormStep(2);
  };

  // Step 2 -> Step 3 validation
  const handleNextToStep3 = () => {
    if (!dateGiven) {
      setFormError('Please select the date administered.');
      return;
    }
    setFormError(null);
    setFormStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !dateGiven || !vaccineName) {
      setFormError('Required vaccination details are missing.');
      return;
    }

    const matchedPt = patients.find(p => p.id === patientId);
    const patName = matchedPt ? matchedPt.name : 'Unknown Child';

    try {
      if (editingId) {
        await updateImmunizationRecord(editingId, {
          patientId,
          patientName: patName,
          childAgeMonths: Number(childAgeMonths),
          vaccineName,
          dateGiven,
          nextDueDate,
          administeredBy
        });
        setSuccessMsg(`Updated ${vaccineName} dose for ${patName}`);
      } else {
        await addImmunizationRecord({
          patientId,
          patientName: patName,
          childAgeMonths: Number(childAgeMonths),
          vaccineName,
          dateGiven,
          nextDueDate,
          administeredBy
        });
        setSuccessMsg(`Recorded ${vaccineName} administration for ${patName}!`);
      }

      setIsFormOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setFormError('Failed to save immunization record.');
    }
  };

  const handleDelete = async (id: string, vaccine: string) => {
    if (confirm(`Are you sure you want to remove ${vaccine} record?`)) {
      try {
        await deleteImmunizationRecord(id);
        await loadData();
        setSuccessMsg('Vaccination record removed.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        console.error(err);
        setSuccessMsg('Failed to delete vaccination record.');
      }
    }
  };

  const handleOpenVisitWorkflow = (ptId: string) => {
    setVisitModalPatientId(ptId);
    setIsVisitModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Baby className="w-4 h-4" />
            <span>Child Health & Immunization</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Child Health & Immunization</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor children's health, vaccinations, and follow-ups.
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
            id="btn-record-vaccination"
            variant="primary" 
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Vaccination</span>
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

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl shrink-0">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Children Registered</p>
              <p className="text-lg font-black text-slate-800 mt-0.5">{patients.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Vaccinations Logged</p>
              <p className="text-lg font-black text-emerald-800 mt-0.5">{records.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Follow-Ups Due</p>
              <p className="text-lg font-black text-amber-700 mt-0.5">
                {records.filter(r => r.nextDueDate).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Visits Logged</p>
              <p className="text-lg font-black text-indigo-800 mt-0.5">
                {visits.filter(v => v.purpose === 'Immunization' || v.purpose === 'Newborn Care').length}
              </p>
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
              placeholder="Search child name, ID, or household number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-600 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Filter Antigen:</span>
              <select
                value={vaccineFilter}
                onChange={(e) => setVaccineFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Antigens</option>
                {VACCINE_LIST.map(v => (
                  <option key={v.value} value={v.value}>{v.value}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  statusFilter === 'completed' ? 'bg-emerald-50 text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setStatusFilter('due')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  statusFilter === 'due' ? 'bg-amber-50 text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Due
              </button>
            </div>

            {(searchQuery || vaccineFilter !== 'all' || statusFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSearchQuery(''); setVaccineFilter('all'); setStatusFilter('all'); }}
                className="text-xs text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MAIN WORKSPACE: CHILD LIST (LEFT) & CHILD PROFILE WORKFLOW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: PEDIATRIC BENEFICIARIES LIST */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-sky-600" />
              <span>Children ({filteredChildren.length})</span>
            </h3>

            {selectedChild && (
              <button 
                onClick={() => navigate(`/asha/patients?id=${selectedChild.id}`)}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Profile</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredChildren.map(child => {
              const isSelected = child.id === selectedChildId;
              const childDoses = records.filter(r => r.patientId === child.id);

              return (
                <div
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-500/10 shadow-xs' 
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl text-white shrink-0 mt-0.5 ${isSelected ? 'bg-sky-600' : 'bg-slate-700'}`}>
                        <Baby className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug">{child.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          ID: <span className="font-mono text-slate-700 font-bold">{child.id}</span> • {child.age} Yrs ({child.gender === 'M' ? 'Boy' : 'Girl'})
                        </p>
                      </div>
                    </div>

                    <Badge variant={childDoses.length > 0 ? 'success' : 'secondary'} className="text-[10px] shrink-0 font-bold">
                      {childDoses.length} Doses Logged
                    </Badge>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Home className="w-3 h-3 text-slate-400" />
                      <span>{child.householdNumber}</span>
                    </span>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChildId(child.id);
                        handleOpenAdd(child.id);
                      }}
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Log Vaccine</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredChildren.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <Baby className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No children found.</p>
                  <p className="text-[11px] text-slate-400">No pediatric records match the search filter.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: SELECTED CHILD WORKSPACE */}
        <div className="lg:col-span-8 space-y-4">
          {selectedChild ? (
            <div className="space-y-4">
              
              {/* SECTION 2: CHILD OVERVIEW CARD */}
              <Card className="border-sky-100 bg-white overflow-hidden shadow-xs">
                <div className="p-5 bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent border-b border-sky-100/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-xs shrink-0">
                        <Baby className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base sm:text-lg font-black text-slate-800">{selectedChild.name}</h2>
                          <Badge variant="outline" className="font-mono text-[10px] bg-white border-slate-200">
                            {selectedChild.id}
                          </Badge>
                          <Badge variant="success" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                            🟢 Active Beneficiary
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Pediatric Cohort • {selectedChild.gender === 'M' ? 'Male' : selectedChild.gender === 'F' ? 'Female' : 'Child'} • Age: <strong className="text-slate-700">{selectedChild.age} Years</strong> ({selectedChild.age * 12} Months)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleOpenAdd(selectedChild.id)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Record Vaccine</span>
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenVisitWorkflow(selectedChild.id)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
                      >
                        <Activity className="w-4 h-4 text-sky-600" />
                        <span>Checkup Visit</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* OVERVIEW METRICS GRID */}
                <CardContent className="p-4 sm:p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Household</span>
                      <span className="font-extrabold text-slate-800 mt-0.5 block">{selectedChild.householdNumber}</span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {selectedHousehold ? `${selectedHousehold.headName} (${selectedHousehold.village})` : 'Registered Family'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Vaccinations Given</span>
                      <span className="font-extrabold text-emerald-700 mt-0.5 block">{selectedChildVaccinations.length} Doses Logged</span>
                      <span className="text-[10px] text-slate-500 block">Universal Schedule</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Health Check</span>
                      <span className="font-extrabold text-slate-800 mt-0.5 block">
                        {selectedChildVisits.length > 0 ? selectedChildVisits[0].visitDate : 'No visits logged'}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {selectedChildVisits.length > 0 ? selectedChildVisits[0].purpose : 'Checkup History'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Next Follow-Up / Due</span>
                      <span className="font-extrabold text-sky-700 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        {selectedChildVaccinations.length > 0 && selectedChildVaccinations[0].nextDueDate
                          ? selectedChildVaccinations[0].nextDueDate
                          : 'As scheduled'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Antigen Booster</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 8: CHILD HEALTH WORKSPACE TABS */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                <button
                  onClick={() => setActiveTab('immunization')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'immunization'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Vaccination Schedule & History</span>
                </button>

                <button
                  onClick={() => setActiveTab('visits')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'visits'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Health Visits ({selectedChildVisits.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'nutrition'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Apple className="w-4 h-4" />
                  <span>Growth & Nutrition</span>
                </button>
              </div>

              {/* TAB 1: IMMUNIZATION STATUS & HISTORY */}
              {activeTab === 'immunization' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  
                  {/* SECTION 3: IMMUNIZATION STATUS & PROGRESS */}
                  <Card className="border-slate-200">
                    <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-sky-600" />
                          <span>Vaccination Progress</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Key antigen immunization milestones for {selectedChild.name}
                        </CardDescription>
                      </div>

                      <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 font-bold text-xs">
                        {selectedChildVaccinations.length} Recorded
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5 space-y-4">
                      {/* VACCINE PROGRESS TRACKER */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {VACCINE_LIST.slice(0, 8).map(v => {
                          const isGiven = selectedChildVaccinations.some(r => r.vaccineName === v.value || r.vaccineName.includes(v.value));
                          const matchingRecord = selectedChildVaccinations.find(r => r.vaccineName === v.value || r.vaccineName.includes(v.value));

                          return (
                            <div 
                              key={v.value}
                              className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                                isGiven 
                                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                                  : 'bg-slate-50/70 border-slate-200 text-slate-600'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-extrabold">{v.value}</span>
                                  {isGiven ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Badge variant="warning" className="text-[9px] px-1.5 py-0 bg-amber-100/80 text-amber-800 border-amber-200">
                                      Due
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium">{v.age}</p>
                              </div>

                              <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                                {isGiven ? (
                                  <span className="font-bold text-emerald-800">
                                    ✓ {matchingRecord?.dateGiven || 'Administered'}
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => handleOpenAdd(selectedChild.id, v.value)}
                                    className="font-bold text-sky-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <span>+ Log Dose</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* SECTION 4: VACCINATION HISTORY LOG */}
                  <Card className="border-slate-200">
                    <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-sky-600" />
                          <span>Vaccination History</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Chronological record of administered vaccines for {selectedChild.name}
                        </CardDescription>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenAdd(selectedChild.id)}
                        className="border-sky-200 text-sky-700 hover:bg-sky-50 font-bold text-xs cursor-pointer"
                      >
                        + Record Vaccination
                      </Button>
                    </CardHeader>

                    <CardContent className="p-0">
                      {selectedChildVaccinations.length > 0 ? (
                        <div className="divide-y divide-slate-100 text-xs">
                          {selectedChildVaccinations.map(r => (
                            <div key={r.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
                                  <Check className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-extrabold text-slate-800 text-sm">{r.vaccineName}</h4>
                                    <Badge variant={r.status === 'synced' ? 'success' : 'warning'} className="text-[10px]">
                                      {r.status === 'synced' ? '✓ Synced' : 'Pending Sync'}
                                    </Badge>
                                  </div>

                                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Administered on <strong className="text-slate-800">{r.dateGiven}</strong> (Age: {r.childAgeMonths} Months) • By <span className="text-slate-700 font-semibold">{r.administeredBy}</span>
                                  </p>

                                  {r.nextDueDate && (
                                    <p className="text-[11px] text-amber-700 font-bold mt-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-amber-500" />
                                      <span>Next Booster Due Date: {r.nextDueDate}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button 
                                  onClick={() => handleOpenEdit(r)}
                                  className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Entry"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(r.id, r.vaccineName)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Entry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-600">No vaccinations recorded yet.</p>
                          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                            Record administration of BCG, OPV, Pentavalent, or MR vaccines to build pediatric health record.
                          </p>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleOpenAdd(selectedChild.id)}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs mt-1 cursor-pointer"
                          >
                            + Record Vaccination
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 2: VISITS HISTORY */}
              {activeTab === 'visits' && (
                <Card className="border-slate-200">
                  <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-sky-600" />
                        <span>Health Checkup & Visit History</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Field visit history and clinical observations for {selectedChild.name}
                      </CardDescription>
                    </div>

                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => handleOpenVisitWorkflow(selectedChild.id)}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer"
                    >
                      + Record Visit
                    </Button>
                  </CardHeader>

                  <CardContent className="p-0">
                    {selectedChildVisits.length > 0 ? (
                      <div className="divide-y divide-slate-100 text-xs">
                        {selectedChildVisits.map((v, idx) => (
                          <div key={`${v.id}-${idx}`} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-sky-100 text-sky-800 rounded-lg font-bold text-[10px]">
                                  {v.purpose}
                                </span>
                                <span className="font-extrabold text-slate-800">{v.visitDate}</span>
                              </div>

                              <Badge variant={v.status === 'synced' ? 'success' : 'warning'} className="text-[10px]">
                                {v.status === 'synced' ? '✓ Synced' : 'Pending'}
                              </Badge>
                            </div>

                            <p className="text-slate-600 font-medium">
                              <strong>Symptoms / Notes:</strong> {v.symptoms || 'Routine healthy child visit.'}
                            </p>

                            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold bg-slate-50 p-2 rounded-xl">
                              <span>Weight: <strong className="text-slate-800">{v.weight ? `${v.weight} kg` : 'N/A'}</strong></span>
                              <span>•</span>
                              <span>BP: <strong className="text-slate-800">{v.bp || 'N/A'}</strong></span>
                              <span>•</span>
                              <span>Referral: <strong className="text-slate-800">{v.referralNeeded ? `Yes (${v.referralFacility})` : 'None'}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center space-y-2">
                        <Activity className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-600">No health visits recorded yet.</p>
                        <p className="text-[11px] text-slate-400">Log home visits or clinical checkups for this child.</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenVisitWorkflow(selectedChild.id)}
                          className="border-sky-200 text-sky-700 font-bold text-xs mt-1 cursor-pointer"
                        >
                          + Record Visit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* TAB 3: GROWTH & NUTRITION */}
              {activeTab === 'nutrition' && (
                <Card className="border-slate-200">
                  <CardHeader className="p-4 sm:p-5 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Apple className="w-4 h-4 text-emerald-600" />
                      <span>Growth & Nutrition Status</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Weight-for-age, SAM status, and nutritional supplement distribution for {selectedChild.name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 text-xs">
                    {selectedChildNutrition.length > 0 ? (
                      <div className="space-y-3">
                        {selectedChildNutrition.map((n, idx) => (
                          <div key={`${n.id}-${idx}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-slate-800">Age Group: {n.ageGroup.toUpperCase()}</span>
                              <Badge variant={n.weightForAgeStatus === 'normal' ? 'success' : 'warning'}>
                                Weight Status: {n.weightForAgeStatus.toUpperCase()}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-600">SAM Flag:</span>
                              {n.samStatus ? (
                                <Badge variant="rose" className="bg-rose-100 text-rose-800 font-bold">
                                  🔴 Severe Acute Malnutrition Flagged
                                </Badge>
                              ) : (
                                <Badge variant="success" className="bg-emerald-50 text-emerald-800 font-bold">
                                  🟢 Normal Growth
                                </Badge>
                              )}
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Interventions</span>
                              <div className="flex flex-wrap gap-1.5">
                                {n.thrustAreas.map((t, tidx) => (
                                  <Badge key={`${t}-${tidx}`} variant="outline" className="bg-white text-slate-700 font-bold text-[10px]">
                                    ✓ {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                        <Apple className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-600">Standard Pediatric Nutrition Tracking</p>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          No specific nutrition alerts flagged. Child receives routine IFA syrups and Anganwadi Take-Home Ration (THR).
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center space-y-3">
                <Baby className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No child selected.</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Select a child from the list on the left to view their vaccination schedule and health history.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* SECTION 5, 6, 7: STEPPED VACCINATION FORM MODAL WITH REVIEW STEP */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            {/* MODAL HEADER */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>{editingId ? 'Edit Vaccination Entry' : 'Record Vaccination'}</span>
                </h3>
                <p className="text-[11px] text-slate-300 font-normal mt-0.5">
                  Step {formStep} of 3 • {formStep === 1 ? 'Vaccine Antigen' : formStep === 2 ? 'Administration' : 'Review & Save'}
                </p>
              </div>

              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP PROGRESS INDICATOR */}
            <div className="bg-slate-100 h-1.5 w-full flex">
              <div 
                className="bg-sky-600 h-full transition-all duration-300"
                style={{ width: `${(formStep / 3) * 100}%` }}
              />
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {patients.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs font-bold text-slate-600 mb-1">No pediatric cohort members found!</p>
                  <p className="text-[11px] text-slate-400 mb-3">Please register a child in Patient Management first.</p>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  {/* STEP 1: CHILD & VACCINE SELECTION */}
                  {formStep === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Pediatric Beneficiary <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={patientId}
                          onChange={(e) => handlePatientSelection(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-600 bg-white"
                          required
                          disabled={!!editingId}
                        >
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.age}Y - {p.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Child Age (Months)
                          </label>
                          <input 
                            type="number"
                            min={0}
                            max={144}
                            value={childAgeMonths}
                            onChange={(e) => setChildAgeMonths(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-600 bg-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Current Selection
                          </label>
                          <div className="p-2 bg-sky-50 text-sky-800 font-extrabold rounded-xl border border-sky-100 flex items-center gap-1.5 text-xs truncate">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-sky-600" />
                            <span className="truncate">{vaccineName}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Select Vaccine Antigen <span className="text-rose-500">*</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                          {VACCINE_LIST.map(v => {
                            const isSelected = vaccineName === v.value;
                            return (
                              <div
                                key={v.value}
                                onClick={() => setVaccineName(v.value)}
                                className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                                  isSelected 
                                    ? 'bg-sky-600 text-white border-sky-700 shadow-xs' 
                                    : 'bg-white border-slate-200/80 hover:border-sky-300 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-extrabold text-xs">{v.label}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                </div>
                                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                                  {v.age} • {v.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button 
                          type="button" 
                          variant="primary" 
                          onClick={handleNextToStep2}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Next: Administration</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: DATES & CLINICIAN */}
                  {formStep === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Date Administered <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="date"
                            value={dateGiven}
                            onChange={(e) => handleDateGivenChange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-600 bg-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Next Booster Due Date
                          </label>
                          <input 
                            type="date"
                            value={nextDueDate}
                            onChange={(e) => setNextDueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-sky-700 font-extrabold rounded-xl text-xs focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Administered By / Clinician <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text"
                          value={administeredBy}
                          onChange={(e) => setAdministeredBy(e.target.value)}
                          placeholder="e.g. ANM Madukkarai PHC"
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-600 bg-white"
                          required
                        />
                      </div>

                      <div className="flex justify-between pt-4 border-t border-slate-100">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setFormStep(1)}
                          className="flex items-center gap-1 text-slate-600 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </Button>

                        <Button 
                          type="button" 
                          variant="primary" 
                          onClick={handleNextToStep3}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Next: Review</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: REVIEW BEFORE SAVE (SECTION 7) */}
                  {formStep === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Review Vaccination Summary</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Child</span>
                            <span className="font-extrabold text-slate-800">
                              {patients.find(p => p.id === patientId)?.name || patientId}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Vaccine Antigen</span>
                            <span className="font-bold text-sky-700">{vaccineName}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Date Administered</span>
                            <span className="font-bold text-slate-700">{dateGiven}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Child Age</span>
                            <span className="font-bold text-slate-800">{childAgeMonths} Months</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Next Due Date</span>
                            <span className="font-bold text-amber-700">{nextDueDate || 'As scheduled'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Administered By</span>
                            <span className="font-bold text-slate-800">{administeredBy}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-slate-100">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setFormStep(2)}
                          className="flex items-center gap-1 text-slate-600 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Edit Details</span>
                        </Button>

                        <Button 
                          type="submit" 
                          variant="primary" 
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                        >
                          {editingId ? 'Save Changes' : 'Confirm & Save Vaccination'}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* RECORD VISIT WORKFLOW MODAL FOR CHECKUPS */}
      {visitModalPatientId && (
        <RecordVisitWorkflow
          initialPatientId={visitModalPatientId}
          isOpen={isVisitModalOpen}
          onClose={() => {
            setIsVisitModalOpen(false);
            setVisitModalPatientId(undefined);
          }}
          onSaveSuccess={() => {
            loadData();
            setSuccessMsg('Health checkup visit recorded successfully!');
            setTimeout(() => setSuccessMsg(null), 3000);
          }}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  getMaternalRecords, 
  getPatients, 
  getVisits,
  addMaternalRecord, 
  updateMaternalRecord, 
  deleteMaternalRecord, 
  MaternalRecord, 
  AshaPatient, 
  VisitRecord,
  isOfflineModeEnabled 
} from './localAshaHelper';
import { maternalApi, patientApi, visitApi } from '../../utils/apiClient';
import RecordVisitWorkflow from './RecordVisitWorkflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { 
  Heart, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Activity, 
  Wifi,
  WifiOff,
  Clock,
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Check,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function MaternalPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState<MaternalRecord[]>([]);
  const [patients, setPatients] = useState<AshaPatient[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  // Selected Patient from URL search params if present
  const paramPatientId = searchParams.get('patientId');

  // ANC Visit Modal state
  const [isAncVisitModalOpen, setIsAncVisitModalOpen] = useState(false);
  const [ancVisitPatientId, setAncVisitPatientId] = useState<string | undefined>(undefined);

  // Stepped Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [patientId, setPatientId] = useState('');
  const [lmpDate, setLmpDate] = useState('');
  const [edd, setEdd] = useState('');
  const [gestationalAgeWeeks, setGestationalAgeWeeks] = useState(20);
  const [ancCount, setAncCount] = useState(1);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [pregsRaw, ptsRaw, visitsRaw] = await Promise.all([
        maternalApi.getAllPregnancies(),
        patientApi.getAll(),
        visitApi.getAll()
      ]);
      const matRecords = await getMaternalRecords(pregsRaw, ptsRaw, visitsRaw);
      setRecords(matRecords);

      const allVisits = await getVisits(visitsRaw, pregsRaw, ptsRaw);
      setVisits(allVisits);
      
      // Filter female patients aged 13-50 for prenatal registration
      const allPts = await getPatients(ptsRaw, pregsRaw);
      const femaleEligible = allPts.filter(p => p.gender === 'F' && p.age >= 13 && p.age <= 50);
      setPatients(femaleEligible);

      // If patientId is passed in URL query, set search query or auto select
      if (paramPatientId) {
        const matchPt = allPts.find(p => p.id === paramPatientId);
        if (matchPt) {
          setSearchQuery(matchPt.name);
        }
      }
    } catch (e) {
      console.error('Error loading maternal care registry data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [paramPatientId]);

  // High Risk calculation
  const highRiskRecords = useMemo(() => {
    return records.filter(r => r.highRiskFactors.length > 0 && !r.highRiskFactors.includes('None'));
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || r.patientName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.patientId.toLowerCase().includes(q);
      
      let matchesRisk = true;
      if (riskFilter === 'high_risk') {
        matchesRisk = r.highRiskFactors.length > 0 && !r.highRiskFactors.includes('None');
      } else if (riskFilter === 'normal') {
        matchesRisk = r.highRiskFactors.includes('None') || r.highRiskFactors.length === 0;
      } else if (riskFilter !== 'all') {
        matchesRisk = r.highRiskFactors.includes(riskFilter);
      }

      return matchesSearch && matchesRisk;
    });
  }, [records, searchQuery, riskFilter]);

  // Open Form modal
  const handleOpenAdd = (presetPatientId?: string) => {
    setEditingId(null);
    setFormStep(1);
    
    const defaultPid = presetPatientId || (patients.length > 0 ? patients[0].id : '');
    setPatientId(defaultPid);
    
    const today = new Date().toISOString().substring(0, 10);
    handleLmpChange(today);
    setAncCount(1);
    setSelectedRisks(['None']);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (r: MaternalRecord) => {
    setEditingId(r.id);
    setFormStep(1);
    setPatientId(r.patientId);
    setLmpDate(r.lmpDate);
    setEdd(r.edd);
    setGestationalAgeWeeks(r.gestationalAgeWeeks);
    setAncCount(r.ancCount);
    setSelectedRisks(r.highRiskFactors.length > 0 ? r.highRiskFactors : ['None']);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Auto calculate EDD and Gestational weeks based on LMP
  const handleLmpChange = (dateStr: string) => {
    setLmpDate(dateStr);
    if (!dateStr) return;

    const lmp = new Date(dateStr);
    
    // Calculate EDD: LMP + 280 days (9 months & 7 days)
    const eddDate = new Date(lmp);
    eddDate.setDate(eddDate.getDate() + 280);
    setEdd(eddDate.toISOString().substring(0, 10));

    // Calculate Gestational Weeks: (Today - LMP) / 7
    const diffTime = Math.abs(new Date().getTime() - lmp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.min(42, Math.max(1, Math.floor(diffDays / 7)));
    setGestationalAgeWeeks(weeks);
  };

  const handleRiskToggle = (risk: string) => {
    if (risk === 'None') {
      setSelectedRisks(['None']);
    } else {
      const filtered = selectedRisks.filter(r => r !== 'None');
      if (filtered.includes(risk)) {
        const next = filtered.filter(r => r !== risk);
        setSelectedRisks(next.length === 0 ? ['None'] : next);
      } else {
        setSelectedRisks([...filtered, risk]);
      }
    }
  };

  // Step 1 -> Step 2 validation
  const handleNextToStep2 = () => {
    if (!patientId) {
      setFormError('Please select a female beneficiary.');
      return;
    }
    if (!lmpDate) {
      setFormError('Please select Last Menstrual Period (LMP) Date.');
      return;
    }
    setFormError(null);
    setFormStep(2);
  };

  // Step 2 -> Step 3 validation
  const handleNextToStep3 = () => {
    setFormError(null);
    setFormStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !lmpDate) {
      setFormError('Required pregnancy information is missing.');
      return;
    }

    const matchedPt = patients.find(p => p.id === patientId);
    const patName = matchedPt ? matchedPt.name : 'Unknown';
    const finalRisks = selectedRisks.length === 0 ? ['None'] : selectedRisks;

    try {
      if (editingId) {
        await updateMaternalRecord(editingId, {
          patientId,
          patientName: patName,
          lmpDate,
          edd,
          gestationalAgeWeeks: Number(gestationalAgeWeeks),
          ancCount: Number(ancCount),
          highRiskFactors: finalRisks
        });
        setSuccessMsg(`Updated pregnancy record for ${patName}`);
      } else {
        await addMaternalRecord({
          patientId,
          patientName: patName,
          lmpDate,
          edd,
          gestationalAgeWeeks: Number(gestationalAgeWeeks),
          ancCount: Number(ancCount),
          highRiskFactors: finalRisks
        });
        setSuccessMsg(`Enrolled pregnancy card for ${patName} successfully!`);
      }

      setIsFormOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setFormError('Failed to save pregnancy record.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to unregister pregnancy card for ${name}?`)) {
      try {
        await deleteMaternalRecord(id);
        const cleanId = String(id).replace(/[^0-9]/g, '');
        setRecords(prev => prev.filter(r => {
          const rClean = String(r.id).replace(/[^0-9]/g, '');
          return rClean !== cleanId && r.id !== id;
        }));
        await loadData();
        setSuccessMsg(`✓ Pregnancy card for ${name} removed successfully.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        console.error('Failed to unregister pregnancy card:', err);
        setSuccessMsg('Failed to unregister pregnancy card.');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    }
  };

  // Open Record Visit Workflow Modal for a patient
  const handleOpenRecordAncVisit = (patientId: string) => {
    setAncVisitPatientId(patientId);
    setIsAncVisitModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Heart className="w-4 h-4" />
            <span>Maternal Care</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pregnancy and ANC Monitoring</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Register pregnancies, track Gestational Weeks & EDD, and monitor ANC checkup history.
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
            id="btn-add-maternal"
            variant="primary" 
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Pregnant Woman</span>
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

      {/* HIGH RISK ALERT BANNER */}
      {highRiskRecords.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-2">
                <span>High-Risk Pregnancies Detected ({highRiskRecords.length})</span>
              </h4>
              <p className="text-[11px] text-rose-700 font-medium mt-0.5 leading-relaxed">
                {highRiskRecords.length} pregnant woman(s) in catchment area identified with high-risk conditions (Severe Anaemia, Hypertension, or Gestational Diabetes).
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setRiskFilter('high_risk')}
            className="border-rose-200 text-rose-800 hover:bg-rose-100 text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Filter High Risk
          </Button>
        </div>
      )}

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pregnant Women</p>
              <p className="text-lg font-black text-slate-800 mt-0.5">{records.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Risk Cases</p>
              <p className="text-lg font-black text-amber-700 mt-0.5">{highRiskRecords.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ANC Visits Logged</p>
              <p className="text-lg font-black text-teal-800 mt-0.5">
                {visits.filter(v => v.purpose === 'ANC').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eligible Women</p>
              <p className="text-lg font-black text-indigo-800 mt-0.5">{patients.length}</p>
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
              placeholder="Search by pregnant woman's name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Filter Risk:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Pregnancies</option>
                <option value="high_risk">🔴 All High Risk</option>
                <option value="Anaemia">Anaemia Cases</option>
                <option value="Hypertension">Hypertension Cases</option>
                <option value="Diabetes">Gestational Diabetes</option>
                <option value="Multi-gravida">Multi-gravida Risks</option>
                <option value="normal">🟢 Normal Cases</option>
              </select>
            </div>

            {(searchQuery || riskFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSearchQuery(''); setRiskFilter('all'); }}
                className="text-xs text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PREGNANCY CARDS LIST */}
      <div className="space-y-4">
        {filteredRecords.map((r) => {
          const isHighRisk = r.highRiskFactors.length > 0 && !r.highRiskFactors.includes('None');
          const ptVisits = visits.filter(v => v.patientId === r.patientId && v.purpose === 'ANC');
          const lastAncVisit = ptVisits.length > 0 ? ptVisits[ptVisits.length - 1] : null;

          return (
            <Card 
              key={r.id} 
              className={`overflow-hidden transition-all duration-200 ${
                isHighRisk 
                  ? 'border-rose-200 shadow-xs' 
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* CARD HEADER */}
              <div className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${
                isHighRisk ? 'bg-rose-50/30 border-rose-100' : 'bg-slate-50/50 border-slate-100'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl text-white shrink-0 ${isHighRisk ? 'bg-rose-600' : 'bg-teal-600'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">{r.patientName}</h3>
                      <span className="text-xs font-mono font-bold text-slate-400">({r.patientId})</span>
                      
                      {isHighRisk ? (
                        <Badge variant="rose" className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-[10px]">
                          🔴 High Risk
                        </Badge>
                      ) : (
                        <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                          🟢 Normal
                        </Badge>
                      )}

                      <Badge variant={r.status === 'synced' ? 'success' : 'warning'} className="text-[10px]">
                        {r.status === 'synced' ? '✓ Synced' : '✓ Saved locally'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Card ID: <span className="font-mono text-slate-700 font-bold">{r.id}</span> • Catchment Record
                    </p>
                  </div>
                </div>

                {/* CARD TOP ACTIONS */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleOpenRecordAncVisit(r.patientId)}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record ANC Visit</span>
                  </Button>

                  <button 
                    onClick={() => handleOpenEdit(r)}
                    title="Edit Pregnancy Details"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleDelete(r.id, r.patientName)}
                    title="Delete Record"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CARD BODY: PREGNANCY OVERVIEW GRID */}
              <CardContent className="p-4 sm:p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Pregnancy Overview</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">LMP Date</span>
                      <span className="font-extrabold text-slate-800 mt-0.5 block">{r.lmpDate || 'Not specified'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected Delivery (EDD)</span>
                      <span className="font-extrabold text-rose-600 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-400" />
                        {r.edd || 'Calculated'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Gestational Age</span>
                      <div className="mt-0.5">
                        <span className="font-extrabold text-slate-800 block">{r.gestationalAgeWeeks} Weeks</span>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1 max-w-[100px]">
                          <div 
                            className="bg-rose-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (r.gestationalAgeWeeks / 40) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">ANC Checkups</span>
                      <span className="font-extrabold text-teal-700 mt-0.5 block">
                        {r.ancCount} Completed
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Last ANC Visit</span>
                      <span className="font-bold text-slate-700 mt-0.5 block">
                        {lastAncVisit ? lastAncVisit.visitDate : 'None logged'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RISK ASSESSMENT BADGES */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Risk Assessment Markers
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {r.highRiskFactors.map(factor => {
                      if (factor === 'None') {
                        return (
                          <Badge key={factor} variant="success" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-xs">
                            ✓ No Risk Factors Flagged
                          </Badge>
                        );
                      }
                      return (
                        <Badge key={factor} variant="rose" className="bg-rose-100 text-rose-900 border-rose-200 font-bold text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{factor}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* ANC HISTORY TIMELINE */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-teal-600" />
                      <span>ANC Visit History</span>
                    </h4>

                    <button 
                      onClick={() => handleOpenRecordAncVisit(r.patientId)}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ Record ANC Checkup</span>
                    </button>
                  </div>

                  {ptVisits.length > 0 ? (
                    <div className="space-y-2.5">
                      {ptVisits.map((v, idx) => (
                        <div key={`${v.id}-${idx}`} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-start sm:items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 font-bold text-slate-800">
                                <span>ANC Visit {idx + 1}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600">{v.visitDate}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {v.symptoms ? `Notes: ${v.symptoms}` : 'Routine checkup completed.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 self-end sm:self-auto bg-white px-2.5 py-1 rounded-lg border border-slate-100">
                            <span>BP: <strong className="text-slate-800">{v.bp || '120/80'}</strong></span>
                            <span>|</span>
                            <span>Weight: <strong className="text-slate-800">{v.weight || '--'} kg</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                      <p className="text-xs font-bold text-slate-500">No ANC visits recorded yet.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Record maternal checkups to build clinical timeline.</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenRecordAncVisit(r.patientId)}
                        className="mt-2 text-xs font-bold text-teal-700 border-teal-200 hover:bg-teal-50 cursor-pointer"
                      >
                        + Record First ANC Visit
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredRecords.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No active pregnancy records found.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No matching records found for search or filters. Enroll a new pregnant woman to start ANC monitoring.
              </p>
              <Button 
                variant="primary"
                onClick={() => handleOpenAdd()}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs mt-2 cursor-pointer"
              >
                + Enroll Pregnant Woman
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* STEPPED ENROLLMENT / EDIT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            {/* MODAL HEADER */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>{editingId ? 'Edit Pregnancy Details' : 'Enroll Pregnant Woman'}</span>
                </h3>
                <p className="text-[11px] text-slate-300 font-normal mt-0.5">
                  Step {formStep} of 3 • {formStep === 1 ? 'Pregnancy Details' : formStep === 2 ? 'ANC & Risk Assessment' : 'Review & Save'}
                </p>
              </div>

              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP PROGRESS INDICATOR */}
            <div className="bg-slate-100 h-1.5 w-full flex">
              <div 
                className="bg-rose-600 h-full transition-all duration-300"
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
                  <p className="text-xs font-bold text-slate-600 mb-1">No eligible female beneficiaries found!</p>
                  <p className="text-[11px] text-slate-400 mb-3">Register a female patient aged 13-50 first in the Patients section to enroll her pregnancy.</p>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  {/* STEP 1: PREGNANCY DETAILS */}
                  {formStep === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Select Beneficiary <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={patientId}
                          onChange={(e) => setPatientId(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
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
                            LMP Date <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="date"
                            value={lmpDate}
                            onChange={(e) => handleLmpChange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Expected Delivery (EDD)
                          </label>
                          <input 
                            type="date"
                            value={edd}
                            readOnly
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl font-extrabold text-xs text-rose-600 focus:outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Gestational Age (Auto Calculated)
                        </label>
                        <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between">
                          <span className="font-bold text-slate-700">Calculated Gestation</span>
                          <span className="font-extrabold text-rose-700 text-sm">{gestationalAgeWeeks} Weeks</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button 
                          type="button" 
                          variant="primary" 
                          onClick={handleNextToStep2}
                          className="bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Next: Assessment</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ANC & RISK ASSESSMENT */}
                  {formStep === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Total ANC Checkups Completed
                        </label>
                        <input 
                          type="number"
                          min={0}
                          max={15}
                          value={ancCount}
                          onChange={(e) => setAncCount(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          High Risk Markers
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {['Anaemia', 'Hypertension', 'Diabetes', 'Multi-gravida', 'None'].map(risk => {
                            const isChecked = selectedRisks.includes(risk);
                            return (
                              <label key={risk} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${
                                isChecked ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'
                              }`}>
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleRiskToggle(risk)}
                                  className="h-4 w-4 rounded text-rose-600 cursor-pointer"
                                />
                                <span className="text-xs">{risk === 'None' ? 'Normal (No High Risk)' : risk}</span>
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
                          className="flex items-center gap-1 text-slate-600 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </Button>

                        <Button 
                          type="button" 
                          variant="primary" 
                          onClick={handleNextToStep3}
                          className="bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Next: Review</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: REVIEW BEFORE SAVE */}
                  {formStep === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Review Pregnancy Enrollment Summary</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Beneficiary</span>
                            <span className="font-extrabold text-slate-800">
                              {patients.find(p => p.id === patientId)?.name || patientId}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">LMP Date</span>
                            <span className="font-bold text-slate-700">{lmpDate}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Calculated EDD</span>
                            <span className="font-bold text-rose-600">{edd}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Gestational Age</span>
                            <span className="font-bold text-slate-800">{gestationalAgeWeeks} Weeks</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">ANC Visits Done</span>
                            <span className="font-bold text-teal-700">{ancCount} Checkups</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Risk Markers</span>
                            <span className="font-bold text-slate-800">{selectedRisks.join(', ')}</span>
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
                          <span>Edit Assessment</span>
                        </Button>

                        <Button 
                          type="submit" 
                          variant="primary" 
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                        >
                          {editingId ? 'Save Changes' : 'Confirm & Save Pregnancy'}
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

      {/* ANC RECORD VISIT WORKFLOW MODAL */}
      {ancVisitPatientId && (
        <RecordVisitWorkflow
          initialPatientId={ancVisitPatientId}
          isOpen={isAncVisitModalOpen}
          onClose={() => {
            setIsAncVisitModalOpen(false);
            setAncVisitPatientId(undefined);
          }}
          onSaveSuccess={() => {
            loadData();
            setSuccessMsg('ANC visit record saved successfully!');
            setTimeout(() => setSuccessMsg(null), 3000);
          }}
        />
      )}
    </div>
  );
}

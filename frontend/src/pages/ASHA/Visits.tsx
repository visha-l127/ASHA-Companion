import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  getVisits, 
  getPatients, 
  deleteVisit, 
  VisitRecord, 
  AshaPatient, 
  isOfflineModeEnabled 
} from './localAshaHelper';
import { visitApi, maternalApi, patientApi } from '../../utils/apiClient';
import RecordVisitWorkflow from './RecordVisitWorkflow';
import { aiApi } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Building2, 
  ClipboardList, 
  Activity, 
  Wifi,
  WifiOff,
  UserCheck,
  X 
} from 'lucide-react';

export default function VisitsPage() {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [patients, setPatients] = useState<AshaPatient[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [referralFilter, setReferralFilter] = useState('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitRecord | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [prioritizedVisits, setPrioritizedVisits] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const [searchParams] = useSearchParams();
  const location = useLocation();

  const loadData = async () => {
    try {
      const [visitsRaw, pregsRaw, ptsRaw] = await Promise.all([
        visitApi.getAll(),
        maternalApi.getAllPregnancies(),
        patientApi.getAll()
      ]);
      const v = await getVisits(visitsRaw, pregsRaw, ptsRaw);
      const p = await getPatients(ptsRaw, pregsRaw);
      setVisits(v);
      setPatients(p);

      if (location.pathname === '/asha/priority-cases') {
        setLoadingAI(true);
        try {
          const aiPrioritized = await aiApi.getPrioritizedVisits();
          setPrioritizedVisits(aiPrioritized);
        } catch (err) {
          console.error('Error fetching AI prioritized visits:', err);
        } finally {
          setLoadingAI(false);
        }
      }
    } catch (e) {
      console.error('Error loading visits:', e);
    }
  };

  useEffect(() => {
    loadData();
    const pid = searchParams.get('patientId') || (location.state as any)?.patientId;
    const shouldOpen = searchParams.get('openForm') === 'true' || (location.state as any)?.openForm;
    const refParam = searchParams.get('referral');
    if (refParam === 'yes' || location.pathname === '/asha/priority-cases') {
      setReferralFilter('yes');
    }
    if (pid) {
      setSelectedPatientId(pid);
      if (shouldOpen) {
        setEditingVisit(null);
        setIsFormOpen(true);
      }
    }
  }, [searchParams, location.state, location.pathname]);

  const filteredVisits = visits.filter((v) => {
    const matchesSearch = 
      v.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPurpose = purposeFilter === 'all' || v.purpose === purposeFilter;
    
    let matchesReferral = true;
    if (referralFilter === 'yes') matchesReferral = v.referralNeeded;
    else if (referralFilter === 'no') matchesReferral = !v.referralNeeded;

    return matchesSearch && matchesPurpose && matchesReferral;
  });

  const highRiskReferralsCount = visits.filter(v => v.referralNeeded).length;

  const handleOpenAdd = () => {
    setEditingVisit(null);
    if (patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    } else {
      setSelectedPatientId('');
    }
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v: VisitRecord) => {
    setEditingVisit(v);
    setSelectedPatientId(v.patientId);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this visit entry?')) {
      await deleteVisit(id);
      await loadData();
      setSuccessMsg('Visit entry deleted.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Calendar className="w-4 h-4" />
            <span>Community Care Journal</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Visit Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Log physical checkups, capture vitals (Blood Pressure & Weight), and dispatch referrals.
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
            id="btn-log-visit"
            variant="primary" 
            onClick={handleOpenAdd}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Patient Visit</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Referrals Banner */}
      {highRiskReferralsCount > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide">High Risk Referrals Escalated</h4>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5 leading-relaxed">
              You have {highRiskReferralsCount} active referral case(s) referred to Block PHCs. Ensure patients are safely escorted or connected with ANM transport services.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by patient name, clinical findings, symptoms or journal ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white text-slate-800"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Purpose:</span>
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Purposes</option>
                <option value="ANC">Prenatal (ANC)</option>
                <option value="Immunization">Immunization</option>
                <option value="Newborn Care">Newborn Care</option>
                <option value="NCD Follow-up">NCD Screening</option>
                <option value="General">General Care</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1 bg-slate-50/50">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Referral:</span>
              <select
                value={referralFilter}
                onChange={(e) => setReferralFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Visits</option>
                <option value="yes">Referred Cases</option>
                <option value="no">Self-Manageable</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visits List */}
      {location.pathname === '/asha/priority-cases' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
              <span>AI Visit Prioritization Engine</span>
            </CardTitle>
            <CardDescription>
              Clinical cases prioritized by AI analytics using real-time patient records, vitals, nutrition logs, and immunization status.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingAI ? (
              <div className="py-12 text-center text-xs font-bold text-slate-500">
                Evaluating clinical priority queues using AI models...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                      <th className="p-4 w-32">Priority Status</th>
                      <th className="p-4 w-48">Patient Profile</th>
                      <th className="p-4 w-48">Condition / Notes</th>
                      <th className="p-4">Prioritization Factors / Reasoning</th>
                      <th className="p-4 text-center w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {prioritizedVisits.map((pv, idx) => {
                      let badgeColor = 'bg-slate-100 text-slate-800';
                      if (pv.priorityLevel === 'CRITICAL') badgeColor = 'bg-rose-100 text-rose-800 font-extrabold border border-rose-200';
                      else if (pv.priorityLevel === 'HIGH') badgeColor = 'bg-orange-100 text-orange-800 font-bold border border-orange-200';
                      else if (pv.priorityLevel === 'MEDIUM') badgeColor = 'bg-amber-100 text-amber-800 font-semibold border border-amber-200';
                      
                      return (
                        <tr key={`pv-${pv.patientId || idx}`} className="hover:bg-rose-50/10 transition-colors">
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] uppercase text-center tracking-wider ${badgeColor}`}>
                                {pv.priorityLevel}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold text-center">Score: {pv.priorityScore}/100</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-extrabold text-slate-800 text-xs">{pv.patientName}</p>
                              <p className="text-[10px] text-slate-400">Village: {pv.village || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="p-4 space-y-1">
                            <p className="font-bold text-slate-700">{pv.condition || 'Clinical Risk Flag'}</p>
                            {pv.notes && <p className="text-[10px] text-slate-500 italic">"{pv.notes}"</p>}
                            {pv.assignedDate && <p className="text-[9px] text-slate-400">Assigned: {pv.assignedDate}</p>}
                          </td>
                          <td className="p-4">
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                              {pv.reasons && pv.reasons.map((r: string, rIdx: number) => (
                                <li key={rIdx}>{r}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-[11px] font-bold px-3 py-1.5 flex items-center gap-1.5 mx-auto bg-teal-600 hover:bg-teal-700"
                              onClick={() => {
                                setSelectedPatientId(String(pv.patientId));
                                setEditingVisit(null);
                                setIsFormOpen(true);
                              }}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Log Visit</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}

                    {prioritizedVisits.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                          No prioritized visits calculated for this sector.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Routine Clinical Visits Journal</CardTitle>
            <CardDescription>
              Displaying all field journals tracked in current village sectors.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                    <th className="p-4">Visit Code</th>
                    <th className="p-4">Patient Profile</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Visit Type / Purpose</th>
                    <th className="p-4">Vitals & Symptoms</th>
                    <th className="p-4">Referral Dispatch</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredVisits.map((v, idx) => (
                    <tr key={`visit-${v.id || idx}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-400">{v.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-extrabold text-slate-800 text-xs">{v.patientName}</p>
                          <p className="text-[10px] text-slate-400">ID: {v.patientId}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">{v.visitDate}</td>
                      <td className="p-4">
                        <Badge variant="neutral" className="font-bold text-xs">{v.purpose}</Badge>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="flex gap-2 text-[10px]">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">BP: {v.bp}</span>
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">Wt: {v.weight} kg</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs italic">"{v.symptoms}"</p>
                      </td>
                      <td className="p-4">
                        {v.referralNeeded ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge variant="danger" className="w-fit">REFERRED</Badge>
                            <span className="text-[9px] font-bold text-slate-500">{v.referralFacility}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">None Required</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(v)}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredVisits.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                        No visits recorded in local database cache.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RECORD VISIT WORKFLOW MODAL */}
      <RecordVisitWorkflow
        initialPatientId={selectedPatientId}
        editingVisit={editingVisit}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaveSuccess={() => {
          loadData();
          setSuccessMsg('Patient visit saved successfully!');
          setTimeout(() => setSuccessMsg(null), 3000);
        }}
      />
    </div>
  );
}

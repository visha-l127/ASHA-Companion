import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  getMedicineIssueRecords, 
  getPatients, 
  addMedicineIssueRecord, 
  updateMedicineIssueRecord, 
  deleteMedicineIssueRecord, 
  MedicineIssueRecord, 
  AshaPatient, 
  isOfflineModeEnabled 
} from './localAshaHelper';
import { pharmacyApi, patientApi, maternalApi } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { 
  Pill, 
  Plus, 
  Minus,
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Wifi,
  WifiOff,
  X,
  User,
  Home,
  Calendar,
  ChevronRight,
  ArrowRight,
  Package,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';

// Available medicines accessible to ASHA workers for village-level field distribution
const AVAILABLE_MEDICINES = [
  { id: 'med-1', name: 'Iron-Folic Acid Tablets (Large)', category: 'Maternal Supplement', stock: 120, unit: 'Tablets', status: 'Available', defaultQty: 30, dosage: 'Take 1 tablet daily at bedtime after food' },
  { id: 'med-2', name: 'IFA Syrup (Prophylactic)', category: 'Pediatric Supplement', stock: 18, unit: 'Bottles', status: 'Low Stock', defaultQty: 1, dosage: '5ml daily after morning feed' },
  { id: 'med-3', name: 'Albendazole 400mg (Deworming)', category: 'Deworming', stock: 40, unit: 'Tablets', status: 'Available', defaultQty: 1, dosage: 'Single chewable dose before bedtime' },
  { id: 'med-4', name: 'ORS Packets (Rehydration)', category: 'Rehydration', stock: 65, unit: 'Packets', status: 'Available', defaultQty: 5, dosage: 'Dissolve 1 packet in 1 Litre of clean drinking water' },
  { id: 'med-5', name: 'Zinc Supplements 20mg', category: 'Pediatric Care', stock: 50, unit: 'Tablets', status: 'Available', defaultQty: 14, dosage: '1 tablet daily for 14 days during diarrhea' },
  { id: 'med-6', name: 'Paracetamol 500mg', category: 'Analgesic / Antipyretic', stock: 80, unit: 'Tablets', status: 'Available', defaultQty: 10, dosage: '1 tablet every 6 hours if fever is present' },
  { id: 'med-7', name: 'Calcium & Vitamin D3', category: 'Prenatal Care', stock: 90, unit: 'Tablets', status: 'Available', defaultQty: 30, dosage: '1 tablet twice daily with meals' },
];

export default function MedicinePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Data states
  const [records, setRecords] = useState<MedicineIssueRecord[]>([]);
  const [patients, setPatients] = useState<AshaPatient[]>([]);

  // Selected Patient Context state
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [medFilter, setMedFilter] = useState('all');

  // Form Workflow states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1); // 1: Details & Qty, 2: Review Before Submit
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [patientId, setPatientId] = useState('');
  const [medicineName, setMedicineName] = useState('Iron-Folic Acid Tablets (Large)');
  const [quantity, setQuantity] = useState(30);
  const [dosageInstructions, setDosageInstructions] = useState('Take 1 tablet daily at bedtime after food');
  const [issueDate, setIssueDate] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [availableMedicines, setAvailableMedicines] = useState<any[]>(AVAILABLE_MEDICINES);

  const paramPatientId = searchParams.get('patientId');

  const loadData = async () => {
    try {
      const [medRecords, ptsRaw, pregsRaw, meds] = await Promise.all([
        getMedicineIssueRecords(),
        patientApi.getAll(),
        maternalApi.getAllPregnancies(),
        pharmacyApi.getMedicines().catch(() => [])
      ]);
      const allPts = await getPatients(ptsRaw, pregsRaw);
      setRecords(medRecords);
      setPatients(allPts);

      if (Array.isArray(meds) && meds.length > 0) {
        const mapped = meds.map((m: any, index: number) => {
          const fallback = AVAILABLE_MEDICINES[index % AVAILABLE_MEDICINES.length];
          return {
            id: String(m.id),
            name: m.name,
            category: m.category || fallback.category,
            stock: m.stock !== undefined ? m.stock : fallback.stock,
            unit: m.unit || fallback.unit,
            status: (m.stock !== undefined ? m.stock : fallback.stock) > 10 ? 'Available' : 'Low Stock',
            defaultQty: fallback.defaultQty,
            dosage: fallback.dosage
          };
        });
        setAvailableMedicines(mapped);
      }

      // Auto-select patient from URL parameter or default to first patient
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
      console.error('Error loading medicine data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [paramPatientId]);

  // Selected Patient Object
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [selectedPatientId, patients]);

  // Selected Patient Medicine Records
  const selectedPatientRecords = useMemo(() => {
    if (!selectedPatientId) return [];
    return records.filter(r => r.patientId === selectedPatientId);
  }, [selectedPatientId, records]);

  // Filtered Patients List for search/selector
  const filteredPatients = useMemo(() => {
    return patients.filter(pt => {
      const q = searchQuery.toLowerCase().trim();
      return !q || pt.name.toLowerCase().includes(q) || pt.id.toLowerCase().includes(q) || pt.householdNumber.toLowerCase().includes(q);
    });
  }, [patients, searchQuery]);

  // Filtered Dispensation Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || r.patientName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.medicineName.toLowerCase().includes(q);
      const matchesMed = medFilter === 'all' || r.medicineName.includes(medFilter);
      
      if (selectedPatientId) {
        return r.patientId === selectedPatientId && matchesSearch && matchesMed;
      }
      return matchesSearch && matchesMed;
    });
  }, [records, searchQuery, medFilter, selectedPatientId]);

  // Handle open form for issuing medicine
  const handleOpenAdd = (presetMedicineName?: string) => {
    setEditingId(null);
    setFormStep(1);

    const targetPid = selectedPatientId || (patients.length > 0 ? patients[0].id : '');
    setPatientId(targetPid);

    const targetMedName = presetMedicineName || 'Iron-Folic Acid Tablets (Large)';
    setMedicineName(targetMedName);

    const matchedMedConfig = availableMedicines.find(m => m.name === targetMedName);
    if (matchedMedConfig) {
      setQuantity(matchedMedConfig.defaultQty);
      setDosageInstructions(matchedMedConfig.dosage);
    } else {
      setQuantity(30);
      setDosageInstructions('Take as advised by clinical supervisor');
    }

    setIssueDate(new Date().toISOString().substring(0, 10));
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (r: MedicineIssueRecord) => {
    setEditingId(r.id);
    setFormStep(1);
    setPatientId(r.patientId);
    setMedicineName(r.medicineName);
    setQuantity(r.quantity);
    setDosageInstructions(r.dosageInstructions);
    setIssueDate(r.issueDate);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle Changing Selected Medicine in Form
  const handleMedicineSelectionChange = (selectedName: string) => {
    setMedicineName(selectedName);
    const matched = availableMedicines.find(m => m.name === selectedName);
    if (matched) {
      setQuantity(matched.defaultQty);
      setDosageInstructions(matched.dosage);
    }
  };

  // Step 1 -> Step 2 (Review) Validation
  const handleNextToReview = () => {
    if (!patientId) {
      setFormError('Please select a patient beneficiary.');
      return;
    }
    if (!quantity || quantity <= 0) {
      setFormError('Quantity must be greater than zero.');
      return;
    }
    if (!dosageInstructions.trim()) {
      setFormError('Dosage instructions or notes are required.');
      return;
    }
    setFormError(null);
    setFormStep(2);
  };

  // Final Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setFormError('Please select a patient beneficiary.');
      return;
    }
    if (quantity <= 0) {
      setFormError('Quantity must be greater than zero.');
      return;
    }

    const matchedPt = patients.find(p => p.id === patientId);
    const patName = matchedPt ? matchedPt.name : 'Unknown Beneficiary';

    try {
      if (editingId) {
        await updateMedicineIssueRecord(editingId, {
          patientId,
          patientName: patName,
          medicineName,
          quantity: Number(quantity),
          dosageInstructions,
          issueDate
        });
        setSuccessMsg(`Updated medicine dispensation record for ${patName}`);
      } else {
        await addMedicineIssueRecord({
          patientId,
          patientName: patName,
          medicineName,
          quantity: Number(quantity),
          dosageInstructions,
          issueDate
        });
        setSuccessMsg(`Successfully issued ${medicineName} to ${patName}!`);
      }

      setIsFormOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setFormError('Failed to save medicine issue record.');
    }
  };

  const handleDelete = async (id: string, patientName: string) => {
    if (confirm(`Are you sure you want to delete medicine record for ${patientName}?`)) {
      try {
        await deleteMedicineIssueRecord(id);
        await loadData();
        setSuccessMsg('Medicine record deleted.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        console.error(err);
        setSuccessMsg('Failed to delete medicine record.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Pill className="w-4 h-4" />
            <span>ASHA Dispensary & Field Supply</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Medicine</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View available medicines and record/request medicines for patients.
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
            id="btn-issue-medicine"
            variant="primary" 
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Medicine</span>
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

      {/* 2. PATIENT CONTEXT CARD (IF PATIENT IS SELECTED) */}
      {selectedPatient && (
        <Card className="border-indigo-100 bg-white shadow-xs overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border-b border-indigo-100/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Active Patient Context
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-800">{selectedPatient.name}</h2>
                    <Badge variant="outline" className="font-mono text-[10px] bg-white border-slate-200">
                      {selectedPatient.id}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Household: <strong className="text-slate-800 font-bold">{selectedPatient.householdNumber}</strong> • Age: <strong className="text-slate-700">{selectedPatient.age} Yrs</strong> ({selectedPatient.gender === 'M' ? 'Male' : 'Female'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleOpenAdd()}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue Medicine</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/asha/patients?id=${selectedPatient.id}`)}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
                >
                  <span>Patient Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 3. MEDICINE AVAILABILITY SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Medicine Availability (Field Stocks)</span>
          </h2>
          <span className="text-[11px] font-bold text-slate-400">{availableMedicines.length} Essential Items Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {availableMedicines.map((med) => {
            const isLowStock = med.status === 'Low Stock';
            return (
              <Card key={med.id} className="bg-white border-slate-200/80 hover:border-indigo-300 transition-all shadow-xs">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
                      <Pill className="w-4.5 h-4.5" />
                    </div>
                    <Badge 
                      variant={isLowStock ? 'warning' : 'success'} 
                      className={`text-[10px] font-bold ${isLowStock ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-teal-50 text-teal-800 border-teal-200'}`}
                    >
                      {isLowStock ? '⚠️ Low Stock' : '✓ Available'}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-1">{med.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{med.category}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock</span>
                      <span className="text-xs font-extrabold text-slate-800">{med.stock} {med.unit}</span>
                    </div>

                    <button
                      onClick={() => handleOpenAdd(med.name)}
                      className="text-xs font-extrabold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200/80 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Issue</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search beneficiary name, medicine name, or dispensation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Medicine:</span>
              <select
                value={medFilter}
                onChange={(e) => setMedFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Medicines</option>
                <option value="Iron-Folic">Iron-Folic Acid (IFA)</option>
                <option value="Albendazole">Albendazole (Deworming)</option>
                <option value="ORS">ORS Packets</option>
                <option value="Zinc">Zinc Supplements</option>
                <option value="Paracetamol">Paracetamol</option>
                <option value="Calcium">Calcium & Vitamin D3</option>
              </select>
            </div>

            {selectedPatientId && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPatientId(null)}
                className="text-xs text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
              >
                Show All Patients
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 11. MEDICINE HISTORY & DISPENSATION REGISTRY */}
      <Card className="border-slate-200">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Medicine History & Dispensation Register</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedPatient 
                ? `Dispensations logged specifically for ${selectedPatient.name}` 
                : 'All primary healthcare medicine distributions logged across village catchment'}
            </CardDescription>
          </div>

          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleOpenAdd()}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs cursor-pointer"
          >
            + Issue Medicine
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {filteredRecords.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {filteredRecords.map((r) => (
                <div key={r.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl shrink-0 mt-0.5">
                      <Pill className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm">{r.medicineName}</span>
                        <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                          Qty: {r.quantity}
                        </Badge>
                        <Badge variant={r.status === 'synced' ? 'success' : 'warning'} className="text-[10px]">
                          {r.status === 'synced' ? '✓ Synced' : '● Pending Sync'}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        Patient: <strong className="text-slate-800">{r.patientName}</strong> (<span className="font-mono text-slate-500">{r.patientId}</span>)
                      </p>

                      <p className="text-xs text-slate-500 font-medium italic">
                        "{r.dosageInstructions}"
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Issued: {r.issueDate}</span>
                        </span>
                        <span>• Log ID: <span className="font-mono font-bold text-slate-500">{r.id}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button 
                      onClick={() => handleOpenEdit(r)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(r.id, r.patientName)}
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
            /* EMPTY STATE */
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Pill className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-600">No medicine records available.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No medicine dispensations logged for this beneficiary yet.
              </p>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => handleOpenAdd()}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs mt-1 cursor-pointer"
              >
                + Issue Medicine
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5, 7, 8. ISSUE MEDICINE MODAL WITH STEP-BY-STEP REVIEW WORKFLOW */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 z-10 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                  <Pill className="w-4.5 h-4.5 text-indigo-300" />
                  <span>{editingId ? 'Edit Medicine Entry' : 'Issue Medicine'}</span>
                </h3>
                <p className="text-[10px] text-indigo-200 font-medium mt-0.5">
                  Step {formStep} of 2: {formStep === 1 ? 'Select Medicine & Details' : 'Review Before Confirm'}
                </p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-indigo-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              <div className={`flex-1 py-2 text-center text-[10px] font-bold border-b-2 transition-colors ${
                formStep === 1 ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-400'
              }`}>
                1. Entry & Quantity
              </div>
              <div className={`flex-1 py-2 text-center text-[10px] font-bold border-b-2 transition-colors ${
                formStep === 2 ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-400'
              }`}>
                2. Review Medicine
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* STEP 1: DETAILS & QUANTITY */}
              {formStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  
                  {/* Patient Selection */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Beneficiary Patient <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-white text-slate-800"
                      required
                      disabled={!!editingId || !!selectedPatientId}
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id}) • HH: {p.householdNumber}</option>
                      ))}
                    </select>
                  </div>

                  {/* Medicine Selection */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Select Available Medicine <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={medicineName}
                      onChange={(e) => handleMedicineSelectionChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-white text-slate-800"
                      required
                    >
                      {availableMedicines.map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.status === 'Low Stock' ? '⚠️ Low Stock' : `${m.stock} ${m.unit}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity with [ - ] count [ + ] controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Quantity <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center text-lg cursor-pointer transition-colors shrink-0"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input 
                          type="number"
                          min={1}
                          max={200}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-center text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center text-lg cursor-pointer transition-colors shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Dispensation Date <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-white text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  {/* Dosage Instructions / Advice */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Dosage Instructions & Field Advice <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Take 1 tablet daily at bedtime after meals"
                      value={dosageInstructions}
                      onChange={(e) => setDosageInstructions(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-white text-slate-800"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="primary" 
                      onClick={handleNextToReview}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next: Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* 8. STEP 2: REVIEW BEFORE SUBMIT */}
              {formStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Review Medicine Issue Details</span>
                    </h4>

                    <div className="space-y-2 text-xs divide-y divide-teal-100/80">
                      <div className="pt-1 flex justify-between">
                        <span className="text-slate-500 font-bold">Patient Beneficiary:</span>
                        <span className="font-extrabold text-slate-900">
                          {patients.find(p => p.id === patientId)?.name || 'Selected Patient'}
                        </span>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-500 font-bold">Medicine:</span>
                        <span className="font-extrabold text-teal-800">{medicineName}</span>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-500 font-bold">Issued Quantity:</span>
                        <span className="font-extrabold text-slate-900 font-mono">{quantity} Unit(s)</span>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-500 font-bold">Dispensation Date:</span>
                        <span className="font-extrabold text-slate-800">{issueDate}</span>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <span className="text-slate-500 font-bold">Dosage Advice:</span>
                        <span className="font-medium text-slate-700 italic text-right max-w-[200px]">
                          "{dosageInstructions}"
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setFormStep(1)}
                      className="border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      ← Edit Details
                    </Button>

                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 cursor-pointer shadow-xs"
                    >
                      ✓ Confirm & Issue Medicine
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

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  loadAllAshaData,
  getPatients, 
  getHouseholds, 
  getVisits,
  getMaternalRecords,
  getImmunizationRecords,
  getNutritionRecords,
  getMedicineIssueRecords,
  addPatient, 
  updatePatient, 
  deletePatient, 
  addVisit,
  addMedicineIssueRecord,
  addMaternalRecord,
  addImmunizationRecord,
  addNutritionRecord,
  AshaPatient, 
  Household,
  VisitRecord,
  MaternalRecord,
  ImmunizationRecord,
  NutritionRecord,
  MedicineIssueRecord,
  isOfflineModeEnabled 
} from './localAshaHelper';
import RecordVisitWorkflow from './RecordVisitWorkflow';
import { patientApi } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Baby, 
  Heart, 
  Phone,
  Wifi,
  WifiOff,
  User,
  X,
  ArrowLeft,
  Calendar,
  Pill,
  Apple,
  Activity,
  FileText,
  Home,
  Clock,
  Sparkles,
  MapPin,
  Check,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Core Data Lists
  const [patients, setPatients] = useState<AshaPatient[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [maternalRecords, setMaternalRecords] = useState<MaternalRecord[]>([]);
  const [immunizationRecords, setImmunizationRecords] = useState<ImmunizationRecord[]>([]);
  const [nutritionRecords, setNutritionRecords] = useState<NutritionRecord[]>([]);
  const [medicineRecords, setMedicineRecords] = useState<MedicineIssueRecord[]>([]);

  // Selection & Detail View State
  const [selectedPatient, setSelectedPatient] = useState<AshaPatient | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'visits' | 'maternal' | 'immunization' | 'nutrition' | 'medicines'>('overview');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // all, pregnant, child, others

  // Form states for Add/Edit Patient
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'M' | 'F' | 'O'>('F');
  const [relationToHead, setRelationToHead] = useState('Self');
  const [phone, setPhone] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [isChild, setIsChild] = useState(false);

  // Quick Modal States inside Patient Profile
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().substring(0, 10));
  const [visitPurpose, setVisitPurpose] = useState<'ANC' | 'Immunization' | 'Newborn Care' | 'NCD Follow-up' | 'General'>('General');
  const [visitSymptoms, setVisitSymptoms] = useState('');
  const [visitBp, setVisitBp] = useState('120/80 mmHg');
  const [visitWeight, setVisitWeight] = useState(60);
  const [visitReferralNeeded, setVisitReferralNeeded] = useState(false);
  const [visitReferralFacility, setVisitReferralFacility] = useState('Madukkarai PHC');

  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [medName, setMedName] = useState('Iron-Folic Acid Tablets');
  const [medQty, setMedQty] = useState(30);
  const [medDosage, setMedDosage] = useState('1 tablet daily after meals');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await loadAllAshaData();

      setPatients(data.patients);
      setHouseholds(data.households);
      setVisits(data.visits);
      setMaternalRecords(data.maternal);
      setImmunizationRecords(data.immunizations);
      setNutritionRecords(data.nutrition);
      setMedicineRecords(data.medicines);

      // Check URL search parameters
      const patientIdParam = searchParams.get('id');
      if (patientIdParam) {
        const found = data.patients.find(p => String(p.id) === String(patientIdParam));
        if (found) {
          setSelectedPatient(found);
        }
      }
    } catch (e) {
      console.error('Error loading patient list:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  // Sync selected patient if updated in state
  useEffect(() => {
    if (selectedPatient) {
      const updated = patients.find(p => p.id === selectedPatient.id);
      if (updated) setSelectedPatient(updated);
    }
  }, [patients]);

  // Filter patients list
  const filteredPatients = patients.filter((p) => {
    const relatedHh = households.find(h => h.id === p.householdId);
    const householdVillage = relatedHh ? relatedHh.village : '';
    
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (relatedHh && relatedHh.householdNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVillage = villageFilter === 'all' || householdVillage === villageFilter;
    
    let matchesType = true;
    if (typeFilter === 'pregnant') matchesType = p.isPregnant;
    else if (typeFilter === 'child') matchesType = p.isChild;
    else if (typeFilter === 'others') matchesType = !p.isPregnant && !p.isChild;

    return matchesSearch && matchesVillage && matchesType;
  });

  // Calculate cohort stats
  const pregnantCount = patients.filter(p => p.isPregnant).length;
  const childCount = patients.filter(p => p.isChild || p.age <= 12).length;

  // Handlers for Add/Edit Patient
  const handleOpenAdd = () => {
    setEditingId(null);
    if (households.length > 0) {
      setHouseholdId(households[0].id);
    } else {
      setHouseholdId('');
    }
    setName('');
    setAge(25);
    setGender('F');
    setRelationToHead('Self');
    setPhone('');
    setIsPregnant(false);
    setIsChild(false);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pt: AshaPatient, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(pt.id);
    setHouseholdId(pt.householdId);
    setName(pt.name);
    setAge(pt.age);
    setGender(pt.gender);
    setRelationToHead(pt.relationToHead);
    setPhone(pt.phone);
    setIsPregnant(pt.isPregnant);
    setIsChild(pt.isChild);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter the patient name.');
      return;
    }
    if (!householdId) {
      setFormError('Please select or create a household first.');
      return;
    }

    const selectedHh = households.find(h => h.id === householdId);
    const householdNum = selectedHh ? selectedHh.householdNumber : 'N/A';

    try {
      if (editingId) {
        await updatePatient(editingId, {
          householdId,
          householdNumber: householdNum,
          name,
          age: Number(age),
          gender,
          relationToHead,
          phone,
          isPregnant: gender === 'F' ? isPregnant : false,
          isChild: Number(age) <= 12 ? isChild : false
        });
        setSuccessMsg('Patient details updated successfully.');
      } else {
        const newPt = await addPatient({
          householdId,
          householdNumber: householdNum,
          name,
          age: Number(age),
          gender,
          relationToHead,
          phone,
          isPregnant: gender === 'F' ? isPregnant : false,
          isChild: Number(age) <= 12 ? isChild : false
        });
        setSuccessMsg('New patient registered successfully!');
        if (selectedPatient?.id === editingId) {
          setSelectedPatient(newPt);
        }
      }

      setIsFormOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setFormError('Failed to save patient.');
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this patient record? All visit journals will be unlinked.')) {
      try {
        await deletePatient(id);
        if (selectedPatient?.id === id) {
          setSelectedPatient(null);
          setSearchParams({});
        }
        await loadData();
        setSuccessMsg('Patient record removed.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        console.error(err);
        setSuccessMsg('Failed to delete patient record.');
      }
    }
  };

  const handleGenderAndAgeLogic = (selectedAge: number) => {
    setAge(selectedAge);
    if (selectedAge <= 12) {
      setIsChild(true);
      setIsPregnant(false);
    } else {
      setIsChild(false);
    }
  };

  // Quick In-Context Visit Logging for selectedPatient
  const handleQuickVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      await addVisit({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        visitDate,
        purpose: visitPurpose,
        symptoms: visitSymptoms || 'Routine field visit',
        bp: visitBp,
        weight: Number(visitWeight),
        referralNeeded: visitReferralNeeded,
        referralFacility: visitReferralNeeded ? visitReferralFacility : ''
      });

      setIsVisitModalOpen(false);
      await loadData();
      setSuccessMsg(`Visit recorded for ${selectedPatient.name}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMsg('Failed to record visit.');
    }
  };

  // Quick In-Context Medicine Logging for selectedPatient
  const handleQuickMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      await addMedicineIssueRecord({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        medicineName: medName,
        quantity: Number(medQty),
        dosageInstructions: medDosage,
        issueDate: new Date().toISOString().substring(0, 10)
      });

      setIsMedicineModalOpen(false);
      await loadData();
      setSuccessMsg(`Medicine issued to ${selectedPatient.name}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMsg('Failed to issue medicine.');
    }
  };

  // Select patient
  const handleSelectPatient = (pt: AshaPatient) => {
    setSelectedPatient(pt);
    setActiveTab('overview');
    setSearchParams({ id: pt.id });
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setSearchParams({});
  };

  // Profile-specific data filters
  const patientVisits = selectedPatient ? visits.filter(v => v.patientId === selectedPatient.id) : [];
  const patientMaternal = selectedPatient ? maternalRecords.filter(m => m.patientId === selectedPatient.id) : [];
  const patientImmunizations = selectedPatient ? immunizationRecords.filter(i => i.patientId === selectedPatient.id) : [];
  const patientNutrition = selectedPatient ? nutritionRecords.filter(n => n.patientId === selectedPatient.id) : [];
  const patientMedicines = selectedPatient ? medicineRecords.filter(m => m.patientId === selectedPatient.id) : [];
  const relatedHousehold = selectedPatient ? households.find(h => h.id === selectedPatient.householdId) : null;

  // Derive health statuses for selectedPatient
  const hasHighRiskMaternal = patientMaternal.some(m => m.highRiskFactors.length > 0 && !m.highRiskFactors.includes('None'));
  const hasSamNutrition = patientNutrition.some(n => n.samStatus || n.weightForAgeStatus === 'severe');
  const hasActiveReferral = patientVisits.some(v => v.referralNeeded);

  // Combine timeline events for selectedPatient
  const timelineEvents: any[] = [];
  patientVisits.forEach(v => {
    timelineEvents.push({
      id: v.id,
      date: v.visitDate,
      type: 'visit',
      title: `Field Visit (${v.purpose})`,
      detail: `${v.symptoms} • BP: ${v.bp} • Weight: ${v.weight}kg`,
      icon: Calendar,
      color: 'teal'
    });
  });
  patientMaternal.forEach(m => {
    timelineEvents.push({
      id: m.id,
      date: m.lastUpdated.split(' ')[0] || '2026-07-06',
      type: 'maternal',
      title: `Maternal ANC Assessment (${m.gestationalAgeWeeks} Weeks)`,
      detail: `EDD: ${m.edd} • ANC Visits: ${m.ancCount} • Risk: ${m.highRiskFactors.join(', ')}`,
      icon: Heart,
      color: 'rose'
    });
  });
  patientImmunizations.forEach(i => {
    timelineEvents.push({
      id: i.id,
      date: i.dateGiven,
      type: 'immunization',
      title: `Vaccine Given: ${i.vaccineName}`,
      detail: `Next due: ${i.nextDueDate} • Administered by: ${i.administeredBy}`,
      icon: Baby,
      color: 'sky'
    });
  });
  patientNutrition.forEach(n => {
    timelineEvents.push({
      id: n.id,
      date: n.lastUpdated.split(' ')[0] || '2026-07-06',
      type: 'nutrition',
      title: `Nutrition Assessment (${n.weightForAgeStatus.toUpperCase()})`,
      detail: `Group: ${n.ageGroup} • Thrust Areas: ${n.thrustAreas.join(', ')}`,
      icon: Apple,
      color: 'amber'
    });
  });
  patientMedicines.forEach(m => {
    timelineEvents.push({
      id: m.id,
      date: m.issueDate,
      type: 'medicine',
      title: `Medicine Issued: ${m.medicineName}`,
      detail: `Qty: ${m.quantity} • ${m.dosageInstructions}`,
      icon: Pill,
      color: 'indigo'
    });
  });

  // Sort timeline descending by date
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ==========================================
  // RENDER: PATIENT PROFILE VIEW
  // ==========================================
  if (selectedPatient) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-8">
        {/* Profile Header Navigation */}
        <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Patient List</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenEdit(selectedPatient)}
              className="text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(selectedPatient.id)}
              className="text-xs font-bold gap-1.5 text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Patient Profile Card Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 p-6 rounded-2xl text-white shadow-sm border border-teal-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border text-xl font-black ${
              selectedPatient.isPregnant ? 'bg-rose-500/20 border-rose-400/40 text-rose-200' :
              selectedPatient.isChild ? 'bg-sky-500/20 border-sky-400/40 text-sky-200' :
              'bg-teal-700/60 border-teal-500/40 text-teal-200'
            }`}>
              {selectedPatient.isPregnant ? <Heart className="w-7 h-7" /> :
               selectedPatient.isChild ? <Baby className="w-7 h-7" /> : <User className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{selectedPatient.name}</h1>
                <Badge variant="neutral" className="bg-teal-700/80 text-teal-100 border-teal-500/40 text-xs font-extrabold uppercase">
                  ID: {selectedPatient.id}
                </Badge>
                {selectedPatient.status === 'synced' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 border border-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full">
                    ● Pending Sync
                  </span>
                )}
              </div>

              <p className="text-xs text-teal-100/90 font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{selectedPatient.age} Years Old</span>
                <span>•</span>
                <span>Gender: {selectedPatient.gender === 'F' ? 'Female' : selectedPatient.gender === 'M' ? 'Male' : 'Other'}</span>
                <span>•</span>
                <span>Household: {selectedPatient.householdNumber}</span>
                {relatedHousehold && (
                  <>
                    <span>•</span>
                    <span>Village: {relatedHousehold.village}</span>
                  </>
                )}
              </p>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap pt-1.5">
                {hasHighRiskMaternal && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                    🔴 High Risk Pregnancy
                  </span>
                )}
                {hasSamNutrition && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider">
                    🟠 Severe Malnutrition (SAM)
                  </span>
                )}
                {hasActiveReferral && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-500 text-white uppercase tracking-wider">
                    🔵 Hospital Referral
                  </span>
                )}
                {!hasHighRiskMaternal && !hasSamNutrition && !hasActiveReferral && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-700/80 text-teal-100 border border-teal-500/30">
                    🟢 Normal / Stable
                  </span>
                )}

                {selectedPatient.isPregnant && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-200/20 text-rose-200 border border-rose-300/30">
                    🤰 Pregnant (ANC)
                  </span>
                )}
                {selectedPatient.isChild && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-200/20 text-sky-200 border border-sky-300/30">
                    👶 Infant / Child
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-end">
            <Button
              onClick={() => setIsVisitModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-teal-950 font-black gap-2 text-xs py-2.5 px-4 shadow-sm w-full md:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Record Visit</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-2xs overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('visits')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'visits'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Visits ({patientVisits.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('maternal')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'maternal'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Maternal Care ({patientMaternal.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('immunization')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'immunization'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>Child & Immunization ({patientImmunizations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'nutrition'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>Nutrition ({patientNutrition.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('medicines')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'medicines'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Medicines ({patientMedicines.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Details Card */}
              <Card className="lg:col-span-1 border border-slate-200/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600" />
                    <span>Basic Demographic Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Full Name</span>
                      <span className="font-extrabold text-slate-900">{selectedPatient.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Patient Identifier</span>
                      <span className="font-mono font-bold text-teal-700">{selectedPatient.id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Age & Gender</span>
                      <span className="font-bold text-slate-800">{selectedPatient.age} Y • {selectedPatient.gender}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Relation to Head</span>
                      <span className="font-bold text-slate-800">{selectedPatient.relationToHead}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Contact Phone</span>
                      <span className="font-mono font-bold text-slate-800">{selectedPatient.phone || 'No phone recorded'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Household Card</span>
                      <button
                        onClick={() => navigate('/asha/households')}
                        className="font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Home className="w-3 h-3" />
                        <span>{selectedPatient.householdNumber}</span>
                      </button>
                    </div>
                    {relatedHousehold && (
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 font-medium">Village Catchment</span>
                        <span className="font-bold text-slate-800">{relatedHousehold.village}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Panel */}
              <Card className="lg:col-span-2 border border-slate-200/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>EHR Direct Field Actions</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Log new clinical encounters directly to patient record
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setIsVisitModalOpen(true)}
                      className="p-3.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <p className="font-extrabold text-xs text-teal-950">Record Visit</p>
                      <p className="text-[10px] text-teal-700 font-medium mt-0.5">Log home visit encounter</p>
                    </button>

                    <button
                      onClick={() => navigate(`/asha/medicine?patientId=${selectedPatient.id}`)}
                      className="p-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Pill className="w-4 h-4" />
                      </div>
                      <p className="font-extrabold text-xs text-indigo-950">Issue Medicine</p>
                      <p className="text-[10px] text-indigo-700 font-medium mt-0.5">Dispense IFA / supplements</p>
                    </button>

                    <button
                      onClick={() => navigate(`/asha/maternal?patientId=${selectedPatient.id}`)}
                      className="p-3.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className="font-extrabold text-xs text-rose-950">Maternal ANC</p>
                      <p className="text-[10px] text-rose-700 font-medium mt-0.5">Update ANC checkup</p>
                    </button>

                    <button
                      onClick={() => navigate(`/asha/immunization?patientId=${selectedPatient.id}`)}
                      className="p-3.5 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Baby className="w-4 h-4" />
                      </div>
                      <p className="font-extrabold text-xs text-sky-950">Vaccination</p>
                      <p className="text-[10px] text-sky-700 font-medium mt-0.5">Log child vaccine dose</p>
                    </button>

                    <button
                      onClick={() => navigate(`/asha/nutrition?patientId=${selectedPatient.id}`)}
                      className="p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Apple className="w-4 h-4" />
                      </div>
                      <p className="font-extrabold text-xs text-amber-950">Nutrition Check</p>
                      <p className="text-[10px] text-amber-700 font-medium mt-0.5">Log weight & SAM status</p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patient Health Timeline */}
            <Card className="border border-slate-200/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Patient Encounter History & Timeline</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Chronological journal of field visits, prescriptions, and health logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timelineEvents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-600">No recent activity recorded for this patient yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use the "Record Visit" button above to log the first field encounter.</p>
                    <Button
                      onClick={() => setIsVisitModalOpen(true)}
                      size="sm"
                      className="mt-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Visit</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                    {timelineEvents.map((evt) => {
                      const IconComp = evt.icon;
                      return (
                        <div key={evt.id} className="flex gap-3 relative pl-8">
                          <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 border-2 border-white shadow-2xs ${
                            evt.color === 'teal' ? 'bg-teal-600' :
                            evt.color === 'rose' ? 'bg-rose-600' :
                            evt.color === 'sky' ? 'bg-sky-600' :
                            evt.color === 'amber' ? 'bg-amber-600' : 'bg-indigo-600'
                          }`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>

                          <div className="p-3 bg-slate-50/80 border border-slate-200/70 rounded-xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900">{evt.title}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 font-medium">{evt.detail}</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 shrink-0 bg-white px-2 py-1 rounded-md border border-slate-200">
                              {evt.date}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: VISITS */}
        {activeTab === 'visits' && (
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-teal-600" />
                  <span>Field Visit History</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Recorded home visits and clinical observations
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsVisitModalOpen(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Visit</span>
              </Button>
            </CardHeader>
            <CardContent>
              {patientVisits.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-600">No visits recorded yet for this patient.</p>
                  <Button
                    onClick={() => setIsVisitModalOpen(true)}
                    size="sm"
                    className="mt-3 bg-teal-700 text-white font-bold text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Visit</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientVisits.map((v) => (
                    <div key={v.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="teal" className="font-extrabold uppercase text-[10px]">
                            {v.purpose}
                          </Badge>
                          <span className="font-bold text-xs text-slate-900">{v.visitDate}</span>
                        </div>
                        {v.referralNeeded && (
                          <Badge variant="danger" className="text-[10px]">
                            Referral: {v.referralFacility || 'Hospital'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        <span className="font-bold text-slate-900">Symptoms/Obs:</span> {v.symptoms}
                      </p>
                      <div className="flex gap-4 text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                        <span>BP: {v.bp}</span>
                        <span>Weight: {v.weight} kg</span>
                        <span className="ml-auto text-slate-400">ID: {v.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: MATERNAL CARE */}
        {activeTab === 'maternal' && (
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-4.5 h-4.5 text-rose-600" />
                  <span>Maternal Health (ANC) Records</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Antenatal care checkups and pregnancy tracking
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate(`/asha/maternal?patientId=${selectedPatient.id}`)}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Maternal Register</span>
              </Button>
            </CardHeader>
            <CardContent>
              {patientMaternal.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-600">No maternal care records available for this patient.</p>
                  <p className="text-[11px] text-slate-400 mt-1">If this beneficiary is pregnant, update maternal status under Manage Maternal Register.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientMaternal.map((m) => (
                    <div key={m.id} className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-rose-900">Gestational Age: {m.gestationalAgeWeeks} Weeks</span>
                        <Badge variant="rose" className="text-[10px]">ANC Visits: {m.ancCount}</Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-rose-100">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">LMP Date</span>
                          <span className="font-bold text-slate-800">{m.lmpDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Expected Delivery (EDD)</span>
                          <span className="font-bold text-rose-700">{m.edd}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">High Risk Factors</span>
                          <span className="font-bold text-slate-800">{m.highRiskFactors.join(', ') || 'None'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 4: IMMUNIZATION */}
        {activeTab === 'immunization' && (
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Baby className="w-4.5 h-4.5 text-sky-600" />
                  <span>Pediatric Immunization Card</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Vaccination log and upcoming scheduled doses
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate(`/asha/immunization?patientId=${selectedPatient.id}`)}
                className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Vaccine Register</span>
              </Button>
            </CardHeader>
            <CardContent>
              {patientImmunizations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-600">No immunization records available for this patient.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientImmunizations.map((i) => (
                    <div key={i.id} className="p-4 bg-sky-50/50 border border-sky-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-sky-950">{i.vaccineName}</span>
                        <span className="text-[10px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                          Given: {i.dateGiven}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-600">
                        <span>Child Age: {i.childAgeMonths} Months</span>
                        <span>Next Due: <strong className="text-slate-900">{i.nextDueDate}</strong></span>
                        <span>Administered By: {i.administeredBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 5: NUTRITION */}
        {activeTab === 'nutrition' && (
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Apple className="w-4.5 h-4.5 text-amber-600" />
                  <span>Nutritional Status Register</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Weight-for-Age tracking, SAM screening, and supplementary rations
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate(`/asha/nutrition?patientId=${selectedPatient.id}`)}
                className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Nutrition Register</span>
              </Button>
            </CardHeader>
            <CardContent>
              {patientNutrition.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-600">No nutrition records available for this patient.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientNutrition.map((n) => (
                    <div key={n.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-950 uppercase">Group: {n.ageGroup}</span>
                        <Badge variant={n.weightForAgeStatus === 'normal' ? 'success' : 'warning'}>
                          Status: {n.weightForAgeStatus.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong className="text-slate-900">Thrust Areas:</strong> {n.thrustAreas.join(', ')}
                      </p>
                      {n.samStatus && (
                        <p className="p-2 bg-rose-100 text-rose-800 rounded text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Flagged as Severe Acute Malnutrition (SAM)</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 6: MEDICINES */}
        {activeTab === 'medicines' && (
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-4.5 h-4.5 text-indigo-600" />
                  <span>Medicine Dispensing History</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Record of IFA tablets, ORS, and essential medicines issued
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate(`/asha/medicine?patientId=${selectedPatient.id}`)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Medicine</span>
              </Button>
            </CardHeader>
            <CardContent>
              {patientMedicines.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-600">No medicine issue records for this patient.</p>
                  <Button
                    onClick={() => navigate(`/asha/medicine?patientId=${selectedPatient.id}`)}
                    size="sm"
                    className="mt-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Issue Medicine</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientMedicines.map((m) => (
                    <div key={m.id} className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-indigo-950">{m.medicineName}</span>
                        <span className="text-[10px] font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                          Issued: {m.issueDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        Qty: <strong>{m.quantity}</strong> • Dosage: {m.dosageInstructions}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* IN-CONTEXT MODAL 1: RECORD VISIT WORKFLOW */}
        {selectedPatient && (
          <RecordVisitWorkflow
            initialPatientId={selectedPatient.id}
            isOpen={isVisitModalOpen}
            onClose={() => setIsVisitModalOpen(false)}
            onSaveSuccess={() => {
              loadData();
              setSuccessMsg(`Visit recorded for ${selectedPatient.name}`);
              setTimeout(() => setSuccessMsg(null), 3000);
            }}
          />
        )}

        {/* IN-CONTEXT MODAL 2: ISSUE MEDICINE */}
        {isMedicineModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsMedicineModalOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-6 py-4 bg-indigo-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-indigo-300" />
                  <span>Issue Medicine to {selectedPatient.name}</span>
                </h3>
                <button onClick={() => setIsMedicineModalOpen(false)} className="text-indigo-200 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuickMedicineSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Medicine</label>
                  <select
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-white"
                  >
                    <option value="Iron-Folic Acid Tablets">Iron-Folic Acid Tablets (Maternal)</option>
                    <option value="IFA Syrup (Prophylactic)">IFA Syrup (Prophylactic Pediatric)</option>
                    <option value="ORS & Zinc Packets">ORS & Zinc Packets</option>
                    <option value="Paracetamol Syrup">Paracetamol Syrup 125mg</option>
                    <option value="Albendazole 400mg">Albendazole 400mg (Deworming)</option>
                    <option value="Calcium & Vitamin D3">Calcium & Vitamin D3 Tablets</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={medQty}
                      onChange={(e) => setMedQty(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Dosage Instructions</label>
                    <input
                      type="text"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsMedicineModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold">
                    Confirm Issue
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: PATIENT LIST VIEW
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Users className="w-4 h-4" />
            <span>Target Catchment Roster</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Patient Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Maintain clinical profiles, filter high-risk cases, and map beneficiaries to target villages.
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
            id="btn-register-patient"
            variant="primary" 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cohort overview widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Cohort</p>
              <h3 className="text-sm font-black text-slate-800">{patients.length} Registered</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Maternal (ANC)</p>
              <h3 className="text-sm font-black text-rose-700">{pregnantCount} Mothers</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pediatric Cohort</p>
              <h3 className="text-sm font-black text-teal-700">{childCount} Infants</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="border border-slate-200/80 shadow-2xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by patient name, ID, phone, or household card..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white text-slate-800"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Village:</span>
              <select
                value={villageFilter}
                onChange={(e) => setVillageFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Villages</option>
                <option value="Madukkarai">Madukkarai</option>
                <option value="Thondamuthur">Thondamuthur</option>
                <option value="Sulur">Sulur</option>
                <option value="Karamadai">Karamadai</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1 bg-slate-50/50">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Profiles</option>
                <option value="pregnant">Pregnant Mothers (ANC)</option>
                <option value="child">Infants/Children (0-12Y)</option>
                <option value="others">General Cohort</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Table (Desktop) / Cards (Mobile) */}
      <Card className="border border-slate-200/80 shadow-2xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900">Cohort Patient Registry</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Select any patient row to open full EHR Profile & Health History
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                  <th className="p-4">Patient Profile</th>
                  <th className="p-4">Household Link</th>
                  <th className="p-4">Relation</th>
                  <th className="p-4">Health Status Badges</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Sync</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPatients.map((pt) => {
                  const relativeHh = households.find(h => h.id === pt.householdId);
                  const villageName = relativeHh ? relativeHh.village : 'N/A';
                  
                  // Check high risk flags
                  const isHighRisk = maternalRecords.some(m => m.patientId === pt.id && m.highRiskFactors.length > 0 && !m.highRiskFactors.includes('None'));
                  const isSam = nutritionRecords.some(n => n.patientId === pt.id && (n.samStatus || n.weightForAgeStatus === 'severe'));

                  return (
                    <tr 
                      key={pt.id} 
                      onClick={() => handleSelectPatient(pt)}
                      className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            pt.isPregnant ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            pt.isChild ? 'bg-sky-50 text-sky-600 border border-sky-100' : 
                            'bg-teal-50 text-teal-700 border border-teal-100'
                          }`}>
                            {pt.isPregnant ? <Heart className="w-4 h-4" /> :
                             pt.isChild ? <Baby className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs group-hover:text-teal-800 transition-colors">
                              {pt.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              ID: {pt.id} • {pt.age}Y • {pt.gender}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-800">{pt.householdNumber}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{villageName}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-600">{pt.relationToHead}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {isHighRisk && (
                            <Badge variant="danger" className="bg-rose-100 text-rose-800 text-[10px] font-bold">
                              🔴 High Risk
                            </Badge>
                          )}
                          {isSam && (
                            <Badge variant="warning" className="bg-amber-100 text-amber-900 text-[10px] font-bold">
                              🟠 SAM
                            </Badge>
                          )}
                          {pt.isPregnant && (
                            <Badge variant="rose" className="bg-rose-50 text-rose-700 border-rose-100 text-[10px]">
                              Pregnant (ANC)
                            </Badge>
                          )}
                          {pt.isChild && (
                            <Badge variant="info" className="bg-sky-50 text-sky-700 border-sky-100 text-[10px]">
                              Child
                            </Badge>
                          )}
                          {!pt.isPregnant && !pt.isChild && !isHighRisk && !isSam && (
                            <span className="text-slate-400 font-medium text-[11px]">General Cohort</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-slate-600 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-300" />
                          {pt.phone || 'No phone'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={pt.status === 'synced' ? 'success' : 'warning'} className="text-[10px]">
                          {pt.status === 'synced' ? 'Synced' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => { e.stopPropagation(); handleSelectPatient(pt); }}
                            className="text-[11px] font-bold py-1 px-2.5 h-auto text-teal-800 bg-teal-50 hover:bg-teal-100 cursor-pointer"
                          >
                            View Profile
                          </Button>
                          <button 
                            onClick={(e) => handleOpenEdit(pt, e)}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Patient"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(pt.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Patient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <p className="text-xs font-bold text-slate-600">No patients found matching search query or filters.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setVillageFilter('all'); setTypeFilter('all'); }}
                        className="text-xs text-teal-700 underline font-bold mt-1 cursor-pointer"
                      >
                        Reset Search Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredPatients.map((pt) => {
              const relativeHh = households.find(h => h.id === pt.householdId);
              const villageName = relativeHh ? relativeHh.village : 'N/A';
              const isHighRisk = maternalRecords.some(m => m.patientId === pt.id && m.highRiskFactors.length > 0 && !m.highRiskFactors.includes('None'));
              const isSam = nutritionRecords.some(n => n.patientId === pt.id && (n.samStatus || n.weightForAgeStatus === 'severe'));

              return (
                <div 
                  key={pt.id}
                  onClick={() => handleSelectPatient(pt)}
                  className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        pt.isPregnant ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        pt.isChild ? 'bg-sky-50 text-sky-600 border border-sky-100' : 
                        'bg-teal-50 text-teal-700 border border-teal-100'
                      }`}>
                        {pt.isPregnant ? <Heart className="w-5 h-5" /> :
                         pt.isChild ? <Baby className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{pt.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">ID: {pt.id} • {pt.age}Y • {pt.gender}</p>
                      </div>
                    </div>

                    <Badge variant={pt.status === 'synced' ? 'success' : 'warning'} className="text-[10px]">
                      {pt.status === 'synced' ? 'Synced' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] uppercase block">Household</span>
                      <span className="font-bold text-slate-800">{pt.householdNumber} ({villageName})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] uppercase block">Contact</span>
                      <span className="font-mono text-slate-800">{pt.phone || 'No phone'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1">
                      {isHighRisk && <Badge variant="danger" className="text-[10px]">🔴 High Risk</Badge>}
                      {isSam && <Badge variant="warning" className="text-[10px]">🟠 SAM</Badge>}
                      {pt.isPregnant && <Badge variant="rose" className="text-[10px]">Pregnant</Badge>}
                      {pt.isChild && <Badge variant="info" className="text-[10px]">Child</Badge>}
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleSelectPatient(pt); }}
                      className="bg-teal-700 text-white font-bold text-xs gap-1 py-1 px-3"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredPatients.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-xs font-bold text-slate-600">No patients found matching search parameters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ADD/EDIT DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">{editingId ? 'Edit Patient Profile' : 'Register New Patient'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPatient} className="p-6 space-y-4">
              {formError && (
                <p className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {formError}
                </p>
              )}

              {households.length === 0 ? (
                <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 mb-2">No Households registered in cache!</p>
                  <p className="text-[11px] text-slate-400">Please add a household under Household Management first to associate the patient.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Associate Household Card</label>
                    <select
                      value={householdId}
                      onChange={(e) => setHouseholdId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                      required
                    >
                      <option value="">-- Select Household Card --</option>
                      {households.map(h => (
                        <option key={h.id} value={h.id}>{h.householdNumber} - Head: {h.headName} ({h.village})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Patient Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sunita Devi"
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Age (Years)</label>
                      <input 
                        type="number" 
                        min={0}
                        max={110}
                        value={age} 
                        onChange={(e) => handleGenderAndAgeLogic(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setGender(val);
                          if (val !== 'F') setIsPregnant(false);
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                      >
                        <option value="F">Female</option>
                        <option value="M">Male</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Relation to Family Head</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Wife, Son, Self"
                        value={relationToHead} 
                        onChange={(e) => setRelationToHead(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="+91 99000 00000"
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {gender === 'F' && age >= 13 && age <= 50 && (
                      <label className="flex items-center gap-3 border border-slate-100 rounded-xl p-3 bg-rose-50/30 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isPregnant}
                          onChange={(e) => setIsPregnant(e.target.checked)}
                          className="h-4.5 w-4.5 text-rose-600 rounded cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-rose-800 block">Beneficiary is Currently Pregnant</span>
                          <span className="text-[10px] text-rose-600/70 font-medium">Enroll in Maternal Health (ANC) and supplementary nutrition log.</span>
                        </div>
                      </label>
                    )}

                    {age <= 12 && (
                      <label className="flex items-center gap-3 border border-slate-100 rounded-xl p-3 bg-sky-50/30 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isChild}
                          onChange={(e) => setIsChild(e.target.checked)}
                          className="h-4.5 w-4.5 text-sky-600 rounded cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-sky-800 block">Register on Pediatric Immunization Card</span>
                          <span className="text-[10px] text-sky-600/70 font-medium">Qualifies child for standard BCG, Polio, and Pentavalent vaccine schedule alerts.</span>
                        </div>
                      </label>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={households.length === 0}>
                  {editingId ? 'Save Changes' : 'Register Patient'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

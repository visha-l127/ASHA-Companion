import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getPatients, 
  getHouseholds, 
  addVisit, 
  updateVisit, 
  AshaPatient, 
  Household, 
  VisitRecord, 
  isOfflineModeEnabled 
} from './localAshaHelper';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { 
  Calendar, 
  User, 
  Home, 
  Heart, 
  Baby, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  ArrowLeft, 
  X, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Check, 
  Clock, 
  FileText, 
  Building2, 
  Pill, 
  Apple, 
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';

interface RecordVisitWorkflowProps {
  initialPatientId?: string;
  editingVisit?: VisitRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: (savedVisit: VisitRecord) => void;
}

export default function RecordVisitWorkflow({
  initialPatientId,
  editingVisit,
  isOpen,
  onClose,
  onSaveSuccess
}: RecordVisitWorkflowProps) {
  const navigate = useNavigate();

  // All patients and households
  const [patients, setPatients] = useState<AshaPatient[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);

  // Step state (1: Details, 2: Assessment, 3: Actions, 4: Review)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [purpose, setPurpose] = useState<'General' | 'ANC' | 'Immunization' | 'Newborn Care' | 'NCD Follow-up'>('General');
  const [locationType, setLocationType] = useState<'Home Visit' | 'Anganwadi Center' | 'Sub-Center / PHC'>('Home Visit');
  
  // Health Assessment
  const [symptoms, setSymptoms] = useState<string>('');
  const [bp, setBp] = useState<string>('120/80 mmHg');
  const [weight, setWeight] = useState<number>(60);

  // Actions & Follow-up
  const [followUpNeeded, setFollowUpNeeded] = useState<boolean>(false);
  const [followUpDate, setFollowUpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().substring(0, 10);
  });
  const [referralNeeded, setReferralNeeded] = useState<boolean>(false);
  const [referralFacility, setReferralFacility] = useState<string>('Madukkarai PHC (Block Level)');
  const [referralReason, setReferralReason] = useState<string>('High Risk Screening & Evaluation');

  // Validation & Error Handling
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Load patient context
  useEffect(() => {
    if (!isOpen) return;

    const loadDataAsync = async () => {
      try {
        const pts = await getPatients();
        const hhs = await getHouseholds();
        setPatients(pts);
        setHouseholds(hhs);

        if (editingVisit) {
          setSelectedPatientId(editingVisit.patientId);
          setVisitDate(editingVisit.visitDate);
          setPurpose(editingVisit.purpose);
          setSymptoms(editingVisit.symptoms);
          setBp(editingVisit.bp);
          setWeight(editingVisit.weight);
          setReferralNeeded(editingVisit.referralNeeded);
          setReferralFacility(editingVisit.referralFacility || 'Madukkarai PHC (Block Level)');
          setStep(1);
        } else {
          const pid = initialPatientId || (pts.length > 0 ? pts[0].id : '');
          setSelectedPatientId(pid);
          
          // Auto-set purpose based on patient demographic
          const matched = pts.find(p => p.id === pid);
          if (matched) {
            if (matched.isPregnant) setPurpose('ANC');
            else if (matched.isChild) setPurpose('Immunization');
            else setPurpose('General');
          } else {
            setPurpose('General');
          }

          setVisitDate(new Date().toISOString().substring(0, 10));
          setSymptoms('');
          setBp('120/80 mmHg');
          setWeight(60);
          setReferralNeeded(false);
          setFollowUpNeeded(false);
          setStep(1);
        }
      } catch (err) {
        console.error('Error loading data in visit workflow:', err);
      }
    };

    loadDataAsync();

    setErrorMsg(null);
    setIsSaved(false);
    setSavedSuccessMessage(null);
  }, [isOpen, initialPatientId, editingVisit]);

  if (!isOpen) return null;

  // Selected Patient object
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const relatedHousehold = selectedPatient ? households.find(h => h.id === selectedPatient.householdId) : null;

  // Auto-fill symptoms when quick symptom chips are tapped
  const handleAddSymptomChip = (chipText: string) => {
    if (!symptoms.trim()) {
      setSymptoms(chipText);
    } else if (!symptoms.includes(chipText)) {
      setSymptoms(`${symptoms.trim()} • ${chipText}`);
    }
  };

  // Quick symptom chips options by visit purpose
  const getSymptomChips = () => {
    switch (purpose) {
      case 'ANC':
        return [
          'Routine ANC checkup',
          'Normal fetal movement',
          'Mild nausea',
          'Swelling / Edema',
          'Hemoglobin / Anemia checked',
          'Advised IFA & Calcium'
        ];
      case 'Immunization':
        return [
          'Vaccine dose administered',
          'Healthy active child',
          'Mild fever post-vaccine',
          'Weight check normal',
          'Breastfeeding adequate'
        ];
      case 'Newborn Care':
        return [
          'Postnatal PNC Day check',
          'Umbilical cord clean',
          'Breastfeeding well',
          'No jaundice signs',
          'Baby weight check ok'
        ];
      case 'NCD Follow-up':
        return [
          'Routine BP check',
          'Blood sugar screening',
          'Regular medicine compliance',
          'Mild dizziness',
          'Lifestyle & diet advised'
        ];
      case 'General':
      default:
        return [
          'Routine home visit',
          'Fever / Cough reported',
          'General weakness',
          'Vitals stable',
          'Health education provided'
        ];
    }
  };

  // Handle step transitions with validation
  const handleNextStep = () => {
    setErrorMsg(null);

    if (step === 1) {
      if (!selectedPatientId) {
        setErrorMsg('Please select a patient to record the visit.');
        return;
      }
      if (!visitDate) {
        setErrorMsg('Please enter a valid visit date.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!symptoms.trim()) {
        setErrorMsg('Please describe clinical observations or select a quick symptom tag.');
        return;
      }
      if (!bp.trim()) {
        setErrorMsg('Please enter blood pressure reading.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (referralNeeded && !referralFacility) {
        setErrorMsg('Please select a referral hospital facility.');
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep((step - 1) as any);
    } else {
      handleCloseRequest();
    }
  };

  // Close request with draft check
  const handleCloseRequest = () => {
    const isDirty = symptoms.trim() !== '' || referralNeeded || followUpNeeded;
    if (isDirty && !isSaved) {
      setShowConfirmLeave(true);
    } else {
      onClose();
    }
  };

  // Submit and Save Visit
  const handleFinalSave = async () => {
    if (!selectedPatient) {
      setErrorMsg('Patient information missing.');
      return;
    }

    // Prepare symptoms payload including follow-up notes if applicable
    let finalSymptoms = symptoms.trim();
    if (followUpNeeded) {
      finalSymptoms += ` [Follow-up scheduled for ${followUpDate}]`;
    }

    const isOffline = isOfflineModeEnabled();

    let savedResult: VisitRecord;

    try {
      if (editingVisit) {
        await updateVisit(editingVisit.id, {
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          visitDate,
          purpose,
          symptoms: finalSymptoms,
          bp,
          weight: Number(weight),
          referralNeeded,
          referralFacility: referralNeeded ? referralFacility : ''
        });
        savedResult = {
          ...editingVisit,
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          visitDate,
          purpose,
          symptoms: finalSymptoms,
          bp,
          weight: Number(weight),
          referralNeeded,
          referralFacility: referralNeeded ? referralFacility : '',
          lastUpdated: new Date().toISOString()
        } as VisitRecord;
      } else {
        savedResult = (await addVisit({
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          visitDate,
          purpose,
          symptoms: finalSymptoms,
          bp,
          weight: Number(weight),
          referralNeeded,
          referralFacility: referralNeeded ? referralFacility : ''
        })) as VisitRecord;
      }

      setIsSaved(true);
      const msg = isOffline 
        ? '✓ Visit saved on this device • Pending sync' 
        : '✓ Visit recorded successfully';
      setSavedSuccessMessage(msg);

      if (onSaveSuccess) {
        onSaveSuccess(savedResult);
      }

      setTimeout(() => {
        onClose();
        // If initialized with initialPatientId, navigate to Patient Profile to ensure timeline updates
        if (initialPatientId) {
          navigate(`/asha/patients?id=${initialPatientId}`);
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to record visit.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={handleCloseRequest}
      />

      {/* Main Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* HEADER BAR */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white flex items-center justify-between shrink-0 border-b border-teal-700/60">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCloseRequest}
              className="w-8 h-8 rounded-full bg-teal-800/80 hover:bg-teal-700 flex items-center justify-center text-teal-100 hover:text-white transition-colors cursor-pointer"
              title="Return / Close"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm text-white tracking-tight">Record Visit</h2>
                {isOfflineModeEnabled() ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full">
                    <WifiOff className="w-3 h-3" /> Offline
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    <Wifi className="w-3 h-3" /> Online
                  </span>
                )}
              </div>
              {selectedPatient && (
                <p className="text-[11px] text-teal-100/90 font-medium truncate max-w-xs">
                  Patient: <strong className="text-white">{selectedPatient.name}</strong> ({selectedPatient.id})
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseRequest}
            className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between gap-1 text-xs max-w-lg mx-auto">
            {/* Step 1 */}
            <div 
              onClick={() => step > 1 && setStep(1)}
              className={`flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
                step === 1 ? 'text-teal-700 font-extrabold' : step > 1 ? 'text-teal-900' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                step === 1 ? 'bg-teal-700 text-white' : step > 1 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
              </span>
              <span className="hidden sm:inline">Details</span>
            </div>

            <div className={`h-0.5 flex-1 mx-1 ${step >= 2 ? 'bg-teal-600' : 'bg-slate-200'}`} />

            {/* Step 2 */}
            <div 
              onClick={() => step > 2 && setStep(2)}
              className={`flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
                step === 2 ? 'text-teal-700 font-extrabold' : step > 2 ? 'text-teal-900' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                step === 2 ? 'bg-teal-700 text-white' : step > 2 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
              </span>
              <span className="hidden sm:inline">Assessment</span>
            </div>

            <div className={`h-0.5 flex-1 mx-1 ${step >= 3 ? 'bg-teal-600' : 'bg-slate-200'}`} />

            {/* Step 3 */}
            <div 
              onClick={() => step > 3 && setStep(3)}
              className={`flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
                step === 3 ? 'text-teal-700 font-extrabold' : step > 3 ? 'text-teal-900' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                step === 3 ? 'bg-teal-700 text-white' : step > 3 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > 3 ? <Check className="w-3 h-3 stroke-[3]" /> : '3'}
              </span>
              <span className="hidden sm:inline">Actions</span>
            </div>

            <div className={`h-0.5 flex-1 mx-1 ${step === 4 ? 'bg-teal-600' : 'bg-slate-200'}`} />

            {/* Step 4 */}
            <div 
              className={`flex items-center gap-1.5 font-bold transition-colors ${
                step === 4 ? 'text-teal-700 font-extrabold' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                step === 4 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                4
              </span>
              <span className="hidden sm:inline">Review</span>
            </div>
          </div>
        </div>

        {/* ERROR / SUCCESS NOTIFICATION BANNER */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in duration-150">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {savedSuccessMessage && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in duration-150">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{savedSuccessMessage}</span>
          </div>
        )}

        {/* BODY CONTENT AREA */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">

          {/* ========================================================= */}
          {/* STEP 1: VISIT DETAILS */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Patient Banner */}
              <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider block">Target Beneficiary</span>
                  {selectedPatient ? (
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{selectedPatient.name}</h3>
                      <p className="text-[11px] text-slate-600 font-medium flex flex-wrap items-center gap-2 mt-0.5">
                        <span>ID: <strong>{selectedPatient.id}</strong></span>
                        <span>•</span>
                        <span>{selectedPatient.age} Y / {selectedPatient.gender}</span>
                        <span>•</span>
                        <span>HH: <strong>{selectedPatient.householdNumber}</strong></span>
                        {relatedHousehold && (
                          <>
                            <span>•</span>
                            <span>{relatedHousehold.village}</span>
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <select
                        value={selectedPatientId}
                        onChange={(e) => {
                          setSelectedPatientId(e.target.value);
                          const p = patients.find(pat => pat.id === e.target.value);
                          if (p) {
                            if (p.isPregnant) setPurpose('ANC');
                            else if (p.isChild) setPurpose('Immunization');
                            else setPurpose('General');
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                      >
                        {patients.map((p, idx) => (
                          <option key={`pat-opt-${p.id || idx}-${idx}`} value={p.id}>{p.name} (ID: {p.id})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedPatient && (
                  <div className="shrink-0 flex items-center gap-1.5">
                    {selectedPatient.isPregnant && (
                      <Badge variant="rose" className="text-[10px] font-extrabold">🤰 Pregnant</Badge>
                    )}
                    {selectedPatient.isChild && (
                      <Badge variant="info" className="text-[10px] font-extrabold">👶 Child</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                    Visit Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                    Encounter Location
                  </label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
                  >
                    <option value="Home Visit">🏠 Home Visit (Field Work)</option>
                    <option value="Anganwadi Center">🏫 Anganwadi Center (AWC)</option>
                    <option value="Sub-Center / PHC">🏥 Sub-Center / PHC Outpost</option>
                  </select>
                </div>
              </div>

              {/* Select Visit Purpose / Type */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Select Visit Category / Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* General */}
                  <button
                    type="button"
                    onClick={() => setPurpose('General')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      purpose === 'General'
                        ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      purpose === 'General' ? 'bg-teal-800 text-white' : 'bg-teal-100 text-teal-700'
                    }`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">General Checkup</p>
                      <p className={`text-[10px] ${purpose === 'General' ? 'text-teal-100' : 'text-slate-500'}`}>
                        Routine home visit & illness follow-up
                      </p>
                    </div>
                  </button>

                  {/* ANC Maternal */}
                  <button
                    type="button"
                    onClick={() => setPurpose('ANC')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      purpose === 'ANC'
                        ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      purpose === 'ANC' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-700'
                    }`}>
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">Maternal Care (ANC)</p>
                      <p className={`text-[10px] ${purpose === 'ANC' ? 'text-rose-100' : 'text-slate-500'}`}>
                        Prenatal checkup & IFA monitoring
                      </p>
                    </div>
                  </button>

                  {/* Immunization */}
                  <button
                    type="button"
                    onClick={() => setPurpose('Immunization')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      purpose === 'Immunization'
                        ? 'bg-sky-700 text-white border-sky-800 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      purpose === 'Immunization' ? 'bg-sky-800 text-white' : 'bg-sky-100 text-sky-700'
                    }`}>
                      <Baby className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">Child Immunization</p>
                      <p className={`text-[10px] ${purpose === 'Immunization' ? 'text-sky-100' : 'text-slate-500'}`}>
                        Vaccination & pediatric growth
                      </p>
                    </div>
                  </button>

                  {/* Newborn Care */}
                  <button
                    type="button"
                    onClick={() => setPurpose('Newborn Care')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      purpose === 'Newborn Care'
                        ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      purpose === 'Newborn Care' ? 'bg-teal-800 text-white' : 'bg-teal-100 text-teal-700'
                    }`}>
                      <Baby className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">Newborn Care (PNC)</p>
                      <p className={`text-[10px] ${purpose === 'Newborn Care' ? 'text-teal-100' : 'text-slate-500'}`}>
                        Postnatal & infant health check
                      </p>
                    </div>
                  </button>

                  {/* NCD Screening */}
                  <button
                    type="button"
                    onClick={() => setPurpose('NCD Follow-up')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 sm:col-span-2 ${
                      purpose === 'NCD Follow-up'
                        ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      purpose === 'NCD Follow-up' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">NCD Screening Follow-up</p>
                      <p className={`text-[10px] ${purpose === 'NCD Follow-up' ? 'text-amber-100' : 'text-slate-500'}`}>
                        Hypertension & Diabetes sugar monitoring
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: HEALTH ASSESSMENT */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Purpose Banner */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">Category: <strong className="text-teal-800">{purpose}</strong></span>
                <span className="text-[11px] text-slate-500 font-medium">Patient: <strong>{selectedPatient?.name}</strong></span>
              </div>

              {/* Quick Symptom Chips */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                  ⚡ Quick Observations Tagging (Tap to Add)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {getSymptomChips().map((chip, idx) => (
                    <button
                      key={`${chip}-${idx}`}
                      type="button"
                      onClick={() => handleAddSymptomChip(chip)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>+</span>
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms / Clinical Findings Box */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                  Clinical Observations & Findings <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Record patient complaints, symptoms, physical signs, or advice provided..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none"
                  required
                />
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                    Blood Pressure (BP) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80 mmHg"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                    Weight (Kg) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    placeholder="60"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    required
                  />
                </div>
              </div>

              {/* Module Shortcuts */}
              {purpose === 'ANC' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-rose-900 font-bold text-[11px]">Need to record full gestational & ANC register?</span>
                  <button
                    type="button"
                    onClick={() => navigate('/asha/maternal')}
                    className="text-xs font-black text-rose-700 underline hover:text-rose-900 shrink-0 cursor-pointer"
                  >
                    Open ANC Register →
                  </button>
                </div>
              )}

              {purpose === 'Immunization' && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-sky-900 font-bold text-[11px]">Need to mark specific vaccine dose administered?</span>
                  <button
                    type="button"
                    onClick={() => navigate('/asha/immunization')}
                    className="text-xs font-black text-sky-700 underline hover:text-sky-900 shrink-0 cursor-pointer"
                  >
                    Open Vaccine Register →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: ACTIONS TAKEN & FOLLOW-UP */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Follow-up Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">Follow-up Home Visit Required?</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Schedule next field visit for this beneficiary</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFollowUpNeeded(false)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                        !followUpNeeded ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setFollowUpNeeded(true)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                        followUpNeeded ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {followUpNeeded && (
                  <div className="pt-2 border-t border-slate-200/80 animate-in fade-in duration-150">
                    <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                      Scheduled Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                )}
              </div>

              {/* Referral Section */}
              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-rose-950 text-xs">High-Risk Escalation / PHC Referral?</h4>
                      <p className="text-[10px] text-rose-700 font-medium">Flag for ANM & PHC Doctor attention</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReferralNeeded(false)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                        !referralNeeded ? 'bg-slate-800 text-white' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setReferralNeeded(true)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                        referralNeeded ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Yes (Refer)
                    </button>
                  </div>
                </div>

                {referralNeeded && (
                  <div className="pt-2 border-t border-rose-200 space-y-3 animate-in fade-in duration-150">
                    <div>
                      <label className="text-[10px] font-extrabold text-rose-900 uppercase tracking-wider block mb-1">
                        Select Referral Facility <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={referralFacility}
                        onChange={(e) => setReferralFacility(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-rose-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 cursor-pointer"
                      >
                        <option value="Madukkarai PHC (Block Level)">Madukkarai PHC (Block Level)</option>
                        <option value="Sulur Primary Health Centre">Sulur Primary Health Centre</option>
                        <option value="District General Hospital Coimbatore">District General Hospital Coimbatore</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-rose-900 uppercase tracking-wider block mb-1">
                        Referral Reason / Instructions
                      </label>
                      <input
                        type="text"
                        value={referralReason}
                        onChange={(e) => setReferralReason(e.target.value)}
                        placeholder="e.g. High BP evaluation / Specialist evaluation required"
                        className="w-full px-3.5 py-2.5 bg-white border border-rose-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Medicine Note Link */}
              <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-extrabold text-slate-800 text-xs">Need to issue IFA / Paracetamol tablets?</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/asha/medicine')}
                  className="text-xs font-black text-teal-700 underline hover:text-teal-900 shrink-0 cursor-pointer"
                >
                  Issue Medicine →
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: REVIEW BEFORE SAVE */}
          {/* ========================================================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl flex items-center gap-2 font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Please review the visit details below before confirming.</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                {/* Patient Header */}
                <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Patient</span>
                    <h3 className="text-sm font-black text-slate-900">{selectedPatient?.name}</h3>
                    <p className="text-[11px] text-slate-500 font-bold">ID: {selectedPatient?.id} • Household: {selectedPatient?.householdNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {/* Visit Details */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Visit Date</span>
                    <p className="font-bold text-slate-800">{visitDate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Category / Purpose</span>
                    <p className="font-bold text-teal-800">{purpose}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Encounter Spot</span>
                    <p className="font-bold text-slate-800">{locationType}</p>
                  </div>
                </div>

                {/* Clinical Assessment */}
                <div className="pb-3 border-b border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Clinical Observations</span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                    "{symptoms}"
                  </p>
                  <div className="flex gap-4 pt-1 text-slate-600 font-bold">
                    <span>BP: {bp}</span>
                    <span>Weight: {weight} kg</span>
                  </div>
                </div>

                {/* Actions & Referral */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Actions & Follow-up</span>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-1 pt-1">
                    <p className="font-bold text-slate-800">
                      Follow-up: {followUpNeeded ? `Yes (Scheduled for ${followUpDate})` : 'No'}
                    </p>
                    <p className="font-bold text-slate-800">
                      Referral Escalation: {referralNeeded ? `Yes (${referralFacility})` : 'None Required'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* STICKY BOTTOM ACTION BAR (MOBILE-FIRST) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            className="font-bold text-xs gap-1 py-2.5 px-4 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </Button>

          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs gap-1.5 py-2.5 px-5 cursor-pointer shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSave}
              disabled={isSaved}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs gap-2 py-2.5 px-6 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isOfflineModeEnabled() ? 'Save Visit (Offline)' : 'Confirm & Save Visit'}</span>
            </Button>
          )}
        </div>

      </div>

      {/* CONFIRM LEAVE MODAL */}
      {showConfirmLeave && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Leave this visit?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                You have unsaved visit observations. Exiting now will discard these entry changes.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfirmLeave(false)}
                className="text-xs font-bold"
              >
                Stay & Continue
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowConfirmLeave(false);
                  onClose();
                }}
                className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold"
              >
                Discard & Leave
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

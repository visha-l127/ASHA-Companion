import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, Badge, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { ehrRecordApi } from '../../utils/apiClient';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  User, 
  ShieldAlert, 
  Check, 
  Clock, 
  AlertTriangle,
  FileText,
  AlertCircle,
  X,
  Send,
  Building2,
  MapPin,
  RotateCcw,
  UserCheck
} from 'lucide-react';

export default function SupervisorPatientMonitoring() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  
  // Selected record modal & action states
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await ehrRecordApi.getAll();
      const mapped = (data || []).map((r: any) => ({
        ...r,
        id: r.recordId
      }));
      setRecords(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  // Summary Metrics
  const totalRecords = records.length;
  const pendingReviewCount = records.filter(r => !r.verificationStatus || r.verificationStatus === 'pending').length;
  const verifiedCount = records.filter(r => r.verificationStatus === 'verified').length;
  const correctionRequestedCount = records.filter(r => r.verificationStatus === 'correction_requested').length;

  // Filtered dataset
  const filteredRecords = records.filter((rec) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      rec.patientName?.toLowerCase().includes(query) ||
      rec.village?.toLowerCase().includes(query) ||
      rec.phcFacility?.toLowerCase().includes(query) ||
      rec.ashaName?.toLowerCase().includes(query) ||
      rec.type?.toLowerCase().includes(query) ||
      rec.recordId?.toLowerCase().includes(query);

    const status = rec.verificationStatus || 'pending';
    const matchesVerification =
      verificationFilter === 'all' ||
      (verificationFilter === 'pending' && status === 'pending') ||
      (verificationFilter === 'verified' && status === 'verified') ||
      (verificationFilter === 'correction_requested' && status === 'correction_requested');

    const isHighRisk = rec.type === 'maternal' || rec.diagnosis?.toLowerCase().includes('high risk') || rec.diagnosis?.toLowerCase().includes('severe');
    const matchesRisk =
      riskFilter === 'all' ||
      (riskFilter === 'high_risk' && isHighRisk) ||
      (riskFilter === 'normal' && !isHighRisk);

    return matchesSearch && matchesVerification && matchesRisk;
  });

  const handleVerifyConfirm = async () => {
    if (!selectedRecord) return;
    const verifierName = user?.name || 'Dr. Ramesh Patel';
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    try {
      await ehrRecordApi.update(selectedRecord.recordId, {
        verificationStatus: 'verified',
        verifiedBy: verifierName,
        verifiedAt: nowStr
      });
      
      setFeedbackMsg({ type: 'success', text: '✓ Record verified successfully' });
      setTimeout(() => setFeedbackMsg(null), 3000);

      setSelectedRecord({
        ...selectedRecord,
        verificationStatus: 'verified',
        verifiedBy: verifierName,
        verifiedAt: nowStr,
      });

      setShowVerifyConfirm(false);
      loadRecords();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionNote.trim()) {
      setCorrectionError('Please provide a correction reason.');
      return;
    }
    if (!selectedRecord) return;

    const verifierName = user?.name || 'Dr. Ramesh Patel';
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    try {
      await ehrRecordApi.update(selectedRecord.recordId, {
        verificationStatus: 'correction_requested',
        verifiedBy: verifierName,
        verifiedAt: nowStr,
        correctionNote: correctionNote
      });

      setFeedbackMsg({ type: 'success', text: '✓ Correction request sent' });
      setTimeout(() => setFeedbackMsg(null), 3500);

      setSelectedRecord({
        ...selectedRecord,
        verificationStatus: 'correction_requested',
        verifiedBy: verifierName,
        verifiedAt: nowStr,
        correctionNote: correctionNote,
      });

      setShowCorrectionForm(false);
      setCorrectionNote('');
      setCorrectionError(null);
      loadRecords();
    } catch (e) {
      console.error(e);
    }
  };

  const renderVerificationBadge = (rec: any) => {
    const status = rec.verificationStatus || 'pending';
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>✓ Verified</span>
        </span>
      );
    }
    if (status === 'correction_requested') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold">
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span>↻ Correction Requested</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>⚠ Pending Review</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Records"
        description="Review and verify health records submitted by ASHA Workers."
        breadcrumbs={[
          { label: 'Dashboard', to: '/supervisor/dashboard' },
          { label: 'Patient Records' }
        ]}
      />

      {/* Global Success Feedback Banner */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Summary Queue */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Records</p>
            <h3 className="text-xl font-black text-slate-800 mt-1">{totalRecords}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Logged in PHC Area</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pending Review</p>
            <h3 className="text-xl font-black text-amber-900 mt-1">{pendingReviewCount}</h3>
            <p className="text-[10px] text-amber-700 mt-0.5 font-medium">
              {pendingReviewCount > 0 ? `${pendingReviewCount} records require attention` : '✓ No records pending review'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Verified Records</p>
            <h3 className="text-xl font-black text-emerald-900 mt-1">{verifiedCount}</h3>
            <p className="text-[10px] text-emerald-700 mt-0.5">Approved Health Data</p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/30">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Correction Requested</p>
            <h3 className="text-xl font-black text-rose-900 mt-1">{correctionRequestedCount}</h3>
            <p className="text-[10px] text-rose-700 mt-0.5">Returned to ASHA</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Status Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by patient name, ID, ASHA worker, record type, or village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500 font-bold uppercase">Status:</span>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Records</option>
                <option value="pending">Pending Review</option>
                <option value="verified">Verified</option>
                <option value="correction_requested">Correction Requested</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Risk Flag:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Risk Levels</option>
                <option value="high_risk">High Risk Flagged</option>
                <option value="normal">Standard Risk</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table / Mobile Cards List */}
      <Card className="overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Patient Details</th>
                <th className="px-5 py-3.5">Record Type</th>
                <th className="px-5 py-3.5">Submitted By</th>
                <th className="px-5 py-3.5">Clinical Overview</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Primary Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec, idx) => {
                  const isHighRisk = rec.data?.riskStatus === 'high' || rec.data?.highRisk;
                  return (
                    <tr key={`supervisor-rec-row-${rec.id || idx}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-extrabold text-slate-800">{rec.patientName || 'Patient Record'}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {rec.id} • {rec.patientAge ? `${rec.patientAge}y/${rec.patientGender}` : 'Record Entry'} • {rec.village || 'Madukkarai'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="neutral" className="text-[10px] uppercase font-bold tracking-wider">
                          {rec.type || 'General Visit'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-700">ASHA: {rec.ashaName || 'Priya'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{rec.lastUpdated || rec.timestamp}</p>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {isHighRisk && (
                            <Badge variant="danger" className="text-[9px] uppercase font-bold">High Risk</Badge>
                          )}
                        </div>
                        <p className="text-slate-600 truncate text-[11px] font-medium">{rec.diagnosis || 'Standard checkup recorded'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        {renderVerificationBadge(rec)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setSelectedRecord(rec);
                            setShowVerifyConfirm(false);
                            setShowCorrectionForm(false);
                            setCorrectionNote('');
                            setCorrectionError(null);
                          }}
                          className="text-xs font-bold text-teal-700 border-teal-200 hover:bg-teal-50"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    <FileText className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No patient records found.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different term or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Responsive Cards */}
        <div className="block md:hidden divide-y divide-slate-100 bg-white">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((rec, idx) => {
              return (
                <div key={`m-rec-card-${rec.id || idx}-${idx}`} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">{rec.patientName || 'Patient Record'}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ID: {rec.id} • {rec.type || 'Visit'}
                      </p>
                    </div>
                    <div>{renderVerificationBadge(rec)}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span>Submitted by ASHA: <strong>{rec.ashaName || 'Priya'}</strong></span>
                    <span className="font-mono text-[10px] text-slate-400">{rec.lastUpdated || rec.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setSelectedRecord(rec);
                        setShowVerifyConfirm(false);
                        setShowCorrectionForm(false);
                        setCorrectionNote('');
                        setCorrectionError(null);
                      }}
                      className="w-full text-xs font-bold text-teal-700 border-teal-200 py-2"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Review Record
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 font-medium">
              <p className="text-xs font-bold text-slate-600">No patient records found.</p>
            </div>
          )}
        </div>
      </Card>

      {/* RECORD DETAIL / READ-ONLY REVIEW MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">{selectedRecord.patientName || 'Patient Record'}</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Record ID: {selectedRecord.id} • Read-Only Clinical Review
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setShowVerifyConfirm(false);
                  setShowCorrectionForm(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Verification Status Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 bg-slate-50/70">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Status</p>
                  <div className="mt-1">
                    {renderVerificationBadge(selectedRecord)}
                  </div>
                </div>
                {selectedRecord.verifiedBy && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviewed By</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedRecord.verifiedBy}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{selectedRecord.verifiedAt}</p>
                  </div>
                )}
              </div>

              {/* Patient Information Section */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1">
                  1. Patient Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{selectedRecord.patientName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Patient ID</p>
                    <p className="font-extrabold text-slate-800 font-mono mt-0.5">{selectedRecord.id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Age / Gender</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">
                      {selectedRecord.patientAge ? `${selectedRecord.patientAge} Yrs / ${selectedRecord.patientGender || 'F'}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Village / Sector</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{selectedRecord.village || 'Madukkarai'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Household</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{selectedRecord.householdId || 'HH-014'}</p>
                  </div>
                </div>
              </div>

              {/* Record & Submission Information */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1">
                  2. Record & Submission Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Record Type</p>
                    <p className="font-extrabold text-slate-800 mt-0.5 capitalize">{selectedRecord.type || 'General Visit'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Submitted By (ASHA)</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{selectedRecord.ashaName || 'Priya'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Submission Date</p>
                    <p className="font-extrabold text-slate-800 mt-0.5 font-mono">{selectedRecord.lastUpdated || selectedRecord.timestamp}</p>
                  </div>
                </div>
              </div>

              {/* Clinical/Health Information - Strictly Read Only */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1">
                  3. Clinical & Health Information (Read-Only)
                </h4>
                
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Diagnosis / Clinical Findings:</span>
                    <p className="text-slate-800 font-bold leading-relaxed mt-0.5">
                      {selectedRecord.diagnosis || 'Standard health screening entry recorded.'}
                    </p>
                  </div>

                  {selectedRecord.treatment && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Treatment / Advised Action:</span>
                      <p className="text-slate-700 font-medium leading-relaxed mt-0.5">{selectedRecord.treatment}</p>
                    </div>
                  )}

                  {selectedRecord.data && (
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                      {Object.entries(selectedRecord.data).map(([k, v]) => {
                        if (typeof v === 'object' || k === 'highRisk') return null;
                        return (
                          <div key={`rec-data-field-${k}`} className="bg-white p-2 border border-slate-150 rounded-lg">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">{k.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-extrabold text-slate-800">{String(v)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Correction Note Display if already present */}
              {selectedRecord.correctionNote && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Active Correction Instructions:</span>
                  </div>
                  <p className="text-xs font-medium pl-5 leading-relaxed">{selectedRecord.correctionNote}</p>
                </div>
              )}

              {/* Read-Only Notice */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Supervisor Scope Rule:</strong> Supervisors review medical data for quality verification. If corrections are needed, send a correction request to the assigned ASHA Worker.
                </span>
              </div>

              {/* VERIFY CONFIRMATION DIALOG STEP */}
              {showVerifyConfirm && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verify this record?</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    You are confirming that the submitted information for <strong>{selectedRecord.patientName}</strong> has been thoroughly reviewed and meets PHC quality standards.
                  </p>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => setShowVerifyConfirm(false)}
                      className="text-xs font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleVerifyConfirm}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                    >
                      Confirm & Verify
                    </Button>
                  </div>
                </div>
              )}

              {/* CORRECTION REQUEST FORM DRAWER */}
              {showCorrectionForm && (
                <form onSubmit={handleRequestCorrectionSubmit} className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-rose-900">Request Correction from ASHA Worker:</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowCorrectionForm(false);
                        setCorrectionError(null);
                      }} 
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  {correctionError && (
                    <p className="p-2 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{correctionError}</span>
                    </p>
                  )}

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      Reason / Instructions for ASHA Worker <span className="text-rose-500">*</span>
                    </span>
                    <textarea
                      rows={3}
                      placeholder="Specify required corrections (e.g. 'Please verify blood pressure measurement and confirm maternal week count')..."
                      value={correctionNote}
                      onChange={(e) => {
                        setCorrectionNote(e.target.value);
                        if (e.target.value.trim()) setCorrectionError(null);
                      }}
                      className="w-full p-3 bg-white border border-rose-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setShowCorrectionForm(false);
                        setCorrectionError(null);
                      }}
                      className="text-xs font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="xs"
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Request
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer Review Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedRecord(null);
                  setShowVerifyConfirm(false);
                  setShowCorrectionForm(false);
                }}
                className="text-xs font-bold text-slate-600"
              >
                Close
              </Button>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                {!showCorrectionForm && !showVerifyConfirm && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCorrectionForm(true);
                      setShowVerifyConfirm(false);
                      setCorrectionError(null);
                    }}
                    className="w-full sm:w-auto text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    Request Correction
                  </Button>
                )}

                {!showVerifyConfirm && !showCorrectionForm && (
                  <Button
                    type="button"
                    onClick={() => {
                      if (selectedRecord.verificationStatus === 'verified') return;
                      setShowVerifyConfirm(true);
                    }}
                    disabled={selectedRecord.verificationStatus === 'verified'}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedRecord.verificationStatus === 'verified' ? '✓ Verified' : 'Verify Record'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

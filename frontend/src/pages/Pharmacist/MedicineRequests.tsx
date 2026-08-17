import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  getRequests, 
  addRequest, 
  updateRequestStatus, 
  getMedicines, 
  getBatches, 
  MedicineRequest, 
  Medicine, 
  MedicineBatch 
} from './localPharmacistHelper';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter,
  Badge, 
  Button, 
  Input, 
  Select 
} from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  X, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Package, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  User, 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  Truck,
  Layers,
  FileText
} from 'lucide-react';

const requestFormSchema = z.object({
  requesterName: z.string().min(2, 'Please enter requester name or facility'),
  requesterRole: z.enum(['ASHA Worker', 'Sub-Center Clinic', 'Central Warehouse Requisition', 'Other']),
  medicineId: z.string().min(1, 'Please select a therapeutic item'),
  quantity: z.number().min(1, 'Requested quantity must be at least 1 unit'),
  priority: z.enum(['Urgent', 'Routine', 'Emergency']),
  requestDate: z.string().min(1, 'Please specify request date'),
  remarks: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export default function MedicineRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1); // 1: Entry, 2: Review
  const [selectedDetailReq, setSelectedDetailReq] = useState<MedicineRequest | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All'); // All, Pending, Approved, Dispensed, Rejected
  const [selectedPriority, setSelectedPriority] = useState('All'); // All, Emergency, Urgent, Routine

  // Action Confirmation
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    status: 'Approved' | 'Dispensed' | 'Rejected';
    title: string;
    description: string;
  } | null>(null);

  // Form State
  const { register, handleSubmit, reset, trigger, getValues, formState: { errors } } = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      requesterName: 'Sunita Sharma (ASHA)',
      requesterRole: 'ASHA Worker',
      medicineId: '',
      quantity: 100,
      priority: 'Urgent',
      requestDate: new Date().toISOString().substring(0, 10),
      remarks: 'Monthly village health worker stock replenishment',
    }
  });

  useEffect(() => {
    refreshData();

    if (searchParams.get('action') === 'new') {
      handleOpenNewForm();
    }
  }, []);

  const refreshData = async () => {
    try {
      const [reqs, meds, bts] = await Promise.all([
        getRequests(),
        getMedicines(),
        getBatches()
      ]);
      setRequests(reqs);
      setMedicines(meds);
      setBatches(bts);
    } catch (err) {
      console.error("Failed to refresh requests data:", err);
    }
  };

  const handleOpenNewForm = () => {
    setFormStep(1);
    reset({
      requesterName: 'Sunita Sharma (ASHA)',
      requesterRole: 'ASHA Worker',
      medicineId: medicines.length > 0 ? medicines[0].id : '',
      quantity: 100,
      priority: 'Urgent',
      requestDate: new Date().toISOString().substring(0, 10),
      remarks: 'Monthly field worker stock replenishment',
    });
    setIsFormOpen(true);
  };

  const handleNextToReview = async () => {
    const isValid = await trigger();
    if (isValid) {
      setFormStep(2);
    }
  };

  const onSubmitForm = async (data: RequestFormValues) => {
    const selectedMed = medicines.find(m => m.id === data.medicineId);
    
    try {
      await addRequest({
        requesterName: data.requesterName,
        requesterRole: data.requesterRole,
        medicineId: data.medicineId,
        medicineName: selectedMed ? selectedMed.name : 'Unknown Medication',
        quantity: data.quantity,
        priority: data.priority,
        requestDate: data.requestDate,
        remarks: data.remarks,
      });
    } catch (err) {
      console.error("Failed to add request:", err);
    }

    setIsFormOpen(false);
    await refreshData();
  };

  const handleExecuteStatusUpdate = async () => {
    if (!confirmAction) return;
    try {
      await updateRequestStatus(confirmAction.id, confirmAction.status);
    } catch (err) {
      console.error("Failed to update request status:", err);
    }
    setConfirmAction(null);
    if (selectedDetailReq && selectedDetailReq.id === confirmAction.id) {
      setSelectedDetailReq(null);
    }
    await refreshData();
  };

  // Metrics
  const totalRequestsCount = requests.length;
  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const approvedRequestsCount = requests.filter(r => r.status === 'Approved').length;
  const dispensedRequestsCount = requests.filter(r => r.status === 'Dispensed').length;

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.remarks && r.remarks.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || r.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Medicine Requests & Requisitions"
        description="Review, approve, and fulfill field medicine requisitions submitted by ASHA workers and sub-center clinics."
        breadcrumbs={[
          { label: 'Dashboard', to: '/pharmacist/dashboard' },
          { label: 'Requests' }
        ]}
        action={{
          label: 'Create Requisition',
          icon: Plus,
          onClick: handleOpenNewForm
        }}
      />

      {/* Connection & Context Banner */}
      <div className="p-4 rounded-2xl bg-teal-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-800 text-teal-300 shrink-0 mt-0.5">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-200 flex items-center gap-2">
              <span>Integrated Supply Chain Fulfillments</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              Fulfilling a request automatically selects the active batch with the earliest expiry date (FEFO) and logs an Outbound Stock Transaction.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <span className="px-3 py-1 rounded-full bg-teal-800 border border-teal-700 text-[11px] font-mono text-teal-200 font-bold">
            {pendingRequestsCount} Pending Action
          </span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Requisitions</p>
              <h4 className="text-xl font-black text-slate-800">{totalRequestsCount}</h4>
              <p className="text-[10px] text-teal-600 font-bold mt-0.5">Field & clinic requisitions</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:border-amber-200 transition-all ${pendingRequestsCount > 0 ? 'bg-amber-50/20' : ''}`}>
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <h4 className={`text-xl font-black ${pendingRequestsCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {pendingRequestsCount}
              </h4>
              <p className="text-[10px] text-amber-700 font-bold mt-0.5">Requires approval</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved (Ready)</p>
              <h4 className="text-xl font-black text-slate-800">{approvedRequestsCount}</h4>
              <p className="text-[10px] text-blue-600 font-bold mt-0.5">Ready for stock issue</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispensed & Fulfilled</p>
              <h4 className="text-xl font-black text-slate-800">{dispensedRequestsCount}</h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Stock updated in shelf</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-100 shadow-sm bg-slate-50/40">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by request ID, requester name, medicine, or remarks..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 placeholder:text-slate-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter by Status */}
            <select
              className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Request Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Dispensed">Dispensed & Fulfilled</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Filter by Priority */}
            <select
              className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="All">All Priority Levels</option>
              <option value="Emergency">Emergency</option>
              <option value="Urgent">Urgent</option>
              <option value="Routine">Routine</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table List */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Requisition ID & Date</th>
                  <th className="p-4">Requester Name & Facility</th>
                  <th className="p-4">Requested Item</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Priority Level</th>
                  <th className="p-4">Status Flag</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  let priorityBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (req.priority === 'Emergency') priorityBadge = 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold';
                  else if (req.priority === 'Urgent') priorityBadge = 'bg-amber-50 text-amber-700 border-amber-200 font-extrabold';

                  let statusVariant: 'success' | 'warning' | 'danger' | 'info' = 'info';
                  if (req.status === 'Dispensed') statusVariant = 'success';
                  else if (req.status === 'Pending') statusVariant = 'warning';
                  else if (req.status === 'Rejected') statusVariant = 'danger';

                  const medObj = medicines.find(m => m.id === req.medicineId);
                  const isStockAvailable = medObj ? medObj.stock >= req.quantity : false;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-extrabold text-slate-800 text-xs">
                          {req.id}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {req.requestDate}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-extrabold text-slate-800 text-sm">
                          {req.requesterName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {req.requesterRole}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-extrabold text-slate-800 text-sm block">{req.medicineName}</span>
                        {medObj && (
                          <span className={`text-[10px] font-mono font-bold ${isStockAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {medObj.stock} {medObj.unit} on shelf
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-black text-slate-900 text-sm">
                        {req.quantity.toLocaleString()} units
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] border uppercase ${priorityBadge}`}>
                          {req.priority}
                        </span>
                      </td>

                      <td className="p-4">
                        <Badge variant={statusVariant}>
                          {req.status}
                        </Badge>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="p-1.5 h-8 w-8 text-teal-700 hover:bg-teal-50 hover:border-teal-200 bg-white"
                            title="View Requisition Details"
                            onClick={() => setSelectedDetailReq(req)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {req.status === 'Pending' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="px-2 py-1 text-xs text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 font-bold"
                              title="Approve Requisition"
                              onClick={() => setConfirmAction({
                                id: req.id,
                                status: 'Approved',
                                title: 'Approve Medicine Requisition',
                                description: `Are you sure you want to approve this request for ${req.quantity} units of ${req.medicineName} for ${req.requesterName}?`
                              })}
                            >
                              Approve
                            </Button>
                          )}

                          {(req.status === 'Approved' || req.status === 'Pending') && (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="px-2 py-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                              title="Dispense & Deduct Stock"
                              onClick={() => setConfirmAction({
                                id: req.id,
                                status: 'Dispensed',
                                title: 'Dispense & Fulfill Inventory Request',
                                description: `Dispensing will automatically deduct ${req.quantity} units of ${req.medicineName} from active batch storage under FEFO rules and record an Outbound Stock Transaction.`
                              })}
                            >
                              Dispense
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No medicine requisition records match selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* READ-ONLY REQUEST DETAIL MODAL */}
      {selectedDetailReq && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedDetailReq(null)} />
          <Card className="relative z-10 w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-150 bg-white">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-800">
                    Requisition Details — {selectedDetailReq.id}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Read-only view of field medicine requisition and fulfillment status.
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-600 bg-white"
                onClick={() => setSelectedDetailReq(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              {/* Core Information */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requester Name & Facility</span>
                  <span className="font-black text-slate-900 text-sm">{selectedDetailReq.requesterName}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedDetailReq.requesterRole}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requisition Priority</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                      selectedDetailReq.priority === 'Emergency' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedDetailReq.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requested Medication</span>
                  <span className="font-black text-teal-900 text-sm">{selectedDetailReq.medicineName}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quantity Requested</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedDetailReq.quantity.toLocaleString()} units</span>
                </div>
              </div>

              {/* Status and Stock Feasibility */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Status</span>
                  <div className="mt-1">
                    <Badge variant={selectedDetailReq.status === 'Dispensed' ? 'success' : selectedDetailReq.status === 'Pending' ? 'warning' : 'info'}>
                      {selectedDetailReq.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Request Date</span>
                  <span className="font-mono font-bold text-slate-700 block mt-1">{selectedDetailReq.requestDate}</span>
                </div>
              </div>

              {/* Purpose / Remarks */}
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requisition Purpose / Remarks</span>
                <p className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 font-medium leading-relaxed">
                  {selectedDetailReq.remarks || 'No additional field notes provided.'}
                </p>
              </div>
            </CardContent>

            <CardFooter className="py-4 bg-slate-50 flex justify-between items-center">
              {selectedDetailReq.status !== 'Dispensed' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => {
                    const req = selectedDetailReq;
                    setConfirmAction({
                      id: req.id,
                      status: 'Rejected',
                      title: 'Reject Requisition',
                      description: `Are you sure you want to reject this request for ${req.medicineName} from ${req.requesterName}?`
                    });
                  }}
                >
                  Reject Request
                </Button>
              )}

              <div className="flex space-x-2">
                {selectedDetailReq.status === 'Pending' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 font-bold"
                    onClick={() => {
                      const req = selectedDetailReq;
                      setConfirmAction({
                        id: req.id,
                        status: 'Approved',
                        title: 'Approve Medicine Requisition',
                        description: `Approve request for ${req.quantity} units of ${req.medicineName}?`
                      });
                    }}
                  >
                    Approve
                  </Button>
                )}

                {selectedDetailReq.status !== 'Dispensed' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                    onClick={() => {
                      const req = selectedDetailReq;
                      setConfirmAction({
                        id: req.id,
                        status: 'Dispensed',
                        title: 'Dispense & Fulfill Inventory Request',
                        description: `Fulfill request for ${req.quantity} units of ${req.medicineName}? This deducts shelf stock automatically.`
                      });
                    }}
                  >
                    Dispense & Fulfill
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedDetailReq(null)}
                >
                  Close
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* TWO-STEP REQUISITION FORM MODAL WITH REVIEW */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          <Card className="relative z-10 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150 bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100 bg-teal-900 text-white">
              <div>
                <CardTitle className="text-white text-base">Create Medicine Requisition</CardTitle>
                <CardDescription className="text-teal-200 text-xs">
                  Step {formStep} of 2: {formStep === 1 ? 'Requisition Details' : 'Review Before Submitting'}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full text-teal-200 hover:text-white hover:bg-teal-800"
                onClick={() => setIsFormOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            {/* Stepper Indicator */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              <div className={`flex-1 py-2 text-center text-[10px] font-bold border-b-2 transition-colors ${
                formStep === 1 ? 'border-teal-600 text-teal-800 bg-white' : 'border-transparent text-slate-400'
              }`}>
                1. Entry Form
              </div>
              <div className={`flex-1 py-2 text-center text-[10px] font-bold border-b-2 transition-colors ${
                formStep === 2 ? 'border-teal-600 text-teal-800 bg-white' : 'border-transparent text-slate-400'
              }`}>
                2. Review Requisition
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)}>
              <CardContent className="p-6 space-y-4">
                {/* STEP 1: ENTRY FORM */}
                {formStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Requester Name / Facility"
                        placeholder="e.g. Sunita Sharma (ASHA)"
                        error={errors.requesterName?.message}
                        {...register('requesterName')}
                      />

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Requester Role
                        </label>
                        <Select
                          label=""
                          options={[
                            { value: 'ASHA Worker', label: 'ASHA Field Worker' },
                            { value: 'Sub-Center Clinic', label: 'Sub-Center Clinic' },
                            { value: 'Central Warehouse Requisition', label: 'Central Requisition' },
                            { value: 'Other', label: 'Other Facility' },
                          ]}
                          error={errors.requesterRole?.message}
                          {...register('requesterRole')}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Select Therapeutic Item <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        label=""
                        options={medicines.map(m => ({ value: m.id, label: `${m.name} (${m.stock} ${m.unit} in stock)` }))}
                        error={errors.medicineId?.message}
                        {...register('medicineId')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <Input
                        type="number"
                        label="Quantity Requested"
                        placeholder="e.g. 100"
                        error={errors.quantity?.message}
                        {...register('quantity', { valueAsNumber: true })}
                      />

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Priority Level
                        </label>
                        <Select
                          label=""
                          options={[
                            { value: 'Routine', label: 'Routine Replenishment' },
                            { value: 'Urgent', label: 'Urgent Request' },
                            { value: 'Emergency', label: 'Emergency Stockout' },
                          ]}
                          error={errors.priority?.message}
                          {...register('priority')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <Input
                        type="date"
                        label="Request Date"
                        error={errors.requestDate?.message}
                        {...register('requestDate')}
                      />

                      <Input
                        label="Purpose / Field Remarks"
                        placeholder="e.g. Village immunization drive preparation"
                        error={errors.remarks?.message}
                        {...register('remarks')}
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button 
                        type="button" 
                        variant="primary" 
                        onClick={handleNextToReview}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center space-x-1.5"
                      >
                        <span>Next: Review Requisition</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: REVIEW REQUISITION */}
                {formStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                      <h4 className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-teal-600" />
                        <span>Review Requisition Details</span>
                      </h4>

                      <div className="space-y-2 text-xs divide-y divide-teal-100/80">
                        <div className="pt-1 flex justify-between">
                          <span className="text-slate-500 font-bold">Requester:</span>
                          <span className="font-extrabold text-slate-900">
                            {getValues('requesterName')} ({getValues('requesterRole')})
                          </span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Therapeutic Item:</span>
                          <span className="font-black text-teal-900">
                            {medicines.find(m => m.id === getValues('medicineId'))?.name}
                          </span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Quantity Requested:</span>
                          <span className="font-extrabold text-slate-900">{getValues('quantity').toLocaleString()} units</span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Priority:</span>
                          <span className="font-bold text-amber-800 uppercase">{getValues('priority')}</span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Request Date:</span>
                          <span className="font-mono text-slate-700">{getValues('requestDate')}</span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Remarks:</span>
                          <span className="font-medium text-slate-700 text-right max-w-xs">{getValues('remarks') || 'None'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFormStep(1)}
                        className="text-slate-700 border-slate-200"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Edit Details
                      </Button>

                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="sm"
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                      >
                        Confirm & Submit Request
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* CONFIRMATION ACTION MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setConfirmAction(null)} />
          <Card className="relative z-10 w-full max-w-sm shadow-xl bg-white">
            <CardHeader className="py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5 text-slate-800">
                <AlertTriangle className="h-5 w-5 text-teal-600" />
                <CardTitle>{confirmAction.title}</CardTitle>
              </div>
              <CardDescription className="pt-2 text-xs leading-relaxed">
                {confirmAction.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="py-4 bg-slate-50 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                className={confirmAction.status === 'Rejected' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-700 hover:bg-teal-800'}
                onClick={handleExecuteStatusUpdate}
              >
                Confirm Action
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  getMedicines, 
  getBatches, 
  addBatch, 
  updateBatch, 
  deleteBatch, 
  getTransactions,
  MedicineBatch,
  Medicine,
  StockTransaction
} from './localPharmacistHelper';
import { pharmacyApi } from '../../utils/apiClient';
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
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Calendar, 
  AlertTriangle, 
  Tag, 
  Layers,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Clock,
  PackageCheck,
  Eye,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Boxes,
  History,
  FileSpreadsheet
} from 'lucide-react';

const batchFormSchema = z.object({
  medicineId: z.string().min(1, 'Please select a therapeutic item'),
  batchNumber: z.string().min(2, 'Batch number must be at least 2 characters'),
  quantity: z.number().min(1, 'Initial batch quantity must be at least 1'),
  manufactureDate: z.string().min(1, 'Please select manufacture date'),
  expiryDate: z.string().min(1, 'Please select expiry date'),
  location: z.string().min(1, 'Please specify storage location'),
}).refine((data) => {
  const mDate = new Date(data.manufactureDate);
  const eDate = new Date(data.expiryDate);
  return eDate > mDate;
}, {
  message: "Expiry date must be after manufacture date",
  path: ["expiryDate"],
});

type BatchFormValues = z.infer<typeof batchFormSchema>;

export default function MedicineBatchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1); // 1: Entry, 2: Review
  const [editingBatch, setEditingBatch] = useState<MedicineBatch | null>(null);
  const [selectedDetailBatch, setSelectedDetailBatch] = useState<MedicineBatch | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All'); // All, Active, Near Expiry, Expired

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const { register, handleSubmit, reset, trigger, getValues, formState: { errors } } = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      medicineId: '',
      batchNumber: '',
      quantity: 100,
      manufactureDate: '',
      expiryDate: '',
      location: 'Shelf A1',
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
      const [bts, meds, txs] = await Promise.all([
        getBatches(),
        getMedicines(),
        getTransactions()
      ]);
      setBatches(bts);
      setMedicines(meds);
      setTransactions(txs);
    } catch (err) {
      console.error("Failed to refresh batch data:", err);
    }
  };

  const handleOpenNewForm = () => {
    setEditingBatch(null);
    setFormStep(1);
    reset({
      medicineId: medicines.length > 0 ? medicines[0].id : '',
      batchNumber: '',
      quantity: 100,
      manufactureDate: new Date().toISOString().substring(0, 10),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      location: 'Shelf A1',
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (batch: MedicineBatch) => {
    setEditingBatch(batch);
    setFormStep(1);
    reset({
      medicineId: batch.medicineId,
      batchNumber: batch.batchNumber,
      quantity: batch.quantity,
      manufactureDate: batch.manufactureDate,
      expiryDate: batch.expiryDate,
      location: batch.location,
    });
    setIsFormOpen(true);
  };

  // Step 1 -> Step 2 Review
  const handleNextToReview = async () => {
    const isValid = await trigger();
    if (isValid) {
      setFormStep(2);
    }
  };

  // Final submit
  const onSubmitForm = async (data: BatchFormValues) => {
    const selectedMed = medicines.find(m => m.id === data.medicineId);
    const medicineName = selectedMed ? selectedMed.name : 'Unknown Medication';

    try {
      if (editingBatch) {
        await updateBatch(editingBatch.id, {
          medicineId: data.medicineId,
          medicineName,
          batchNumber: data.batchNumber,
          quantity: data.quantity,
          manufactureDate: data.manufactureDate,
          expiryDate: data.expiryDate,
          location: data.location,
        });
      } else {
        await addBatch({
          medicineId: data.medicineId,
          medicineName,
          batchNumber: data.batchNumber,
          quantity: data.quantity,
          manufactureDate: data.manufactureDate,
          expiryDate: data.expiryDate,
          location: data.location,
        });
      }
    } catch (err) {
      console.error("Failed to submit batch:", err);
    }

    setIsFormOpen(false);
    await refreshData();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBatch(id);
    } catch (err) {
      console.error("Failed to delete batch:", err);
    }
    setConfirmDeleteId(null);
    await refreshData();
  };

  // Days until expiry calculation
  const getDaysToExpiry = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Metrics
  const totalBatchesCount = batches.length;
  const activeBatchesCount = batches.filter(b => b.status === 'Active').length;
  const nearExpiryBatchesCount = batches.filter(b => b.status === 'Near Expiry').length;
  const expiredBatchesCount = batches.filter(b => b.status === 'Expired').length;
  const totalBatchUnits = batches.reduce((acc, b) => acc + b.quantity, 0);

  // Filter batches by Medicine Name, Batch Number, Storage Location, and Status
  const filteredBatches = batches.filter(b => {
    const matchesSearch = b.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()); // FEFO priority order

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Medicine Batches"
        description="Manage medicine batches, quantities, and expiry information."
        breadcrumbs={[
          { label: 'Dashboard', to: '/pharmacist/dashboard' },
          { label: 'Batches' }
        ]}
        action={{
          label: 'Receive Supply Batch',
          icon: Plus,
          onClick: handleOpenNewForm
        }}
      />

      {medicines.length === 0 && (
        <Card className="bg-amber-50/60 border border-amber-200/80 p-5 text-sm text-amber-900 flex items-center space-x-3 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p>
            Please register a medicine first under <strong>Medicine Catalog</strong> before receiving supply batch logs.
          </p>
        </Card>
      )}

      {/* FEFO Protocol Banner & Connection Indicator */}
      <div className="p-4 rounded-2xl bg-teal-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-800 text-teal-300 shrink-0 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-200 flex items-center gap-2">
              <span>FEFO Protocol Active: First-Expiry, First-Out</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              Batches are strictly sorted by earliest expiration date. Always dispense near-expiry batches first to prevent drug wastage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="px-3 py-1 rounded-full bg-teal-800 border border-teal-700 text-[11px] font-mono text-teal-200 font-bold">
            {totalBatchUnits.toLocaleString()} units logged across {totalBatchesCount} batches
          </span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Batches</p>
              <h4 className="text-xl font-black text-slate-800">{totalBatchesCount}</h4>
              <p className="text-[10px] text-teal-600 font-bold mt-0.5">{totalBatchUnits.toLocaleString()} total units in storage</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active & Safe</p>
              <h4 className="text-xl font-black text-slate-800">{activeBatchesCount}</h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Optimal shelf life (&gt;30d)</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:border-amber-200 transition-all ${nearExpiryBatchesCount > 0 ? 'bg-amber-50/20' : ''}`}>
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Near Expiry (&lt;30d)</p>
              <h4 className={`text-xl font-black ${nearExpiryBatchesCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {nearExpiryBatchesCount}
              </h4>
              <p className="text-[10px] text-amber-700 font-bold mt-0.5">Dispense first under FEFO</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:border-rose-200 transition-all ${expiredBatchesCount > 0 ? 'bg-rose-50/20' : ''}`}>
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expired Batches</p>
              <h4 className={`text-xl font-black ${expiredBatchesCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {expiredBatchesCount}
              </h4>
              <p className="text-[10px] text-rose-600 font-bold mt-0.5">Quarantine & write-off</p>
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
              placeholder="Search by medicine name, batch number, or storage location..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 placeholder:text-slate-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold w-full md:w-auto">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              className="bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer w-full font-bold"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Expiry Statuses</option>
              <option value="Active">Active (Safe)</option>
              <option value="Near Expiry">Near Expiry (&lt;30 Days)</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table List */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">FEFO Priority & Medicine</th>
                  <th className="p-4">Batch Number</th>
                  <th className="p-4">Quantity Left</th>
                  <th className="p-4">Storage Location</th>
                  <th className="p-4">Mfg / Expiry Date</th>
                  <th className="p-4">Expiry Countdown</th>
                  <th className="p-4">Status Flag</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map((batch, index) => {
                  let badgeVariant: 'success' | 'warning' | 'danger' = 'success';
                  if (batch.status === 'Expired') badgeVariant = 'danger';
                  else if (batch.status === 'Near Expiry') badgeVariant = 'warning';

                  const daysLeft = getDaysToExpiry(batch.expiryDate);

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-extrabold text-[10px]">
                            {index + 1}
                          </span>
                          <div className="p-2 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                            <Layers className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm block">{batch.medicineName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {batch.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800 text-sm">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-slate-800">
                          {batch.batchNumber}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-800 text-sm">
                        {batch.quantity.toLocaleString()} units
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center text-slate-600 font-semibold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px]">
                          <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                          {batch.location}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-[11px]">
                        <div>Mfg: <span className="text-slate-400">{batch.manufactureDate}</span></div>
                        <div>Exp: <span className="font-bold text-slate-800">{batch.expiryDate}</span></div>
                      </td>
                      <td className="p-4">
                        {daysLeft < 0 ? (
                          <span className="inline-flex items-center text-rose-700 font-extrabold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-[10px]">
                            Expired {Math.abs(daysLeft)}d ago
                          </span>
                        ) : daysLeft <= 30 ? (
                          <span className="inline-flex items-center text-amber-700 font-extrabold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] animate-pulse">
                            <Clock className="h-3 w-3 mr-1" />
                            Expires in {daysLeft}d
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-[10px]">
                            {daysLeft} days remaining
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={badgeVariant}>
                          {batch.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="p-1.5 h-8 w-8 text-teal-700 hover:bg-teal-50 hover:border-teal-200 bg-white"
                            title="View Batch Details"
                            onClick={() => setSelectedDetailBatch(batch)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="p-1.5 h-8 w-8 hover:text-amber-600 hover:border-amber-200 bg-white"
                            title="Edit Batch Details"
                            onClick={() => handleOpenEditForm(batch)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="p-1.5 h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100 bg-white"
                            title="Discard / Delete Batch"
                            onClick={() => setConfirmDeleteId(batch.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredBatches.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      No active drug batch records matching selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* READ-ONLY BATCH DETAIL MODAL */}
      {selectedDetailBatch && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedDetailBatch(null)} />
          <Card className="relative z-10 w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-150 bg-white">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-800">
                    Batch Details — {selectedDetailBatch.batchNumber}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Read-only view of supply batch specifications, manufacturing code, and shelf location.
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-600 bg-white"
                onClick={() => setSelectedDetailBatch(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              {/* Summary Block */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Medicine Name</span>
                  <span className="font-black text-slate-900 text-sm">{selectedDetailBatch.medicineName}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Med ID: {selectedDetailBatch.medicineId}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batch Number</span>
                  <span className="font-mono font-black text-teal-800 text-sm bg-teal-50 px-2 py-0.5 rounded border border-teal-100 inline-block mt-0.5">
                    {selectedDetailBatch.batchNumber}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Stock Quantity</span>
                  <span className="font-extrabold text-slate-800 text-sm">{selectedDetailBatch.quantity.toLocaleString()} units</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Flag</span>
                  <div className="mt-1">
                    <Badge variant={selectedDetailBatch.status === 'Expired' ? 'danger' : selectedDetailBatch.status === 'Near Expiry' ? 'warning' : 'success'}>
                      {selectedDetailBatch.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Manufacturing & Expiry Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Manufacture Date</span>
                  <span className="font-mono font-bold text-slate-700">{selectedDetailBatch.manufactureDate}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expiry Date</span>
                  <span className="font-mono font-extrabold text-slate-900">{selectedDetailBatch.expiryDate}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pharmacy Storage Location</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-teal-600" />
                    {selectedDetailBatch.location}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Updated</span>
                  <span className="font-mono text-slate-500">{selectedDetailBatch.lastUpdated}</span>
                </div>
              </div>

              {/* Linked Transaction Log History */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <History className="h-3.5 w-3.5 text-teal-600" />
                  <span>Recent Transaction History for this Batch</span>
                </span>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {transactions
                    .filter(t => t.batchNumber === selectedDetailBatch.batchNumber || t.medicineId === selectedDetailBatch.medicineId)
                    .slice(0, 3)
                    .map(tx => (
                      <div key={tx.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-800">{tx.type} ({tx.quantity} units)</span>
                          <span className="text-[10px] text-slate-400 block">{tx.reason}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{tx.transactionDate}</span>
                      </div>
                    ))}
                  {transactions.filter(t => t.batchNumber === selectedDetailBatch.batchNumber || t.medicineId === selectedDetailBatch.medicineId).length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No transaction history recorded for this batch yet.</p>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="py-4 bg-slate-50 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const b = selectedDetailBatch;
                  setSelectedDetailBatch(null);
                  handleOpenEditForm(b);
                }}
                className="text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Edit Batch Information
              </Button>

              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setSelectedDetailBatch(null)}
              >
                Close View
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* TWO-STEP ADD / EDIT BATCH FORM MODAL WITH REVIEW */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          <Card className="relative z-10 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150 bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100 bg-teal-900 text-white">
              <div>
                <CardTitle className="text-white text-base">
                  {editingBatch ? 'Modify Batch Details' : 'Receive New Supply Batch'}
                </CardTitle>
                <CardDescription className="text-teal-200 text-xs">
                  Step {formStep} of 2: {formStep === 1 ? 'Configure Batch & Expiry' : 'Review Before Confirming'}
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
                2. Review Batch
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)}>
              <CardContent className="p-6 space-y-4">
                {/* STEP 1: ENTRY FORM */}
                {formStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Section 1: Medicine Selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Section 1: Medicine Information <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        label=""
                        options={medicines.map(m => ({ value: m.id, label: `${m.name} (${m.stock} ${m.unit} on hand)` }))}
                        error={errors.medicineId?.message}
                        disabled={!!editingBatch} // Can't change medicine of an existing batch
                        {...register('medicineId')}
                      />
                    </div>

                    {/* Section 2: Batch Information */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Section 2: Batch Information
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Batch Code Number"
                          placeholder="e.g. PV-992, PM-103"
                          error={errors.batchNumber?.message}
                          {...register('batchNumber')}
                        />
                        <Input
                          label="Pharmacy Storage Location"
                          placeholder="e.g. Cold Room Box C, Shelf B2"
                          error={errors.location?.message}
                          {...register('location')}
                        />
                      </div>
                    </div>

                    {/* Section 3: Stock Information */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Section 3: Stock Information & Timelines
                      </label>
                      <Input
                        type="number"
                        label="Quantity Inbound"
                        placeholder="e.g. 500"
                        error={errors.quantity?.message}
                        {...register('quantity', { valueAsNumber: true })}
                      />

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <Input
                          type="date"
                          label="Manufacture Date"
                          error={errors.manufactureDate?.message}
                          {...register('manufactureDate')}
                        />
                        <Input
                          type="date"
                          label="Expiry Date"
                          error={errors.expiryDate?.message}
                          {...register('expiryDate')}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button 
                        type="button" 
                        variant="primary" 
                        onClick={handleNextToReview}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center space-x-1.5"
                      >
                        <span>Next: Review Batch</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: REVIEW BATCH BEFORE CONFIRMING */}
                {formStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                      <h4 className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-teal-600" />
                        <span>Review Batch Configuration</span>
                      </h4>

                      <div className="space-y-2 text-xs divide-y divide-teal-100/80">
                        <div className="pt-1 flex justify-between">
                          <span className="text-slate-500 font-bold">Medicine:</span>
                          <span className="font-extrabold text-slate-900">
                            {medicines.find(m => m.id === getValues('medicineId'))?.name || 'Selected Item'}
                          </span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Batch Number:</span>
                          <span className="font-mono font-extrabold text-teal-900 bg-teal-100/60 px-2 py-0.5 rounded">
                            {getValues('batchNumber')}
                          </span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Quantity Inbound:</span>
                          <span className="font-extrabold text-slate-900">{getValues('quantity').toLocaleString()} units</span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Storage Location:</span>
                          <span className="font-semibold text-slate-800">{getValues('location')}</span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Manufacture Date:</span>
                          <span className="font-mono text-slate-700">{getValues('manufactureDate')}</span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Expiry Date:</span>
                          <span className="font-mono font-bold text-slate-900">{getValues('expiryDate')}</span>
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
                        {editingBatch ? 'Confirm & Save Changes' : 'Confirm & Receive Batch'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setConfirmDeleteId(null)} />
          <Card className="relative z-10 w-full max-w-sm shadow-xl bg-white">
            <CardHeader className="py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle className="text-rose-700">Discard Supply Batch</CardTitle>
              </div>
              <CardDescription className="pt-2 text-xs">
                Are you sure you want to discard this batch log? The quantities inside this batch will be deducted from the main medication's stock immediately.
              </CardDescription>
            </CardHeader>
            <CardFooter className="py-4 bg-slate-50 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => handleDelete(confirmDeleteId)}
              >
                Discard Batch
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

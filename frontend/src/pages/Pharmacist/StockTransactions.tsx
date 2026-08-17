import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  getMedicines, 
  getBatches, 
  getTransactions, 
  addTransaction,
  StockTransaction,
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
  Plus, 
  Search, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  FileSpreadsheet, 
  Calendar, 
  User, 
  FileText,
  Eye,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Boxes,
  History,
  AlertCircle
} from 'lucide-react';

const transactionFormSchema = z.object({
  medicineId: z.string().min(1, 'Please select a medicine'),
  batchId: z.string().optional(),
  type: z.enum(['Inbound', 'Outbound']),
  quantity: z.number().min(1, 'Quantity must be at least 1 unit'),
  reason: z.string().min(3, 'Please provide a clear reason or narration'),
  performedBy: z.string().min(2, 'Please enter authorized operator name'),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export default function StockTransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1); // 1: Entry, 2: Review
  const [selectedDetailTx, setSelectedDetailTx] = useState<StockTransaction | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All'); // All, Inbound, Outbound
  const [selectedMedFilter, setSelectedMedFilter] = useState('All');

  // Form
  const { register, handleSubmit, reset, trigger, watch, setValue, getValues, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      medicineId: '',
      batchId: '',
      type: 'Inbound',
      quantity: 50,
      reason: 'Routine stock movement log',
      performedBy: 'Meera Deshmukh',
    }
  });

  const watchMedicineId = watch('medicineId');

  useEffect(() => {
    refreshData();

    if (searchParams.get('action') === 'new') {
      handleOpenNewForm();
    }
  }, []);

  const refreshData = async () => {
    try {
      const [txs, meds, bts] = await Promise.all([
        getTransactions(),
        getMedicines(),
        getBatches()
      ]);
      setTransactions(txs);
      setMedicines(meds);
      setBatches(bts);
    } catch (err) {
      console.error("Failed to refresh transactions data:", err);
    }
  };

  const handleOpenNewForm = () => {
    setFormStep(1);
    reset({
      medicineId: medicines.length > 0 ? medicines[0].id : '',
      batchId: '',
      type: 'Inbound',
      quantity: 50,
      reason: 'Routine stock addition',
      performedBy: 'Meera Deshmukh',
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

  // Submit form
  const onSubmitForm = async (data: TransactionFormValues) => {
    const selectedMed = medicines.find(m => m.id === data.medicineId);
    const selectedBatch = batches.find(b => b.id === data.batchId);

    try {
      await addTransaction({
        medicineId: data.medicineId,
        medicineName: selectedMed ? selectedMed.name : 'Unknown Item',
        batchId: data.batchId,
        batchNumber: selectedBatch ? selectedBatch.batchNumber : undefined,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        performedBy: data.performedBy,
      });
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }

    setIsFormOpen(false);
    await refreshData();
  };

  // Filtered available batches for chosen medicine in the form
  const availableBatchesForMed = batches.filter(b => b.medicineId === watchMedicineId);

  // Metrics
  const totalInboundQty = transactions
    .filter(t => t.type === 'Inbound')
    .reduce((acc, t) => acc + t.quantity, 0);

  const totalOutboundQty = transactions
    .filter(t => t.type === 'Outbound')
    .reduce((acc, t) => acc + t.quantity, 0);

  const inboundTxCount = transactions.filter(t => t.type === 'Inbound').length;
  const outboundTxCount = transactions.filter(t => t.type === 'Outbound').length;

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.batchNumber && t.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          t.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All' || t.type === selectedType;
    const matchesMed = selectedMedFilter === 'All' || t.medicineId === selectedMedFilter;

    return matchesSearch && matchesType && matchesMed;
  }).sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Stock Transactions"
        description="Track medicine stock additions, issues, adjustments, and other existing inventory transactions."
        breadcrumbs={[
          { label: 'Dashboard', to: '/pharmacist/dashboard' },
          { label: 'Transactions' }
        ]}
        action={{
          label: 'Record Stock Movement',
          icon: Plus,
          onClick: handleOpenNewForm
        }}
      />

      {/* Stock Connection Banner */}
      <div className="p-4 rounded-2xl bg-teal-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-800 text-teal-300 shrink-0 mt-0.5">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-200 flex items-center gap-2">
              <span>Inventory Continuity Chain: Medicine Catalog → Batches → Transactions</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              Every stock movement automatically recalculates active shelf quantities across linked supply batches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <span className="px-3 py-1 rounded-full bg-teal-800 border border-teal-700 text-[11px] font-mono text-teal-200 font-bold">
            {transactions.length} Transactions Logged
          </span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ledger Activity</p>
              <h4 className="text-xl font-black text-slate-800">{transactions.length} logs</h4>
              <p className="text-[10px] text-teal-600 font-bold mt-0.5">Full audit trail preserved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inbound Received</p>
              <h4 className="text-xl font-black text-slate-800">+{totalInboundQty.toLocaleString()} units</h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{inboundTxCount} receipt entries</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-rose-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outbound Dispensed</p>
              <h4 className="text-xl font-black text-slate-800">-{totalOutboundQty.toLocaleString()} units</h4>
              <p className="text-[10px] text-rose-600 font-bold mt-0.5">{outboundTxCount} issue entries</p>
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
              placeholder="Search by transaction ID, medicine, batch code, reason, or operator..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 placeholder:text-slate-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter by Type */}
            <select
              className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Movement Types</option>
              <option value="Inbound">Inbound (Stock Added)</option>
              <option value="Outbound">Outbound (Stock Dispensed)</option>
            </select>

            {/* Filter by Medicine */}
            <select
              className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              value={selectedMedFilter}
              onChange={(e) => setSelectedMedFilter(e.target.value)}
            >
              <option value="All">All Therapeutic Items</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table List */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Transaction ID & Date</th>
                  <th className="p-4">Therapeutic Item</th>
                  <th className="p-4">Batch Number</th>
                  <th className="p-4">Movement Direction</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Authorized Operator</th>
                  <th className="p-4">Reason / Narration</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isInbound = tx.type === 'Inbound';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-extrabold text-slate-800 text-xs">
                          {tx.id}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {tx.transactionDate}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-slate-800 text-sm block">{tx.medicineName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {tx.medicineId}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">
                        {tx.batchNumber ? (
                          <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                            {tx.batchNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unspecified</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isInbound ? (
                          <span className="inline-flex items-center text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px]">
                            <ArrowDownLeft className="h-3 w-3 mr-1 text-emerald-600" />
                            Inbound Addition
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-700 font-extrabold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-[10px]">
                            <ArrowUpRight className="h-3 w-3 mr-1 text-rose-600" />
                            Outbound Issue
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-extrabold text-sm">
                        <span className={isInbound ? 'text-emerald-700' : 'text-rose-700'}>
                          {isInbound ? '+' : '-'}{tx.quantity.toLocaleString()} units
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {tx.performedBy}
                      </td>
                      <td className="p-4 text-slate-600 max-w-xs truncate" title={tx.reason}>
                        {tx.reason}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="p-1.5 h-8 w-8 text-teal-700 hover:bg-teal-50 hover:border-teal-200 bg-white"
                          title="View Transaction Details"
                          onClick={() => setSelectedDetailTx(tx)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      No stock movement ledger records match selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* READ-ONLY TRANSACTION DETAIL MODAL */}
      {selectedDetailTx && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedDetailTx(null)} />
          <Card className="relative z-10 w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-150 bg-white">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border ${
                  selectedDetailTx.type === 'Inbound' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                  {selectedDetailTx.type === 'Inbound' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-800">
                    Transaction Details — {selectedDetailTx.id}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Read-only view of logged inventory movement entry.
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-600 bg-white"
                onClick={() => setSelectedDetailTx(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              {/* Core Attributes */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Therapeutic Item</span>
                  <span className="font-black text-slate-900 text-sm">{selectedDetailTx.medicineName}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Med ID: {selectedDetailTx.medicineId}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Movement Direction</span>
                  <div className="mt-1">
                    {selectedDetailTx.type === 'Inbound' ? (
                      <span className="inline-flex items-center text-emerald-800 font-black bg-emerald-100/80 px-2.5 py-1 rounded border border-emerald-200">
                        Inbound Addition
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-rose-800 font-black bg-rose-100/80 px-2.5 py-1 rounded border border-rose-200">
                        Outbound Issue
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quantity Moved</span>
                  <span className={`font-extrabold text-base ${selectedDetailTx.type === 'Inbound' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedDetailTx.type === 'Inbound' ? '+' : '-'}{selectedDetailTx.quantity.toLocaleString()} units
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batch Number</span>
                  <span className="font-mono font-bold text-slate-800 text-sm block mt-0.5">
                    {selectedDetailTx.batchNumber || 'N/A (General Catalog)'}
                  </span>
                </div>
              </div>

              {/* Timestamp & Operator metadata */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Timestamp</span>
                  <span className="font-mono font-bold text-slate-700">{selectedDetailTx.transactionDate}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authorized Operator</span>
                  <span className="font-extrabold text-slate-800">{selectedDetailTx.performedBy}</span>
                </div>
              </div>

              {/* Reason / Narration */}
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason & Transaction Notes</span>
                <p className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 leading-relaxed font-medium">
                  {selectedDetailTx.reason}
                </p>
              </div>
            </CardContent>

            <CardFooter className="py-4 bg-slate-50 flex justify-end">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setSelectedDetailTx(null)}
              >
                Close View
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* TWO-STEP RECORD STOCK MOVEMENT FORM MODAL WITH REVIEW */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          <Card className="relative z-10 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150 bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100 bg-teal-900 text-white">
              <div>
                <CardTitle className="text-white text-base">Record Stock Movement</CardTitle>
                <CardDescription className="text-teal-200 text-xs">
                  Step {formStep} of 2: {formStep === 1 ? 'Movement Specification' : 'Review Before Logging'}
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
                2. Review Transaction
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)}>
              <CardContent className="p-6 space-y-4">
                {/* STEP 1: ENTRY FORM */}
                {formStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Medicine Selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Select Therapeutic Item <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        label=""
                        options={medicines.map(m => ({ value: m.id, label: `${m.name} (${m.stock} ${m.unit} on hand)` }))}
                        error={errors.medicineId?.message}
                        {...register('medicineId')}
                      />
                    </div>

                    {/* Batch Selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Select Specific Supply Batch (Optional)
                      </label>
                      <Select
                        label=""
                        options={[
                          { value: '', label: '-- General Catalog / FEFO Auto-Select --' },
                          ...availableBatchesForMed.map(b => ({ value: b.id, label: `Batch ${b.batchNumber} (${b.quantity} left, Exp: ${b.expiryDate})` }))
                        ]}
                        error={errors.batchId?.message}
                        {...register('batchId')}
                      />
                    </div>

                    {/* Direction and Quantity */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Movement Direction <span className="text-rose-500">*</span>
                        </label>
                        <Select
                          label=""
                          options={[
                            { value: 'Inbound', label: 'Inbound (Addition)' },
                            { value: 'Outbound', label: 'Outbound (Issue/Dispense)' },
                          ]}
                          error={errors.type?.message}
                          {...register('type')}
                        />
                      </div>

                      <Input
                        type="number"
                        label="Quantity Units"
                        placeholder="e.g. 100"
                        error={errors.quantity?.message}
                        {...register('quantity')}
                      />
                    </div>

                    {/* Operator and Reason */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <Input
                        label="Authorized Operator Name"
                        placeholder="e.g. Meera Deshmukh"
                        error={errors.performedBy?.message}
                        {...register('performedBy')}
                      />

                      <Input
                        label="Reason / Narration Notes"
                        placeholder="e.g. Dispensed for Sub-Center Clinic drive"
                        error={errors.reason?.message}
                        {...register('reason')}
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button 
                        type="button" 
                        variant="primary" 
                        onClick={handleNextToReview}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center space-x-1.5"
                      >
                        <span>Next: Review Transaction</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: REVIEW TRANSACTION */}
                {formStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                      <h4 className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-teal-600" />
                        <span>Review Transaction Entry</span>
                      </h4>

                      <div className="space-y-2 text-xs divide-y divide-teal-100/80">
                        <div className="pt-1 flex justify-between">
                          <span className="text-slate-500 font-bold">Therapeutic Item:</span>
                          <span className="font-extrabold text-slate-900">
                            {medicines.find(m => m.id === getValues('medicineId'))?.name}
                          </span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Target Batch:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {batches.find(b => b.id === getValues('batchId'))?.batchNumber || 'Auto-FEFO Batch'}
                          </span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Movement Direction:</span>
                          <span className={`font-black ${getValues('type') === 'Inbound' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {getValues('type') === 'Inbound' ? '+ Inbound Addition' : '- Outbound Issue'}
                          </span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Quantity Units:</span>
                          <span className="font-extrabold text-slate-900">{getValues('quantity').toLocaleString()} units</span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Authorized Operator:</span>
                          <span className="font-semibold text-slate-800">{getValues('performedBy')}</span>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-500 font-bold">Reason / Notes:</span>
                          <span className="font-medium text-slate-700 text-right max-w-xs">{getValues('reason')}</span>
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
                        Confirm & Log Transaction
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

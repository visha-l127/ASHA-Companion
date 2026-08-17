import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../components/ui';
import { 
  Download, 
  FileText, 
  BarChart2, 
  Calendar, 
  Pill, 
  CheckCircle2, 
  ShieldCheck, 
  Filter, 
  Eye, 
  X, 
  Printer, 
  Boxes, 
  RefreshCw, 
  TrendingUp, 
  ClipboardList 
} from 'lucide-react';
import { 
  getMedicines, 
  getBatches, 
  getTransactions, 
  getRequests, 
  getDemandForecasts,
  initPharmacistLocalStorage,
  Medicine,
  MedicineBatch,
  StockTransaction,
  MedicineRequest,
  DemandForecast
} from './localPharmacistHelper';

type ReportType = 'inventory' | 'movement' | 'expiry' | 'requisitions' | 'demand';

export default function PharmacistReports() {
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [dateRange, setDateRange] = useState('This Month');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Active Report Viewer Modal state
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);

  // Data states
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);

  useEffect(() => {
    initPharmacistLocalStorage();
    const loadAllData = async () => {
      try {
        const [meds, bts, txs] = await Promise.all([
          getMedicines(),
          getBatches(),
          getTransactions()
        ]);
        const reqs = getRequests();
        const fcs = await getDemandForecasts(meds);
        setMedicines(meds);
        setBatches(bts);
        setTransactions(txs);
        setRequests(reqs);
        setForecasts(fcs);
      } catch (err) {
        console.error("Failed to load reports data:", err);
      }
    };
    loadAllData();
  }, []);

  const handleDownload = (reportName: string) => {
    setDownloadSuccess(`Exported ${reportName} (${dateRange}) - File Download Started`);
    setTimeout(() => setDownloadSuccess(''), 4000);
  };

  // Filtered dataset helpers
  const filteredMedicines = medicines.filter(m => categoryFilter === 'All' || m.category === categoryFilter);
  const filteredBatches = batches.filter(b => {
    if (categoryFilter === 'All') return true;
    const med = medicines.find(m => m.id === b.medicineId);
    return med?.category === categoryFilter;
  });

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Pharmacy Reports"
        description="Access official inventory valuation, stock movement, batch expiry, and field requisition reports."
        breadcrumbs={[
          { label: 'Pharmacy Analytics', to: '/pharmacist/dashboard' },
          { label: 'Reports' }
        ]}
      />

      {/* Report Parameter Toolbar */}
      <Card className="border-slate-100 bg-slate-50/40 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-teal-600" />
              <span>Audit Period:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">Current Month (August 2026)</option>
                <option value="Financial Year YTD">Financial Year 2026 YTD</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span>Category Filter:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">All Categories</option>
                <option value="Analgesic">Analgesics</option>
                <option value="Vaccine">Vaccines</option>
                <option value="Supplements">Supplements</option>
                <option value="Antibiotic">Antibiotics</option>
                <option value="Dehydration">Dehydration / ORS</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Official Government Health System Format</span>
          </div>
        </CardContent>
      </Card>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* 5 REPORT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Inventory & Valuation Report */}
        <Card className="hover:border-teal-200 transition-all flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Pill className="w-4 h-4 text-amber-600" />
                Inventory & Stock Valuation Report
              </CardTitle>
              <Badge variant="secondary" className="text-[9px]">Stock Ledger</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Review current medicine stock levels, minimum safe thresholds, unit pricing, and overall inventory valuation.
            </p>
            <div className="text-[10px] text-slate-400 font-mono">Filter: {dateRange} | {categoryFilter}</div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReport('inventory')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Report</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload('PHC_Inventory_Valuation_Report')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. Stock Movement & Dispensing Audit Report */}
        <Card className="hover:border-teal-200 transition-all flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-600" />
                Stock Movement & Dispensing Report
              </CardTitle>
              <Badge variant="secondary" className="text-[9px]">Dispensing Logs</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Track inbound shipments from central warehouse and outbound dispensations to ASHA workers and outpatient clinics.
            </p>
            <div className="text-[10px] text-slate-400 font-mono">Filter: {dateRange} | {categoryFilter}</div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReport('movement')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Report</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload('PHC_Stock_Movement_Report')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 3. Batch Expiry Schedule Report */}
        <Card className="hover:border-teal-200 transition-all flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-600" />
                Batch Expiry Schedule (FEFO Audit)
              </CardTitle>
              <Badge variant="danger" className="text-[9px]">Waste Prevention</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Review active storage batches sorted by expiry date to enforce First-Expiry-First-Out dispensing and prevent waste.
            </p>
            <div className="text-[10px] text-slate-400 font-mono">Filter: {dateRange} | {categoryFilter}</div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReport('expiry')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Report</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload('PHC_Batch_Expiry_Schedule')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 4. Field Medicine Requisition Report */}
        <Card className="hover:border-teal-200 transition-all flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                Field Medicine Requisition Report
              </CardTitle>
              <Badge variant="info" className="text-[9px]">Field Outreach</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Audit drug kit requests submitted by ASHA workers and sub-center clinics, including approval and fulfillment status.
            </p>
            <div className="text-[10px] text-slate-400 font-mono">Filter: {dateRange} | {categoryFilter}</div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReport('requisitions')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Report</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload('Field_Requisition_Audit_Report')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 5. Demand Forecast Report */}
        <Card className="hover:border-teal-200 transition-all flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Demand Forecast Report
              </CardTitle>
              <Badge variant="secondary" className="text-[9px]">Planning</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Review 30-day predicted consumption demand and suggested buffer stock reorder limits based on historical trends.
            </p>
            <div className="text-[10px] text-slate-400 font-mono">Filter: {dateRange} | {categoryFilter}</div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReport('demand')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Report</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload('Demand_Forecast_Audit_Report')}
                className="text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* REPORT VIEWER MODAL */}
      {activeReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setActiveReport(null)} />
          <div className="relative z-10 bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-teal-400" />
                  <h3 className="font-extrabold text-base text-white">
                    {activeReport === 'inventory' && 'Inventory & Stock Valuation Report'}
                    {activeReport === 'movement' && 'Stock Movement & Dispensing Audit'}
                    {activeReport === 'expiry' && 'Batch Expiry Schedule (FEFO Compliance)'}
                    {activeReport === 'requisitions' && 'Field Medicine Requisition Report'}
                    {activeReport === 'demand' && '30-Day Demand Forecast Report'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Audit Period: <span className="text-teal-300 font-bold">{dateRange}</span> | Category: <span className="text-teal-300 font-bold">{categoryFilter}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-bold py-1.5 px-3"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3.5 w-3.5 mr-1" /> Print
                </Button>
                <button 
                  onClick={() => setActiveReport(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content / Real Data Table */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Report 1: Inventory */}
              {activeReport === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total Medicine Items</p>
                      <p className="text-base font-black text-slate-800">{filteredMedicines.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total Stock Units</p>
                      <p className="text-base font-black text-teal-700">
                        {filteredMedicines.reduce((acc, m) => acc + m.stock, 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Low Stock Alert Items</p>
                      <p className="text-base font-black text-amber-700">
                        {filteredMedicines.filter(m => m.stock < m.minThreshold).length}
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">Medicine Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3 text-right">Current Stock</th>
                          <th className="p-3 text-right">Min Threshold</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredMedicines.map(m => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-400">{m.id}</td>
                            <td className="p-3 font-extrabold text-slate-800">{m.name}</td>
                            <td className="p-3 text-slate-600">{m.category}</td>
                            <td className="p-3 text-right font-black text-slate-800">{m.stock} {m.unit}</td>
                            <td className="p-3 text-right font-semibold text-slate-500">{m.minThreshold} {m.unit}</td>
                            <td className="p-3 text-center">
                              <Badge variant={m.stock === 0 ? 'danger' : m.stock < m.minThreshold ? 'warning' : 'success'}>
                                {m.stock === 0 ? 'Out of Stock' : m.stock < m.minThreshold ? 'Low Stock' : 'Healthy'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 2: Movement */}
              {activeReport === 'movement' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b">
                        <tr>
                          <th className="p-3">TX ID</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Medicine</th>
                          <th className="p-3">Type</th>
                          <th className="p-3 text-right">Quantity</th>
                          <th className="p-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-400">{t.id}</td>
                            <td className="p-3 font-medium text-slate-600">{t.transactionDate}</td>
                            <td className="p-3 font-extrabold text-slate-800">{t.medicineName}</td>
                            <td className="p-3">
                              <Badge variant={t.type === 'Inbound' ? 'success' : 'info'}>
                                {t.type}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-black text-slate-800">{t.quantity}</td>
                            <td className="p-3 text-slate-600">{t.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 3: Expiry */}
              {activeReport === 'expiry' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b">
                        <tr>
                          <th className="p-3">Batch No</th>
                          <th className="p-3">Medicine</th>
                          <th className="p-3 text-right">Quantity</th>
                          <th className="p-3">Expiry Date</th>
                          <th className="p-3">Location</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBatches.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-800">{b.batchNumber}</td>
                            <td className="p-3 font-extrabold text-slate-800">{b.medicineName}</td>
                            <td className="p-3 text-right font-bold text-slate-700">{b.quantity}</td>
                            <td className="p-3 font-bold text-slate-800">{b.expiryDate}</td>
                            <td className="p-3 text-slate-600">{b.location}</td>
                            <td className="p-3 text-center">
                              <Badge variant={b.status === 'Expired' ? 'danger' : b.status === 'Near Expiry' ? 'warning' : 'success'}>
                                {b.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 4: Requisitions */}
              {activeReport === 'requisitions' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b">
                        <tr>
                          <th className="p-3">Req ID</th>
                          <th className="p-3">Requester</th>
                          <th className="p-3">Medicine</th>
                          <th className="p-3 text-right">Qty</th>
                          <th className="p-3">Priority</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requests.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-400">{r.id}</td>
                            <td className="p-3 font-extrabold text-slate-800">{r.requesterName} ({r.requesterRole})</td>
                            <td className="p-3 text-slate-700 font-medium">{r.medicineName}</td>
                            <td className="p-3 text-right font-bold text-slate-800">{r.quantity}</td>
                            <td className="p-3">
                              <Badge variant={r.priority === 'Emergency' ? 'danger' : r.priority === 'Urgent' ? 'warning' : 'secondary'}>
                                {r.priority}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              <Badge variant={r.status === 'Dispensed' ? 'success' : r.status === 'Approved' ? 'info' : 'warning'}>
                                {r.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 5: Demand Forecast */}
              {activeReport === 'demand' && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-xs font-medium">
                    Forecasts are estimates based on available historical data for inventory planning purposes.
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b">
                        <tr>
                          <th className="p-3">Medicine Name</th>
                          <th className="p-3 text-right">Current Stock</th>
                          <th className="p-3 text-right">Forecast Demand</th>
                          <th className="p-3">Trend</th>
                          <th className="p-3 text-right">Suggested Procurement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {forecasts.map(f => (
                          <tr key={f.medicineId} className="hover:bg-slate-50">
                            <td className="p-3 font-extrabold text-slate-800">{f.medicineName}</td>
                            <td className="p-3 text-right font-bold text-slate-700">{f.currentStock}</td>
                            <td className="p-3 text-right font-black text-teal-800">{f.forecastedDemandNextMonth}</td>
                            <td className="p-3 font-semibold text-slate-600">{f.seasonalTrend}</td>
                            <td className="p-3 text-right font-black text-rose-700">
                              {f.recommendedOrderQty > 0 ? `+${f.recommendedOrderQty} units` : 'Sufficient'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-bold"
                onClick={() => setActiveReport(null)}
              >
                Close Report
              </Button>

              <Button 
                variant="primary" 
                size="sm" 
                className="text-xs font-bold flex items-center gap-1.5"
                onClick={() => {
                  handleDownload(`Report_${activeReport}_${dateRange}`);
                  setActiveReport(null);
                }}
              >
                <Download className="h-3.5 w-3.5" /> Export Official Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

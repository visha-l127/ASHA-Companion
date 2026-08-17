import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getMedicines, 
  getBatches, 
  getTransactions, 
  getAlerts, 
  getRequests,
  getDemandForecasts, 
  initPharmacistLocalStorage,
  Medicine,
  MedicineBatch,
  StockTransaction,
  PharmacistAlert,
  MedicineRequest,
  DemandForecast
} from './localPharmacistHelper';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Badge, 
  Button 
} from '../../components/ui';
import { 
  Pill, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft,
  CalendarDays,
  ShieldAlert,
  Activity,
  PackageCheck,
  ChevronRight,
  Boxes,
  ClipboardList,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

export default function PharmacistDashboard() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [alerts, setAlerts] = useState<PharmacistAlert[]>([]);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'lowStock' | 'expiring' | 'consumed'>('all');

  useEffect(() => {
    initPharmacistLocalStorage();
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [meds, b, txs] = await Promise.all([
        getMedicines(),
        getBatches(),
        getTransactions()
      ]);
      const reqs = getRequests();
      const [alts, fc] = await Promise.all([
        getAlerts(meds, b),
        getDemandForecasts(meds)
      ]);

      setMedicines(meds);
      setBatches(b);
      setTransactions(txs);
      setAlerts(alts);
      setRequests(reqs);
      setForecasts(fc);
    } catch (err) {
      console.error("Failed to refresh dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Derived Metrics strictly from existing data
  const totalMedicinesCount = medicines.length;
  const lowStockMedicines = medicines.filter(m => m.stock < m.minThreshold);
  const lowStockCount = lowStockMedicines.length;
  const outOfStockCount = medicines.filter(m => m.stock === 0).length;
  const healthyStockCount = medicines.filter(m => m.stock >= m.minThreshold).length;

  const activeBatches = batches.filter(b => b.status === 'Active');
  const nearExpiryBatches = batches.filter(b => b.status === 'Near Expiry');
  const expiredBatches = batches.filter(b => b.status === 'Expired');

  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const totalTransactionsCount = transactions.length;

  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalAlertsCount = activeAlerts.filter(a => a.severity === 'Critical').length;

  // Consumption analytics from outbound stock transactions
  const outboundTransactions = transactions.filter(t => t.type === 'Outbound');
  const totalOutboundUnits = outboundTransactions.reduce((acc, t) => acc + t.quantity, 0);

  // Group consumption by medicine name
  const consumptionMap: Record<string, number> = {};
  outboundTransactions.forEach(t => {
    consumptionMap[t.medicineName] = (consumptionMap[t.medicineName] || 0) + t.quantity;
  });

  const topConsumedList = Object.entries(consumptionMap)
    .map(([medicineName, quantity]) => ({ medicineName, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Stock status pie chart data
  const stockPieData = [
    { name: 'Healthy Stock', value: healthyStockCount, color: '#10b981' },
    { name: 'Low Stock', value: lowStockCount - outOfStockCount, color: '#f59e0b' },
    { name: 'Out of Stock', value: outOfStockCount, color: '#f43f5e' },
  ].filter(item => item.value > 0);

  // Batch expiry status chart data
  const batchPieData = [
    { name: 'Valid / Active', value: activeBatches.length, color: '#0d9488' },
    { name: 'Expiring Soon (<30d)', value: nearExpiryBatches.length, color: '#f59e0b' },
    { name: 'Expired', value: expiredBatches.length, color: '#f43f5e' },
  ].filter(item => item.value > 0);

  // Nearest expiring batches list
  const nearestExpiringBatches = [...batches]
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-8 w-8 text-teal-600 animate-spin" />
        <p className="text-sm font-bold text-slate-700">Loading Pharmacy Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 md:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                PHC Pharmacy Workstation
              </span>
              <span className="text-xs text-slate-400 font-mono">Real-time Data Sync</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Pharmacy Analytics
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              Monitor stock movement, medicine demand, expiry, and pharmacy activity.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs font-bold py-2 px-3.5 backdrop-blur-md"
              onClick={refreshData}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reload Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Operational Questions Bar */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-teal-600" /> Operational Overview Questions
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Click to navigate or inspect</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          <button
            onClick={() => setActiveTab('lowStock')}
            className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
              activeTab === 'lowStock' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Low Stock</span>
            <span className={`font-black text-sm block ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {lowStockCount} items
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expiring')}
            className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
              activeTab === 'expiring' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Expiring Soon</span>
            <span className="font-black text-sm text-amber-700 block">
              {nearExpiryBatches.length} batches
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expiring')}
            className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
              activeTab === 'expiring' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20' : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Expired</span>
            <span className={`font-black text-sm block ${expiredBatches.length > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
              {expiredBatches.length} batches
            </span>
          </button>

          <button
            onClick={() => setActiveTab('consumed')}
            className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
              activeTab === 'consumed' ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20' : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Top Consumed</span>
            <span className="font-black text-sm text-teal-800 block">
              {topConsumedList.length} drugs
            </span>
          </button>

          <button
            onClick={() => navigate('/pharmacist/forecast')}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 text-left transition-all text-xs"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block">5. Demand Forecast</span>
            <span className="font-black text-sm text-indigo-700 block flex items-center justify-between">
              View <ArrowRight className="h-3 w-3" />
            </span>
          </button>

          <button
            onClick={() => navigate('/pharmacist/alerts')}
            className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
              criticalAlertsCount > 0 ? 'bg-rose-50/80 border-rose-200' : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block">6. Active Alerts</span>
            <span className={`font-black text-sm block ${activeAlerts.length > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
              {activeAlerts.length} alerts
            </span>
          </button>

          <button
            onClick={() => navigate('/pharmacist/reports')}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 text-left transition-all text-xs"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block">7. Reports</span>
            <span className="font-black text-sm text-blue-700 block flex items-center justify-between">
              5 Available <ArrowRight className="h-3 w-3" />
            </span>
          </button>
        </div>
      </div>

      {/* Critical Action Banner (If stockout or expired present) */}
      {(outOfStockCount > 0 || expiredBatches.length > 0 || lowStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                Action Required: Immediate Stock & Safety Risks Detected
              </h4>
              <p className="text-xs text-slate-700 font-medium mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                {outOfStockCount > 0 && <span className="font-extrabold text-rose-700">• {outOfStockCount} item(s) Out of Stock</span>}
                {expiredBatches.length > 0 && <span className="font-extrabold text-rose-700">• {expiredBatches.length} batch(es) Expired</span>}
                {lowStockCount > 0 && <span className="font-bold text-amber-800">• {lowStockCount} item(s) Low Stock</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button 
              variant="danger" 
              size="sm" 
              className="text-xs font-bold px-3.5 py-2 flex items-center gap-1.5"
              onClick={() => navigate('/pharmacist/alerts')}
            >
              Resolve Alerts <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* SUMMARY METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Medicines */}
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Medicines</span>
              <Pill className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">{totalMedicinesCount}</h3>
            <p className="text-[10px] text-teal-700 font-semibold">Registered Items</p>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className={`hover:border-amber-200 transition-all ${lowStockCount > 0 ? 'bg-amber-50/20 border-amber-200' : ''}`}>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock</span>
              <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {lowStockCount}
            </h3>
            <p className="text-[10px] text-amber-700 font-semibold">Below min threshold</p>
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card className={`hover:border-amber-200 transition-all ${nearExpiryBatches.length > 0 ? 'bg-amber-50/20 border-amber-200' : ''}`}>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Expiring Soon</span>
              <CalendarDays className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className={`text-2xl font-black ${nearExpiryBatches.length > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {nearExpiryBatches.length}
            </h3>
            <p className="text-[10px] text-amber-700 font-semibold">&lt; 30 Days Remaining</p>
          </CardContent>
        </Card>

        {/* Expired */}
        <Card className={`hover:border-rose-200 transition-all ${expiredBatches.length > 0 ? 'bg-rose-50/20 border-rose-200' : ''}`}>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Expired</span>
              <ShieldAlert className={`h-4 w-4 ${expiredBatches.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-2xl font-black ${expiredBatches.length > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
              {expiredBatches.length}
            </h3>
            <p className="text-[10px] text-rose-700 font-semibold">Discard immediately</p>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Requests</span>
              <ClipboardList className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">{pendingRequestsCount}</h3>
            <p className="text-[10px] text-indigo-700 font-semibold">ASHA & Clinic Requisitions</p>
          </CardContent>
        </Card>

        {/* Stock Transactions */}
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Stock Transactions</span>
              <RefreshCw className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">{totalTransactionsCount}</h3>
            <p className="text-[10px] text-teal-700 font-semibold">Logged movements</p>
          </CardContent>
        </Card>
      </div>

      {/* STOCK OVERVIEW & EXPIRY OVERVIEW GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STOCK OVERVIEW CARD */}
        <Card className="border-slate-100 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-teal-600" />
                Stock Balance Overview
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-[11px] font-bold h-7 py-0"
                onClick={() => navigate('/pharmacist/medicines')}
              >
                View All Medicines
              </Button>
            </div>
            <CardDescription className="text-xs">
              Real-time classification of therapeutic items by minimum safe stock thresholds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Healthy Stock</p>
                <p className="text-lg font-black text-emerald-700">{healthyStockCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Low Stock</p>
                <p className="text-lg font-black text-amber-700">{lowStockCount - outOfStockCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Out of Stock</p>
                <p className="text-lg font-black text-rose-700">{outOfStockCount}</p>
              </div>
            </div>

            {/* Low Stock Table */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Low & Out of Stock Items ({lowStockCount})
              </h4>
              {lowStockMedicines.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Medicine Name</th>
                        <th className="p-2.5 text-right">Current Stock</th>
                        <th className="p-2.5 text-right">Min Threshold</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lowStockMedicines.slice(0, 5).map(m => {
                        const isZero = m.stock === 0;
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-extrabold text-slate-800">{m.name}</td>
                            <td className={`p-2.5 text-right font-black ${isZero ? 'text-rose-600' : 'text-amber-700'}`}>
                              {m.stock} {m.unit}
                            </td>
                            <td className="p-2.5 text-right text-slate-500 font-semibold">{m.minThreshold} {m.unit}</td>
                            <td className="p-2.5 text-center">
                              <Badge variant={isZero ? 'danger' : 'warning'} className="text-[9px] py-0 px-1.5 font-bold">
                                {isZero ? 'Out of Stock' : 'Low Stock'}
                              </Badge>
                            </td>
                            <td className="p-2.5 text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-[10px] py-1 px-2 h-6 font-bold"
                                onClick={() => navigate('/pharmacist/transactions?action=adjust')}
                              >
                                Restock
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50/40 rounded-xl">
                  All medicines are currently within safe stock limits.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* EXPIRY OVERVIEW CARD */}
        <Card className="border-slate-100 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-600" />
                Batch Expiry Safety Overview
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-[11px] font-bold h-7 py-0"
                onClick={() => navigate('/pharmacist/batches')}
              >
                View All Batches
              </Button>
            </div>
            <CardDescription className="text-xs">
              Monitor batch expiry dates to maintain First-Expiry First-Out (FEFO) dispensing rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Valid Batches</p>
                <p className="text-lg font-black text-teal-700">{activeBatches.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Expiring (&lt;30d)</p>
                <p className="text-lg font-black text-amber-700">{nearExpiryBatches.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Expired</p>
                <p className="text-lg font-black text-rose-700">{expiredBatches.length}</p>
              </div>
            </div>

            {/* Nearest Expiring Batches Table */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" /> Nearest Expiring Batches
              </h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Medicine & Batch</th>
                      <th className="p-2.5">Location</th>
                      <th className="p-2.5">Expiry Date</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {nearestExpiringBatches.map(b => {
                      const isExpired = b.status === 'Expired';
                      const isNear = b.status === 'Near Expiry';
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5">
                            <span className="font-extrabold text-slate-800 block">{b.medicineName}</span>
                            <span className="text-[10px] font-mono text-slate-400">Batch: {b.batchNumber}</span>
                          </td>
                          <td className="p-2.5 text-slate-600 font-medium">{b.location}</td>
                          <td className="p-2.5 font-bold text-slate-700">{b.expiryDate}</td>
                          <td className="p-2.5 text-center">
                            <Badge variant={isExpired ? 'danger' : isNear ? 'warning' : 'success'} className="text-[9px] py-0 px-1.5 font-bold">
                              {b.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CONSUMPTION ANALYTICS & DEMAND PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Consumed Medicines Chart / List */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                Consumption Analytics & Usage Patterns
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-bold">Outbound History</Badge>
            </div>
            <CardDescription className="text-xs">
              Total outbound units issued to ASHA workers, sub-centers, and outpatient clinics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topConsumedList.length > 0 ? (
              <div className="space-y-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topConsumedList} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="medicineName" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        labelClassName="font-extrabold text-slate-700 text-xs"
                      />
                      <Bar dataKey="quantity" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={32} name="Units Consumed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Most Frequently Issued List</h4>
                  <div className="space-y-2">
                    {topConsumedList.map((item, idx) => (
                      <div key={item.medicineName} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/60">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">0{idx + 1}.</span>
                          <span className="font-bold text-slate-800">{item.medicineName}</span>
                        </div>
                        <span className="font-black text-teal-700">{item.quantity} units issued</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                Not enough transaction history for a meaningful trend.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demand Forecasting Quick Card */}
        <Card className="border-slate-100 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                Demand Forecast Preview
              </CardTitle>
              <Badge variant="info" className="text-[9px]">30-Day Model</Badge>
            </div>
            <CardDescription className="text-xs">
              Estimated demand based on available historical data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {forecasts.slice(0, 4).map(f => {
                const isRunout = f.currentStock < f.forecastedDemandNextMonth;
                return (
                  <div key={f.medicineId} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{f.medicineName}</p>
                      <p className="text-[10px] text-slate-500">Stock: {f.currentStock} | Est. Demand: {f.forecastedDemandNextMonth}</p>
                    </div>
                    {isRunout ? (
                      <Badge variant="danger" className="text-[9px]">Runout Risk</Badge>
                    ) : (
                      <Badge variant="success" className="text-[9px]">Sufficient</Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-relaxed font-medium">
              Forecasts are estimates based on available historical data for inventory planning purposes.
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs font-bold py-2 border-slate-200"
              onClick={() => navigate('/pharmacist/forecast')}
            >
              Open Demand Forecast Module <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAlerts, 
  resolveAlert, 
  getMedicines,
  getBatches,
  getRequests,
  initPharmacistLocalStorage, 
  PharmacistAlert,
  Medicine,
  MedicineBatch,
  MedicineRequest
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
import { PageHeader } from '../../components/PageHeader';
import { 
  AlertTriangle, 
  Check, 
  Search, 
  Filter, 
  ShieldAlert, 
  Info, 
  Calendar, 
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  X,
  ExternalLink,
  Pill,
  Layers,
  ClipboardList
} from 'lucide-react';

export default function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<PharmacistAlert[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [showResolved, setShowResolved] = useState(false);

  // Selected alert for modal inspector
  const [inspectAlert, setInspectAlert] = useState<PharmacistAlert | null>(null);

  useEffect(() => {
    initPharmacistLocalStorage();
    refreshAlerts();
  }, []);

  const refreshAlerts = async () => {
    try {
      const [alts, meds, bts, reqs] = await Promise.all([
        getAlerts(),
        getMedicines(),
        getBatches(),
        getRequests()
      ]);
      setAlerts(alts);
      setMedicines(meds);
      setBatches(bts);
      setRequests(reqs);
    } catch (err) {
      console.error("Failed to refresh alerts:", err);
    }
  };

  const handleResolveAlert = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await resolveAlert(id);
    if (inspectAlert?.id === id) {
      setInspectAlert(null);
    }
    await refreshAlerts();
  };

  const handleResolveAll = async () => {
    const activeAlerts = alerts.filter(a => !a.resolved);
    await Promise.all(activeAlerts.map(a => resolveAlert(a.id)));
    await refreshAlerts();
  };

  // Filter alerts strictly based on state
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'All' || 
                        (selectedType === 'Stockout' && (a.type === 'Stockout' || a.title.includes('Stock'))) ||
                        (selectedType === 'Expiry' && (a.type === 'Expiry' || a.title.includes('Batch') || a.title.includes('Expired'))) ||
                        a.type === selectedType;

    const matchesSeverity = selectedSeverity === 'All' || a.severity === selectedSeverity;
    const matchesResolvedState = showResolved ? true : !a.resolved;

    return matchesSearch && matchesType && matchesSeverity && matchesResolvedState;
  });

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;
  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'Critical').length;
  const warningCount = alerts.filter(a => !a.resolved && a.severity === 'Warning').length;

  // Detail Modal Helper Data
  const relatedMedicine = inspectAlert?.medicineId 
    ? medicines.find(m => m.id === inspectAlert.medicineId) 
    : null;

  const relatedBatch = inspectAlert?.batchId 
    ? batches.find(b => b.id === inspectAlert.batchId) 
    : null;

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Alerts"
        description="Monitor low stock conditions, expiring batches, and critical pharmacy activity."
        breadcrumbs={[
          { label: 'Pharmacy Analytics', to: '/pharmacist/dashboard' },
          { label: 'Alerts' }
        ]}
        action={
          activeAlertsCount > 0 ? {
            label: 'Resolve All Active Alerts',
            icon: Check,
            onClick: handleResolveAll,
            variant: 'outline'
          } : undefined
        }
      />

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Critical Level warnings */}
        <Card className="bg-gradient-to-r from-rose-50 to-rose-100/40 border-rose-200 shadow-xs">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Critical Priority</p>
              <h3 className="text-xl font-black text-rose-950">{criticalCount} Threats</h3>
              <p className="text-[10px] text-rose-700 font-semibold mt-0.5">Stockouts or expired batches</p>
            </div>
          </CardContent>
        </Card>

        {/* Warning Level warnings */}
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100/40 border-amber-200 shadow-xs">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Warning Priority</p>
              <h3 className="text-xl font-black text-amber-950">{warningCount} Warnings</h3>
              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Near threshold or near expiry</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Active Warnings */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100/60 border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-slate-800 text-white rounded-2xl shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Active Alerts</p>
              <h3 className="text-xl font-black text-slate-800">{activeAlertsCount} Active</h3>
              <p className="text-[10px] text-slate-600 font-semibold mt-0.5">System safeguards trigger</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Station */}
      <Card className="border-slate-100 shadow-sm bg-slate-50/40">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search alerts by title, medicine name..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                className="bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="All">All Alert Types</option>
                <option value="Stockout">Low Stock & Stockout</option>
                <option value="Expiry">Expiry Warnings</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 text-slate-400" />
              <select
                className="bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical Threats</option>
                <option value="Warning">Advisories</option>
              </select>
            </div>

            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                showResolved 
                  ? 'bg-teal-50 border-teal-200 text-teal-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {showResolved ? 'Hide Resolved' : 'Include Resolved'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Alert Cards Grid */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'Critical';
          const isResolved = alert.resolved;

          return (
            <Card 
              key={alert.id} 
              className={`border transition-all cursor-pointer ${
                isResolved
                  ? 'bg-slate-50/50 border-slate-200 opacity-70'
                  : isCritical 
                    ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300 shadow-xs' 
                    : 'bg-amber-50/30 border-amber-200 hover:border-amber-300 shadow-xs'
              }`}
              onClick={() => setInspectAlert(alert)}
            >
              <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isResolved
                      ? 'bg-slate-100 text-slate-500'
                      : isCritical 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isResolved ? <CheckCircle2 className="h-5 w-5" /> : isCritical ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-extrabold text-xs sm:text-sm ${isResolved ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {alert.title}
                      </h4>
                      <Badge variant={isResolved ? 'secondary' : isCritical ? 'danger' : 'warning'} className="text-[9px] font-bold py-0.5 px-2">
                        {isResolved ? 'Resolved' : alert.severity}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400">ID: {alert.id}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                      <span className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">{alert.type}</span>
                      <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> Generated: {alert.dateGenerated}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold py-1.5 px-3 border-slate-200 bg-white hover:bg-slate-50"
                    onClick={() => setInspectAlert(alert)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1 text-slate-500" /> Details
                  </Button>

                  {!isResolved && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 text-xs font-bold py-1.5 px-3"
                      onClick={(e) => handleResolveAlert(alert.id, e)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredAlerts.length === 0 && (
          <Card className="p-12 text-center border-slate-100 shadow-sm bg-slate-50/30">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">No alert conditions currently detected.</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                No active stockouts, expiring batches, or system safeguards match your filter options.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Alert Detail Inspector Modal */}
      {inspectAlert && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setInspectAlert(null)} />
          <div className="relative z-10 bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className={`p-4 border-b flex items-center justify-between ${
              inspectAlert.severity === 'Critical' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
            }`}>
              <div className="flex items-center space-x-2">
                <ShieldAlert className={`h-5 w-5 ${inspectAlert.severity === 'Critical' ? 'text-rose-600' : 'text-amber-600'}`} />
                <h3 className="font-extrabold text-slate-900 text-sm">Alert Inspector & Detail</h3>
              </div>
              <button 
                onClick={() => setInspectAlert(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={inspectAlert.severity === 'Critical' ? 'danger' : 'warning'} className="text-[10px]">
                    {inspectAlert.severity} Priority
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">Date: {inspectAlert.dateGenerated}</span>
                </div>
                <h4 className="text-base font-black text-slate-900 pt-1">{inspectAlert.title}</h4>
                <p className="text-slate-600 leading-relaxed font-medium">{inspectAlert.message}</p>
              </div>

              {/* Related Medicine Info if present */}
              {relatedMedicine && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Pill className="h-3 w-3 text-teal-600" /> Related Medicine Item
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{relatedMedicine.name}</span>
                    <span className="font-bold text-teal-700">{relatedMedicine.stock} {relatedMedicine.unit} (Min: {relatedMedicine.minThreshold})</span>
                  </div>
                </div>
              )}

              {/* Related Batch Info if present */}
              {relatedBatch && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="h-3 w-3 text-amber-600" /> Related Storage Batch
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Batch {relatedBatch.batchNumber}</span>
                    <span className="font-bold text-rose-600">Expires: {relatedBatch.expiryDate}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Location: {relatedBatch.location} | Qty: {relatedBatch.quantity}</p>
                </div>
              )}

              {/* Recommended Action Links using existing routes */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Existing Action</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs font-bold justify-between"
                    onClick={() => {
                      setInspectAlert(null);
                      navigate('/pharmacist/medicines');
                    }}
                  >
                    <span>View Medicine</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs font-bold justify-between"
                    onClick={() => {
                      setInspectAlert(null);
                      navigate('/pharmacist/batches');
                    }}
                  >
                    <span>View Batch</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs font-bold justify-between"
                    onClick={() => {
                      setInspectAlert(null);
                      navigate('/pharmacist/requests');
                    }}
                  >
                    <span>View Requisition</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs font-bold justify-between"
                    onClick={() => {
                      setInspectAlert(null);
                      navigate('/pharmacist/transactions');
                    }}
                  >
                    <span>View Transaction</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-bold"
                onClick={() => setInspectAlert(null)}
              >
                Close
              </Button>

              {!inspectAlert.resolved && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="text-xs font-bold"
                  onClick={() => handleResolveAlert(inspectAlert.id)}
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { priorityVisitApi, adminApi } from '../../utils/apiClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter,
  Button, 
  Input, 
  Select, 
  Badge 
} from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { 
  Calendar, 
  User, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  ClipboardCheck,
  UserCheck
} from 'lucide-react';

const priorityVisitSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  village: z.string().min(2, 'Village is required'),
  ashaId: z.string().min(1, 'Please select an ASHA worker'),
  condition: z.string().min(3, 'Condition description is required'),
  urgency: z.enum(['Critical', 'High', 'Medium', 'Low']),
  notes: z.string().min(3, 'Instructions for the ASHA are required'),
});

type PriorityVisitValues = z.infer<typeof priorityVisitSchema>;

export default function PriorityVisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [ashas, setAshas] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Filtering & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsha, setSelectedAsha] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed'>('All');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(priorityVisitSchema),
    defaultValues: {
      patientName: '',
      village: 'Madukkarai',
      ashaId: '',
      condition: '',
      urgency: 'High',
      notes: ''
    }
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setErrorMessage(null);
      const visitsData = await priorityVisitApi.getAll();
      setVisits(visitsData);

      const users = await adminApi.getUsers();
      const mappedAshas = users
        .filter((u: any) => u.role && u.role.toLowerCase() === 'asha')
        .map((u: any) => ({
          id: String(u.id),
          name: u.name,
          sector: u.phcId || 'Sector 1'
        }));
      setAshas(mappedAshas);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Failed to load priority visits from backend.");
    }
  };

  const handleOpenForm = () => {
    reset({
      patientName: '',
      village: ashas.length > 0 ? ashas[0].sector : 'Madukkarai',
      ashaId: ashas.length > 0 ? ashas[0].id : '',
      condition: '',
      urgency: 'High',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const onSubmitForm = async (data: PriorityVisitValues) => {
    const selectedAshaObj = ashas.find(a => a.id === data.ashaId);
    if (!selectedAshaObj) return;

    try {
      setErrorMessage(null);
      await priorityVisitApi.create({
        patientName: data.patientName,
        village: data.village,
        ashaId: data.ashaId,
        ashaName: selectedAshaObj.name,
        condition: data.condition,
        urgency: data.urgency,
        notes: data.notes
      });
      setIsFormOpen(false);
      refreshData();
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Failed to create priority visit on backend.");
    }
  };

  const handleToggleStatus = async (id: number | string, currentStatus: string) => {
    try {
      setErrorMessage(null);
      const nextStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await priorityVisitApi.update(id, { status: nextStatus });
      refreshData();
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Failed to update visit status on backend.");
    }
  };

  const handleDeleteVisit = async (id: number | string) => {
    try {
      setErrorMessage(null);
      await priorityVisitApi.delete(id);
      refreshData();
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Failed to delete visit from backend.");
    }
  };

  // Filter logic
  const filteredVisits = visits.filter(v => {
    const matchesSearch = (v.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (v.condition || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (v.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAsha = selectedAsha === 'All' || String(v.ashaId) === selectedAsha;
    const matchesUrgency = selectedUrgency === 'All' || v.urgency === selectedUrgency;
    const matchesTab = activeTab === 'All' || v.status === activeTab;

    return matchesSearch && matchesAsha && matchesUrgency && matchesTab;
  });

  const pendingCount = visits.filter(v => v.status === 'Pending').length;
  const completedCount = visits.filter(v => v.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Priority Clinical Visits"
        description="Delegate high-priority home visits, specify clinical action items, and track live compliance status across the sector."
        breadcrumbs={[
          { label: 'Dashboard', to: '/supervisor/dashboard' },
          { label: 'Priority Visits' }
        ]}
        action={{
          label: 'Delegate Priority Visit',
          icon: Plus,
          onClick: handleOpenForm
        }}
      />

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-50/50">
          <CardContent className="pt-5 flex items-center space-x-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Logged</p>
              <h3 className="text-sm font-black text-slate-800">{visits.length} Assignments</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">All historic delegations</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/30 border-amber-100">
          <CardContent className="pt-5 flex items-center space-x-4">
            <div className="p-3 bg-amber-500 text-white rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase">Awaiting Action</p>
              <h3 className="text-sm font-black text-amber-955">{pendingCount} Pending Visits</h3>
              <p className="text-[10px] text-amber-700 font-bold mt-0.5">Active field checkups</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/30 border-emerald-100">
          <CardContent className="pt-5 flex items-center space-x-4">
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase">Verification Done</p>
              <h3 className="text-sm font-black text-emerald-950">{completedCount} Closed</h3>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Checked & verified by MO</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and search toolbar */}
      <Card className="border-slate-100 shadow-sm bg-slate-50/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search priority visits by patient name, diagnosis, notes..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter ASHA */}
              <div className="flex items-center space-x-2 bg-white px-3 py-1 border border-slate-200 rounded-xl">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  className="text-xs font-semibold bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer"
                  value={selectedAsha}
                  onChange={(e) => setSelectedAsha(e.target.value)}
                >
                  <option value="All">All ASHAs</option>
                  {ashas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter Urgency */}
              <div className="flex items-center space-x-2 bg-white px-3 py-1 border border-slate-200 rounded-xl">
                <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                <select
                  className="text-xs font-semibold bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer"
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                >
                  <option value="All">All Urgency Levels</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom segment tabs */}
          <div className="flex border-b border-slate-150">
            {(['All', 'Pending', 'Completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 text-xs font-bold transition-all border-b-2 mr-2 ${
                  activeTab === tab
                    ? 'border-teal-600 text-teal-700 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'All' ? 'All Assignments' : tab === 'Pending' ? `Pending Queue (${pendingCount})` : `Completed Archive (${completedCount})`}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid List of priority visits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVisits.map((v, idx) => {
          const isPending = v.status === 'Pending';
          
          let urgencyColor = 'bg-slate-100 text-slate-700 border-slate-200';
          if (v.urgency === 'Critical') urgencyColor = 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
          else if (v.urgency === 'High') urgencyColor = 'bg-amber-50 text-amber-700 border-amber-100';
          else if (v.urgency === 'Medium') urgencyColor = 'bg-blue-50 text-blue-700 border-blue-100';

          return (
            <Card key={`pv-card-${v.id || idx}-${idx}`} className={`border transition-all duration-200 ${isPending ? 'border-slate-200 hover:shadow-md' : 'border-slate-100 bg-slate-50/40 opacity-80'}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center">
                      {v.patientName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{v.village}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={`text-[8px] font-bold uppercase border py-0.5 px-2 ${urgencyColor}`}>
                      {v.urgency}
                    </Badge>
                    <Badge variant={isPending ? 'warning' : 'success'} className="text-[8px] font-bold uppercase py-0.5 px-2">
                      {v.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {/* Clinical reason */}
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinical Context</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">{v.condition}</p>
                </div>

                {/* Notes/Instructions */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Supervisor Directives</span>
                  <p className="text-xs text-slate-600 leading-normal bg-teal-50/20 border border-teal-50/50 p-2.5 rounded-xl">{v.notes}</p>
                </div>

                {/* Handled by info */}
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                  <span className="flex items-center text-slate-500 font-medium">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
                    Assigned: <strong className="text-slate-700 ml-1">{v.ashaName}</strong>
                  </span>
                  <span className="text-slate-400 font-mono flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {v.assignedDate}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 border-t border-slate-50/80 py-3 flex justify-between items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 font-bold flex items-center gap-1"
                  onClick={() => handleDeleteVisit(v.id)}
                >
                  <X className="h-3.5 w-3.5 text-rose-600" />
                  <span>Delete</span>
                </Button>
                <Button 
                  type="button"
                  variant={isPending ? 'outline' : 'ghost'} 
                  size="xs"
                  className={`text-xs font-bold flex items-center gap-1.5 ${isPending ? 'border-teal-200 text-teal-700 hover:bg-teal-50' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => handleToggleStatus(v.id, v.status)}
                >
                  <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                  {isPending ? 'Mark as Completed / Visited' : 'Re-open Assignment'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {filteredVisits.length === 0 && (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-800 text-sm">No priority visits found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              There are no patient visits in this view matching your query.
            </p>
          </div>
        )}
      </div>

      {/* Delegate Priority Visit Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          <Card className="relative z-10 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150 bg-white">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100">
              <div>
                <CardTitle>Delegate Priority Home Visit</CardTitle>
                <CardDescription>
                  Issue a dedicated action item directly to an ASHA worker in her field companion app.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100"
                onClick={() => setIsFormOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
              <CardContent className="space-y-4 pt-4">
                {/* Patient Name */}
                <Input
                  label="Patient name"
                  placeholder="e.g. Meera Bai"
                  error={errors.patientName?.message}
                  {...register('patientName')}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Village selection */}
                  <Select
                    label="Patient Village"
                    options={[
                      { value: 'Madukkarai', label: 'Madukkarai' },
                      { value: 'Thondamuthur', label: 'Thondamuthur' },
                      { value: 'Sulur', label: 'Sulur' },
                      { value: 'Karamadai', label: 'Karamadai' },
                    ]}
                    error={errors.village?.message}
                    {...register('village')}
                  />

                  {/* Urgency Selection */}
                  <Select
                    label="Urgency Level"
                    options={[
                      { value: 'Critical', label: 'Critical' },
                      { value: 'High', label: 'High' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Low', label: 'Low' },
                    ]}
                    error={errors.urgency?.message}
                    {...register('urgency')}
                  />
                </div>

                {/* Select ASHA worker */}
                <Select
                  label="Assign ASHA Volunteer"
                  options={ashas.map(a => ({ value: a.id, label: `${a.name} (${a.sector})` }))}
                  error={errors.ashaId?.message}
                  {...register('ashaId')}
                />

                {/* Condition Reason */}
                <Input
                  label="Clinical Reason / Target Condition"
                  placeholder="e.g. Gestational Hypertension 156/98 checkup"
                  error={errors.condition?.message}
                  {...register('condition')}
                />

                {/* Supervisor Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Directives / Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Provide actionable directions (e.g. counseling steps, medicine verification)..."
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 placeholder:text-slate-400"
                    {...register('notes')}
                  />
                  {errors.notes?.message && <p className="text-[10px] text-rose-600 font-semibold">{errors.notes?.message as string}</p>}
                </div>
              </CardContent>
              <CardFooter className="py-4 bg-slate-50 flex justify-end space-x-2 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm"
                >
                  Issue Visit Delegation
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

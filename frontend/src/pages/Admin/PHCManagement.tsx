import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Building2, 
  Phone, 
  Calendar,
  Layers,
  Check,
  Eye,
  UserCheck,
  ShieldAlert,
  Users,
  Ban,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  getPHCs, 
  savePHCs, 
  PHC, 
  addAuditLog,
  getAdminUsers,
  saveAdminUsers,
  AdminUser,
  getAuditLogs
} from './localStorageHelper';
import { adminApi } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

// Zod validation schema
const phcSchema = z.object({
  name: z.string().min(5, { message: 'PHC facility name must be at least 5 characters long' }),
  code: z.string().regex(/^PHC-[A-Z]{3}-\d{2}$/, { 
    message: 'Facility Code must match format: PHC-XXX-01 (e.g., PHC-RMP-01)' 
  }),
  district: z.string().min(3, { message: 'District name is required' }),
  beds: z.coerce.number().min(0, { message: 'Beds count must be 0 or more' }),
  contactNumber: z.string().min(10, { message: 'Please enter a valid clinical phone number' }),
  status: z.enum(['active', 'inactive']),
  establishedYear: z.coerce.number()
    .min(1950, { message: 'Year must be 1950 or later' })
    .max(new Date().getFullYear(), { message: 'Year cannot be in the future' }),
  supervisorId: z.string().optional(),
});

type PHCFormValues = z.infer<typeof phcSchema>;

export default function PHCManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  
  // Feedback banners
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modal management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPhc, setEditingPhc] = useState<PHC | null>(null);
  const [phcToDisable, setPhcToDisable] = useState<PHC | null>(null);
  const [inspectPhc, setInspectPhc] = useState<PHC | null>(null);

  // Load datasets
  useEffect(() => {
    refreshDatasets();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleAddNewClick();
    }
  }, [searchParams]);

  const refreshDatasets = async () => {
    let localPhcs = getPHCs();
    setUsers(getAdminUsers());

    try {
      const backendPhcs = await adminApi.getPHCs();
      if (Array.isArray(backendPhcs)) {
        const liveList: PHC[] = backendPhcs.map((bp: any) => {
          const existing = localPhcs.find(lp => lp.code === bp.code || String(lp.id) === String(bp.id));
          return {
            id: String(bp.id),
            name: bp.name,
            code: bp.code,
            district: bp.district || 'Coimbatore',
            beds: bp.beds || existing?.beds || 15,
            contactNumber: bp.contactNumber || existing?.contactNumber || '+91 94421 00000',
            status: 'active' as const,
            establishedYear: bp.establishedYear || existing?.establishedYear || 2020,
          };
        });

        // Retain any purely local PHCs
        localPhcs.forEach(lp => {
          if (!liveList.some(l => l.code === lp.code || l.id === lp.id)) {
            liveList.push(lp);
          }
        });

        localPhcs = liveList;
      }
    } catch (backendErr) {
      console.warn('Backend PHC fetch note:', backendErr);
    }

    setPhcs(localPhcs);
    savePHCs(localPhcs);
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const uniqueDistricts = Array.from(new Set(phcs.map(p => p.district)));
  const supervisorList = users.filter(u => u.role === 'supervisor');

  // Setup form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PHCFormValues>({
    resolver: zodResolver(phcSchema) as any,
    defaultValues: {
      name: '',
      code: '',
      district: '',
      beds: 0,
      contactNumber: '',
      status: 'active',
      establishedYear: 2020,
      supervisorId: '',
    }
  });

  // Find supervisor assigned to a specific PHC
  const getAssignedSupervisor = (phc: PHC): AdminUser | undefined => {
    return users.find(u => 
      u.role === 'supervisor' && 
      (u.facilityId === phc.id || 
       u.facilityName?.toLowerCase() === phc.name.toLowerCase())
    );
  };

  // Handle Edit Click
  const handleEditClick = (phc: PHC, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPhc(phc);
    const assignedSup = users.find(u => u.facilityId === phc.id || u.assignedPHC === phc.name);
    reset({
      name: phc.name,
      code: phc.code,
      district: phc.district,
      beds: phc.beds,
      contactNumber: phc.contactNumber,
      status: phc.status,
      establishedYear: phc.establishedYear,
      supervisorId: assignedSup?.id || '',
    });
    setIsFormOpen(true);
  };

  // Open Form for Adding New PHC
  const handleAddNewClick = () => {
    setEditingPhc(null);
    reset({
      name: '',
      code: 'PHC-NEW-01',
      district: 'Coimbatore',
      beds: 10,
      contactNumber: '',
      status: 'active',
      establishedYear: 2025,
      supervisorId: '',
    });
    setIsFormOpen(true);
  };

  // Submit Handler
  const onSubmitForm = async (data: PHCFormValues) => {
    try {
      let targetPhcId = editingPhc?.id;

      if (editingPhc) {
        // Edit mode - call real backend PUT /phcs/{id}
        let backendId = Number(editingPhc.id);
        if (isNaN(backendId) || backendId <= 0) {
          const live = await adminApi.getPHCs();
          const match = live.find((p: any) => p.code === editingPhc.code);
          if (match) backendId = Number(match.id);
        }

        if (backendId && !isNaN(backendId) && backendId > 0) {
          await adminApi.updatePHC(backendId, {
            name: data.name,
            code: data.code,
            district: data.district,
            block: data.district || 'Coimbatore',
          });
        }
        addAuditLog(data.name, 'Admin', `Updated PHC details: ${data.code}`, 'info');
        showFeedback(`✓ PHC updated successfully`);
      } else {
        // Add mode - Create in backend Oracle DB
        const created = await adminApi.createPHC({
          name: data.name,
          code: data.code,
          district: data.district,
          block: data.district || 'Coimbatore',
        });
        targetPhcId = String(created?.id || Date.now());
        addAuditLog(data.name, 'Admin', `Registered new PHC center: ${data.code}`, 'success');
        showFeedback(`✓ PHC created successfully`);
      }

      // Assign supervisor if selected
      if (data.supervisorId) {
        const updatedUsers = users.map(u => {
          if (u.id === data.supervisorId) {
            return {
              ...u,
              facilityId: targetPhcId || u.facilityId,
              facilityName: data.name,
              assignedPHC: data.name,
            };
          }
          return u;
        });
        saveAdminUsers(updatedUsers);
        setUsers(updatedUsers);
      }
      
      setIsFormOpen(false);
      setEditingPhc(null);
      await refreshDatasets();
    } catch (err: any) {
      console.error('PHC save error:', err);
      showFeedback(`❌ Failed to save PHC: ${err?.message || 'Server error'}`);
    }
  };

  // Soft Disable / Decommission Confirm Handler
  const handleDisableConfirm = () => {
    if (!phcToDisable) return;

    const updatedPhcs = phcs.map(p => {
      if (p.id === phcToDisable.id) {
        return { ...p, status: 'inactive' as const };
      }
      return p;
    });

    savePHCs(updatedPhcs);
    setPhcs(updatedPhcs);
    addAuditLog(phcToDisable.name, 'Admin', `Decommissioned / Disabled PHC: ${phcToDisable.code}`, 'warning');
    showFeedback(`✓ PHC disabled successfully`);
    setPhcToDisable(null);

    if (inspectPhc && inspectPhc.id === phcToDisable.id) {
      setInspectPhc({ ...inspectPhc, status: 'inactive' });
    }
  };

  // Re-enable PHC
  const handleReenablePhc = (phc: PHC) => {
    const updatedPhcs = phcs.map(p => {
      if (p.id === phc.id) {
        return { ...p, status: 'active' as const };
      }
      return p;
    });

    savePHCs(updatedPhcs);
    setPhcs(updatedPhcs);
    addAuditLog(phc.name, 'Admin', `Re-activated PHC: ${phc.code}`, 'success');
    showFeedback(`✓ PHC updated successfully`);

    if (inspectPhc && inspectPhc.id === phc.id) {
      setInspectPhc({ ...inspectPhc, status: 'active' });
    }
  };

  // Filter and Search PHCs
  const filteredPhcs = phcs.filter((phc) => {
    const matchesSearch = 
      phc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phc.district.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || phc.status === statusFilter;
      
    const matchesDistrict = 
      districtFilter === 'all' || phc.district === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  // Calculate connected staff counts for inspect modal
  const getLinkedStaffCounts = (phc: PHC) => {
    const ashAs = users.filter(u => u.role === 'asha' && (u.facilityId === phc.id || u.facilityName?.toLowerCase() === phc.name.toLowerCase()));
    const pharmacists = users.filter(u => u.role === 'pharmacist' && (u.facilityId === phc.id || u.facilityName?.toLowerCase() === phc.name.toLowerCase()));
    return { ashAsCount: ashAs.length, pharmacistsCount: pharmacists.length };
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Panel */}
      <PageHeader
        title="PHC Management"
        description="Manage Primary Health Centre information and assigned supervisory structure."
        breadcrumbs={[
          { label: 'Admin Dashboard', to: '/admin/dashboard' },
          { label: 'PHC Management' }
        ]}
        action={{
          label: '+ Add PHC',
          icon: Plus,
          onClick: handleAddNewClick
        }}
      />

      {/* Success Feedback Banner */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-slate-100 bg-slate-50/40 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by PHC Name, Code, or District..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-white">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">✓ Active</option>
                <option value="inactive">⊘ Inactive</option>
              </select>
            </div>

            {/* District Filter */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-white">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">District:</span>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Districts</option>
                {uniqueDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DESKTOP TABLE VIEW */}
      <Card className="hidden md:block overflow-hidden border-slate-100 shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">PHC Facility</th>
                <th className="px-6 py-4">District & Code</th>
                <th className="px-6 py-4">Assigned Supervisor</th>
                <th className="px-6 py-4">Beds & Est.</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPhcs.length > 0 ? (
                filteredPhcs.map((phc) => {
                  const supervisor = getAssignedSupervisor(phc);

                  return (
                    <tr 
                      key={phc.id} 
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => setInspectPhc(phc)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold border ${
                            phc.status === 'active' 
                              ? 'bg-teal-50 text-teal-700 border-teal-100' 
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm">{phc.name}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                              <Phone className="w-3 h-3 text-slate-300" /> {phc.contactNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" /> {phc.district}
                        </p>
                        <span className="inline-block mt-1 text-[9px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded">
                          {phc.code}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {supervisor ? (
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                              <UserCheck className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{supervisor.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{supervisor.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg inline-block">
                            No supervisor assigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{phc.beds} Beds</p>
                        <p className="text-[10px] text-slate-400">Est. {phc.establishedYear}</p>
                      </td>

                      <td className="px-6 py-4">
                        {phc.status === 'active' ? (
                          <Badge variant="success" className="text-[10px] font-bold py-0.5 px-2">
                            ✓ Active
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px] font-bold py-0.5 px-2">
                            ⊘ Inactive
                          </Badge>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1.5 text-slate-500 hover:text-teal-700 border-slate-200 h-auto"
                            onClick={() => setInspectPhc(phc)}
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1.5 text-slate-500 hover:text-teal-700 border-slate-200 h-auto"
                            onClick={(e) => handleEditClick(phc, e)}
                            title="Edit PHC"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          {phc.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-1.5 text-slate-400 hover:text-rose-600 border-slate-200 h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhcToDisable(phc);
                              }}
                              title="Disable PHC"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 border-emerald-200 h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReenablePhc(phc);
                              }}
                              title="Re-enable PHC"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
                    No PHCs match your search or active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MOBILE RESPONSIVE CARDS VIEW (<768px) */}
      <div className="block md:hidden space-y-3">
        {filteredPhcs.length > 0 ? (
          filteredPhcs.map((phc) => {
            const supervisor = getAssignedSupervisor(phc);

            return (
              <Card 
                key={phc.id} 
                className={`border transition-all cursor-pointer ${
                  phc.status === 'active' ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
                onClick={() => setInspectPhc(phc)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{phc.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 border px-1.5 py-0.2 rounded">
                          {phc.code}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-teal-600" /> {phc.district}
                        </span>
                      </div>
                    </div>

                    {phc.status === 'active' ? (
                      <Badge variant="success" className="text-[10px] font-bold shrink-0">
                        ✓ Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="text-[10px] font-bold shrink-0">
                        ⊘ Inactive
                      </Badge>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Supervisor</p>
                    {supervisor ? (
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                        {supervisor.name} ({supervisor.username})
                      </p>
                    ) : (
                      <p className="text-amber-700 font-bold text-[11px]">No supervisor assigned</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs" onClick={(e) => e.stopPropagation()}>
                    <span className="text-slate-500 font-medium">{phc.beds} Beds | Est. {phc.establishedYear}</span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold py-1.5 px-3 border-slate-200"
                        onClick={() => setInspectPhc(phc)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold py-1.5 px-3 border-slate-200"
                        onClick={(e) => handleEditClick(phc, e)}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center text-slate-400 font-medium border-slate-100">
            <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No PHCs match your search or active filters.
          </Card>
        )}
      </div>

      {/* PHC PROFILE INSPECTOR MODAL */}
      {inspectPhc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-teal-800 rounded-xl">
                  <Building2 className="h-6 w-6 text-teal-300" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">{inspectPhc.name}</h3>
                  <p className="text-xs text-teal-200 font-mono">{inspectPhc.code} | District: {inspectPhc.district}</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectPhc(null)}
                className="p-1.5 text-teal-200 hover:text-white rounded-lg hover:bg-teal-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* PHC Information */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Facility Profile</span>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Status</span>
                    {inspectPhc.status === 'active' ? (
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">✓ Active Center</span>
                    ) : (
                      <span className="font-extrabold text-slate-500 flex items-center gap-1">⊘ Inactive Center</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Bed Capacity</span>
                    <span className="font-extrabold text-slate-800">{inspectPhc.beds} Beds</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Established</span>
                    <span className="font-extrabold text-slate-800">{inspectPhc.establishedYear}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Clinical Phone</span>
                    <span className="font-extrabold text-slate-800">{inspectPhc.contactNumber}</span>
                  </div>
                </div>
              </div>

              {/* Assigned Supervisor Information */}
              <div className="p-3 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-teal-700" /> Assigned Supervisor
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-bold py-1 px-2.5 border-teal-200 bg-white text-teal-800 hover:bg-teal-100"
                    onClick={() => {
                      setInspectPhc(null);
                      navigate('/admin/supervisors');
                    }}
                  >
                    Manage Supervisors
                  </Button>
                </div>

                {(() => {
                  const supervisor = getAssignedSupervisor(inspectPhc);
                  if (supervisor) {
                    return (
                      <div className="space-y-1 pt-1 text-slate-800">
                        <p className="font-extrabold text-sm">{supervisor.name}</p>
                        <p className="text-[11px] font-medium text-slate-600">Email: {supervisor.email} | Phone: {supervisor.contactNumber}</p>
                        <p className="text-[10px] font-mono text-teal-800 font-bold">Username: {supervisor.username} ({supervisor.status})</p>
                      </div>
                    );
                  }
                  return (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-bold flex items-center justify-between">
                      <span>No supervisor assigned to this PHC.</span>
                    </div>
                  );
                })()}
              </div>

              {/* System Context Overview */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Linked Personnel Context</span>
                {(() => {
                  const { ashAsCount, pharmacistsCount } = getLinkedStaffCounts(inspectPhc);
                  return (
                    <div className="grid grid-cols-2 gap-3 text-slate-800 font-extrabold">
                      <div className="p-2 bg-white border border-slate-200 rounded-lg text-center">
                        <p className="text-base text-blue-700">{ashAsCount}</p>
                        <p className="text-[10px] text-slate-500 font-bold">ASHA Workers</p>
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg text-center">
                        <p className="text-base text-teal-700">{pharmacistsCount}</p>
                        <p className="text-[10px] text-slate-500 font-bold">Pharmacists</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-bold"
                onClick={() => setInspectPhc(null)}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs font-bold"
                  onClick={() => {
                    const current = inspectPhc;
                    setInspectPhc(null);
                    handleEditClick(current);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit PHC
                </Button>

                {inspectPhc.status === 'active' ? (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="text-xs font-bold"
                    onClick={() => {
                      const current = inspectPhc;
                      setInspectPhc(null);
                      setPhcToDisable(current);
                    }}
                  >
                    <Ban className="h-3.5 w-3.5 mr-1" /> Disable
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="text-xs font-bold"
                    onClick={() => handleReenablePhc(inspectPhc)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Re-enable
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PHC MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold">{editingPhc ? 'Edit PHC Information' : 'Create New PHC Facility'}</h3>
                <p className="text-[10px] text-teal-200 mt-0.5 font-medium">Configure facility details and assigned supervisory structure.</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-teal-200 hover:text-white p-1 rounded-lg hover:bg-teal-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                {/* PHC Name */}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">PHC Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Madukkarai PHC"
                    {...register('name')}
                    className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                      errors.name ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.name.message}</p>}
                </div>

                {/* Code */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Facility Code</label>
                  <input
                    type="text"
                    placeholder="PHC-MDK-01"
                    {...register('code')}
                    className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 uppercase ${
                      errors.code ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.code && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.code.message}</p>}
                </div>

                {/* District */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">District Area</label>
                  <input
                    type="text"
                    placeholder="e.g., Coimbatore"
                    {...register('district')}
                    className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                      errors.district ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.district && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.district.message}</p>}
                </div>

                {/* Beds Capacity */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Beds Capacity</label>
                  <input
                    type="number"
                    {...register('beds')}
                    className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                      errors.beds ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.beds && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.beds.message}</p>}
                </div>

                {/* Est. Year */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Est. Year</label>
                  <input
                    type="number"
                    {...register('establishedYear')}
                    className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                      errors.establishedYear ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.establishedYear && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.establishedYear.message}</p>}
                </div>

                {/* Clinical Phone */}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Clinical Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    {...register('contactNumber')}
                    className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                      errors.contactNumber ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.contactNumber && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.contactNumber.message}</p>}
                </div>

                {/* Assign Supervisor */}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assign PHC Supervisor</label>
                  <select
                    {...register('supervisorId')}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="">-- Leave Unassigned --</option>
                    {supervisorList.map(sup => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operational Status */}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Operational Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 border border-slate-200 rounded-xl p-2.5 cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        value="active"
                        {...register('status')}
                        className="h-3.5 w-3.5 text-teal-600 focus:ring-teal-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-700">✓ Active</span>
                    </label>

                    <label className="flex items-center gap-2 border border-slate-200 rounded-xl p-2.5 cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        value="inactive"
                        {...register('status')}
                        className="h-3.5 w-3.5 text-teal-600 focus:ring-teal-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-500">⊘ Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  className="text-xs font-bold"
                >
                  {editingPhc ? 'Save PHC Changes' : 'Create PHC Facility'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DISABLE DIALOG */}
      {phcToDisable && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setPhcToDisable(null)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Disable this PHC?</h3>
                <p className="text-xs text-slate-500">System decommissioning confirmation.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Users associated with this PHC may lose access according to the existing system behavior. Are you sure you want to disable <span className="font-bold text-slate-900">{phcToDisable.name}</span> ({phcToDisable.code})?
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPhcToDisable(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="danger" 
                onClick={handleDisableConfirm}
                className="text-xs font-bold"
              >
                Disable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

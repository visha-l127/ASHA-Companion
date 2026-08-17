import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase,
  ShieldAlert,
  KeyRound,
  Copy,
  Check,
  CheckCircle2,
  Ban,
  Eye,
  UserCheck,
  Info,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { 
  getAdminUsers, 
  saveAdminUsers, 
  getPHCs, 
  AdminUser, 
  PHC,
  addAuditLog 
} from './localStorageHelper';
import { hashPassword, generateTempPassword } from '../../utils/security';
import { adminApi } from '../../utils/apiClient';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

// Zod validation schema for Supervisor Account
const supervisorSchema = z.object({
  name: z.string().min(3, { message: 'Supervisor full name must be at least 3 characters long' }),
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .regex(/^[a-zA-Z0-9._-]+$/, { message: 'Username can only contain letters, numbers, dots, dashes, and underscores' }),
  email: z.string().email({ message: 'Please enter a valid official health email address' }),
  role: z.literal('supervisor'),
  facilityId: z.string().min(1, { message: 'Please assign a Primary Health Centre' }),
  status: z.enum(['active', 'inactive']),
  contactNumber: z.string().min(10, { message: 'Please enter a valid 10-digit mobile number' }),
  location: z.string().min(3, { message: 'Office location or sector description is required' }),
});

type SupervisorFormValues = z.infer<typeof supervisorSchema>;

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');

  // Feedback notifications
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToInspect, setUserToInspect] = useState<AdminUser | null>(null);
  const [userToDisable, setUserToDisable] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);

  // Temporary Credential Modal State
  const [tempCredsModal, setTempCredsModal] = useState<{
    userName: string;
    username: string;
    tempPassword: string;
    isReset: boolean;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Load initial datasets
  useEffect(() => {
    refreshDatasets();
  }, []);

  const refreshDatasets = async () => {
    try {
      let localUsers = getAdminUsers();
      
      let livePhcs: PHC[] = [];
      try {
        const fetchedPhcs = await adminApi.getPHCs();
        if (Array.isArray(fetchedPhcs) && fetchedPhcs.length > 0) {
          livePhcs = fetchedPhcs.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            code: p.code,
            district: p.district || 'District',
            beds: p.beds || 30,
            contactNumber: p.contactNumber || '+91 94421 00100',
            status: 'active',
            establishedYear: p.establishedYear || 2020
          }));
          setPhcs(livePhcs);
        } else {
          livePhcs = getPHCs();
          setPhcs(livePhcs);
        }
      } catch (err) {
        console.warn('Backend PHC fetch note:', err);
        livePhcs = getPHCs();
        setPhcs(livePhcs);
      }

      // Fetch live users from Spring Boot backend Oracle DB
      try {
        const backendUsers = await adminApi.getUsers();
        if (Array.isArray(backendUsers)) {
          const supervisorBackendUsers = backendUsers.filter((bu: any) =>
            (bu.role || '').toLowerCase().includes('sup') || (bu.role || '').toUpperCase() === 'PHC_SUPERVISOR'
          );

          const liveSupervisors: AdminUser[] = supervisorBackendUsers.map((bu: any) => {
            const matchedPhc = livePhcs.find(p => p.code === bu.phcId || String(p.id) === String(bu.phcId));
            const existingLocal = localUsers.find(lu => lu.username === bu.username || String(lu.id) === String(bu.id));
            return {
              id: String(bu.id),
              name: bu.name || bu.username,
              username: bu.username,
              email: bu.username.includes('@') ? bu.username : `${bu.username.toLowerCase()}@ashacompanion.org`,
              role: 'supervisor' as const,
              facilityId: bu.phcId || 'PHC_01',
              facilityName: matchedPhc ? matchedPhc.name : (bu.phcId ? `PHC ${bu.phcId}` : 'Madukkarai PHC'),
              status: existingLocal?.status || 'active',
              contactNumber: bu.phone || existingLocal?.contactNumber || '+91 94421 00100',
              location: bu.location || existingLocal?.location || 'PHC Sector',
              isActivated: true,
              mustChangePassword: false,
              avatarUrl: existingLocal?.avatarUrl,
            };
          });

          localUsers = liveSupervisors;
        }
      } catch (backendErr) {
        console.warn('Backend user fetch fallback to local:', backendErr);
      }

      setUsers(localUsers);
      saveAdminUsers(localUsers);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to load Supervisors. Please try again.");
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupervisorFormValues>({
    resolver: zodResolver(supervisorSchema) as any,
    defaultValues: {
      name: '',
      username: '',
      email: '',
      status: 'active',
      role: 'supervisor',
      facilityId: '',
      contactNumber: '',
      location: '',
    }
  });

  // Handle Edit Click
  const handleEditClick = (user: AdminUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingUser(user);
    setAvatarBase64(user.avatarUrl || undefined);
    reset({
      name: user.name,
      username: user.username || '',
      email: user.email,
      role: 'supervisor',
      facilityId: user.facilityId,
      status: user.status,
      contactNumber: user.contactNumber,
      location: user.location,
    });
    setIsFormOpen(true);
  };

  // Handle Add Click
  const handleAddNewClick = () => {
    setEditingUser(null);
    setAvatarBase64(undefined);
    reset({
      name: '',
      username: '',
      email: '',
      role: 'supervisor',
      facilityId: phcs[0]?.id || '',
      status: 'active',
      contactNumber: '',
      location: '',
    });
    setIsFormOpen(true);
  };

  // Submit Handler (Create or Edit Supervisor)
  const onSubmitForm = async (data: SupervisorFormValues) => {
    try {
      const assignedFacility = phcs.find(p => p.code === data.facilityId || p.id === data.facilityId);
      const facilityName = assignedFacility ? assignedFacility.name : 'District Center';

      if (editingUser) {
        // Edit Mode - call real backend PUT /users/{id}
        let backendId = Number(editingUser.id);
        if (isNaN(backendId) || backendId <= 0) {
          const dbUsers = await adminApi.getUsers();
          const match = dbUsers.find((u: any) => u.username === editingUser.username || u.username === editingUser.email);
          if (match) backendId = Number(match.id);
        }

        if (backendId && !isNaN(backendId) && backendId > 0) {
          await adminApi.updateUser(backendId, {
            name: data.name,
            phcId: assignedFacility?.code || data.facilityId,
            phone: data.contactNumber,
            location: data.location,
            status: data.status,
          });
        }
        addAuditLog(facilityName, 'Admin', `Updated PHC Supervisor account: ${data.name}`, 'info');
        showFeedback('✓ Supervisor updated successfully');
      } else {
        // Create Mode with temporary password
        const generatedPass = generateTempPassword();

        await adminApi.createUser({
          name: data.name,
          username: data.username,
          password: generatedPass,
          role: 'PHC_SUPERVISOR',
          phcId: assignedFacility?.code || data.facilityId || 'PHC_01',
          phone: data.contactNumber,
        });

        addAuditLog(facilityName, 'Admin', `Provisioned new PHC Supervisor: ${data.name}`, 'success');
        showFeedback('✓ Supervisor created successfully');

        // Open credentials popup
        setTempCredsModal({
          userName: data.name,
          username: data.username,
          tempPassword: generatedPass,
          isReset: false,
        });
      }

      setIsFormOpen(false);
      setEditingUser(null);
      await refreshDatasets();
    } catch (err: any) {
      console.error('Supervisor submit error:', err);
      const errMsg = err?.message || 'Unable to save Supervisor details.';
      setErrorMessage(errMsg);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (user: AdminUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const generatedPass = generateTempPassword();

      // Sync password reset credentials to Spring Boot backend Oracle DB
      try {
        await adminApi.createUser({
          name: user.name,
          username: user.username || user.email,
          password: generatedPass,
          role: 'PHC_SUPERVISOR',
          phcId: user.facilityId || 'PHC_01',
          phone: user.contactNumber,
        });
      } catch (apiErr: any) {
        console.error('Backend password reset sync error:', apiErr);
      }

      const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            password: hashPassword(generatedPass),
            mustChangePassword: true,
            isActivated: false,
          };
        }
        return u;
      });

      saveAdminUsers(updatedUsers);
      setUsers(updatedUsers);
      addAuditLog(user.facilityName, 'Admin', `Reset password for PHC Supervisor: ${user.name}`, 'warning');
      showFeedback('✓ Supervisor password reset successfully');

      setTempCredsModal({
        userName: user.name,
        username: user.username || user.email,
        tempPassword: generatedPass,
        isReset: true,
      });
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to update Supervisor status.");
    }
  };

  // Soft Disable Handler
  const handleDisableConfirm = () => {
    if (!userToDisable) return;
    try {
      const updatedUsers = users.map((u) => {
        if (u.id === userToDisable.id) {
          return { ...u, status: 'inactive' as const };
        }
        return u;
      });

      saveAdminUsers(updatedUsers);
      setUsers(updatedUsers);
      addAuditLog(userToDisable.facilityName, 'Admin', `Disabled PHC Supervisor account: ${userToDisable.name}`, 'warning');
      showFeedback('✓ Supervisor disabled successfully');

      if (userToInspect && userToInspect.id === userToDisable.id) {
        setUserToInspect({ ...userToInspect, status: 'inactive' });
      }

      setUserToDisable(null);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to update Supervisor status.");
    }
  };

  // Re-enable Supervisor Handler
  const handleReenableUser = (user: AdminUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
          return { ...u, status: 'active' as const };
        }
        return u;
      });

      saveAdminUsers(updatedUsers);
      setUsers(updatedUsers);
      addAuditLog(user.facilityName, 'Admin', `Re-activated PHC Supervisor account: ${user.name}`, 'success');
      showFeedback('✓ Supervisor updated successfully');

      if (userToInspect && userToInspect.id === user.id) {
        setUserToInspect({ ...userToInspect, status: 'active' });
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to update Supervisor status.");
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      let backendId = Number(userToDelete.id);
      if (isNaN(backendId) || backendId <= 0) {
        const dbUsers = await adminApi.getUsers();
        const targetDbUser = dbUsers.find((u: any) => u.username === userToDelete.username || u.username === userToDelete.email);
        if (targetDbUser && targetDbUser.id) {
          backendId = Number(targetDbUser.id);
        }
      }
      if (backendId && !isNaN(backendId) && backendId > 0) {
        try {
          await adminApi.deleteUser(backendId);
        } catch (apiErr: any) {
          // If 404, user is already deleted on backend; proceed with local cleanup
          if (apiErr?.response?.status !== 404 && !String(apiErr?.message || '').includes('404')) {
            throw apiErr;
          }
        }
      }

      // Clean from local users and state
      const currentLocal = getAdminUsers();
      const updatedLocal = currentLocal.filter(u => u.id !== userToDelete.id && u.username !== userToDelete.username);
      saveAdminUsers(updatedLocal);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id && u.username !== userToDelete.username));

      addAuditLog(userToDelete.facilityName, 'Admin', `Revoked and deleted Supervisor account: ${userToDelete.name}`, 'warning');
      showFeedback('✓ Supervisor deleted successfully');
      
      if (userToInspect && userToInspect.id === userToDelete.id) {
        setUserToInspect(null);
      }

      setUserToDelete(null);
      await refreshDatasets();
    } catch (err: any) {
      console.error('Delete supervisor error:', err);
      const currentLocal = getAdminUsers();
      const updatedLocal = currentLocal.filter(u => u.id !== userToDelete.id && u.username !== userToDelete.username);
      saveAdminUsers(updatedLocal);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id && u.username !== userToDelete.username));
      
      setUserToDelete(null);
      await refreshDatasets();
      showFeedback('✓ Supervisor removed');
    }
  };

  // Filter Supervisor Accounts ONLY
  const supervisorUsers = users.filter(u => u.role === 'supervisor');

  const filteredUsers = supervisorUsers.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.contactNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesFacility = facilityFilter === 'all' || user.facilityId === facilityFilter;

    return matchesSearch && matchesStatus && matchesFacility;
  });

  // Real statistics derived strictly from existing data
  const totalSupervisors = supervisorUsers.length;
  const activeCount = supervisorUsers.filter(u => u.status === 'active').length;
  const disabledCount = supervisorUsers.filter(u => u.status === 'inactive').length;
  
  // Count assigned PHCs
  const assignedPhcIds = new Set(supervisorUsers.filter(u => u.status === 'active').map(u => u.facilityId));
  const assignedPhcsCount = assignedPhcIds.size;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <PageHeader
        title="PHC Supervisors"
        description="Manage PHC Supervisor accounts and their assigned Primary Health Centres."
        breadcrumbs={[
          { label: 'Admin Dashboard', to: '/admin/dashboard' },
          { label: 'PHC Supervisors' }
        ]}
        action={{
          label: '+ Add Supervisor',
          icon: Plus,
          onClick: handleAddNewClick
        }}
      />

      {/* Success / Error Feedback Banners */}
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

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Admin Scope & Hierarchy Banner */}
      <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs text-teal-900 flex items-start sm:items-center gap-3">
        <div className="p-2 bg-teal-100/80 text-teal-800 rounded-xl shrink-0">
          <Briefcase className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <p className="font-extrabold text-teal-950 flex items-center gap-1.5">
            <span>District System Administrative Scope</span>
            <span className="text-[10px] font-mono bg-teal-200/60 text-teal-900 px-1.5 py-0.2 rounded font-bold">Admin Boundary</span>
          </p>
          <p className="text-[11px] text-teal-800 leading-relaxed font-medium">
            Admin manages Supervisor accounts and PHC center assignments. PHC Supervisors are responsible for managing PHC-level field teams (ASHA workers and Pharmacists).
          </p>
        </div>
      </div>

      {/* SUMMARY METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Supervisors</p>
              <h3 className="text-2xl font-black text-slate-800">{totalSupervisors > 0 ? totalSupervisors : '—'}</h3>
              <p className="text-[10px] text-teal-700 font-semibold">Registered Accounts</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-200 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
              <h3 className="text-2xl font-black text-emerald-700">{activeCount > 0 ? activeCount : '—'}</h3>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Active Operational Duty
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disabled / Inactive</p>
              <h3 className="text-2xl font-black text-slate-600">{disabledCount}</h3>
              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Ban className="h-3 w-3" /> Suspended Access
              </p>
            </div>
            <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl">
              <Ban className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-200 transition-all col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Covered PHCs</p>
              <h3 className="text-2xl font-black text-slate-800">{assignedPhcsCount > 0 ? assignedPhcsCount : '—'}</h3>
              <p className="text-[10px] text-teal-700 font-semibold">Facilities with Supervisor</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH AND FILTERS */}
      <Card className="border-slate-100 bg-slate-50/40 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by Name, Username, ID, Phone, Email..."
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
                <option value="all">All Statuses</option>
                <option value="active">✓ Active</option>
                <option value="inactive">⊘ Disabled</option>
              </select>
            </div>

            {/* Assigned PHC Filter */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-white">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned PHC:</span>
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All PHCs</option>
                {phcs.map(p => (
                  <option key={p.id} value={p.code}>{p.name}</option>
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
                <th className="px-6 py-4">Supervisor Personnel</th>
                <th className="px-6 py-4">Username & ID</th>
                <th className="px-6 py-4">Assigned PHC Center</th>
                <th className="px-6 py-4">Contact & Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Activation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => setUserToInspect(user)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-teal-100 shrink-0 flex items-center justify-center bg-teal-50 text-teal-700 font-extrabold text-xs">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{user.name}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                            <Mail className="w-3 h-3 text-slate-300" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-mono font-bold text-slate-800 text-xs">@{user.username || 'unassigned'}</p>
                      <span className="inline-block mt-0.5 text-[9px] font-mono text-slate-400">
                        ID: {user.id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate max-w-[180px]">{user.facilityName}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Primary Health Centre</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {user.contactNumber}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-teal-600 shrink-0" /> {user.location}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {user.status === 'active' ? (
                        <Badge variant="success" className="text-[10px] font-bold py-0.5 px-2">
                          ✓ Active
                        </Badge>
                      ) : (
                        <Badge variant="neutral" className="text-[10px] font-bold py-0.5 px-2">
                          ⊘ Disabled
                        </Badge>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {user.isActivated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Activated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending Setup
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1.5 text-slate-500 hover:text-teal-700 border-slate-200 h-auto"
                          onClick={() => setUserToInspect(user)}
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1.5 text-slate-500 hover:text-teal-700 border-slate-200 h-auto"
                          onClick={(e) => handleEditClick(user, e)}
                          title="Edit Supervisor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1.5 text-slate-500 hover:text-amber-600 border-slate-200 h-auto"
                          onClick={(e) => handleResetPassword(user, e)}
                          title="Reset Temp Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </Button>

                        {user.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1.5 text-slate-400 hover:text-rose-600 border-slate-200 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDisable(user);
                            }}
                            title="Disable Supervisor"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 border-emerald-200 h-auto"
                            onClick={(e) => handleReenableUser(user, e)}
                            title="Re-enable Supervisor"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1.5 text-slate-400 hover:text-rose-700 border-slate-200 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(user);
                          }}
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
                    {searchQuery ? "No Supervisors match your search." : "No PHC Supervisors found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MOBILE RESPONSIVE CARDS VIEW (<768px) */}
      <div className="block md:hidden space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card 
              key={user.id}
              className={`border transition-all cursor-pointer ${
                user.status === 'active' ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-200 opacity-80'
              }`}
              onClick={() => setUserToInspect(user)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl border border-teal-100 shrink-0 flex items-center justify-center bg-teal-50 text-teal-700 font-extrabold text-xs">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{user.name}</h4>
                      <p className="text-[11px] font-mono text-slate-500 font-bold">@{user.username || 'unassigned'} • {user.id}</p>
                    </div>
                  </div>

                  {user.status === 'active' ? (
                    <Badge variant="success" className="text-[10px] font-bold shrink-0">
                      ✓ Active
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="text-[10px] font-bold shrink-0">
                      ⊘ Disabled
                    </Badge>
                  )}
                </div>

                <div className="p-2.5 bg-teal-50/40 border border-teal-100 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned PHC</span>
                  <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    {user.facilityName}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {user.contactNumber}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold py-1.5 px-3 border-slate-200"
                      onClick={() => setUserToInspect(user)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold py-1.5 px-3 border-slate-200"
                      onClick={(e) => handleEditClick(user, e)}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-slate-400 font-medium border-slate-100">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            {searchQuery ? "No Supervisors match your search." : "No PHC Supervisors found."}
          </Card>
        )}
      </div>

      {/* SUPERVISOR PROFILE INSPECTOR MODAL */}
      {userToInspect && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-teal-800 rounded-xl">
                  <UserCheck className="h-6 w-6 text-teal-300" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">{userToInspect.name}</h3>
                  <p className="text-xs text-teal-200 font-mono">@{userToInspect.username} | ID: {userToInspect.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setUserToInspect(null)}
                className="p-1.5 text-teal-200 hover:text-white rounded-lg hover:bg-teal-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Personal & Contact Info */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supervisor Personnel Information</span>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Full Name</span>
                    <span className="font-extrabold text-slate-800">{userToInspect.name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Official Email</span>
                    <span className="font-extrabold text-slate-800">{userToInspect.email}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Mobile Number</span>
                    <span className="font-extrabold text-slate-800">{userToInspect.contactNumber}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Office Location</span>
                    <span className="font-extrabold text-slate-800">{userToInspect.location}</span>
                  </div>
                </div>
              </div>

              {/* Account & Status */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Account Status</span>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">System Role</span>
                    <span className="font-extrabold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block">
                      PHC Supervisor
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Account Status</span>
                    {userToInspect.status === 'active' ? (
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">✓ Active Duty</span>
                    ) : (
                      <span className="font-extrabold text-slate-500 flex items-center gap-1">⊘ Disabled</span>
                    )}
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Activation Status</span>
                    {userToInspect.isActivated ? (
                      <span className="font-bold text-emerald-800 text-[11px]">✓ Profile Activated & Security Password Configured</span>
                    ) : (
                      <span className="font-bold text-amber-800 text-[11px]">● Pending First Login Setup (Temporary Password Active)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned PHC Assignment */}
              <div className="p-3 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-teal-700" /> Assigned Primary Health Centre
                </span>
                <p className="font-extrabold text-sm text-slate-800">{userToInspect.facilityName}</p>
                <p className="text-[11px] text-teal-800 font-medium">
                  This Supervisor is responsible for managing the PHC-level field workforce (ASHA workers and Pharmacists) at {userToInspect.facilityName}.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-bold"
                onClick={() => setUserToInspect(null)}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs font-bold"
                  onClick={() => {
                    const current = userToInspect;
                    setUserToInspect(null);
                    handleEditClick(current);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>

                {userToInspect.status === 'active' ? (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="text-xs font-bold"
                    onClick={() => {
                      const current = userToInspect;
                      setUserToInspect(null);
                      setUserToDisable(current);
                    }}
                  >
                    <Ban className="h-3.5 w-3.5 mr-1" /> Disable
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="text-xs font-bold"
                    onClick={() => handleReenableUser(userToInspect)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Re-enable
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SUPERVISOR MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold">{editingUser ? 'Edit PHC Supervisor Details' : 'Provision PHC Supervisor Account'}</h3>
                <p className="text-[10px] text-teal-200 mt-0.5 font-medium">Configure supervisor account information and PHC center assignment.</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-teal-200 hover:text-white p-1 rounded-lg hover:bg-teal-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4 text-xs">
              <input type="hidden" value="supervisor" {...register('role')} />

              {/* 1. PERSONAL INFORMATION SECTION */}
              <div className="space-y-3 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  1. Personal Information
                </span>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Meena Krishnan"
                    {...register('name')}
                    className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                      errors.name ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Mobile Contact Number</label>
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

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Office Location</label>
                    <input
                      type="text"
                      placeholder="e.g., Coimbatore HQ"
                      {...register('location')}
                      className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                        errors.location ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    />
                    {errors.location && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.location.message}</p>}
                  </div>
                </div>
              </div>

              {/* 2. ACCOUNT INFORMATION SECTION */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  2. Account Information
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Username (Login ID)</label>
                    <input
                      type="text"
                      placeholder="meena.k"
                      {...register('username')}
                      className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                        errors.username ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    />
                    {errors.username && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.username.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Official Email Address</label>
                    <input
                      type="email"
                      placeholder="meena@companion.org"
                      {...register('email')}
                      className={`px-3.5 py-2 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                        errors.email ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    />
                    {errors.email && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.email.message}</p>}
                  </div>
                </div>

                {!editingUser && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      A temporary password will be assigned. The Supervisor must change it during first login.
                    </span>
                  </div>
                )}
              </div>

              {/* 3. PHC ASSIGNMENT SECTION */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  3. PHC Assignment
                </span>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Assign Primary Health Centre</label>
                  <select
                    {...register('facilityId')}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold"
                  >
                    {phcs.map(p => (
                      <option key={p.id} value={p.code}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                  {errors.facilityId && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.facilityId.message}</p>}
                </div>
              </div>

              {/* 4. OPERATIONAL STATUS SECTION */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Operational Status</label>
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
                    <span className="text-xs font-bold text-slate-500">⊘ Disabled</span>
                  </label>
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
                  {editingUser ? 'Save Supervisor' : 'Provision Supervisor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DISABLE DIALOG */}
      {userToDisable && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setUserToDisable(null)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Disable this PHC Supervisor?</h3>
                <p className="text-xs text-slate-500">Account suspension confirmation.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              They will no longer be able to access the application. Their assigned PHC and historical operational logs will be preserved.
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUserToDisable(null)}
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

      {/* CONFIRMATION DELETE DIALOG */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setUserToDelete(null)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Delete PHC Supervisor?</h3>
                <p className="text-xs text-slate-500">Account revocation confirmation.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to delete <span className="font-bold text-slate-900">{userToDelete.name}</span> (@{userToDelete.username})? Access credentials will be permanently revoked.
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUserToDelete(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="danger" 
                onClick={handleDeleteConfirm}
                className="text-xs font-bold"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPORARY CREDENTIALS DISPLAY MODAL */}
      {tempCredsModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setTempCredsModal(null)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center border border-teal-100 text-teal-700 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {tempCredsModal.isReset ? 'Password Reset Generated' : 'Temporary Credentials Issued'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{tempCredsModal.userName}</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Username</p>
                <p className="text-xs font-mono font-bold text-slate-800">{tempCredsModal.username}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Temporary Password</p>
                <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                  <span className="font-mono font-bold text-teal-800 text-xs tracking-wider">{tempCredsModal.tempPassword}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tempCredsModal.tempPassword);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="p-1 text-slate-400 hover:text-teal-700 cursor-pointer transition-colors"
                    title="Copy Temporary Password"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl leading-relaxed font-medium">
              Provide these temporary credentials to the Supervisor. They must create a new password during their first login.
            </p>

            <button
              onClick={() => setTempCredsModal(null)}
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

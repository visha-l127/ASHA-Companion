import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminUser, addAuditLog } from '../Admin/localStorageHelper';
import { hashPassword, generateTempPassword } from '../../utils/security';
import { adminApi } from '../../utils/apiClient';
import { Card, CardContent, Badge, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { 
  Pill, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  Mail, 
  Phone, 
  Building2, 
  Key, 
  CheckCircle,
  ShieldAlert,
  KeyRound,
  Copy,
  Check,
  Eye,
  UserCheck,
  UserX,
  Package,
  Users
} from 'lucide-react';

export default function PharmacistManagement() {
  const { user: currentUser } = useAuth();
  const supervisorPHC = currentUser?.facilityName || 'Madukkarai PHC';
  const supervisorPHCId = currentUser?.facilityId || 'phc-01';

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [userToDisable, setUserToDisable] = useState<AdminUser | null>(null);
  const [userToResetPass, setUserToResetPass] = useState<AdminUser | null>(null);
  const [selectedPharmacistProfile, setSelectedPharmacistProfile] = useState<AdminUser | null>(null);

  // Temp creds popup state
  const [tempCredsModal, setTempCredsModal] = useState<{
    userName: string;
    username: string;
    tempPassword: string;
    isReset: boolean;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [supervisorPHC]);

  const loadUsers = async () => {
    try {
      const allUsers = await adminApi.getUsers();
      const mapped = allUsers.map((u: any) => {
        const rawStatus = String(u.status || 'active').toLowerCase();
        const normStatus: 'active' | 'inactive' = (rawStatus === 'inactive' || rawStatus === 'disabled') ? 'inactive' : 'active';
        return {
          id: String(u.id),
          name: u.name,
          username: u.username,
          email: u.username.toLowerCase() + "@companion.org",
          role: u.role.toLowerCase() as any,
          facilityId: u.phcId || '',
          facilityName: supervisorPHC,
          status: normStatus,
          contactNumber: u.phone || '+91 90000 11111',
          location: u.location || u.phcId || `${supervisorPHC} Dispensary`
        };
      });
      setUsers(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Pharmacists strictly belonging to this Supervisor's PHC
  const pharmacistList = users.filter((u) => {
    const isPharmacist = u.role === 'pharmacist';
    const matchesPHC = u.facilityName?.toLowerCase() === supervisorPHC.toLowerCase() ||
                       u.facilityId === supervisorPHCId;
    return isPharmacist && matchesPHC;
  });

  const filteredPharmacists = pharmacistList.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(query) ||
      (u.username && u.username.toLowerCase().includes(query)) ||
      u.email.toLowerCase().includes(query) ||
      u.location.toLowerCase().includes(query) ||
      (u.contactNumber && u.contactNumber.toLowerCase().includes(query)) ||
      u.id.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary Metrics
  const totalCount = pharmacistList.length;
  const activeCount = pharmacistList.filter(u => u.status === 'active').length;
  const inactiveCount = pharmacistList.filter(u => u.status === 'inactive').length;

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setEmail('');
    setContactNumber('');
    setLocation(`${supervisorPHC} Dispensary`);
    setStatus('active');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (u: AdminUser) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username || '');
    setEmail(u.email);
    setContactNumber(u.contactNumber || '');
    setLocation(u.location || '');
    const rawStatus = String(u.status || 'active').toLowerCase();
    const normStatus: 'active' | 'inactive' = (rawStatus === 'inactive' || rawStatus === 'disabled') ? 'inactive' : 'active';
    setStatus(normStatus);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || !email.trim() || !username.trim()) {
      setFormError('Please fill in Name, Username, and Email.');
      return;
    }

    try {
      if (editingUser) {
        let backendId = Number(editingUser.id);
        if (isNaN(backendId) || backendId <= 0) {
          const dbUsers = await adminApi.getUsers();
          const match = dbUsers.find((u: any) => u.username === editingUser.username || u.username === editingUser.email);
          if (match) backendId = Number(match.id);
        }

        if (backendId && !isNaN(backendId) && backendId > 0) {
          await adminApi.updateUser(backendId, {
            name,
            phone: contactNumber,
            location,
            status
          });
        }
        addAuditLog(supervisorPHC, currentUser?.name || 'Supervisor', `Updated Pharmacist profile: ${name}`, 'info');
        setSuccessMsg(`✓ Pharmacist ${name} updated successfully!`);
      } else {
        const generatedPass = generateTempPassword();
        await adminApi.createUser({
          name,
          username,
          password: generatedPass,
          role: 'PHARMACIST',
          phcId: currentUser?.phcId || supervisorPHCId || 'PHC_N1_1786513619',
          phone: contactNumber
        });

        addAuditLog(supervisorPHC, currentUser?.name || 'Supervisor', `Provisioned Pharmacist account: ${name}`, 'success');
        setTempCredsModal({
          userName: name,
          username: username,
          tempPassword: generatedPass,
          isReset: false,
        });
        setSuccessMsg(`✓ Pharmacist ${name} created successfully!`);
      }
      setIsFormOpen(false);
      await loadUsers();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Backend user create error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save user on backend.';
      setFormError(`Server Error: ${errMsg}`);
    }
  };

  const handleToggleDisable = async () => {
    if (!userToDisable) return;
    const newStatus = userToDisable.status === 'active' ? 'inactive' : 'active';
    try {
      let backendId = Number(userToDisable.id);
      if (isNaN(backendId) || backendId <= 0) {
        const dbUsers = await adminApi.getUsers();
        const match = dbUsers.find((u: any) => u.username === userToDisable.username || u.username === userToDisable.email);
        if (match) backendId = Number(match.id);
      }

      if (backendId && !isNaN(backendId) && backendId > 0) {
        await adminApi.updateUser(backendId, {
          name: userToDisable.name,
          phone: userToDisable.contactNumber,
          location: userToDisable.location,
          status: newStatus
        });
      }
      addAuditLog(supervisorPHC, currentUser?.name || 'Supervisor', `${newStatus === 'inactive' ? 'Disabled' : 'Re-enabled'} Pharmacist account: ${userToDisable.name}`, 'warning');
      setSuccessMsg(`✓ Pharmacist account ${newStatus === 'inactive' ? 'disabled' : 'activated'} successfully.`);
    } catch (err: any) {
      console.error('Failed to toggle pharmacist status:', err);
      setFormError(err.message || 'Failed to update status.');
    }
    setUserToDisable(null);
    await loadUsers();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await adminApi.deleteUser(Number(userToDelete.id));
      addAuditLog(supervisorPHC, currentUser?.name || 'Supervisor', `Deleted Pharmacist account: ${userToDelete.name}`, 'warning');
      setSuccessMsg('✓ Pharmacist account removed.');
    } catch (err: any) {
      console.warn('Backend user delete error:', err);
      setFormError(err.message || 'Failed to delete user.');
    }
    setUserToDelete(null);
    loadUsers();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleResetPassword = async () => {
    if (!userToResetPass) return;
    const generatedPass = generateTempPassword();

    try {
      await adminApi.createUser({
        name: userToResetPass.name,
        username: userToResetPass.username || userToResetPass.email,
        password: generatedPass,
        role: 'PHARMACIST',
        phcId: userToResetPass.facilityId || currentUser?.phcId || supervisorPHCId || 'PHC_N1_1786513619',
        phone: userToResetPass.contactNumber
      });
      addAuditLog(supervisorPHC, currentUser?.name || 'Supervisor', `Reset password credentials for Pharmacist: ${userToResetPass.name}`, 'info');

      setTempCredsModal({
        userName: userToResetPass.name,
        username: userToResetPass.username || userToResetPass.email,
        tempPassword: generatedPass,
        isReset: true,
      });
    } catch (err: any) {
      console.error('Backend password reset sync error:', err);
    }
    setUserToResetPass(null);
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacists"
        description={`Manage Pharmacist accounts assigned to ${supervisorPHC}.`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/supervisor/dashboard' },
          { label: 'Pharmacists' }
        ]}
        action={{
          label: 'Add Pharmacist',
          icon: Plus,
          onClick: handleOpenAdd
        }}
      />

      {/* Global Success Feedback Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Compact Pharmacist Summary Metrics & Section Selectors */}
      <div className="grid grid-cols-3 gap-4">
        <Card 
          onClick={() => setStatusFilter('all')}
          className={`border-slate-200 cursor-pointer transition-all hover:shadow-sm hover:border-slate-300 ${
            statusFilter === 'all' ? 'ring-2 ring-indigo-600 bg-indigo-50/20 shadow-xs' : 'bg-white'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Pharmacists</p>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mt-1">{totalCount}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Assigned to {supervisorPHC}</p>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setStatusFilter('active')}
          className={`border-emerald-200 cursor-pointer transition-all hover:shadow-sm ${
            statusFilter === 'active' 
              ? 'ring-2 ring-emerald-600 bg-emerald-100/40 shadow-xs' 
              : 'bg-emerald-50/20 hover:bg-emerald-50/40'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active Section</p>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-emerald-900 mt-1">{activeCount}</h3>
            <p className="text-[10px] text-emerald-700 mt-0.5">Dispensary Active</p>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setStatusFilter('inactive')}
          className={`border-rose-200 cursor-pointer transition-all hover:shadow-sm ${
            statusFilter === 'inactive' 
              ? 'ring-2 ring-rose-600 bg-rose-100/40 shadow-xs' 
              : 'bg-rose-50/20 hover:bg-rose-50/40'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Disabled Section</p>
              <UserX className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="text-xl font-black text-rose-900 mt-1">{inactiveCount}</h3>
            <p className="text-[10px] text-rose-700 mt-0.5 font-medium">Suspended Access</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter, Section Tabs, and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              Disabled ({inactiveCount})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:flex-1 md:max-w-md ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
              <input 
                type="text"
                placeholder="Search pharmacists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white text-slate-800 font-medium"
              />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table (Desktop) & Cards (Mobile) List */}
      <Card className="overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Pharmacist</th>
                <th className="px-6 py-4">Workstation</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Account State</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {filteredPharmacists.length > 0 ? (
                filteredPharmacists.map((pharm, idx) => {
                  const isActive = pharm.status === 'active';
                  return (
                    <tr key={`pharm-mgmt-row-${pharm.id || idx}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center bg-indigo-100 text-indigo-900 font-black text-sm">
                            {pharm.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p 
                              onClick={() => setSelectedPharmacistProfile(pharm)}
                              className="font-extrabold text-slate-800 text-xs hover:text-indigo-700 cursor-pointer transition-colors"
                            >
                              {pharm.name}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                              <span>ID: {pharm.id}</span>
                              <span>•</span>
                              <span>@{pharm.username || 'pharmacist'}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-700">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          {pharm.location || `${supervisorPHC} Dispensary`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        <p className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {pharm.contactNumber || 'N/A'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{pharm.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black">
                            <UserX className="w-3 h-3 text-rose-600" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {pharm.isActivated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-emerald-700 bg-emerald-50/60 border border-emerald-100">
                            ✓ Activated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-amber-700 bg-amber-50/60 border border-amber-100">
                            Pending First Login
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setSelectedPharmacistProfile(pharm)}
                            className="text-xs font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Profile
                          </Button>

                          <button
                            onClick={() => setUserToResetPass(pharm)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset Credentials"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(pharm)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setUserToDisable(pharm)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive 
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' 
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isActive ? "Disable Access" : "Re-enable Access"}
                          >
                            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => setUserToDelete(pharm)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    <Pill className="w-10 h-10 mx-auto text-slate-200 mb-2.5" />
                    <p className="text-xs font-bold text-slate-600">
                      {statusFilter === 'inactive' ? 'No Disabled Pharmacists found.' : statusFilter === 'active' ? 'No Active Pharmacists found.' : 'No Pharmacists found.'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {statusFilter === 'inactive' ? 'Pharmacists with disabled or suspended access will appear in this section.' : 'Try searching with a different term or add a new Pharmacist.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Responsive Cards */}
        <div className="block md:hidden divide-y divide-slate-100 bg-white">
          {filteredPharmacists.length > 0 ? (
            filteredPharmacists.map((pharm, idx) => {
              const isActive = pharm.status === 'active';
              return (
                <div key={`m-pharm-card-${pharm.id || idx}-${idx}`} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-900 font-black text-xs flex items-center justify-center shrink-0">
                        {pharm.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 text-xs">{pharm.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">@{pharm.username || 'pharmacist'}</p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[9px] font-black">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[9px] font-black">
                        Disabled
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                    <p className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Workstation: <strong>{pharm.location || `${supervisorPHC} Dispensary`}</strong>
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone: {pharm.contactNumber || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setSelectedPharmacistProfile(pharm)}
                      className="w-full text-xs font-bold text-indigo-700 border-indigo-200 py-2"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 font-medium">
              <p className="text-xs font-bold text-slate-600">
                {statusFilter === 'inactive' ? 'No Disabled Pharmacists found.' : statusFilter === 'active' ? 'No Active Pharmacists found.' : 'No Pharmacists found.'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* PHARMACIST PROFILE MODAL */}
      {selectedPharmacistProfile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-800 text-white flex items-center justify-center font-black text-lg">
                  {selectedPharmacistProfile.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">{selectedPharmacistProfile.name}</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Pharmacist ID: {selectedPharmacistProfile.id} • Pharmacy Staff Account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPharmacistProfile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Account Status Badge Box */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Employment Status</p>
                  <div className="mt-1">
                    {selectedPharmacistProfile.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-black text-xs">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Active Duty
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-black text-xs">
                        <UserX className="w-3.5 h-3.5 text-rose-600" />
                        Suspended / Disabled
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">First Login Activation</p>
                  <p className="font-extrabold text-slate-700 mt-1">
                    {selectedPharmacistProfile.isActivated ? '🟢 Activated' : '🟠 Pending First Password Reset'}
                  </p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Username</p>
                  <p className="font-extrabold text-slate-800 font-mono mt-0.5">@{selectedPharmacistProfile.username || 'pharmacist'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Official Email</p>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedPharmacistProfile.email}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile Contact</p>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedPharmacistProfile.contactNumber || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Workstation / Desk</p>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedPharmacistProfile.location || `${supervisorPHC} Dispensary`}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned PHC</p>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedPharmacistProfile.facilityName || supervisorPHC}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Role Permission</p>
                  <p className="font-extrabold text-slate-800 mt-0.5 capitalize">{selectedPharmacistProfile.role || 'pharmacist'}</p>
                </div>
              </div>

              {/* Inventory Scope Notice */}
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/60 rounded-xl text-indigo-950 flex items-start gap-2.5">
                <Package className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-extrabold text-xs">Inventory Role Separation Rule</p>
                  <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                    The Pharmacist manages medicine stock, batch orders, cold-chain logs, and dispensations directly within the Pharmacist Portal. Supervisors manage account access, security keys, and personnel assignments.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedPharmacistProfile(null)}
                className="text-xs font-bold"
              >
                Close Profile
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const u = selectedPharmacistProfile;
                    setSelectedPharmacistProfile(null);
                    handleOpenEdit(u);
                  }}
                  className="text-xs font-bold text-indigo-700 border-indigo-200"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Pharmacist Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PHARMACIST DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{editingUser ? 'Edit Pharmacist Profile' : 'Create Pharmacist'}</h3>
                <p className="text-[10px] text-indigo-200 mt-0.5 font-medium">
                  {editingUser ? 'Update pharmacist contact or workstation assignment.' : 'Provision new Pharmacist account for ' + supervisorPHC}
                </p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-indigo-100 hover:text-white p-1 rounded-lg hover:bg-indigo-800/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <p className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {formError}
                </p>
              )}

              {/* Personal Information Group */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1">
                  1. Personal & Contact Information
                </h4>
                
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Pharmacist Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Official Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rajesh@companion.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Mobile Contact</label>
                    <input
                      type="text"
                      placeholder="+91 XXXXX XXXXX"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information & Temporary Password Warning */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1">
                  2. Account Credentials & Login Key
                </h4>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Username / Login ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. rajesh_pharm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono font-bold"
                    required
                  />
                </div>

                {!editingUser && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed font-medium">
                    ⚡ <strong>Temporary Password Notice:</strong> A temporary password will be assigned to this account. The Pharmacist must change it during their first login.
                  </div>
                )}
              </div>

              {/* PHC & Workstation Group */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1">
                  3. PHC Facility & Workstation Assignment
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Primary PHC</label>
                    <input
                      type="text"
                      disabled
                      value={supervisorPHC}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-100 text-slate-600 w-full font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Pharmacy Workstation</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Dispensary Desk"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Employment Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label 
                      onClick={() => setStatus('active')}
                      className={`flex items-center gap-2 border rounded-xl p-2.5 cursor-pointer transition-all ${
                        status === 'active' 
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold ring-1 ring-indigo-500/20' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pharmacistEmploymentStatus"
                        value="active"
                        checked={status === 'active'}
                        onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      />
                      <span className="text-xs font-bold">Active Duty</span>
                    </label>

                    <label 
                      onClick={() => setStatus('inactive')}
                      className={`flex items-center gap-2 border rounded-xl p-2.5 cursor-pointer transition-all ${
                        status === 'inactive' 
                          ? 'border-rose-500 bg-rose-50/50 text-rose-950 font-bold ring-1 ring-rose-500/20' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pharmacistEmploymentStatus"
                        value="inactive"
                        checked={status === 'inactive'}
                        onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                      />
                      <span className="text-xs font-bold">Disabled Access</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="text-xs font-bold">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold">
                  {editingUser ? 'Save Changes' : 'Create Pharmacist Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISABLE PHARMACIST CONFIRMATION DIALOG */}
      {userToDisable && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setUserToDisable(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-800 text-sm">
                {userToDisable.status === 'active' ? 'Disable Pharmacist?' : 'Re-enable Pharmacist?'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {userToDisable.status === 'active'
                ? `Disable access for ${userToDisable.name}? The pharmacist will no longer be able to log in or manage dispensary stock.`
                : `Re-enable account access for ${userToDisable.name}?`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setUserToDisable(null)} className="text-xs font-bold">
                Cancel
              </Button>
              <Button
                variant={userToDisable.status === 'active' ? 'danger' : 'primary'}
                onClick={handleToggleDisable}
                className="text-xs font-bold"
              >
                {userToDisable.status === 'active' ? 'Disable Access' : 'Re-enable Access'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD DIALOG */}
      {userToResetPass && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setUserToResetPass(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <Key className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-800 text-sm">Reset Password Credentials</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reset login security credentials for <strong className="text-slate-800">{userToResetPass.name}</strong>? They will be issued a temporary key and prompted to set a new password upon first login.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setUserToResetPass(null)} className="text-xs font-bold">Cancel</Button>
              <Button variant="warning" onClick={handleResetPassword} className="text-xs font-bold">Issue Temporary Key</Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setUserToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-800 text-sm">Delete Pharmacist Account?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to permanently remove <strong className="text-slate-800">{userToDelete.name}</strong> from {supervisorPHC}? This action cannot be easily undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setUserToDelete(null)} className="text-xs font-bold">Cancel</Button>
              <Button variant="danger" onClick={handleDelete} className="text-xs font-bold">Yes, Remove Account</Button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPORARY CREDENTIALS DISPLAY MODAL */}
      {tempCredsModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setTempCredsModal(null)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-700 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {tempCredsModal.isReset ? 'Password Reset Issued' : 'Temporary Credentials Created'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{tempCredsModal.userName}</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Username / Login ID</p>
                <p className="text-xs font-mono font-bold text-slate-800">{tempCredsModal.username}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Temporary Password</p>
                <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                  <span className="font-mono font-bold text-indigo-800 text-xs tracking-wider">{tempCredsModal.tempPassword}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tempCredsModal.tempPassword);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-700 cursor-pointer transition-colors"
                    title="Copy Temporary Password"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl leading-relaxed font-medium">
              Provide these temporary credentials to the Pharmacist. Upon their first login, they will be required to create a new password.
            </p>

            <button
              onClick={() => setTempCredsModal(null)}
              className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

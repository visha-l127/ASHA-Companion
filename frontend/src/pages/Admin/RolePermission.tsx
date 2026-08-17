import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Shield, 
  Check, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { RolePermission } from './localStorageHelper';
import { adminApi } from '../../utils/apiClient';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

const AVAILABLE_PERMISSIONS = [
  { key: 'view_dashboard', label: 'Dashboard Overview', desc: 'Can view general overview metrics' },
  { key: 'manage_phc', label: 'PHC Management', desc: 'Can add, edit, and delete PHC facilities' },
  { key: 'manage_users', label: 'User Directory', desc: 'Can provision and revoke personnel tablet profiles' },
  { key: 'manage_roles', label: 'Access Control Matrix', desc: 'Can modify permission bindings for work-roles' },
  { key: 'view_reports', label: 'Aggregative Reports', desc: 'Can inspect and export public health metrics' },
  { key: 'manage_settings', label: 'Device Configurations', desc: 'Can adjust global offline sync parameters' },
  { key: 'view_audits', label: 'District Audit Logs', desc: 'Can read clinical data ingestion transaction logs' },
];

const rolePermissionSchema = z.object({
  role: z.string().min(3, { message: 'Workflow role name must be at least 3 characters long' }),
  description: z.string().min(10, { message: 'Workflow description must be at least 10 characters long' }),
  permissions: z.array(z.string()).min(1, { message: 'Please select at least one permission capability' }),
});

type RoleFormValues = z.infer<typeof rolePermissionSchema>;

export default function RolePermissionPage() {
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RolePermission | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RolePermission | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const res = await adminApi.getRolesPermissions();
      const mapped = res.map((r: any) => ({
        id: String(r.id),
        role: r.role,
        description: r.description,
        permissions: r.permissions
      }));
      setRoles(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(rolePermissionSchema),
    defaultValues: {
      role: '',
      description: '',
      permissions: [],
    }
  });

  const selectedPermissions = watch('permissions') || [];

  const handleCheckboxChange = (permKey: string, checked: boolean) => {
    const current = [...selectedPermissions];
    if (checked) {
      if (!current.includes(permKey)) {
        setValue('permissions', [...current, permKey], { shouldValidate: true });
      }
    } else {
      setValue('permissions', current.filter(p => p !== permKey), { shouldValidate: true });
    }
  };

  const handleEditClick = (role: RolePermission) => {
    setEditingRole(role);
    reset({
      role: role.role,
      description: role.description,
      permissions: role.permissions,
    });
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingRole(null);
    reset({
      role: '',
      description: '',
      permissions: ['view_dashboard'],
    });
    setIsFormOpen(true);
  };

  const onSubmitForm = async (data: RoleFormValues) => {
    try {
      if (editingRole) {
        await adminApi.updateRolePermission(editingRole.id, {
          role: data.role,
          description: data.description,
          permissions: data.permissions
        });
      } else {
        await adminApi.createRolePermission({
          role: data.role,
          description: data.description,
          permissions: data.permissions
        });
      }
      await loadRoles();
      setIsFormOpen(false);
      setEditingRole(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    try {
      await adminApi.deleteRolePermission(roleToDelete.id);
      await loadRoles();
      setRoleToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRoles = roles.filter((role) => {
    return (
      role.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Configure system capabilities and workflow permission scopes for medical staff, administrative leads, and field volunteers."
        breadcrumbs={[
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'Roles & Permissions' }
        ]}
        action={{
          label: 'Create Custom Role',
          icon: Plus,
          onClick: handleAddNewClick
        }}
      />

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search roles by title or capability keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRoles.map((r) => (
          <Card key={r.id} className="flex flex-col justify-between h-full border border-slate-100 hover:border-teal-100 transition-all duration-200 shadow-xs hover:shadow-md">
            <CardHeader className="pb-3 border-none bg-slate-50/40">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 capitalize tracking-wide">{r.role} Workspace</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">ID: {r.id}</p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditClick(r)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {/* Prevent deleting core default roles */}
                  {!['admin', 'supervisor', 'asha', 'pharmacist'].includes(r.role.toLowerCase()) && (
                    <button 
                      onClick={() => setRoleToDelete(r)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-medium">
                {r.description}
              </p>
            </CardHeader>
            <CardContent className="pt-4 border-t border-slate-100/60 bg-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Enabled Capabilities ({r.permissions.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.map((perm) => {
                  const resolved = AVAILABLE_PERMISSIONS.find(ap => ap.key === perm);
                  return (
                    <span 
                      key={perm}
                      className="inline-flex items-center gap-1 bg-teal-50/50 border border-teal-100 text-teal-800 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide"
                      title={resolved?.desc}
                    >
                      <Check className="w-3 h-3 text-teal-600 shrink-0" />
                      {resolved?.label || perm}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{editingRole ? 'Edit Workflow Capabilities' : 'Create Custom Workspace'}</h3>
                <p className="text-[10px] text-teal-200 mt-0.5 font-medium font-sans">Set capability policies to bind clinical records offline.</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-teal-100 hover:text-white p-1 rounded-lg hover:bg-teal-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Workflow Role Title</label>
                <input
                  type="text"
                  placeholder="e.g., Community Health Officer (CHO)"
                  {...register('role')}
                  disabled={!!editingRole && ['admin', 'supervisor', 'asha', 'pharmacist'].includes(editingRole.role.toLowerCase())}
                  className={`px-4 py-2.5 border rounded-xl text-sm bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 ${
                    errors.role ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
                {errors.role && <p className="text-[11px] text-rose-500 mt-1 font-bold">{errors.role.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Workflow Scope Description</label>
                <textarea
                  placeholder="Describe the operational duties and facility context of this custom user role..."
                  {...register('description')}
                  rows={2}
                  className={`px-4 py-2.5 border rounded-xl text-sm bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 ${
                    errors.description ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
                {errors.description && <p className="text-[11px] text-rose-500 mt-1 font-bold">{errors.description.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Access Control Matrix Permissions</label>
                  {errors.permissions && <span className="text-[10px] text-rose-500 font-bold">{errors.permissions.message}</span>}
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 border border-slate-100 rounded-xl p-3 bg-slate-50/40">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.key);
                    return (
                      <label 
                        key={perm.key}
                        className={`flex items-start gap-3 border rounded-xl p-2.5 cursor-pointer bg-white transition-all hover:bg-slate-50 ${
                          isChecked ? 'border-teal-600/30 bg-teal-50/5 ring-1 ring-teal-500/5' : 'border-slate-200/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(perm.key, e.target.checked)}
                          className="mt-0.5 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{perm.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{perm.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                >
                  {editingRole ? 'Save Config' : 'Create Role'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {roleToDelete && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setRoleToDelete(null)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Decommission Role?</h3>
                <p className="text-xs text-slate-500">Access tokens will be invalid.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to remove the custom role <span className="font-bold text-slate-800">{roleToDelete.role}</span>? Any staff accounts configured under this template will fallback to basic dashboard views.
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setRoleToDelete(null)}
              >
                Keep Active
              </Button>
              <Button 
                type="button" 
                variant="danger" 
                onClick={handleDeleteConfirm}
              >
                Delete Role
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

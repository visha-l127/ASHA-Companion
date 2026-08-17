import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, Badge, Button } from '../../components/ui';
import { AdminUser } from './localStorageHelper';
import { adminApi } from '../../utils/apiClient';
import { Search, Filter, Mail, Phone, MapPin, Building2, User, ShieldCheck } from 'lucide-react';

export default function SystemUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [phcs, setPhcs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, phcsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getPHCs()
      ]);
      setPhcs(phcsRes);

      const mappedUsers: AdminUser[] = usersRes.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        username: u.username,
        email: u.username.toLowerCase() + "@companion.org",
        role: u.role.toLowerCase() as any,
        facilityId: u.phcId || '',
        facilityName: phcsRes.find((p: any) => p.code === u.phcId)?.name || 'Central Office',
        status: 'active',
        contactNumber: '+91 90000 11111',
        location: phcsRes.find((p: any) => p.code === u.phcId)?.district || 'District HQ'
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to load users directory", error);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'supervisor':
      case 'asha':
      case 'pharmacist':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Users Directory"
        description="Comprehensive master directory of all authenticated health system personnel across all roles."
        breadcrumbs={[
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'System Users' }
        ]}
      />

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search personnel by name, official email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All System Roles</option>
                <option value="admin">District Admin</option>
                <option value="supervisor">PHC Supervisor</option>
                <option value="asha">ASHA Worker</option>
                <option value="pharmacist">PHC Pharmacist</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Personnel</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">PHC Facility</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{user.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        {user.facilityName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {user.location}
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'active' ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Suspended</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedUser(user)}
                        className="text-xs font-bold px-2.5 py-1 h-auto"
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No users found matching your search query or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Full Name</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedUser.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Role</p>
                  <p className="font-bold text-slate-800 uppercase mt-0.5">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  <p className="font-bold text-slate-800 uppercase mt-0.5">{selectedUser.status}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Official Email</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Facility</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedUser.facilityName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Contact & Location</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedUser.contactNumber} • {selectedUser.location}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <Button variant="primary" onClick={() => setSelectedUser(null)} className="text-xs font-bold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { User, Lock, Mail, Phone, MapPin, Building2, ShieldCheck, Camera, Check } from 'lucide-react';

export default function ASHAProfile() {
  const { user } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setSuccessMsg('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSuccessMsg('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ASHA Worker Profile"
        description="View personal assignment details, updates, and manage login security credentials."
        breadcrumbs={[
          { label: 'Dashboard', to: '/asha/dashboard' },
          { label: 'Profile' }
        ]}
      />

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Details */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              Personal & Work Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm">
                  {user?.name?.substring(0, 2).toUpperCase() || 'AW'}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white text-slate-600 rounded-full border border-slate-200 shadow-xs hover:text-teal-700">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{user?.name || 'ASHA Worker'}</h3>
                <p className="text-xs text-teal-700 font-semibold uppercase tracking-wider">Accredited Social Health Activist</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{user?.facilityName || 'Sulur Primary Health Centre'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Official Email</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  {user?.email || 'asha.worker@companion.org'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned PHC Center</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  {user?.facilityName || 'Sulur PHC'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Catchment Area</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {user?.location || 'Sulur Sector 4, Gram Panchayat'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Account Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Active & Authenticated
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-600" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              {passwordError && (
                <p className="text-xs text-rose-600 font-bold">{passwordError}</p>
              )}

              <Button type="submit" variant="primary" className="w-full text-xs font-bold">
                Update Security Credentials
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

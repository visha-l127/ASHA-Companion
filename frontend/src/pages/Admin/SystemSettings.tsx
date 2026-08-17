import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  Radio, 
  CheckCircle,
  HelpCircle,
  Server,
  UserCheck,
  AlertTriangle,
  X,
  Sliders,
  SlidersHorizontal,
  HardDrive
} from 'lucide-react';
import { SystemSettings } from './localStorageHelper';
import { adminApi } from '../../utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

// Zod schema
const settingsSchema = z.object({
  offlineTtl: z.coerce.number()
    .min(1, { message: 'Offline session TTL must be at least 1 day' })
    .max(90, { message: 'Offline session TTL cannot exceed 90 days due to safety standards' }),
  maxDbSize: z.coerce.number()
    .min(5, { message: 'Maximum SQLite local DB quota must be at least 5 MB' })
    .max(500, { message: 'Maximum SQLite local DB quota cannot exceed 500 MB' }),
  compressionRatio: z.string().min(3, { message: 'Please enter a compression format (e.g., 8:1)' }),
  biometricLock: z.boolean(),
  districtIncharge: z.string().min(3, { message: 'District Health Incharge Name is required' }),
  backupSchedule: z.enum(['daily', 'weekly', 'monthly']),
  serverUrl: z.string().url({ message: 'Please specify a valid official FHIR/API endpoint' }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SystemSettingsPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'security' | 'data'>('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
  });

  useEffect(() => {
    loadSettings();
  }, [reset]);

  const loadSettings = async () => {
    try {
      const data = await adminApi.getSystemSettings();
      reset(data);
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmitForm = async (data: SettingsFormValues) => {
    try {
      await adminApi.saveSystemSettings(data);
      reset(data); // Re-sets clean state for isDirty
      setSuccessMsg('✓ Settings saved successfully');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreDefaults = async () => {
    const defaults = {
      offlineTtl: 30,
      maxDbSize: 50,
      compressionRatio: '8:1',
      biometricLock: true,
      districtIncharge: 'Dr. R. Kannan (DHO Coimbatore)',
      backupSchedule: 'daily' as const,
      serverUrl: 'https://national-health-portal.gov.in/api/v1',
    };
    try {
      await adminApi.saveSystemSettings(defaults);
      reset(defaults);
      setIsResetConfirmOpen(false);
      
      setSuccessMsg('✓ Settings reset to default values');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="System Settings"
        description="Manage system-level configuration for the healthcare platform."
        breadcrumbs={[
          { label: 'Admin Dashboard', to: '/admin/dashboard' },
          { label: 'System Settings' }
        ]}
        action={{
          label: 'Reset Settings',
          icon: RefreshCw,
          onClick: () => setIsResetConfirmOpen(true),
          variant: 'outline'
        }}
      />

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subtle Unsaved Changes Alert Bar */}
      {isDirty && (
        <div className="sticky top-2 z-30 p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span>Unsaved changes detected. Remember to save your updates.</span>
          </div>
          <Button 
            type="button" 
            variant="primary" 
            size="sm"
            onClick={handleSubmit(onSubmitForm)}
            className="text-xs font-extrabold px-4 py-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Changes
          </Button>
        </div>
      )}

      {/* Grouping Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
            activeTab === 'all'
              ? 'border-teal-600 text-teal-800 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          All Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
            activeTab === 'general'
              ? 'border-teal-600 text-teal-800 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          General
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
            activeTab === 'security'
              ? 'border-teal-600 text-teal-800 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Security
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
            activeTab === 'data'
              ? 'border-teal-600 text-teal-800 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Data & Synchronization
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* GROUP 1: GENERAL SETTINGS */}
        {(activeTab === 'all' || activeTab === 'general') && (
          <Card className="overflow-hidden border border-slate-200/80 shadow-xs">
            <CardHeader className="bg-slate-50/70 pb-3.5 border-b border-slate-100">
              <CardTitle className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-600" />
                General System Parameters
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Designate district administrative authorities and central sync endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Designated District Health Incharge
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. R. Kannan (DHO Coimbatore)"
                    {...register('districtIncharge')}
                    className={`px-3.5 py-2.5 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                      errors.districtIncharge ? 'border-rose-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Designated Medical Officer authority listed on system dispatches.</p>
                  {errors.districtIncharge && <p className="text-[11px] text-rose-500 mt-1 font-bold">{errors.districtIncharge.message}</p>}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Central Health Portal API URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://national-health-portal.gov.in/api/v1"
                    {...register('serverUrl')}
                    className={`px-3.5 py-2.5 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                      errors.serverUrl ? 'border-rose-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Official endpoint for district data upload & synchronization.</p>
                  {errors.serverUrl && <p className="text-[11px] text-rose-500 mt-1 font-bold">{errors.serverUrl.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GROUP 2: SECURITY SETTINGS */}
        {(activeTab === 'all' || activeTab === 'security') && (
          <Card className="overflow-hidden border border-slate-200/80 shadow-xs">
            <CardHeader className="bg-slate-50/70 pb-3.5 border-b border-slate-100">
              <CardTitle className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Security & Authentication Policies
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Enforce mobile device authentication, inactivity timeouts, and access safeguards.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-4">
              <label className="flex items-start gap-3.5 border border-slate-200 rounded-2xl p-4 bg-slate-50/40 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('biometricLock')}
                  className="mt-1 h-4.5 w-4.5 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Enforce Tablet Lock Policy (Biometric / PIN)</span>
                    <Badge variant="success" className="text-[9px] py-0 px-1.5">NHDS Compliant</Badge>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                    When enabled, field tablets require screen unlock (Biometric fingerprint or 4-digit PIN) after 5 minutes of inactivity to protect sensitive patient records.
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>
        )}

        {/* GROUP 3: DATA & SYNCHRONIZATION SETTINGS */}
        {(activeTab === 'all' || activeTab === 'data') && (
          <Card className="overflow-hidden border border-slate-200/80 shadow-xs">
            <CardHeader className="bg-slate-50/70 pb-3.5 border-b border-slate-100">
              <CardTitle className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                Data, Offline Caching & Backup Rules
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure offline database limits, packet compression, and automated backups.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>Offline Session Validity TTL (Days)</span>
                  <span className="text-[10px] text-teal-700 font-mono font-bold">Max 90 Days</span>
                </label>
                <input
                  type="number"
                  placeholder="30"
                  {...register('offlineTtl')}
                  className={`px-3.5 py-2.5 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                    errors.offlineTtl ? 'border-rose-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Days an offline tablet can operate without requiring central re-authentication.</p>
                {errors.offlineTtl && <p className="text-[11px] text-rose-500 mt-1 font-bold">{errors.offlineTtl.message}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>Local SQLite DB Memory Quota (MB)</span>
                  <span className="text-[10px] text-teal-700 font-mono font-bold">5 - 500 MB</span>
                </label>
                <input
                  type="number"
                  placeholder="50"
                  {...register('maxDbSize')}
                  className={`px-3.5 py-2.5 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                    errors.maxDbSize ? 'border-rose-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Maximum local storage allocated for offline patient records per device.</p>
                {errors.maxDbSize && <p className="text-[11px] text-rose-500 mt-1 font-bold">{errors.maxDbSize.message}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  GPRS Compression Ratio
                </label>
                <input
                  type="text"
                  placeholder="8:1"
                  {...register('compressionRatio')}
                  className={`px-3.5 py-2.5 border rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                    errors.compressionRatio ? 'border-rose-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Data payload compression ratio for low-bandwidth 2G/GPRS transmissions.</p>
                {errors.compressionRatio && <p className="text-[11px] text-rose-500 mt-1 font-bold">{errors.compressionRatio.message}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Backup Schedule Frequency
                </label>
                <select
                  {...register('backupSchedule')}
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold cursor-pointer"
                >
                  <option value="daily">Daily Incremental Syncs</option>
                  <option value="weekly">Weekly Full Snapshots</option>
                  <option value="monthly">Monthly Consolidated Cold Backups</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Automated central data vault snapshot schedule.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Footer Action */}
        <div className="flex items-center justify-between pt-2">
          <Button 
            type="button"
            variant="outline"
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-xs font-bold text-slate-600"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reset Defaults
          </Button>

          <Button 
            type="submit" 
            variant="primary" 
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>

      {/* CONFIRMATION DIALOG FOR RESET SETTINGS */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setIsResetConfirmOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Reset System Settings?</h3>
                <p className="text-xs text-slate-500 font-medium">Restore standard default configurations</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to restore all system configuration parameters to standard health-guidelines defaults? Any unsaved or custom changes will be overwritten.
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsResetConfirmOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                size="sm"
                onClick={handleRestoreDefaults}
                className="text-xs font-bold"
              >
                Reset Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

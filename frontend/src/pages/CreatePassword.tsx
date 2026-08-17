import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

// Password criteria checking helpers
const checkLength = (p: string) => p.length >= 8;
const checkUpper = (p: string) => /[A-Z]/.test(p);
const checkLower = (p: string) => /[a-z]/.test(p);
const checkNumber = (p: string) => /[0-9]/.test(p);
const checkSpecial = (p: string) => /[^A-Za-z0-9]/.test(p);

const createPasswordSchema = z.object({
  password: z.string().min(1, { message: 'New password is required' }),
  confirmPassword: z.string().min(1, { message: 'Password confirmation is required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type CreatePasswordFormValues = z.infer<typeof createPasswordSchema>;

export default function CreatePassword() {
  const navigate = useNavigate();
  const { user, updateUserPassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePasswordFormValues>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  const passwordVal = watch('password') || '';

  // Password requirements state
  const hasLength = checkLength(passwordVal);
  const hasUpper = checkUpper(passwordVal);
  const hasLower = checkLower(passwordVal);
  const hasNum = checkNumber(passwordVal);
  const hasSpec = checkSpecial(passwordVal);

  const isPasswordStrong = hasLength && hasUpper && hasLower && hasNum && hasSpec;

  const handlePasswordSubmit = async (data: CreatePasswordFormValues) => {
    setGeneralError(null);

    if (!isPasswordStrong) {
      setGeneralError('Please fulfill all password strength rules before saving.');
      return;
    }

    try {
      await updateUserPassword(data.password);
      setIsSuccess(true);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to update password. Please try again.');
    }
  };

  const dashboardMap: Record<UserRole, string> = {
    admin: '/admin/dashboard',
    supervisor: '/supervisor/dashboard',
    asha: '/asha/dashboard',
    pharmacist: '/pharmacist/dashboard',
  };

  const targetDashboard = user ? dashboardMap[user.role] : '/login';

  // If unauthenticated, prompt to login first
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Authentication Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please sign in with your assigned temporary credentials first. If your account is flagged for first-time password setup, you will be directed here automatically.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success view after setting new password
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 border border-slate-200 shadow-md rounded-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Password Set!</h2>
              <p className="mt-1.5 text-xs text-slate-500 font-medium">
                Your temporary password has been revoked and replaced with your new secure credentials.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>Account Verified: {user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Facility: {user.facilityName}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(targetDashboard, { replace: true })}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-xs font-bold rounded-xl text-white bg-teal-700 hover:bg-teal-800 transition-all cursor-pointer shadow-sm"
            >
              Proceed to Workspace Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Brand Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 bg-teal-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>ASHA EHR • Password Security Requirement</span>
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Create New Password
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-600 font-medium">
          First-time login / password reset detected. Set a new password before accessing your dashboard.
        </p>

        {/* Form Container */}
        <div className="mt-6 bg-white py-8 px-6 border border-slate-200 shadow-md rounded-2xl sm:px-10">
          
          {/* Logged in User Identity Card */}
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900">{user.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">{user.email} • {user.facilityName}</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-teal-100 text-teal-800 border border-teal-200">
              {user.role}
            </span>
          </div>

          <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-5">
            
            {generalError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-medium text-rose-800 flex gap-2.5 items-start">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-950">Update Failed</p>
                  <p className="text-rose-700 mt-0.5">{generalError}</p>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new secure password"
                  {...register('password')}
                  className={`pl-10 pr-10 py-2.5 border rounded-xl text-sm bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                    errors.password ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-600 mt-1 font-bold">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  {...register('confirmPassword')}
                  className={`pl-10 pr-10 py-2.5 border rounded-xl text-sm bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 ${
                    errors.confirmPassword ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-600 mt-1 font-bold">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password Criteria Checklist */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Password Strength Rules</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  {hasLength ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span className={hasLength ? 'text-emerald-700 font-bold' : 'text-slate-500'}>8+ Characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span className={hasUpper ? 'text-emerald-700 font-bold' : 'text-slate-500'}>1 Uppercase</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasLower ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span className={hasLower ? 'text-emerald-700 font-bold' : 'text-slate-500'}>1 Lowercase</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNum ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span className={hasNum ? 'text-emerald-700 font-bold' : 'text-slate-500'}>1 Number (0-9)</span>
                </div>
                <div className="col-span-2 flex items-center gap-1.5">
                  {hasSpec ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span className={hasSpec ? 'text-emerald-700 font-bold' : 'text-slate-500'}>1 Special Char (@, #, $, %, !)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isPasswordStrong}
              className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs text-white transition-all shadow-xs cursor-pointer ${
                isPasswordStrong
                  ? 'bg-teal-700 hover:bg-teal-800'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              {isSubmitting ? 'Saving New Password...' : 'Save Password & Access Workspace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

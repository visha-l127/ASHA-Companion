import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Button, Card, CardContent, Alert } from '../components/ui';
import { 
  ShieldCheck, 
  Wifi, 
  Radio, 
  Info, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  KeyRound, 
  CheckCircle2, 
  Sparkles, 
  X,
  Heart,
  Users,
  Pill,
  HeartHandshake
} from 'lucide-react';

// Zod validation schema
const loginSchema = z.object({
  identifier: z.string().min(2, { message: 'Username or email address is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, networkStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const from = location.state?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Network simulation for poor bandwidth environments
      const delay = networkStatus === 'poor' ? 1200 : 300;
      await new Promise((resolve) => setTimeout(resolve, delay));

      const result = await login(data.identifier, data.password, data.rememberMe);

      if (result && result.success) {
        if (result.mustChangePassword) {
          navigate('/create-password', { replace: true });
          return;
        }

        // Automatic Role-Based Dashboard Routing
        const dashboardMap: Record<UserRole, string> = {
          admin: '/admin/dashboard',
          supervisor: '/supervisor/dashboard',
          asha: '/asha/dashboard',
          pharmacist: '/pharmacist/dashboard',
        };

        let targetPath = dashboardMap[result.role];
        if (from && typeof from === 'string' && from.startsWith(`/${result.role}`)) {
          targetPath = from;
        }

        navigate(targetPath, { replace: true });
      } else {
        setAuthError('Authentication failed. Check your username/email and password.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row justify-center items-stretch font-sans">
      {/* Left panel - Modern Healthcare Brand Canvas */}
      <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 text-white p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="p-2.5 bg-teal-500/20 border border-teal-400/30 rounded-xl backdrop-blur-md">
            <ShieldCheck className="h-6 w-6 text-teal-300" />
          </div>
          <div>
            <span className="font-black text-lg tracking-wider uppercase block leading-none">ASHA EHR</span>
            <span className="text-[10px] text-teal-300/80 font-semibold tracking-widest uppercase">Digital Health Platform</span>
          </div>
        </div>

        {/* Project Mission & Capabilities */}
        <div className="space-y-5 z-10 my-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/40 border border-teal-600/40 rounded-full text-xs font-bold text-teal-300 backdrop-blur-sm">
            <HeartHandshake className="w-3.5 h-3.5 text-teal-300" />
            <span>Rural Healthcare & Community Outreach</span>
          </div>

          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black leading-tight tracking-tight text-white">
            Transforming Last-Mile Healthcare for Rural Communities
          </h2>
          
          <p className="text-xs lg:text-sm text-teal-100/90 leading-relaxed max-w-lg">
            A unified digital companion empowering Accredited Social Health Activists (ASHA), Primary Health Center (PHC) supervisors, and dispensary pharmacists to provide continuous, lifesaving care to every village household.
          </p>

          <div className="space-y-3 pt-1">
            {/* Feature 1: Maternal & Child Healthcare */}
            <div className="flex items-start space-x-3 bg-slate-900/40 border border-teal-800/40 p-3.5 rounded-xl backdrop-blur-md">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 shrink-0 mt-0.5 border border-rose-500/30">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-200">Maternal & Child Health Monitoring</p>
                <p className="text-[11px] text-teal-100/70 leading-normal mt-0.5">
                  Early enrollment of pregnancies, ANC checkup schedules, high-risk case detection, and immunization tracking for infants.
                </p>
              </div>
            </div>

            {/* Feature 2: Household & Village Census */}
            <div className="flex items-start space-x-3 bg-slate-900/40 border border-teal-800/40 p-3.5 rounded-xl backdrop-blur-md">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5 border border-teal-500/30">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-200">Doorstep Beneficiary & Household Registries</p>
                <p className="text-[11px] text-teal-100/70 leading-normal mt-0.5">
                  Door-to-door family profiling, child malnutrition assessments, and timely emergency referrals to sub-center clinics.
                </p>
              </div>
            </div>

            {/* Feature 3: Pharmacy & Essential Medicines */}
            <div className="flex items-start space-x-3 bg-slate-900/40 border border-teal-800/40 p-3.5 rounded-xl backdrop-blur-md">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5 border border-emerald-500/30">
                <Pill className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-200">PHC Dispensary & Drug Inventory</p>
                <p className="text-[11px] text-teal-100/70 leading-normal mt-0.5">
                  Real-time stock tracking for essential maternal and child medicines, batch expiration alerts, and direct sub-center distribution.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-teal-200/50 font-semibold z-10 flex items-center justify-between border-t border-teal-800/40 pt-4">
          <span>© 2026 National Rural Health Mission</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-teal-400" /> Ministry of Health & Family Welfare
          </span>
        </div>
      </div>

      {/* Right panel - Modern Minimalist Authentication Portal */}
      <div className="flex-1 p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          
          {/* Form Header */}
          <div className="text-center md:text-left space-y-1">
            <div className="md:hidden inline-flex items-center space-x-2 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-teal-100">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>ASHA EHR Companion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Enter your clinical credentials to access your workspace
            </p>
          </div>

          {authError && (
            <Alert variant="danger" className="border-rose-200 bg-rose-50/80 text-rose-800 text-xs font-medium rounded-xl">
              {authError}
            </Alert>
          )}

          {networkStatus === 'offline' && (
            <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-xs text-amber-800 flex items-start space-x-2.5 shadow-sm">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Offline Notice:</strong> You are currently offline. Credentials will be checked against the cached offline vault.
              </span>
            </div>
          )}

          {/* Clean Auth Card */}
          <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-5">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Identifier Input */}
                <div>
                  <label htmlFor="identifier" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="identifier"
                      type="text"
                      placeholder="Username or email address"
                      className={`pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder:text-slate-400 ${
                        errors.identifier ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      {...register('identifier')}
                    />
                  </div>
                  {errors.identifier && (
                    <span className="text-xs text-rose-600 font-medium mt-1 block">
                      {errors.identifier.message}
                    </span>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline focus:outline-none cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className={`pl-10 pr-10 py-2.5 border rounded-xl text-sm bg-white text-slate-900 transition-all w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder:text-slate-400 ${
                        errors.password ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      {...register('password')}
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
                    <span className="text-xs text-rose-600 font-medium mt-1 block">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center pt-1">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
                    {...register('rememberMe')}
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                    Remember me on this device
                  </label>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm mt-2" 
                  isLoading={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Secure Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setShowForgotModal(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 z-10">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-800">
                <KeyRound className="h-5 w-5 text-teal-600" />
                <h3 className="font-bold text-base">Account Password Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-medium text-slate-700">
                To maintain healthcare security and Role-Based Access Control (RBAC):
              </p>
              <ul className="space-y-2 list-disc pl-4 text-slate-600">
                <li>
                  <strong>ASHA Workers & Pharmacists:</strong> Please contact your Primary Health Center (PHC) Supervisor to reset or assign your account password.
                </li>
                <li>
                  <strong>PHC Supervisors:</strong> Please contact your District Health Administration Officer (District Admin).
                </li>
              </ul>
              <div className="p-3 bg-teal-50 border border-teal-100 text-teal-800 rounded-xl text-[11px] font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>All account updates and role assignments are audited and logged in the district registry.</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForgotModal(false)}
                className="text-xs font-bold"
              >
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

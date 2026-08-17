import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import Unauthorized from '../pages/Unauthorized';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 1. Show Auth Loading state while initializing session/permissions
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 bg-teal-900 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg border border-teal-700/30">
          <ShieldCheck className="w-8 h-8 text-teal-300 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Checking Permissions...</h2>
        </div>
        <p className="text-xs text-slate-500 font-medium">Initializing workspace session & security clearance</p>
      </div>
    );
  }

  // 2. Redirect unauthenticated users to login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check if account is suspended / inactive
  if (user.status === 'inactive') {
    return <Unauthorized message="Your account status is currently suspended. Please contact your PHC Supervisor or System Administrator." />;
  }

  // 4. Force mandatory password change on first-time login or admin reset
  if (user.mustChangePassword && location.pathname !== '/create-password') {
    return <Navigate to="/create-password" replace />;
  }

  // 5. Check allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Unauthorized />;
  }

  return <>{children}</>;
};


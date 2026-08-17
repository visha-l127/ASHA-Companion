import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, CardContent } from '../components/ui';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { UserRole } from '../types';

interface UnauthorizedProps {
  message?: string;
}

export default function Unauthorized({ message }: UnauthorizedProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (): string => {
    if (!user) return '/login';
    const dashboardMap: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      supervisor: '/supervisor/dashboard',
      asha: '/asha/dashboard',
      pharmacist: '/pharmacist/dashboard',
    };
    return dashboardMap[user.role] || '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-xl border border-slate-100 bg-white">
        <CardContent className="space-y-4 pt-0">
          <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100 shadow-2xs">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider rounded-full">
              HTTP Error 403
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Access Denied</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              Unauthorized Role / PHC Boundary Violation
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {message ||
              `Your current workspace credentials (${user?.role?.toUpperCase() || 'GUEST'} - ${user?.facilityName || 'Unassigned'}) do not have authorization to view or manage this restricted medical section.`}
          </p>

          {user && (
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-left space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-bold uppercase">Active User:</span>
                <span className="font-bold text-slate-800">{user.name}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-bold uppercase">Role:</span>
                <span className="font-extrabold text-teal-700 uppercase">{user.role}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-bold uppercase">Assigned PHC:</span>
                <span className="font-bold text-slate-700">{user.facilityName}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs font-bold gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Go Back
            </Button>

            <Link to={getDashboardPath()} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full gap-2 text-xs font-bold">
                <Home className="h-3.5 w-3.5" /> Return to My Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

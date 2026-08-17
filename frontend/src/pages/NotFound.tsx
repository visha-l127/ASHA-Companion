import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '../components/ui';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-xl border border-slate-100">
        <CardContent className="space-y-4 pt-0">
          <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center animate-bounce">
            <ShieldAlert className="h-8 w-8" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
            <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            The medical workstation directory you requested does not exist or has been relocated during central server updates. Verify your route configuration.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full gap-2 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Landing
              </Button>
            </Link>
            
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full gap-2 text-xs">
                <Home className="h-3.5 w-3.5" /> Sign In Hub
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

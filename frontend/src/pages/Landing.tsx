import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Wifi, Signal, HardDrive, Smartphone, HeartHandshake, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui';

export default function Landing() {
  const { isAuthenticated, user, logout } = useAuth();

  const features = [
    {
      title: 'Offline-First Vault',
      description: 'Collect complex maternal, pediatric, and general health screenings in remote, zero-internet zones. Data is saved locally using high-performance sandbox caching.',
      icon: HardDrive,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      title: 'Lightweight Sync Engine',
      description: 'Specifically built to leverage 2G, GPRS, and EDGE networks. Compresses and synchronizes clinical records dynamically once any small fraction of signal is discovered.',
      icon: Signal,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      title: 'Prescription & Medicine Link',
      description: 'Streamlines referrals directly from ASHA village registers to PHC Pharmacists, eliminating paper prescription slips and reducing supply stockouts.',
      icon: HeartHandshake,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Maternal & ANC Trackers',
      description: 'Visually guides ASHA workers through critical checklists during trimester visits. Keeps maternal history, immunization dates, and high-risk flags up to date.',
      icon: ShieldCheck,
      color: 'text-rose-600 bg-rose-50',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="h-6 w-6 text-teal-600" />
          <span className="font-extrabold text-base tracking-tight text-slate-800 uppercase">ASHA EHR Companion</span>
        </div>
        <div>
          {isAuthenticated ? (
            <div className="flex items-center space-x-2.5">
              <Link to={`/${user?.role || 'asha'}/dashboard`}>
                <Button size="sm">Access Portal</Button>
              </Link>
              <Button size="sm" variant="outline" onClick={logout} className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="outline">Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-teal-100/50 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
            <Wifi className="h-3.5 w-3.5" />
            <span>Built for Low-Internet and Rural Sub-Centers</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Mobile EHR Companion for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
              ASHA Workers
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            Empowering Accredited Social Health Activists (ASHA) and PHC physicians to log, manage, and audit clinical patient charts in hard-to-reach, disconnected geographic zones. Full offline durability with automatic queue sync.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link to={isAuthenticated ? `/${user?.role || 'asha'}/dashboard` : "/login"}>
              <Button variant="primary" size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
            <Link to={isAuthenticated ? `/${user?.role || 'asha'}/dashboard` : "/login"}>
              <Button variant="outline" size="lg">
                Access Portal
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-black text-teal-600">100%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Offline Ready</p>
            </div>
            <div>
              <p className="text-2xl font-black text-sky-600">2G / SMS</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Sync Optimized</p>
            </div>
            <div>
              <p className="text-2xl font-black text-amber-600">4 Roles</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Fully Integrated</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-72 h-[520px] bg-slate-900 rounded-[36px] shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col justify-between p-3">
            {/* Phone Speaker/Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-slate-800 rounded-b-xl flex justify-center items-center">
              <div className="h-1 w-10 bg-slate-700 rounded-full" />
            </div>

            {/* Simulated App Screen */}
            <div className="flex-1 bg-slate-50 rounded-[28px] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-teal-700 text-white p-3 pt-5 text-center">
                <div className="flex items-center justify-between text-[10px]">
                  <span>2G Signal</span>
                  <div className="flex items-center space-x-1">
                    <Signal className="h-2.5 w-2.5" />
                    <span className="font-bold">Offline Active</span>
                  </div>
                </div>
                <h3 className="font-bold text-xs mt-1.5">ASHA Companion</h3>
              </div>

              {/* Patient List */}
              <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-xs text-slate-800">Sunita Devi</span>
                    <span className="text-[8px] bg-teal-50 text-teal-700 px-1.5 py-0.2 rounded font-bold uppercase">Synced</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">ANC 2nd Trimester Checkup - Normal</p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs ring-1 ring-amber-400">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-xs text-slate-800">Ram Sharan</span>
                    <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-bold uppercase">Pending Sync</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">BP: 152/94 mmHg - Referred to PHC</p>
                </div>

                <div className="bg-teal-50/50 border border-dashed border-teal-200 p-2 text-center rounded-lg cursor-pointer">
                  <p className="text-[10px] font-bold text-teal-700">+ Add New Health Record</p>
                  <p className="text-[8px] text-teal-500">Saves locally automatically</p>
                </div>
              </div>

              {/* Bottom Nav Mockup */}
              <div className="bg-white border-t border-slate-100 p-2.5 flex justify-around items-center text-[9px] font-semibold text-slate-400">
                <span className="text-teal-600 font-bold">Register</span>
                <span>Referrals</span>
                <span>Sync Queue (1)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Tailored for Remote Health Ecosystems
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              A comprehensive technical foundation solving the physical and geographical bottlenecks that compromise EHR data collection.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="p-5 border border-slate-100 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white">
                  <div className={`p-2.5 rounded-lg inline-block ${feat.color} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-6 text-center border-t border-slate-800">
        <p className="font-semibold text-slate-300">ASHA Worker Mobile EHR Companion • District Healthcare Informatics System</p>
        <p className="mt-2 text-[10px] text-slate-500">Optimized for high performance on Opera Mini, Android WebViews, and Google Chrome over 2G/3G connections.</p>
      </footer>
    </div>
  );
}

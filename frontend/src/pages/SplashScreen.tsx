import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

// Global variable to track if the splash screen has already been shown in this SPA session
// This ensures that when the user logs out or returns to "/", we skip the splash screen
let hasShownSplashInSession = false;

export default function SplashScreen() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // If we've already shown and completed the splash screen in this browser session, skip it instantly
    if (hasShownSplashInSession) {
      navigate('/landing', { replace: true });
      return;
    }

    // Start the exit fade-out slightly before the 3 seconds mark
    const fadeOutTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2600);

    // Automatically navigate to landing page after exactly 3.0 seconds
    const redirectTimer = setTimeout(() => {
      hasShownSplashInSession = true; // Mark as shown ONLY upon successful completion of the timer
      navigate('/landing', { replace: true });
    }, 3000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  // If we should skip it immediately (i.e. already shown in this session), return null to avoid any rendering or flash
  if (hasShownSplashInSession) {
    return null;
  }

  return (
    <motion.div
      id="splash-screen-container"
      className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* Decorative Background Accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-50 rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-50 rounded-full blur-3xl pointer-events-none opacity-60" />

      {/* Top Section - Government Branding */}
      <motion.div
        id="govt-branding"
        className="text-center flex flex-col items-center space-y-1.5 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* State emblem placeholder stylized vector shape */}
        <div className="flex items-center justify-center space-x-1.5 mb-1 bg-white p-2 rounded-full shadow-xs border border-slate-100">
          <svg className="w-8 h-8 text-emerald-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z" />
          </svg>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-slate-700">
          Government of Tamil Nadu
        </span>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Directorate of Public Health & Preventive Medicine
        </span>
        <span className="text-[10px] font-medium text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100/50 uppercase tracking-wide">
          National Health Mission (Tamil Nadu)
        </span>
      </motion.div>

      {/* Center Section - Logo, Title & Tagline */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 z-10 max-w-lg mx-auto w-full">
        {/* Modern Vector Healthcare Logo */}
        <motion.div
          id="splash-app-logo"
          className="relative w-24 h-24 mb-6 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
        >
          {/* Logo Background Pulse rings */}
          <div className="absolute inset-0 bg-teal-500/10 rounded-full animate-ping opacity-25" />
          <div className="absolute inset-2 bg-emerald-500/5 rounded-full animate-pulse" />
          
          {/* Logo Icon Body */}
          <div className="relative w-20 h-20 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-2xl shadow-lg flex items-center justify-center border border-teal-400/20">
            <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10.5V20a2 2 0 01-2 2H7a2 2 0 01-2-2v-9.5m14 0a2 2 0 00-2-2h-2m2 2l-4-4m-4 4l4-4m-4 4H7a2 2 0 00-2 2M7 10.5V4a2 2 0 012-2h6a2 2 0 012 2v6.5M12 12v6m-3-3h6" />
            </svg>
          </div>
        </motion.div>

        {/* Project Name */}
        <motion.div
          id="splash-project-name"
          className="text-center space-y-2 mb-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 leading-tight">
            Mobile-based EHR Companion
          </h1>
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider">
            for ASHA Workers
          </p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            in Low-Internet Areas
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          id="splash-tagline"
          className="text-xs sm:text-sm text-slate-500 font-medium text-center italic max-w-md px-4 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          "Empowering ASHA Workers with Smart Digital Health Records"
        </motion.p>

        {/* Beautiful Three Bouncing Dots Indicator */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2.5 h-2.5 bg-teal-600 rounded-full"
              initial={{ opacity: 0.3 }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: index * 0.15,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Section - Prototype Information */}
      <motion.div
        id="splash-footer"
        className="text-center space-y-1 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
          Developed for Rural Primary Healthcare
        </span>
        <div className="flex items-center justify-center space-x-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          <span>Coimbatore District Prototype</span>
          <span className="text-slate-300">•</span>
          <span className="text-teal-600 font-bold">Version 1.0</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function resetSplashSessionForTesting() {
  hasShownSplashInSession = false;
}


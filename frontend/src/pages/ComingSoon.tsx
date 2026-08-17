import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import { Hourglass, HeartHandshake, ShieldAlert, Thermometer, ShieldCheck } from 'lucide-react';

export default function ComingSoon() {
  const location = useLocation();
  const path = location.pathname;

  const getSubpageContext = () => {
    if (path.includes('maternal')) {
      return {
        title: 'Maternal Health Register (ANC)',
        desc: 'Interactive prenatal screening logs, pregnancy risk classifiers, fetal growth tracking graphs, and automated SMS wellness delivery schedules.',
        icon: ShieldCheck,
        color: 'text-rose-600 bg-rose-50 border-rose-100',
      };
    }
    if (path.includes('immunization')) {
      return {
        title: 'Child Immunization Register',
        desc: 'National immunization timeline checklist, vaccine dose reminders, infant weight-for-age charts, and critical notification system for parents.',
        icon: Thermometer,
        color: 'text-sky-600 bg-sky-50 border-sky-100',
      };
    }
    if (path.includes('patients') || path.includes('users') || path.includes('ashas')) {
      return {
        title: 'Demographics & Patient Cohort Register',
        desc: 'Comprehensive patient biographical record-keeper with duplicate verification, biometric links, and district identity pairing engines.',
        icon: HeartHandshake,
        color: 'text-teal-600 bg-teal-50 border-teal-100',
      };
    }
    return {
      title: 'Clinical Workspace Module',
      desc: 'Advanced telemetry, custom local prescription builders, stock distribution pipelines, and district health diagnostic heatmaps.',
      icon: ShieldAlert,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    };
  };

  const context = getSubpageContext();
  const Icon = context.icon;

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <Card className="max-w-xl w-full border-2 border-dashed border-slate-200 bg-white shadow-xs">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 mb-2 animate-pulse">
            <Hourglass className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Coming in Next Prompt</CardTitle>
          <Badge variant="info" className="mx-auto mt-2 w-fit">Module Placeholder</Badge>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
          <p className="text-xs text-slate-500 font-mono bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-md inline-block">
            Target Endpoint: {path}
          </p>

          <div className={`p-5 rounded-xl border flex flex-col items-center text-center space-y-3 ${context.color}`}>
            <Icon className="h-8 w-8" />
            <h4 className="font-extrabold text-sm text-slate-800">{context.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              {context.desc}
            </p>
          </div>

          <p className="text-xs text-slate-400">
            The core workspace routing architecture is fully set up and ready to consume these clinical features.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

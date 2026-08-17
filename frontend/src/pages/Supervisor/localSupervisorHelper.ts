import { SyncRecord } from '../../types';

export interface AshaPerformance {
  id: string;
  name: string;
  sector: string;
  activePatients: number;
  syncedCount: number;
  pendingCount: number;
  completionRate: number; // e.g. 92%
  visitsThisMonth: number;
  highRiskCasesTracked: number;
  lastActive: string;
}

export interface HighRiskPregnancy {
  id: string;
  patientName: string;
  patientAge: number;
  village: string;
  hbLevel: number; // Hemoglobin (if anaemia)
  bpSys: number; // Systolic BP
  bpDia: number; // Diastolic BP
  riskType: string; // "Severe Anaemia", "Preeclampsia", "Gestational Diabetes", "Pregnancy Hypertension"
  gestationalWeeks: number;
  assignedAsha: string;
  ashaId: string;
  status: 'Referred' | 'Under Observation' | 'Resolved';
  lastChecked: string;
}

export interface ImmunizationDefaulter {
  id: string;
  childName: string;
  childAge: string; // e.g., "18 months", "9 months"
  parentName: string;
  parentContact: string;
  village: string;
  missedVaccine: string; // "DPT Booster 1", "Measles 1 (MR)", "OPV Booster"
  dueDate: string;
  daysOverdue: number;
  assignedAsha: string;
  ashaId: string;
  notes: string;
}

export interface NutritionRiskChild {
  id: string;
  childName: string;
  childAge: string; // e.g., "3 years", "18 months"
  parentName: string;
  village: string;
  weight: number; // kg
  height: number; // cm
  muac: number; // cm (Mid-Upper Arm Circumference)
  status: 'SAM' | 'MAM' | 'Borderline'; // Severe/Moderate Acute Malnutrition
  assignedAsha: string;
  ashaId: string;
  lastAssessed: string;
}

export interface MedicineAlert {
  id: string;
  title: string;
  type: 'Stockout' | 'Expiry' | 'Contamination' | 'Shortage';
  facility: string; // e.g., "Rampur PHC", "Gopalpur Sub-Centre"
  medicineName: string;
  details: string;
  severity: 'Critical' | 'Warning' | 'Advisory';
  dateGenerated: string;
  resolved: boolean;
}

export interface PriorityVisit {
  id: string;
  patientName: string;
  village: string;
  ashaId: string;
  ashaName: string;
  condition: string;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedDate: string;
  status: 'Pending' | 'Completed';
  notes: string;
}

// Initial Mock Data to seed localStorage if empty
const INITIAL_ASHAS: AshaPerformance[] = [
  { id: 'ASHA-101', name: 'Anjali Sharma', sector: 'Madukkarai', activePatients: 42, syncedCount: 28, pendingCount: 2, completionRate: 94, visitsThisMonth: 18, highRiskCasesTracked: 5, lastActive: '2 hours ago' },
  { id: 'ASHA-102', name: 'Rajni Bala', sector: 'Thondamuthur', activePatients: 38, syncedCount: 32, pendingCount: 0, completionRate: 89, visitsThisMonth: 14, highRiskCasesTracked: 3, lastActive: '1 day ago' },
  { id: 'ASHA-103', name: 'Kiran Devi', sector: 'Sulur', activePatients: 45, syncedCount: 30, pendingCount: 1, completionRate: 91, visitsThisMonth: 21, highRiskCasesTracked: 6, lastActive: '3 hours ago' },
  { id: 'ASHA-104', name: 'Priya Patel', sector: 'Karamadai', activePatients: 29, syncedCount: 22, pendingCount: 3, completionRate: 78, visitsThisMonth: 11, highRiskCasesTracked: 2, lastActive: '3 days ago' },
];

const INITIAL_HIGH_RISK_PREGNANCIES: HighRiskPregnancy[] = [
  {
    id: 'HRP-001',
    patientName: 'Meera Bai',
    patientAge: 24,
    village: 'Madukkarai',
    hbLevel: 8.2,
    bpSys: 120,
    bpDia: 80,
    riskType: 'Severe Anaemia (Hb < 9.0 g/dL)',
    gestationalWeeks: 28,
    assignedAsha: 'Anjali Sharma',
    ashaId: 'ASHA-101',
    status: 'Referred',
    lastChecked: '2026-07-05',
  },
  {
    id: 'HRP-002',
    patientName: 'Sarita Yadav',
    patientAge: 28,
    village: 'Sulur',
    hbLevel: 11.2,
    bpSys: 156,
    bpDia: 98,
    riskType: 'Pregnancy Hypertension (BP > 140/90)',
    gestationalWeeks: 32,
    assignedAsha: 'Kiran Devi',
    ashaId: 'ASHA-103',
    status: 'Under Observation',
    lastChecked: '2026-07-06',
  },
  {
    id: 'HRP-003',
    patientName: 'Pooja Sharma',
    patientAge: 21,
    village: 'Thondamuthur',
    hbLevel: 9.8,
    bpSys: 142,
    bpDia: 94,
    riskType: 'Pre-eclampsia Suspect (Hypertension & Oedema)',
    gestationalWeeks: 34,
    assignedAsha: 'Rajni Bala',
    ashaId: 'ASHA-102',
    status: 'Referred',
    lastChecked: '2026-07-04',
  }
];

const INITIAL_DEFAULTERS: ImmunizationDefaulter[] = [
  {
    id: 'DEF-001',
    childName: 'Rahul Verma',
    childAge: '18 months',
    parentName: 'Sushma Verma',
    parentContact: '+91 98765 43210',
    village: 'Karamadai',
    missedVaccine: 'DPT Booster 1',
    dueDate: '2026-06-15',
    daysOverdue: 22,
    assignedAsha: 'Priya Patel',
    ashaId: 'ASHA-104',
    notes: 'Family migrated temporarily for harvest, now returned.'
  },
  {
    id: 'DEF-002',
    childName: 'Pinky Gond',
    childAge: '9 months',
    parentName: 'Rami Gond',
    parentContact: '+91 88776 55432',
    village: 'Madukkarai',
    missedVaccine: 'Measles & Rubella 1 (MR)',
    dueDate: '2026-06-25',
    daysOverdue: 12,
    assignedAsha: 'Anjali Sharma',
    ashaId: 'ASHA-101',
    notes: 'Mother hesitant due to post-vaccine fever rumors. Counselor counseling requested.'
  },
  {
    id: 'DEF-003',
    childName: 'Aman Dev',
    childAge: '2.2 years',
    parentName: 'Seema Dev',
    parentContact: '+91 76543 21098',
    village: 'Sulur',
    missedVaccine: 'OPV Booster',
    dueDate: '2026-06-10',
    daysOverdue: 27,
    assignedAsha: 'Kiran Devi',
    ashaId: 'ASHA-103',
    notes: 'Minor illness during regular village health and nutrition day (VHSND).'
  }
];

const INITIAL_NUTRITION_CHILDREN: NutritionRiskChild[] = [
  {
    id: 'NUT-001',
    childName: 'Sonu Kumar',
    childAge: '3 years',
    parentName: 'Phoolan Devi',
    village: 'Sulur',
    weight: 9.2,
    height: 92,
    muac: 11.1,
    status: 'SAM',
    assignedAsha: 'Kiran Devi',
    ashaId: 'ASHA-103',
    lastAssessed: '2026-07-01'
  },
  {
    id: 'NUT-002',
    childName: 'Golu Sahni',
    childAge: '18 months',
    parentName: 'Munni Sahni',
    village: 'Thondamuthur',
    weight: 8.5,
    height: 79,
    muac: 12.2,
    status: 'MAM',
    assignedAsha: 'Rajni Bala',
    ashaId: 'ASHA-102',
    lastAssessed: '2026-07-02'
  },
  {
    id: 'NUT-003',
    childName: 'Ritu Patel',
    childAge: '2 years',
    parentName: 'Vandana Patel',
    village: 'Karamadai',
    weight: 8.1,
    height: 84,
    muac: 10.9,
    status: 'SAM',
    assignedAsha: 'Priya Patel',
    ashaId: 'ASHA-104',
    lastAssessed: '2026-07-03'
  }
];

const INITIAL_MEDICINE_ALERTS: MedicineAlert[] = [
  {
    id: 'MED-ALT-01',
    title: 'BCG Vaccine Critical Low Stock',
    type: 'Stockout',
    facility: 'Madukkarai PHC (Main Cold Chain)',
    medicineName: 'BCG Immunization Vials',
    details: 'Current physical balance at 4 vials (safety threshold is 20). Immediate central warehouse requisition recommended.',
    severity: 'Critical',
    dateGenerated: '2026-07-06',
    resolved: false
  },
  {
    id: 'MED-ALT-02',
    title: 'DPT Booster Supply Interruption',
    type: 'Shortage',
    facility: 'Thondamuthur Sub-Centre Vaccine Bag',
    medicineName: 'DPT Vaccines',
    details: 'Stock depleted to 0 units. 12 children listed as overdue or pending DPT boosters in village registers.',
    severity: 'Critical',
    dateGenerated: '2026-07-07',
    resolved: false
  },
  {
    id: 'MED-ALT-03',
    title: 'Rotavirus Vaccine Expiry Advisory',
    type: 'Expiry',
    facility: 'Madukkarai PHC (ILR Freezer #2)',
    medicineName: 'Rotavirus Oral Vaccine (Batch: ROT-2026-X)',
    details: '45 doses expiring on 2026-07-22 (in 15 days). Request pre-emptive distribution to high-catchment sub-centers.',
    severity: 'Warning',
    dateGenerated: '2026-07-05',
    resolved: false
  },
  {
    id: 'MED-ALT-04',
    title: 'Iron-Folic Acid (IFA) Tablets Low Stock',
    type: 'Shortage',
    facility: 'Karamadai Village Depot',
    medicineName: 'IFA Syrup & Tablets (Maternal Spec)',
    details: 'Stock dropped below 100 tablets. High density of pregnant mothers in third trimester residing in catchment.',
    severity: 'Warning',
    dateGenerated: '2026-07-06',
    resolved: false
  }
];

const INITIAL_PRIORITY_VISITS: PriorityVisit[] = [
  {
    id: 'PV-1001',
    patientName: 'Meera Bai',
    village: 'Madukkarai',
    ashaId: 'ASHA-101',
    ashaName: 'Anjali Sharma',
    condition: 'Severe Anaemia checkup (Hb 8.2 g/dL)',
    urgency: 'Critical',
    assignedDate: '2026-07-07',
    status: 'Pending',
    notes: 'Check if she has received blood infusion reference at PHC. Verify double IFA consumption.'
  },
  {
    id: 'PV-1002',
    patientName: 'Sarita Yadav',
    village: 'Sulur',
    ashaId: 'ASHA-103',
    ashaName: 'Kiran Devi',
    condition: 'Hypertension audit (BP 156/98 mmHg)',
    urgency: 'High',
    assignedDate: '2026-07-06',
    status: 'Completed',
    notes: 'Verify if the patient went to PHC for MO consultation. Check compliance with Methyldopa.'
  }
];

import { load as loadPriorityVisits, save as savePriorityVisitsUtil, add as addPriorityVisitUtil, update as updatePriorityVisitUtil } from '../../utils/storage/priorityVisits';
import { load as loadAlerts, save as saveAlertsUtil } from '../../utils/storage/alerts';

// Helper to load/save in localStorage
export function initSupervisorLocalStorage() {
  const existingAshas = localStorage.getItem('sup_ashas');
  if (!existingAshas || existingAshas.includes('Rampur') || existingAshas.includes('Gopalpur')) {
    localStorage.setItem('sup_ashas', JSON.stringify(INITIAL_ASHAS));
    localStorage.setItem('sup_high_risk', JSON.stringify(INITIAL_HIGH_RISK_PREGNANCIES));
    localStorage.setItem('sup_defaulters', JSON.stringify(INITIAL_DEFAULTERS));
    localStorage.setItem('sup_nutrition', JSON.stringify(INITIAL_NUTRITION_CHILDREN));
    saveAlertsUtil(INITIAL_MEDICINE_ALERTS as any);
    savePriorityVisitsUtil(INITIAL_PRIORITY_VISITS as any);
  }

  if (!localStorage.getItem('sup_ashas')) {
    localStorage.setItem('sup_ashas', JSON.stringify(INITIAL_ASHAS));
  }
  if (!localStorage.getItem('sup_high_risk')) {
    localStorage.setItem('sup_high_risk', JSON.stringify(INITIAL_HIGH_RISK_PREGNANCIES));
  }
  if (!localStorage.getItem('sup_defaulters')) {
    localStorage.setItem('sup_defaulters', JSON.stringify(INITIAL_DEFAULTERS));
  }
  if (!localStorage.getItem('sup_nutrition')) {
    localStorage.setItem('sup_nutrition', JSON.stringify(INITIAL_NUTRITION_CHILDREN));
  }
  if (!localStorage.getItem('sup_med_alerts')) {
    saveAlertsUtil(INITIAL_MEDICINE_ALERTS as any);
  }
  if (!localStorage.getItem('sup_priority_visits')) {
    savePriorityVisitsUtil(INITIAL_PRIORITY_VISITS as any);
  }
}

// Getters
export function getAshas(): AshaPerformance[] {
  initSupervisorLocalStorage();
  const data = localStorage.getItem('sup_ashas');
  return data ? JSON.parse(data) : [];
}

export function getHighRiskPregnancies(): HighRiskPregnancy[] {
  initSupervisorLocalStorage();
  const data = localStorage.getItem('sup_high_risk');
  return data ? JSON.parse(data) : [];
}

export function getDefaulters(): ImmunizationDefaulter[] {
  initSupervisorLocalStorage();
  const data = localStorage.getItem('sup_defaulters');
  return data ? JSON.parse(data) : [];
}

export function getNutritionChildren(): NutritionRiskChild[] {
  initSupervisorLocalStorage();
  const data = localStorage.getItem('sup_nutrition');
  return data ? JSON.parse(data) : [];
}

export function getMedicineAlerts(): MedicineAlert[] {
  initSupervisorLocalStorage();
  return loadAlerts() as any[];
}

export function getPriorityVisits(): PriorityVisit[] {
  initSupervisorLocalStorage();
  return loadPriorityVisits() as any[];
}

// Setters & Actions
export function addPriorityVisit(visit: Omit<PriorityVisit, 'id' | 'assignedDate' | 'status'>): PriorityVisit {
  initSupervisorLocalStorage();
  const newVisit = addPriorityVisitUtil(visit as any) as any;

  // Also update ASHA pendingCount
  const ashas = getAshas();
  const updatedAshas = ashas.map(a => {
    if (a.id === visit.ashaId) {
      return { ...a, pendingCount: a.pendingCount + 1 };
    }
    return a;
  });
  localStorage.setItem('sup_ashas', JSON.stringify(updatedAshas));

  return newVisit;
}

export function toggleVisitStatus(id: string): PriorityVisit[] {
  initSupervisorLocalStorage();
  const list = getPriorityVisits();
  const updatedList = list.map(v => {
    if (v.id === id) {
      const nextStatus = v.status === 'Pending' ? 'Completed' : 'Pending';
      
      // Update ASHA metrics accordingly
      const ashas = getAshas();
      const updatedAshas = ashas.map(a => {
        if (a.id === v.ashaId) {
          const change = nextStatus === 'Completed' ? -1 : 1;
          const visitsChange = nextStatus === 'Completed' ? 1 : -1;
          return { 
            ...a, 
            pendingCount: Math.max(0, a.pendingCount + change),
            visitsThisMonth: Math.max(0, a.visitsThisMonth + visitsChange)
          };
        }
        return a;
      });
      localStorage.setItem('sup_ashas', JSON.stringify(updatedAshas));

      updatePriorityVisitUtil(id, { status: nextStatus as any });
      return { ...v, status: nextStatus as 'Pending' | 'Completed' };
    }
    return v;
  });
  return loadPriorityVisits() as any[];
}

export function updateHighRiskPregnancyStatus(id: string, status: HighRiskPregnancy['status']): HighRiskPregnancy[] {
  initSupervisorLocalStorage();
  const list = getHighRiskPregnancies();
  const updatedList = list.map(h => {
    if (h.id === id) {
      return { ...h, status, lastChecked: new Date().toISOString().substring(0, 10) };
    }
    return h;
  });
  localStorage.setItem('sup_high_risk', JSON.stringify(updatedList));
  return updatedList;
}

export function resolveDefaulter(id: string, notes: string): ImmunizationDefaulter[] {
  initSupervisorLocalStorage();
  const list = getDefaulters();
  // We can filter out or update the notes. Let's filter it out to represent "resolved / vaccinated"
  const updatedList = list.filter(d => d.id !== id);
  localStorage.setItem('sup_defaulters', JSON.stringify(updatedList));
  return updatedList;
}

export function resolveNutritionChild(id: string): NutritionRiskChild[] {
  initSupervisorLocalStorage();
  const list = getNutritionChildren();
  // Filter out to represent "cured / exited from program" or update status to Borderline/Normal
  const updatedList = list.filter(n => n.id !== id);
  localStorage.setItem('sup_nutrition', JSON.stringify(updatedList));
  return updatedList;
}

export function resolveMedicineAlert(id: string): MedicineAlert[] {
  initSupervisorLocalStorage();
  const list = getMedicineAlerts();
  const updatedList = list.map(m => {
    if (m.id === id) {
      return { ...m, resolved: true };
    }
    return m;
  });
  saveAlertsUtil(updatedList as any);
  return loadAlerts() as any[];
}

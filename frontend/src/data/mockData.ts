import { User, SyncRecord } from '../types';

export const DEMO_CREDENTIALS = [
  {
    email: 'vishal.admin',
    password: 'Admin@123',
    role: 'admin' as const,
    name: 'District Admin (Vishal)',
    location: 'District Headquarter',
    facilityName: 'District Health Administration Office',
    isActivated: true,
  },
  {
    email: 'dr.meena',
    password: 'Supervisor@123',
    role: 'supervisor' as const,
    name: 'PHC Supervisor (Dr. Meena)',
    location: 'Thondamuthur Sector',
    facilityName: 'Thondamuthur PHC',
    isActivated: true,
  },
  {
    email: 'sunita',
    password: 'Asha@123',
    role: 'asha' as const,
    name: 'ASHA Worker (Sunita)',
    location: 'Madukkarai Village',
    facilityName: 'Madukkarai PHC',
    isActivated: true,
  },
  {
    email: 'arjun',
    password: 'Pharmacist@123',
    role: 'pharmacist' as const,
    name: 'Pharmacist (Arjun)',
    location: 'Sulur Block',
    facilityName: 'Sulur PHC',
    isActivated: true,
  }
];

export const INITIAL_RECORDS: SyncRecord[] = [
  {
    id: 'REC-001',
    patientName: 'Sunita Devi',
    patientAge: 26,
    patientGender: 'F',
    village: 'Madukkarai',
    status: 'synced',
    lastUpdated: '2026-07-06 14:32',
    diagnosis: 'ANC 2nd Trimester Checkup - Normal',
    treatment: 'Folic Acid, Iron Supplements, Calcium advised',
    workerId: 'asha-01',
    type: 'maternal'
  },
  {
    id: 'REC-002',
    patientName: 'Aarav Kumar',
    patientAge: 1,
    patientGender: 'M',
    village: 'Thondamuthur',
    status: 'synced',
    lastUpdated: '2026-07-06 11:15',
    diagnosis: '1st Measles & Rubella (MR) Vaccination',
    treatment: 'Administered 0.5ml subcutaneously. Post-vaccination fever counseling given.',
    workerId: 'asha-01',
    type: 'child_immunization'
  },
  {
    id: 'REC-003',
    patientName: 'Ram Sharan',
    patientAge: 52,
    patientGender: 'M',
    village: 'Sulur',
    status: 'pending',
    lastUpdated: '2026-07-07 09:45',
    diagnosis: 'NCD Screening - High Blood Pressure',
    treatment: 'BP 152/94 mmHg. Referred to PHC for Medical Officer consultation.',
    workerId: 'asha-01',
    type: 'ncd_screening'
  },
  {
    id: 'REC-004',
    patientName: 'Komal Gupta',
    patientAge: 22,
    patientGender: 'F',
    village: 'Madukkarai',
    status: 'pending',
    lastUpdated: '2026-07-07 15:20',
    diagnosis: 'Mild Anaemia - Hb 10.2 g/dL',
    treatment: 'Iron-rich diet counseling. Standard iron-folic acid regimen started.',
    workerId: 'asha-01',
    type: 'maternal'
  },
  {
    id: 'REC-005',
    patientName: 'Harish Chandra',
    patientAge: 61,
    patientGender: 'M',
    village: 'Karamadai',
    status: 'failed',
    lastUpdated: '2026-07-05 18:10',
    diagnosis: 'Chronic Diabetes Follow-up',
    treatment: 'Random Blood Sugar: 210 mg/dL. Urged immediate PHC visit.',
    workerId: 'asha-01',
    type: 'ncd_screening'
  },
  {
    id: 'REC-006',
    patientName: 'Radha Bai',
    patientAge: 31,
    patientGender: 'F',
    village: 'Sulur',
    status: 'synced',
    lastUpdated: '2026-07-04 10:20',
    diagnosis: 'General Checkup - High Grade Fever',
    treatment: 'Paracetamol 500mg, Malaria Rapid Diagnostic Test (Negative). Cool compress.',
    workerId: 'asha-01',
    type: 'general'
  }
];

export const RECENT_ACTIVITIES = [
  {
    id: 'ACT-001',
    action: 'Added Sunita Devi ANC checkup record',
    time: '2 hours ago',
    type: 'add',
    synced: true
  },
  {
    id: 'ACT-002',
    action: 'Created Ram Sharan NCD screening',
    time: '4 hours ago',
    type: 'add',
    synced: false
  },
  {
    id: 'ACT-003',
    action: 'Updated Aarav Kumar immunization profile',
    time: '1 day ago',
    type: 'update',
    synced: true
  },
  {
    id: 'ACT-004',
    action: 'Attempted Harish Chandra diabetic sync',
    time: '2 days ago',
    type: 'sync_fail',
    synced: false
  }
];

export const VACCINE_STOCK = [
  { name: 'BCG', stock: 45, threshold: 20, unit: 'vials' },
  { name: 'OPV', stock: 120, threshold: 30, unit: 'doses' },
  { name: 'Pentavalent', stock: 18, threshold: 25, unit: 'vials' },
  { name: 'Rotavirus', stock: 65, threshold: 20, unit: 'doses' },
  { name: 'MR Vaccine', stock: 40, threshold: 15, unit: 'vials' },
  { name: 'DPT Booster', stock: 8, threshold: 15, unit: 'vials' }
];

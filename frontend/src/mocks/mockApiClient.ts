// In-memory mock data layer for GitHub Pages Demo Mode (VITE_DEMO_MODE=true)
// Provides realistic sample data, matching real DTOs and entity shapes.
// Supports in-memory soft-delete semantics (matching real backend) and mutations.
// Refreshing resets all data to seed state.

export interface MockUser {
  id: number;
  name: string;
  username: string;
  role: string;
  phcId?: string;
  password?: string;
  phone?: string;
  location?: string;
  status: string;
}

// ----------------- Seed Datasets -----------------

const SEED_USERS: MockUser[] = [
  {
    id: 1,
    name: 'District Administrator',
    username: 'admin',
    role: 'ADMIN',
    phcId: 'PHC-101',
    password: 'Admin@123',
    phone: '+91 98401 23456',
    location: 'District Headquarter',
    status: 'active',
  },
  {
    id: 2,
    name: 'Dr. Vedavalli Raman',
    username: 'vedava',
    role: 'PHC_SUPERVISOR',
    phcId: 'PHC-101',
    password: 'Vedava@123',
    phone: '+91 94432 11223',
    location: 'Madukkarai PHC',
    status: 'active',
  },
  {
    id: 3,
    name: 'Anita Devi',
    username: 'anita.devi',
    role: 'ASHA',
    phcId: 'PHC-101',
    password: 'Asha@123',
    phone: '+91 98412 99887',
    location: 'Madukkarai Village Sector A',
    status: 'active',
  },
  {
    id: 4,
    name: 'Priya Sharma',
    username: 'priya.sharma',
    role: 'PHARMACIST',
    phcId: 'PHC-101',
    password: 'Pharm@123',
    phone: '+91 97890 55443',
    location: 'Madukkarai Central Dispensary',
    status: 'active',
  },
];

const SEED_PHCS = [
  {
    id: 1,
    name: 'Madukkarai Primary Health Center',
    code: 'PHC-101',
    district: 'Demo District',
    block: 'Madukkarai Block',
    address: 'Near Old Bus Stand, Madukkarai',
    active: true,
  },
  {
    id: 2,
    name: 'Thondamuthur Primary Health Center',
    code: 'PHC-102',
    district: 'Demo District',
    block: 'Thondamuthur Block',
    address: 'Main Road, Thondamuthur',
    active: true,
  },
];

const SEED_HOUSEHOLDS = [
  {
    id: 1,
    householdNumber: 'HH-MDK-01',
    headName: 'Ramesh Kumar',
    village: 'Madukkarai',
    membersCount: 4,
    category: 'BPL',
    waterSource: 'piped',
    toilet: true,
    ashaWorkerId: 3,
    phcId: 'PHC-101',
    createdAt: '2026-06-10T10:00:00',
    updatedAt: '2026-08-01T12:00:00',
    active: 1,
  },
  {
    id: 2,
    householdNumber: 'HH-MDK-02',
    headName: 'Kavitha Murugan',
    village: 'Madukkarai',
    membersCount: 5,
    category: 'APL',
    waterSource: 'handpump',
    toilet: true,
    ashaWorkerId: 3,
    phcId: 'PHC-101',
    createdAt: '2026-06-15T11:30:00',
    updatedAt: '2026-08-05T14:20:00',
    active: 1,
  },
  {
    id: 3,
    householdNumber: 'HH-MDK-03',
    headName: 'Selvam Natarajan',
    village: 'Madukkarai',
    membersCount: 3,
    category: 'AAY',
    waterSource: 'well',
    toilet: false,
    ashaWorkerId: 3,
    phcId: 'PHC-101',
    createdAt: '2026-07-01T09:00:00',
    updatedAt: '2026-08-10T16:45:00',
    active: 1,
  },
];

const SEED_PATIENTS = [
  {
    id: 1,
    name: 'Sunita Devi',
    dateOfBirth: '1998-05-14',
    gender: 'Female',
    phone: '9876543210',
    address: 'Household HH-MDK-01',
    village: 'Madukkarai',
    emergencyContact: 'Ramesh Kumar',
    phcId: 'PHC-101',
    ashaWorkerId: 3,
    createdAt: '2026-06-10T10:15:00',
    updatedAt: '2026-08-12T11:00:00',
    active: true,
  },
  {
    id: 2,
    name: 'Aarav Kumar',
    dateOfBirth: '2025-06-20',
    gender: 'Male',
    phone: '9876543210',
    address: 'Household HH-MDK-01',
    village: 'Madukkarai',
    emergencyContact: 'Sunita Devi',
    phcId: 'PHC-101',
    ashaWorkerId: 3,
    createdAt: '2026-06-10T10:30:00',
    updatedAt: '2026-08-15T09:40:00',
    active: true,
  },
  {
    id: 3,
    name: 'Komal Gupta',
    dateOfBirth: '2004-03-22',
    gender: 'Female',
    phone: '9840199882',
    address: 'Household HH-MDK-02',
    village: 'Madukkarai',
    emergencyContact: 'Kavitha Murugan',
    phcId: 'PHC-101',
    ashaWorkerId: 3,
    createdAt: '2026-06-15T11:45:00',
    updatedAt: '2026-08-16T15:10:00',
    active: true,
  },
  {
    id: 4,
    name: 'Radha Bai',
    dateOfBirth: '1995-11-08',
    gender: 'Female',
    phone: '9789012345',
    address: 'Household HH-MDK-03',
    village: 'Madukkarai',
    emergencyContact: 'Selvam Natarajan',
    phcId: 'PHC-101',
    ashaWorkerId: 3,
    createdAt: '2026-07-01T09:15:00',
    updatedAt: '2026-08-18T10:00:00',
    active: true,
  },
  {
    id: 5,
    name: 'Harish Chandra',
    dateOfBirth: '1965-08-19',
    gender: 'Male',
    phone: '9443219876',
    address: 'Household HH-MDK-03',
    village: 'Madukkarai',
    emergencyContact: 'Selvam Natarajan',
    phcId: 'PHC-101',
    ashaWorkerId: 3,
    createdAt: '2026-07-01T09:30:00',
    updatedAt: '2026-08-18T10:30:00',
    active: true,
  },
];

const SEED_PREGNANCIES = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Sunita Devi',
    lastMenstrualPeriod: '2026-02-15',
    expectedDeliveryDate: '2026-11-22',
    gravida: 5,
    para: 3,
    bloodGroup: 'B+',
    pregnancyStatus: 'ACTIVE',
    highRisk: true,
    riskFactors: 'Severe Anemia (Hb 6.8), High Gravida (>= 5)',
    registrationDate: '2026-04-10',
    createdAt: '2026-04-10T10:00:00',
    updatedAt: '2026-08-12T11:00:00',
    active: true,
  },
  {
    id: 2,
    patientId: 3,
    patientName: 'Komal Gupta',
    lastMenstrualPeriod: '2026-04-01',
    expectedDeliveryDate: '2027-01-06',
    gravida: 1,
    para: 0,
    bloodGroup: 'O+',
    pregnancyStatus: 'REGISTERED',
    highRisk: false,
    riskFactors: 'None',
    registrationDate: '2026-05-20',
    createdAt: '2026-05-20T14:00:00',
    updatedAt: '2026-08-16T15:10:00',
    active: true,
  },
];

const SEED_ANC_VISITS = [
  {
    id: 1,
    pregnancyId: 1,
    visitDate: '2026-06-15',
    weight: 56.5,
    systolicBp: 148,
    diastolicBp: 94,
    hemoglobin: 6.8,
    fetalHeartRate: 142,
    dangerSigns: 'Severe headache, blurred vision',
    symptoms: 'Swollen feet, fatigue',
    clinicalNotes: 'Gestational hypertension and severe anemia. IFA forte prescribed. Immediate PHC referral given.',
    nextVisitDate: '2026-06-25',
    riskEvaluated: true,
    riskNotes: 'High Risk Flagged: Systolic >= 140, Diastolic >= 90, Hb < 7.0',
    active: 1,
  },
  {
    id: 2,
    pregnancyId: 1,
    visitDate: '2026-07-20',
    weight: 58.0,
    systolicBp: 138,
    diastolicBp: 88,
    hemoglobin: 8.2,
    fetalHeartRate: 144,
    dangerSigns: 'None',
    symptoms: 'Mild edema',
    clinicalNotes: 'BP slightly improved post medication. Diet counseling reinforced.',
    nextVisitDate: '2026-08-15',
    riskEvaluated: true,
    riskNotes: 'Moderate Risk: Prior severe anemia history',
    active: 1,
  },
];

const SEED_VACCINES = [
  { id: 1, name: 'BCG Vaccine', code: 'BCG', targetAge: 'Birth', active: true },
  { id: 2, name: 'Oral Polio Vaccine (OPV)', code: 'OPV-0', targetAge: 'Birth', active: true },
  { id: 3, name: 'Hepatitis B', code: 'HepB-0', targetAge: 'Birth', active: true },
  { id: 4, name: 'Pentavalent 1', code: 'PENTA-1', targetAge: '6 Weeks', active: true },
  { id: 5, name: 'Rotavirus 1', code: 'ROTA-1', targetAge: '6 Weeks', active: true },
  { id: 6, name: 'Measles & Rubella 1 (MR-1)', code: 'MR-1', targetAge: '9 Months', active: true },
  { id: 7, name: 'DPT Booster', code: 'DPT-B', targetAge: '16-24 Months', active: true },
];

const SEED_IMMUNIZATIONS = [
  {
    id: 1,
    patientId: 2,
    patientName: 'Aarav Kumar',
    vaccineId: 1,
    vaccineCode: 'BCG',
    vaccineName: 'BCG Vaccine',
    doseNumber: 1,
    administeredDate: '2025-06-22',
    batchNumber: 'BCG-2025-04',
    administeredBy: 3,
    notes: 'Administered at birth, left upper arm scar observed',
    administered: true,
    nextDueDate: '2025-08-01',
    createdAt: '2025-06-22T10:00:00',
    updatedAt: '2025-06-22T10:00:00',
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Aarav Kumar',
    vaccineId: 4,
    vaccineCode: 'PENTA-1',
    vaccineName: 'Pentavalent 1',
    doseNumber: 1,
    administeredDate: '2025-08-05',
    batchNumber: 'PENTA-992',
    administeredBy: 3,
    notes: 'Given at Sub-center session',
    administered: true,
    nextDueDate: '2025-09-05',
    createdAt: '2025-08-05T11:00:00',
    updatedAt: '2025-08-05T11:00:00',
  },
  {
    id: 3,
    patientId: 2,
    patientName: 'Aarav Kumar',
    vaccineId: 6,
    vaccineCode: 'MR-1',
    vaccineName: 'Measles & Rubella 1 (MR-1)',
    doseNumber: 1,
    administeredDate: null,
    batchNumber: null,
    administeredBy: 3,
    notes: 'Scheduled 9-month booster — overdue',
    administered: false,
    nextDueDate: '2026-03-20',
    createdAt: '2025-08-05T11:00:00',
    updatedAt: '2026-08-10T12:00:00',
  },
];

const SEED_NUTRITION = [
  {
    id: 1,
    patientId: 2,
    patientName: 'Aarav Kumar',
    measurementDate: '2026-08-01',
    weightKg: 8.4,
    heightCm: 76.0,
    muacCm: 11.2,
    ageMonths: 14,
    feedingType: 'Complementary Feeding',
    nutritionStatus: 'HIGH_RISK',
    riskFlag: true,
    riskFactors: 'Severe Acute Malnutrition (MUAC < 11.5 cm)',
    notes: 'Referred to Nutrition Rehabilitation Centre (NRC)',
    recordedByUserId: 3,
    createdAt: '2026-08-01T10:30:00',
    updatedAt: '2026-08-01T10:30:00',
    active: 1,
  },
  {
    id: 2,
    patientId: 4,
    patientName: 'Radha Bai',
    measurementDate: '2026-08-10',
    weightKg: 44.0,
    heightCm: 154.0,
    muacCm: 21.0,
    ageMonths: 360,
    feedingType: 'Normal Adult Diet',
    nutritionStatus: 'NORMAL',
    riskFlag: false,
    riskFactors: 'None',
    notes: 'Healthy BMI',
    recordedByUserId: 3,
    createdAt: '2026-08-10T11:00:00',
    updatedAt: '2026-08-10T11:00:00',
    active: 1,
  },
];

const SEED_PRIORITY_VISITS = [
  {
    id: 1,
    patientName: 'Sunita Devi',
    village: 'Madukkarai',
    ashaId: '3',
    ashaName: 'Anita Devi',
    condition: 'Gestational Hypertension (BP 148/94) & Severe Anemia',
    urgency: 'Critical',
    assignedDate: '2026-08-15',
    status: 'Pending',
    notes: 'Conduct urgent home check, verify daily IFA intake and BP stability. Accompany to PHC if systolic >= 140.',
  },
  {
    id: 2,
    patientName: 'Aarav Kumar',
    village: 'Madukkarai',
    ashaId: '3',
    ashaName: 'Anita Devi',
    condition: 'Severe Acute Malnutrition (MUAC 11.2 cm) & Overdue MR-1 Dose',
    urgency: 'High',
    assignedDate: '2026-08-16',
    status: 'Pending',
    notes: 'Check child weight, monitor take-home ration (THR) consumption, counsel mother for NRC visit.',
  },
  {
    id: 3,
    patientName: 'TEST_DEMO_PATIENT',
    village: 'Madukkarai',
    ashaId: '3',
    ashaName: 'Anita Devi',
    condition: 'Gestational Hypertension 155/95 follow-up',
    urgency: 'High',
    assignedDate: '2026-08-20',
    status: 'Completed',
    notes: 'Demonstration visit for supervisor delegation workflow walkthrough.',
  },
];

const SEED_MEDICINES = [
  { id: 1, name: 'Iron & Folic Acid Tablets (IFA)', code: 'IFA-100', genericName: 'Ferrous Sulphate + Folic Acid', category: 'Supplements', dosageForm: 'Tablet', strength: '100mg Fe + 0.5mg FA', unit: 'Tablets', stock: 2400, reorderLevel: 500, active: true },
  { id: 2, name: 'Calcium & Vitamin D3', code: 'CAL-500', genericName: 'Calcium Carbonate + Cholecalciferol', category: 'Supplements', dosageForm: 'Tablet', strength: '500mg + 250IU', unit: 'Tablets', stock: 1600, reorderLevel: 400, active: true },
  { id: 3, name: 'Paracetamol 500mg', code: 'PCM-500', genericName: 'Paracetamol', category: 'Analgesic', dosageForm: 'Tablet', strength: '500mg', unit: 'Tablets', stock: 850, reorderLevel: 300, active: true },
  { id: 4, name: 'Amoxicillin 250mg', code: 'AMX-250', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotic', dosageForm: 'Capsule', strength: '250mg', unit: 'Capsules', stock: 120, reorderLevel: 250, active: true },
  { id: 5, name: 'ORS Sachets', code: 'ORS-20', genericName: 'Oral Rehydration Salts IP', category: 'Electrolyte', dosageForm: 'Sachet', strength: '20.5g', unit: 'Sachets', stock: 450, reorderLevel: 100, active: true },
  { id: 6, name: 'Zinc Sulphate 20mg', code: 'ZN-20', genericName: 'Zinc Sulphate Dispersible', category: 'Supplements', dosageForm: 'Tablet', strength: '20mg', unit: 'Tablets', stock: 320, reorderLevel: 150, active: true },
];

const SEED_MEDICINE_BATCHES = [
  { id: 1, medicineId: 1, medicineName: 'Iron & Folic Acid Tablets (IFA)', batchNumber: 'IFA-B2026-01', quantity: 1800, expiryDate: '2027-04-30', manufacturingDate: '2025-05-01', unit: 'Tablets', phcId: 'PHC-101', status: 'Active' },
  { id: 2, medicineId: 4, medicineName: 'Amoxicillin 250mg', batchNumber: 'AMX-2025-88', quantity: 120, expiryDate: '2026-09-25', manufacturingDate: '2024-10-01', unit: 'Capsules', phcId: 'PHC-101', status: 'Near Expiry' },
  { id: 3, medicineId: 3, medicineName: 'Paracetamol 500mg', batchNumber: 'PCM-2026-03', quantity: 850, expiryDate: '2028-01-31', manufacturingDate: '2026-02-01', unit: 'Tablets', phcId: 'PHC-101', status: 'Active' },
];

const SEED_MEDICINE_TRANSACTIONS = [
  { id: 1, medicineId: 1, medicineName: 'Iron & Folic Acid Tablets (IFA)', batchId: 1, batchNumber: 'IFA-B2026-01', type: 'Outbound', quantity: 60, transactionDate: '2026-08-10 10:30', reason: 'Dispensed to ASHA Anita Devi for ANC patient Sunita Devi', performedBy: 'Priya Sharma' },
  { id: 2, medicineId: 3, medicineName: 'Paracetamol 500mg', batchId: 3, batchNumber: 'PCM-2026-03', type: 'Outbound', quantity: 30, transactionDate: '2026-08-12 11:15', reason: 'Sub-center clinic weekly replenishment', performedBy: 'Priya Sharma' },
  { id: 3, medicineId: 4, medicineName: 'Amoxicillin 250mg', batchId: 2, batchNumber: 'AMX-2025-88', type: 'Inbound', quantity: 200, transactionDate: '2026-07-01 09:00', reason: 'District warehouse stock delivery', performedBy: 'Priya Sharma' },
];

const SEED_MEDICINE_ISSUES = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Sunita Devi',
    medicineName: 'Iron & Folic Acid Tablets (IFA)',
    quantity: 60,
    dosageInstructions: '1 tablet twice daily after food with lemon water',
    issueDate: '2026-08-10',
    createdAt: '2026-08-10T10:30:00',
    updatedAt: '2026-08-10T10:30:00',
    active: 1,
  },
  {
    id: 2,
    patientId: 4,
    patientName: 'Radha Bai',
    medicineName: 'Paracetamol 500mg',
    quantity: 10,
    dosageInstructions: '1 tablet SOS for body pain / fever after meals',
    issueDate: '2026-08-12',
    createdAt: '2026-08-12T11:00:00',
    updatedAt: '2026-08-12T11:00:00',
    active: 1,
  },
];

const SEED_AUDIT_LOGS = [
  {
    id: 1,
    phcId: 'PHC-101',
    performedUsername: 'admin',
    role: 'ADMIN',
    description: 'System initialization and PHC Directory registered',
    timestamp: '2026-08-01T08:00:00',
    status: '200',
  },
  {
    id: 2,
    phcId: 'PHC-101',
    performedUsername: 'vedava',
    role: 'PHC_SUPERVISOR',
    description: 'Delegated priority home visit to ASHA Anita Devi (Patient: Sunita Devi)',
    timestamp: '2026-08-15T09:30:00',
    status: '201',
  },
  {
    id: 3,
    phcId: 'PHC-101',
    performedUsername: 'anita.devi',
    role: 'ASHA',
    description: 'Recorded ANC Visit checkup with elevated blood pressure detection',
    timestamp: '2026-08-15T11:45:00',
    status: '201',
  },
];

// ----------------- In-Memory Mutable State -----------------

class MockDataStore {
  users = [...SEED_USERS];
  phcs = [...SEED_PHCS];
  households = [...SEED_HOUSEHOLDS];
  patients = [...SEED_PATIENTS];
  pregnancies = [...SEED_PREGNANCIES];
  ancVisits = [...SEED_ANC_VISITS];
  vaccines = [...SEED_VACCINES];
  immunizations = [...SEED_IMMUNIZATIONS];
  nutrition = [...SEED_NUTRITION];
  priorityVisits = [...SEED_PRIORITY_VISITS];
  medicines = [...SEED_MEDICINES];
  batches = [...SEED_MEDICINE_BATCHES];
  transactions = [...SEED_MEDICINE_TRANSACTIONS];
  medicineIssues = [...SEED_MEDICINE_ISSUES];
  auditLogs = [...SEED_AUDIT_LOGS];

  nextId = 1000;

  getId(): number {
    return ++this.nextId;
  }
}

// Global in-memory instance: resets on browser refresh
const store = new MockDataStore();

// ----------------- Helper Mock Request Router -----------------

export async function handleMockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const url = endpoint.startsWith('http') ? new URL(endpoint).pathname : endpoint;
  const path = url.replace(/^\/api/, '');
  const body = options.body ? JSON.parse(String(options.body)) : null;

  // Add small artificial latency for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 60));

  // 1. Health Check
  if (path === '/health') {
    return { status: 'UP', service: 'demo-mode' } as T;
  }

  // 2. Auth Endpoints
  if (path === '/auth/login' && method === 'POST') {
    const { username, password } = body || {};
    const user = store.users.find(
      (u) =>
        u.username.toLowerCase() === (username || '').toLowerCase() ||
        (u.phone && u.phone === username)
    );

    if (!user || user.password !== password) {
      throw new Error('Invalid username or password');
    }

    if (user.status !== 'active') {
      throw new Error('Account is inactive. Contact district administrator.');
    }

    const token = `demo-token-${user.role.toLowerCase()}-${Date.now()}`;
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        phcId: user.phcId,
      },
    } as T;
  }

  if (path === '/auth/register' && method === 'POST') {
    const newUser: MockUser = {
      id: store.getId(),
      name: body.name || 'New Volunteer',
      username: body.username,
      role: body.role || 'ASHA',
      phcId: body.phcId || 'PHC-101',
      password: body.password || 'Asha@123',
      phone: body.phone,
      status: 'active',
    };
    store.users.push(newUser);
    return { id: newUser.id, name: newUser.name, username: newUser.username, role: newUser.role } as T;
  }

  if (path === '/auth/change-password' && method === 'POST') {
    return { message: 'Password updated successfully in demo session.' } as T;
  }

  if (path === '/users/profile' && method === 'GET') {
    return store.users[0] as T;
  }

  // 3. Dashboard Endpoints
  if (path === '/dashboard/summary' && method === 'GET') {
    const activePts = store.patients.filter((p) => p.active);
    const activePregs = store.pregnancies.filter((p) => p.active);
    const highRiskPregs = activePregs.filter((p) => p.highRisk);
    const childPts = activePts.filter((p) => {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      return age <= 12;
    });
    const overdueImms = store.immunizations.filter((i) => !i.administered);

    return {
      totalPatients: store.patients.length,
      activePatients: activePts.length,
      totalPregnancies: store.pregnancies.length,
      activePregnancies: activePregs.length,
      highRiskPregnancies: highRiskPregs.length,
      pendingANCVisits: 2,
      overdueANCVisits: 1,
      childrenCount: childPts.length,
      immunizationsDue: 1,
      immunizationsOverdue: overdueImms.length,
      nutritionAtRiskCount: 1,
      nutritionHighRiskCount: store.nutrition.filter((n) => n.active && n.nutritionStatus === 'HIGH_RISK').length,
      lowStockMedicineCount: store.medicines.filter((m) => m.stock < m.reorderLevel).length,
      expiringMedicineBatchCount: store.batches.filter((b) => b.status === 'Near Expiry').length,
      totalAlerts: 4,
    } as T;
  }

  if (path === '/dashboard/overview' && method === 'GET') {
    return {
      activePatients: store.patients.filter((p) => p.active).length,
      highRiskMothers: store.pregnancies.filter((p) => p.active && p.highRisk).length,
      overdueImmunizations: store.immunizations.filter((i) => !i.administered).length,
      urgentVisits: store.priorityVisits.filter((v) => v.status === 'Pending').length,
    } as T;
  }

  if (path === '/dashboard/maternal/high-risk' && method === 'GET') {
    return store.pregnancies
      .filter((p) => p.active && p.highRisk)
      .map((p) => ({
        pregnancyId: p.id,
        patientId: p.patientId,
        patientName: p.patientName,
        phcId: 'PHC-101',
        expectedDeliveryDate: p.expectedDeliveryDate,
        pregnancyStatus: p.pregnancyStatus,
        riskFactors: p.riskFactors,
        lastAncVisitDate: '2026-07-20',
      })) as T;
  }

  if (path === '/dashboard/immunization/overdue' && method === 'GET') {
    return store.immunizations.filter((i) => !i.administered) as T;
  }

  if (path === '/dashboard/nutrition/high-risk' && method === 'GET') {
    return store.nutrition.filter((n) => n.active && n.nutritionStatus === 'HIGH_RISK') as T;
  }

  if (path === '/dashboard/medicines/low-stock' && method === 'GET') {
    return store.medicines.filter((m) => m.stock < m.reorderLevel) as T;
  }

  if (path === '/dashboard/alerts' && method === 'GET') {
    return [
      { id: 1, title: 'High-Risk Maternal Alert', message: 'Sunita Devi: Severe Anemia (Hb 6.8)', severity: 'Critical' },
      { id: 2, title: 'Severe Malnutrition Alert', message: 'Aarav Kumar: MUAC 11.2cm (SAM)', severity: 'High' },
      { id: 3, title: 'Overdue Immunization Booster', message: 'Aarav Kumar: MR-1 dose past due date', severity: 'Medium' },
      { id: 4, title: 'Near Expiry Inventory', message: 'Amoxicillin 250mg batch expiring in < 30 days', severity: 'Warning' },
    ] as T;
  }

  // 4. Patients API (Soft-Delete Semantics)
  if (path === '/patients' && method === 'GET') {
    return store.patients.filter((p) => p.active) as T;
  }

  const patientIdMatch = path.match(/^\/patients\/(\d+)$/);
  if (patientIdMatch) {
    const id = Number(patientIdMatch[1]);
    const patient = store.patients.find((p) => p.id === id);

    if (method === 'GET') {
      if (!patient || !patient.active) {
        throw new Error('Patient not found with ID: ' + id);
      }
      return patient as T;
    }

    if (method === 'PUT') {
      if (!patient || !patient.active) {
        throw new Error('Patient not found with ID: ' + id);
      }
      Object.assign(patient, body, { updatedAt: new Date().toISOString() });
      return patient as T;
    }

    if (method === 'DELETE') {
      if (!patient || !patient.active) {
        throw new Error('Patient not found with ID: ' + id);
      }
      // Soft-delete semantics: marks inactive
      patient.active = false;
      patient.updatedAt = new Date().toISOString();
      return undefined as T;
    }
  }

  if (path === '/patients' && method === 'POST') {
    const newPatient = {
      id: store.getId(),
      name: body.name,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender || 'Female',
      phone: body.phone || '',
      address: body.address || 'Household HH-MDK-01',
      village: body.village || 'Madukkarai',
      emergencyContact: body.emergencyContact || '',
      phcId: body.phcId || 'PHC-101',
      ashaWorkerId: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };
    store.patients.push(newPatient);
    return newPatient as T;
  }

  // 5. Households API (Soft-Delete Semantics)
  if (path === '/households' && method === 'GET') {
    return store.households
      .filter((h) => h.active === 1)
      .map((h) => ({
        id: h.id,
        householdNumber: h.householdNumber,
        headName: h.headName,
        village: h.village,
        membersCount: h.membersCount,
        category: h.category,
        waterSource: h.waterSource,
        toilet: h.toilet === true || (h.toilet as any) === 1,
        ashaWorkerId: h.ashaWorkerId,
        phcId: h.phcId,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      })) as T;
  }

  const householdIdMatch = path.match(/^\/households\/(\d+)$/);
  if (householdIdMatch) {
    const id = Number(householdIdMatch[1]);
    const hh = store.households.find((h) => h.id === id);

    if (method === 'GET') {
      if (!hh || hh.active !== 1) throw new Error('Household not found with ID: ' + id);
      return {
        id: hh.id,
        householdNumber: hh.householdNumber,
        headName: hh.headName,
        village: hh.village,
        membersCount: hh.membersCount,
        category: hh.category,
        waterSource: hh.waterSource,
        toilet: hh.toilet === true || (hh.toilet as any) === 1,
        ashaWorkerId: hh.ashaWorkerId,
        phcId: hh.phcId,
        createdAt: hh.createdAt,
        updatedAt: hh.updatedAt,
      } as T;
    }

    if (method === 'PUT') {
      if (!hh || hh.active !== 1) throw new Error('Household not found with ID: ' + id);
      Object.assign(hh, body, {
        toilet: body.toilet !== undefined ? (body.toilet === true || body.toilet === 1) : hh.toilet,
        updatedAt: new Date().toISOString()
      });
      return {
        id: hh.id,
        householdNumber: hh.householdNumber,
        headName: hh.headName,
        village: hh.village,
        membersCount: hh.membersCount,
        category: hh.category,
        waterSource: hh.waterSource,
        toilet: hh.toilet === true || (hh.toilet as any) === 1,
        ashaWorkerId: hh.ashaWorkerId,
        phcId: hh.phcId,
        createdAt: hh.createdAt,
        updatedAt: hh.updatedAt,
      } as T;
    }

    if (method === 'DELETE') {
      if (!hh || hh.active !== 1) throw new Error('Household not found with ID: ' + id);
      // Soft-delete semantics
      hh.active = 0;
      hh.updatedAt = new Date().toISOString();
      return undefined as T;
    }
  }

  if (path === '/households' && method === 'POST') {
    const newHh = {
      id: store.getId(),
      householdNumber: body.householdNumber || `HH-MDK-${store.households.length + 1}`,
      headName: body.headName,
      village: body.village || 'Madukkarai',
      membersCount: Number(body.membersCount) || 3,
      category: body.category || 'BPL',
      waterSource: body.waterSource || 'piped',
      toilet: body.toilet === true || body.toilet === 1,
      ashaWorkerId: 3,
      phcId: 'PHC-101',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: 1,
    };
    store.households.push(newHh);
    return {
      id: newHh.id,
      householdNumber: newHh.householdNumber,
      headName: newHh.headName,
      village: newHh.village,
      membersCount: newHh.membersCount,
      category: newHh.category,
      waterSource: newHh.waterSource,
      toilet: newHh.toilet,
      ashaWorkerId: newHh.ashaWorkerId,
      phcId: newHh.phcId,
      createdAt: newHh.createdAt,
      updatedAt: newHh.updatedAt,
    } as T;
  }

  // 6. Pregnancies API (Soft-Delete Semantics)
  if (path === '/pregnancies' && method === 'GET') {
    return store.pregnancies.filter((p) => p.active) as T;
  }

  if (path === '/pregnancies/high-risk' && method === 'GET') {
    return store.pregnancies.filter((p) => p.active && p.highRisk) as T;
  }

  const pregIdMatch = path.match(/^\/pregnancies\/(\d+)$/);
  if (pregIdMatch) {
    const id = Number(pregIdMatch[1]);
    const preg = store.pregnancies.find((p) => p.id === id);

    if (method === 'GET') {
      if (!preg || !preg.active) throw new Error('Pregnancy record not found');
      return preg as T;
    }

    if (method === 'PUT') {
      if (!preg || !preg.active) throw new Error('Pregnancy record not found');
      Object.assign(preg, body, { updatedAt: new Date().toISOString() });
      return preg as T;
    }

    if (method === 'DELETE') {
      if (!preg || !preg.active) throw new Error('Pregnancy record not found');
      // Soft deactivation preserves pregnancyStatus and sets active = false
      preg.active = false;
      preg.updatedAt = new Date().toISOString();
      return undefined as T;
    }
  }

  const pregStatusMatch = path.match(/^\/pregnancies\/(\d+)\/status$/);
  if (pregStatusMatch && method === 'PATCH') {
    const id = Number(pregStatusMatch[1]);
    const preg = store.pregnancies.find((p) => p.id === id);
    if (!preg || !preg.active) throw new Error('Pregnancy not found');
    const newStatus = new URL(endpoint, 'http://localhost').searchParams.get('status') || 'COMPLETED';
    preg.pregnancyStatus = newStatus;
    return preg as T;
  }

  if (path === '/pregnancies' && method === 'POST') {
    const pat = store.patients.find((p) => p.id === Number(body.patientId));
    const newPreg = {
      id: store.getId(),
      patientId: Number(body.patientId),
      patientName: pat ? pat.name : 'Registered Mother',
      lastMenstrualPeriod: body.lastMenstrualPeriod,
      expectedDeliveryDate: new Date(new Date(body.lastMenstrualPeriod).getTime() + 280 * 86400000).toISOString().split('T')[0],
      gravida: Number(body.gravida) || 1,
      para: Number(body.para) || 0,
      bloodGroup: body.bloodGroup || 'B+',
      pregnancyStatus: 'REGISTERED',
      highRisk: Number(body.gravida) >= 5,
      riskFactors: Number(body.gravida) >= 5 ? 'High Gravida (>= 5)' : 'None',
      registrationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };
    store.pregnancies.push(newPreg);
    return newPreg as T;
  }

  // ANC Visits for Pregnancy
  const pregVisitsMatch = path.match(/^\/pregnancies\/(\d+)\/visits$/);
  if (pregVisitsMatch) {
    const pregId = Number(pregVisitsMatch[1]);
    if (method === 'GET') {
      return store.ancVisits.filter((v) => v.pregnancyId === pregId && v.active === 1) as T;
    }
    if (method === 'POST') {
      const newVisit = {
        id: store.getId(),
        pregnancyId: pregId,
        visitDate: body.visitDate || new Date().toISOString().split('T')[0],
        weight: Number(body.weight) || 55.0,
        systolicBp: Number(body.systolicBp) || 120,
        diastolicBp: Number(body.diastolicBp) || 80,
        hemoglobin: Number(body.hemoglobin) || 11.5,
        fetalHeartRate: Number(body.fetalHeartRate) || 140,
        dangerSigns: body.dangerSigns || 'None',
        symptoms: body.symptoms || '',
        clinicalNotes: body.clinicalNotes || '',
        nextVisitDate: body.nextVisitDate || '',
        riskEvaluated: true,
        riskNotes: Number(body.systolicBp) >= 140 || Number(body.hemoglobin) < 7 ? 'High Risk Assessment Flagged' : 'Normal',
        active: 1,
      };
      store.ancVisits.push(newVisit);
      return newVisit as T;
    }
  }

  if (path === '/antenatal-visits' && method === 'GET') {
    return store.ancVisits.filter((v) => v.active === 1) as T;
  }

  const ancVisitIdMatch = path.match(/^\/pregnancies\/visits\/(\d+)$/) || path.match(/^\/antenatal-visits\/(\d+)$/);
  if (ancVisitIdMatch && method === 'DELETE') {
    const vId = Number(ancVisitIdMatch[1]);
    const visit = store.ancVisits.find((v) => v.id === vId);
    if (visit) {
      visit.active = 0; // Soft delete
    }
    return undefined as T;
  }

  // 7. Vaccines & Immunization API (Strict Integrity Protection)
  if (path === '/vaccines' && method === 'GET') {
    return store.vaccines.filter((v) => v.active) as T;
  }

  const immPatientMatch = path.match(/^\/immunizations\/patient\/(\d+)$/);
  if (immPatientMatch && method === 'GET') {
    const patientId = Number(immPatientMatch[1]);
    return store.immunizations.filter((i) => i.patientId === patientId) as T;
  }

  if (path === '/immunizations/upcoming' && method === 'GET') {
    return store.immunizations.filter((i) => !i.administered) as T;
  }

  if (path === '/immunizations/overdue' && method === 'GET') {
    return store.immunizations.filter((i) => !i.administered) as T;
  }

  const immIdMatch = path.match(/^\/immunizations\/(\d+)$/);
  if (immIdMatch) {
    const id = Number(immIdMatch[1]);
    const record = store.immunizations.find((i) => i.id === id);

    if (method === 'GET') {
      if (!record) throw new Error('Immunization record not found');
      return record as T;
    }

    if (method === 'PUT') {
      if (!record) throw new Error('Immunization record not found');

      // Rule: cannot change already-administered record back to administered = false or null
      if (record.administered && (body.administered === false || body.administered === null)) {
        const err: any = new Error('Cannot un-administer an immunization record that has already been administered.');
        err.status = 409;
        throw err;
      }

      Object.assign(record, body, { updatedAt: new Date().toISOString() });
      return record as T;
    }

    if (method === 'DELETE') {
      if (!record) throw new Error('Immunization record not found');

      // Rule: Administered records cannot be deleted (409 Conflict)
      if (record.administered) {
        const err: any = new Error('Cannot delete an administered immunization record.');
        err.status = 409;
        throw err;
      }

      // Non-administered records are permitted to be deleted
      const idx = store.immunizations.findIndex((i) => i.id === id);
      if (idx !== -1) {
        store.immunizations.splice(idx, 1);
      }
      return undefined as T;
    }
  }

  if (path === '/immunizations' && method === 'POST') {
    const patient = store.patients.find((p) => p.id === Number(body.patientId));
    const vaccine = store.vaccines.find((v) => v.id === Number(body.vaccineId));

    const newImm = {
      id: store.getId(),
      patientId: Number(body.patientId),
      patientName: patient ? patient.name : 'Patient',
      vaccineId: Number(body.vaccineId),
      vaccineCode: vaccine ? vaccine.code : 'VAC',
      vaccineName: vaccine ? vaccine.name : 'Vaccine Dose',
      doseNumber: Number(body.doseNumber) || 1,
      administeredDate: body.administeredDate || (body.administered ? new Date().toISOString().split('T')[0] : null),
      batchNumber: body.batchNumber || 'DEMO-BATCH-01',
      administeredBy: 3,
      notes: body.notes || 'Administered at PHC Session',
      administered: !!body.administered,
      nextDueDate: body.nextDueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.immunizations.push(newImm);
    return newImm as T;
  }

  // 8. Priority Visits API (Hard Delete per real backend)
  if (path === '/priority-visits' && method === 'GET') {
    return store.priorityVisits as T;
  }

  const priorityVisitIdMatch = path.match(/^\/priority-visits\/(\d+)$/);
  if (priorityVisitIdMatch) {
    const id = Number(priorityVisitIdMatch[1]);
    const visit = store.priorityVisits.find((v) => v.id === id);

    if (method === 'GET') {
      if (!visit) throw new Error('Priority visit not found');
      return visit as T;
    }

    if (method === 'PUT') {
      if (!visit) throw new Error('Priority visit not found');
      Object.assign(visit, body);
      return visit as T;
    }

    if (method === 'DELETE') {
      const idx = store.priorityVisits.findIndex((v) => v.id === id);
      if (idx !== -1) {
        store.priorityVisits.splice(idx, 1);
      }
      return undefined as T;
    }
  }

  if (path === '/priority-visits' && method === 'POST') {
    const newVisit = {
      id: store.getId(),
      patientName: body.patientName,
      village: body.village || 'Madukkarai',
      ashaId: String(body.ashaId || '3'),
      ashaName: body.ashaName || 'Anita Devi',
      condition: body.condition,
      urgency: body.urgency || 'High',
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      notes: body.notes || '',
    };
    store.priorityVisits.push(newVisit);
    return newVisit as T;
  }

  // 9. Nutrition Records API (Soft-Delete Semantics)
  if (path === '/nutrition-records' && method === 'GET') {
    return store.nutrition.filter((n) => n.active === 1) as T;
  }

  const nutPatientMatch = path.match(/^\/nutrition-records\/patient\/(\d+)$/);
  if (nutPatientMatch && method === 'GET') {
    const patId = Number(nutPatientMatch[1]);
    return store.nutrition.filter((n) => n.patientId === patId && n.active === 1) as T;
  }

  const nutIdMatch = path.match(/^\/nutrition-records\/(\d+)$/);
  if (nutIdMatch) {
    const id = Number(nutIdMatch[1]);
    const rec = store.nutrition.find((n) => n.id === id);

    if (method === 'GET') {
      if (!rec || rec.active !== 1) throw new Error('Nutrition record not found');
      return rec as T;
    }

    if (method === 'PUT') {
      if (!rec || rec.active !== 1) throw new Error('Nutrition record not found');
      Object.assign(rec, body, { updatedAt: new Date().toISOString() });
      return rec as T;
    }

    if (method === 'DELETE') {
      if (!rec || rec.active !== 1) throw new Error('Nutrition record not found');
      rec.active = 0; // Soft delete
      rec.updatedAt = new Date().toISOString();
      return undefined as T;
    }
  }

  if (path === '/nutrition-records' && method === 'POST') {
    const pat = store.patients.find((p) => p.id === Number(body.patientId));
    const muac = Number(body.muacCm) || 14.0;
    const isSam = muac < 11.5;

    const newNut = {
      id: store.getId(),
      patientId: Number(body.patientId),
      patientName: pat ? pat.name : 'Child Patient',
      measurementDate: body.measurementDate || new Date().toISOString().split('T')[0],
      weightKg: Number(body.weightKg) || 10.0,
      heightCm: Number(body.heightCm) || 80.0,
      muacCm: muac,
      ageMonths: Number(body.ageMonths) || 24,
      feedingType: body.feedingType || 'Normal Feeding',
      nutritionStatus: isSam ? 'HIGH_RISK' : muac < 12.5 ? 'MODERATE_RISK' : 'NORMAL',
      riskFlag: isSam || muac < 12.5,
      riskFactors: isSam ? 'Severe Acute Malnutrition (MUAC < 11.5cm)' : 'None',
      notes: body.notes || 'Routine check',
      recordedByUserId: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: 1,
    };
    store.nutrition.push(newNut);
    return newNut as T;
  }

  // 10. Medicine Issues API (Soft-Delete Semantics)
  if (path === '/medicine-issues' && method === 'GET') {
    return store.medicineIssues.filter((m) => m.active === 1) as T;
  }

  const medIssuePatMatch = path.match(/^\/medicine-issues\/patient\/(\d+)$/);
  if (medIssuePatMatch && method === 'GET') {
    const patId = Number(medIssuePatMatch[1]);
    return store.medicineIssues.filter((m) => m.patientId === patId && m.active === 1) as T;
  }

  const medIssueIdMatch = path.match(/^\/medicine-issues\/(\d+)$/);
  if (medIssueIdMatch) {
    const id = Number(medIssueIdMatch[1]);
    const item = store.medicineIssues.find((m) => m.id === id);

    if (method === 'GET') {
      if (!item || item.active !== 1) throw new Error('Medicine issue record not found');
      return item as T;
    }

    if (method === 'PUT') {
      if (!item || item.active !== 1) throw new Error('Medicine issue record not found');
      Object.assign(item, body, { updatedAt: new Date().toISOString() });
      return item as T;
    }

    if (method === 'DELETE') {
      if (!item || item.active !== 1) throw new Error('Medicine issue record not found');
      item.active = 0; // Soft delete
      item.updatedAt = new Date().toISOString();
      return undefined as T;
    }
  }

  if (path === '/medicine-issues' && method === 'POST') {
    const newIssue = {
      id: store.getId(),
      patientId: Number(body.patientId),
      patientName: body.patientName || 'Patient',
      medicineName: body.medicineName || 'IFA Tablets',
      quantity: Number(body.quantity) || 30,
      dosageInstructions: body.dosageInstructions || '1 tablet daily',
      issueDate: body.issueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: 1,
    };
    store.medicineIssues.push(newIssue);
    return newIssue as T;
  }

  // 11. Pharmacy API
  if (path === '/medicines' && method === 'GET') {
    return store.medicines as T;
  }

  if (path === '/medicine-batches' && method === 'GET') {
    return store.batches as T;
  }

  if (path === '/medicine-transactions' && method === 'GET') {
    return store.transactions as T;
  }

  if (path === '/medicine-transactions/dispense' && method === 'POST') {
    const batch = store.batches.find((b) => b.id === Number(body.batchId));
    if (batch) {
      batch.quantity = Math.max(0, batch.quantity - Number(body.quantity));
    }
    const newTx = {
      id: store.getId(),
      medicineId: batch ? batch.medicineId : 1,
      medicineName: batch ? batch.medicineName : 'Dispensed Medicine',
      batchId: Number(body.batchId),
      batchNumber: batch ? batch.batchNumber : 'BATCH-01',
      type: 'Outbound',
      quantity: Number(body.quantity),
      transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reason: body.reason || 'Dispensed to healthcare worker',
      performedBy: 'Priya Sharma (Pharmacist)',
    };
    store.transactions.unshift(newTx);
    return newTx as T;
  }

  // 12. Admin Management API (Users, PHCs, Settings, Audit Logs)
  if (path === '/phcs' && method === 'GET') {
    return store.phcs.filter((p) => p.active) as T;
  }

  if (path === '/users' && method === 'GET') {
    return store.users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role,
      phcId: u.phcId,
      status: u.status,
      phone: u.phone,
      location: u.location,
    })) as T;
  }

  if (path === '/audit-logs' && method === 'GET') {
    return store.auditLogs as T;
  }

  if (path === '/admin-dashboard-stats' && method === 'GET') {
    return {
      totalPhcs: store.phcs.length,
      activePhcs: store.phcs.filter((p) => p.active).length,
      inactivePhcs: store.phcs.filter((p) => !p.active).length,
      totalUsers: store.users.length,
      totalSupervisors: store.users.filter((u) => u.role === 'PHC_SUPERVISOR').length,
      totalAshas: store.users.filter((u) => u.role === 'ASHA').length,
      totalPharmacists: store.users.filter((u) => u.role === 'PHARMACIST').length,
      totalAuditLogs: store.auditLogs.length,
      offlineTtl: 30,
      maxDbSize: 50,
      compressionRatio: '8:1',
      districtIncharge: 'Dr. A. Sample (Demo District Officer)',
      serverUrl: 'https://demo-health-portal.example.com/api/v1',
    } as T;
  }

  if (path === '/settings' && method === 'GET') {
    return {
      offlineTtl: 30,
      maxDbSize: 50,
      compressionRatio: '8:1',
      biometricLock: true,
      districtIncharge: 'Dr. A. Sample (Demo District Officer)',
      backupSchedule: 'daily',
      serverUrl: 'https://demo-health-portal.example.com/api/v1',
    } as T;
  }

  if (path === '/roles' && method === 'GET') {
    return [
      { id: 1, role: 'ADMIN', description: 'Full system administration and directory oversight', permissions: ['ALL_PERMISSIONS'] },
      { id: 2, role: 'PHC_SUPERVISOR', description: 'Sector coordination, priority delegation, verification', permissions: ['VIEW_SECTOR', 'DELEGATE_TASKS', 'VERIFY_EHR'] },
      { id: 3, role: 'ASHA', description: 'Community outreach, household census, patient care', permissions: ['FIELD_COLLECTION', 'ANC_TRACKING', 'IMMUNIZATION'] },
      { id: 4, role: 'PHARMACIST', description: 'Dispensary inventory, batch intake, stock dispensing', permissions: ['DISPENSE_STOCK', 'MANAGE_CATALOGUE'] },
    ] as T;
  }

  // 13. EHR Records API
  if (path === '/ehr-records' && method === 'GET') {
    return [
      {
        id: 'REC-001',
        patientName: 'Sunita Devi',
        patientAge: 26,
        patientGender: 'F',
        village: 'Madukkarai',
        status: 'synced',
        lastUpdated: '2026-08-15 11:45',
        diagnosis: 'ANC 2nd Trimester Checkup - High BP & Anemia',
        treatment: 'IFA forte, Calcium supplements, urgent PHC referral',
        workerId: '3',
        type: 'maternal',
        verificationStatus: 'verified',
        verifiedBy: 'Dr. Vedavalli Raman',
        verifiedAt: '2026-08-16 09:30',
      },
      {
        id: 'REC-002',
        patientName: 'Aarav Kumar',
        patientAge: 1,
        patientGender: 'M',
        village: 'Madukkarai',
        status: 'synced',
        lastUpdated: '2026-08-16 10:15',
        diagnosis: 'Severe Acute Malnutrition (MUAC 11.2cm)',
        treatment: 'NRC referral, therapeutic food counseling',
        workerId: '3',
        type: 'child_immunization',
        verificationStatus: 'pending',
      },
    ] as T;
  }

  // 14. AI Decision Support Endpoints
  if (path.startsWith('/ai/')) {
    if (path === '/ai/visits/prioritized' || path.startsWith('/ai/visits/prioritized')) {
      return [
        {
          patientId: 1,
          patientName: 'Sunita Devi',
          village: 'Madukkarai',
          priorityScore: 92,
          priorityLevel: 'CRITICAL',
          reasons: [
            'Systolic Blood Pressure >= 140 (148/94 mmHg)',
            'Severe Anemia (Hb 6.8 g/dL < 7.0)',
            'High Gravida (Gravida 5, Para 3)',
          ],
          condition: 'Gestational Hypertension & Severe Anemia',
          notes: 'Supervisor priority escort required to PHC; check for severe headache/edema and ensure IFA adherence.',
          assignedDate: '2026-08-15',
          status: 'Pending',
        },
        {
          patientId: 2,
          patientName: 'Aarav Kumar',
          village: 'Madukkarai',
          priorityScore: 78,
          priorityLevel: 'HIGH',
          reasons: [
            'MUAC 11.2 cm (< 11.5 cm SAM threshold)',
            'Overdue MR-1 (Measles-Rubella) dose',
            'Weight-for-Age severe growth faltering',
          ],
          condition: 'Severe Acute Malnutrition (SAM) & Overdue MR-1 Vaccine',
          notes: 'Provide energy-dense nutrition supplements, conduct immediate home follow-up, and schedule MR-1 catch-up immunization.',
          assignedDate: '2026-08-16',
          status: 'Pending',
        },
        {
          patientId: 3,
          patientName: 'Komal Gupta',
          village: 'Madukkarai',
          priorityScore: 54,
          priorityLevel: 'MEDIUM',
          reasons: [
            'ANC Trimester 2 checkup overdue by 10 days',
            'Moderate weight gain lag (+0.8 kg in 4 weeks)',
          ],
          condition: 'ANC 2nd Trimester Routine Follow-up',
          notes: 'Verify fetal heart rate, distribute Calcium/Vit D3 supplements, and counsel on maternal diet.',
          assignedDate: '2026-08-18',
          status: 'Pending',
        },
      ] as unknown as T;
    }
    if (path.includes('/maternal/')) {
      return {
        pregnancyId: 1,
        riskScore: 88,
        riskCategory: 'HIGH_RISK',
        factors: ['Systolic Blood Pressure >= 140', 'Severe Anemia (Hb < 7.0)', 'High Gravida (>= 5)'],
        recommendedActions: ['Immediate Medical Officer Referral', 'Emergency Transportation Preparedness'],
      } as T;
    }
    if (path.includes('/nutrition/')) {
      return {
        patientId: 2,
        samFlag: true,
        muacClassification: 'SAM',
        recommendation: 'Enroll in facility-based NRC protocol',
      } as T;
    }
    if (path.includes('/immunization/')) {
      return {
        patientId: 2,
        overdueCount: 1,
        defaulterRisk: 'High',
        missedDoses: ['MR-1 (Measles-Rubella)'],
      } as T;
    }
    if (path.includes('/forecast')) {
      return {
        medicineCode: 'IFA-100',
        currentStock: 2400,
        projectedMonthlyDemand: 720,
        runoutDays: 100,
        recommendedOrder: 1500,
      } as T;
    }
    if (path.includes('/expiry-risk')) {
      return {
        medicineCode: 'AMX-250',
        batchNumber: 'AMX-2025-88',
        expiryDate: '2026-09-25',
        daysToExpiry: 22,
        actionRequired: 'Prioritize dispensing or return to warehouse',
      } as T;
    }
    if (path === '/ai/dashboard/summary') {
      return {
        highRiskPregnancyAlerts: 1,
        severeMalnutritionAlerts: 1,
        immunizationDefaulters: 1,
        stockoutRiskMedicines: 1,
      } as T;
    }
    return {} as T;
  }

  // 15. Reports Endpoints (Tier 2 graceful data)
  if (path.startsWith('/reports/')) {
    return {
      generatedAt: new Date().toISOString(),
      reportType: path.replace('/reports/', ''),
      recordsCount: 12,
      summary: 'Sample demographic and clinical metrics for demonstration purposes.',
      data: [],
    } as T;
  }

  // 16. Fallback for unhandled endpoints
  console.warn(`[Demo Mode] Unhandled endpoint: ${method} ${path}`);
  return ([] as unknown) as T;
}

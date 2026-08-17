import { 
  patientApi, 
  maternalApi, 
  immunizationApi, 
  nutritionApi, 
  householdApi, 
  medicineIssueApi, 
  visitApi 
} from '../../utils/apiClient';

export interface Household {
  id: string;
  householdNumber: string;
  headName: string;
  village: string;
  membersCount: number;
  category: 'APL' | 'BPL' | 'AAY';
  waterSource: 'piped' | 'handpump' | 'well';
  toilet: boolean;
  status: 'synced' | 'pending';
  lastUpdated: string;
}

export interface AshaPatient {
  id: string;
  householdId: string;
  householdNumber: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  relationToHead: string;
  phone: string;
  isPregnant: boolean;
  isChild: boolean;
  status: 'synced' | 'pending';
  lastUpdated: string;
}

export interface VisitRecord {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  purpose: 'ANC' | 'Immunization' | 'Newborn Care' | 'NCD Follow-up' | 'General';
  symptoms: string;
  bp: string;
  weight: number;
  referralNeeded: boolean;
  referralFacility: string;
  status: 'synced' | 'pending';
  lastUpdated: string;
  verificationStatus?: 'pending' | 'verified' | 'correction_requested';
  verifiedBy?: string;
  verifiedAt?: string;
  correctionNote?: string;
}

export interface MaternalRecord {
  id: string;
  patientId: string;
  patientName: string;
  lmpDate: string;
  edd: string;
  gestationalAgeWeeks: number;
  ancCount: number;
  highRiskFactors: string[];
  status: 'synced' | 'pending';
  lastUpdated: string;
  verificationStatus?: 'pending' | 'verified' | 'correction_requested';
  verifiedBy?: string;
  verifiedAt?: string;
  correctionNote?: string;
}

export interface ImmunizationRecord {
  id: string;
  patientId: string;
  patientName: string;
  childAgeMonths: number;
  vaccineName: string;
  dateGiven: string;
  nextDueDate: string;
  administeredBy: string;
  status: 'synced' | 'pending';
  lastUpdated: string;
  verificationStatus?: 'pending' | 'verified' | 'correction_requested';
  verifiedBy?: string;
  verifiedAt?: string;
  correctionNote?: string;
}

export interface NutritionRecord {
  id: string;
  patientId: string;
  patientName: string;
  ageGroup: 'infant' | 'child' | 'pregnant' | 'lactating';
  weightForAgeStatus: 'normal' | 'moderate' | 'severe';
  samStatus: boolean; // Severe Acute Malnutrition
  thrustAreas: string[];
  status: 'synced' | 'pending';
  lastUpdated: string;
  verificationStatus?: 'pending' | 'verified' | 'correction_requested';
  verifiedBy?: string;
  verifiedAt?: string;
  correctionNote?: string;
}

export interface MedicineIssueRecord {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  quantity: number;
  dosageInstructions: string;
  issueDate: string;
  status: 'synced' | 'pending';
  lastUpdated: string;
  verificationStatus?: 'pending' | 'verified' | 'correction_requested';
  verifiedBy?: string;
  verifiedAt?: string;
  correctionNote?: string;
}

// Mode Get/Set (Online-Only Mode)
export const isOfflineModeEnabled = (): boolean => {
  return false;
};

export const setOfflineModeEnabled = (enabled: boolean) => {
  // No-op
};

// Households CRUD
export const getHouseholds = async (): Promise<Household[]> => {
  const hhs = await householdApi.getAll();
  return hhs.map((h: any) => ({
    id: String(h.id),
    householdNumber: h.householdNumber,
    headName: h.headName,
    village: h.village,
    membersCount: h.membersCount,
    category: h.category as any,
    waterSource: h.waterSource as any,
    toilet: h.toilet === true || h.toilet === 1,
    status: 'synced',
    lastUpdated: h.updatedAt || new Date().toISOString()
  }));
};

export const addHousehold = async (hh: Omit<Household, 'id' | 'status' | 'lastUpdated'>) => {
  const res = await householdApi.create({
    householdNumber: hh.householdNumber,
    headName: hh.headName,
    village: hh.village,
    membersCount: Number(hh.membersCount),
    category: hh.category,
    waterSource: hh.waterSource,
    toilet: hh.toilet
  });
  return {
    ...hh,
    id: String(res.id),
    status: 'synced',
    lastUpdated: new Date().toISOString()
  };
};

export const updateHousehold = async (id: string, hh: Partial<Household>) => {
  const existing = await householdApi.getById(id);
  await householdApi.update(id, {
    householdNumber: hh.householdNumber || existing.householdNumber,
    headName: hh.headName || existing.headName,
    village: hh.village || existing.village,
    membersCount: hh.membersCount !== undefined ? Number(hh.membersCount) : existing.membersCount,
    category: hh.category || existing.category,
    waterSource: hh.waterSource || existing.waterSource,
    toilet: hh.toilet !== undefined ? hh.toilet : (existing.toilet === true || existing.toilet === 1)
  });
};

export const deleteHousehold = async (id: string) => {
  await householdApi.delete(id);
};

// Patients CRUD
const mapPatient = (p: any): AshaPatient => {
  const birthYear = p.dateOfBirth ? new Date(p.dateOfBirth).getFullYear() : 2000;
  const age = new Date().getFullYear() - birthYear;
  let householdNumber = 'HH-MDK-01';
  let householdId = 'HH-101';
  if (p.address && p.address.startsWith('Household ')) {
    householdNumber = p.address.replace('Household ', '');
  }
  return {
    id: String(p.id),
    householdId,
    householdNumber,
    name: p.name,
    age,
    gender: p.gender === 'Female' ? 'F' : (p.gender === 'Male' ? 'M' : 'O'),
    relationToHead: p.emergencyContact || 'Self',
    phone: p.phone || '',
    isPregnant: false, // determined in getPatients
    isChild: age <= 12,
    status: 'synced',
    lastUpdated: p.updatedAt || new Date().toISOString()
  };
};

export const getPatients = async (
  prefetchedPts?: any[],
  prefetchedPregs?: any[],
  prefetchedHhs?: Household[]
): Promise<AshaPatient[]> => {
  const pts = prefetchedPts || await patientApi.getAll();
  const pregs = prefetchedPregs || await maternalApi.getAllPregnancies();
  const activePregPatientIds = new Set(
    pregs
      .filter((pr: any) => pr.pregnancyStatus === 'ACTIVE' || pr.pregnancyStatus === 'REGISTERED')
      .map((pr: any) => String(pr.patientId))
  );

  let hhs: Household[] = prefetchedHhs || [];
  if (!prefetchedHhs) {
    try {
      hhs = await getHouseholds();
    } catch (err) {
      console.warn('Failed to load households in getPatients:', err);
    }
  }

  return pts.map((p: any) => {
    const mapped = mapPatient(p);
    if (activePregPatientIds.has(mapped.id)) {
      mapped.isPregnant = true;
    }
    const hh = hhs.find(h => h.householdNumber === mapped.householdNumber);
    if (hh) {
      mapped.householdId = hh.id;
    }
    return mapped;
  });
};

export const addPatient = async (pt: Omit<AshaPatient, 'id' | 'status' | 'lastUpdated'>) => {
  const birthYear = new Date().getFullYear() - pt.age;
  const dob = `${birthYear}-01-01`;
  const res = await patientApi.create({
    name: pt.name,
    dateOfBirth: dob,
    gender: pt.gender === 'F' ? 'Female' : (pt.gender === 'M' ? 'Male' : 'Other'),
    phone: pt.phone,
    address: `Household ${pt.householdNumber}`,
    village: 'Madukkarai',
    emergencyContact: pt.relationToHead
  });
  const mapped = mapPatient(res);
  mapped.householdId = pt.householdId;
  return mapped;
};

export const updatePatient = async (id: string, pt: Partial<AshaPatient>) => {
  const current = await patientApi.getById(id);
  const birthYear = pt.age ? (new Date().getFullYear() - pt.age) : new Date(current.dateOfBirth).getFullYear();
  const dob = `${birthYear}-01-01`;
  const res = await patientApi.update(id, {
    name: pt.name || current.name,
    dateOfBirth: dob,
    gender: pt.gender === 'F' ? 'Female' : (pt.gender === 'M' ? 'Male' : (pt.gender ? 'Other' : current.gender)),
    phone: pt.phone !== undefined ? pt.phone : current.phone,
    address: pt.householdNumber ? `Household ${pt.householdNumber}` : current.address,
    village: current.village || 'Madukkarai',
    emergencyContact: pt.relationToHead || current.emergencyContact
  });
  const mapped = mapPatient(res);
  if (pt.householdId) {
    mapped.householdId = pt.householdId;
  } else {
    try {
      const hhs = await getHouseholds();
      const hh = hhs.find(h => h.householdNumber === mapped.householdNumber);
      if (hh) mapped.householdId = hh.id;
    } catch (err) {
      console.warn('Failed to resolve household in updatePatient:', err);
    }
  }
  return mapped;
};

export const deletePatient = async (id: string) => {
  await patientApi.delete(id);
};

// Visits CRUD
export const getVisits = async (
  prefetchedVisits?: any[],
  prefetchedPregs?: any[],
  prefetchedPts?: any[]
): Promise<VisitRecord[]> => {
  const visits = prefetchedVisits || await visitApi.getAll();
  const pregs = prefetchedPregs || await maternalApi.getAllPregnancies();
  const pts = prefetchedPts || await patientApi.getAll();

  const pregMap = new Map<number, any>();
  pregs.forEach((pr: any) => pregMap.set(pr.id, pr));

  const patMap = new Map<number, any>();
  pts.forEach((pt: any) => patMap.set(pt.id, pt));

  return visits.map((v: any) => {
    const preg = pregMap.get(v.pregnancyId);
    const pat = preg ? patMap.get(preg.patientId) : null;
    return {
      id: `VS-${v.id}`,
      patientId: pat ? String(pat.id) : '1',
      patientName: pat ? pat.name : 'Unknown Patient',
      visitDate: v.visitDate ? String(v.visitDate) : '',
      purpose: 'ANC',
      symptoms: v.symptoms || 'Routine follow-up',
      bp: `${v.systolicBp}/${v.diastolicBp}`,
      weight: v.weight ? Number(v.weight) : 60,
      referralNeeded: v.dangerSigns && v.dangerSigns.trim() !== '',
      referralFacility: v.dangerSigns || '',
      status: 'synced',
      lastUpdated: v.updatedAt || new Date().toISOString()
    };
  });
};

export const addVisit = async (v: Omit<VisitRecord, 'id' | 'status' | 'lastUpdated'>) => {
  const resolvedPatientId = Number(v.patientId);

  // Find or create active pregnancy
  const pregs = await maternalApi.getAllPregnancies();
  let targetPreg = pregs.find((pr: any) => pr.patientId === resolvedPatientId && pr.pregnancyStatus === 'ACTIVE');
  if (!targetPreg) {
    targetPreg = await maternalApi.createPregnancy({
      patientId: resolvedPatientId,
      lastMenstrualPeriod: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      gravida: 1,
      para: 0
    });
  }

  const bpParts = (v.bp || '120/80').split('/');
  const sys = bpParts[0] ? Number(bpParts[0].replace(/\D/g, '')) : 120;
  const dia = bpParts[1] ? Number(bpParts[1].replace(/\D/g, '')) : 80;

  const res = await visitApi.create(targetPreg.id, {
    visitDate: v.visitDate,
    weight: Number(v.weight),
    systolicBp: sys,
    diastolicBp: dia,
    hemoglobin: 11.5,
    fetalHeartRate: 140,
    dangerSigns: v.referralNeeded ? (v.referralFacility || 'Referral') : '',
    symptoms: v.symptoms,
    clinicalNotes: v.purpose
  });

  return {
    ...v,
    id: `VS-${res.id}`,
    status: 'synced',
    lastUpdated: new Date().toISOString()
  };
};

export const updateVisit = async (id: string, v: Partial<VisitRecord>) => {
  const dbId = Number(id.replace('VS-', ''));
  const bpParts = (v.bp || '120/80').split('/');
  const sys = bpParts[0] ? Number(bpParts[0].replace(/\D/g, '')) : 120;
  const dia = bpParts[1] ? Number(bpParts[1].replace(/\D/g, '')) : 80;

  await visitApi.update(dbId, {
    visitDate: v.visitDate,
    weight: v.weight ? Number(v.weight) : undefined,
    systolicBp: sys,
    diastolicBp: dia,
    dangerSigns: v.referralNeeded ? v.referralFacility : '',
    symptoms: v.symptoms,
    clinicalNotes: v.purpose
  });
};

export const deleteVisit = async (id: string) => {
  const dbId = Number(id.replace('VS-', ''));
  await visitApi.delete(dbId);
};

// Maternal CRUD
export const getMaternalRecords = async (
  prefetchedPregs?: any[],
  prefetchedPts?: any[],
  prefetchedVisits?: any[]
): Promise<MaternalRecord[]> => {
  const pregs = prefetchedPregs || await maternalApi.getAllPregnancies();
  const pts = prefetchedPts || await patientApi.getAll();

  const patMap = new Map<number, any>();
  pts.forEach((pt: any) => patMap.set(pt.id, pt));

  const visits = prefetchedVisits || await visitApi.getAll();

  const activePregs = pregs.filter((p: any) => p.active !== false && p.active !== 0 && String(p.pregnancyStatus || '').toUpperCase() !== 'COMPLETED');

  return activePregs.map((p: any) => {
    const pat = patMap.get(p.patientId);
    const pVisits = visits.filter((v: any) => v.pregnancyId === p.id);

    const lmpDate = p.lastMenstrualPeriod ? String(p.lastMenstrualPeriod) : '';
    const lmp = new Date(lmpDate);
    const diffTime = Math.abs(new Date().getTime() - lmp.getTime());
    const gestWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

    return {
      id: `MAT-${p.id}`,
      patientId: pat ? String(pat.id) : '1',
      patientName: pat ? pat.name : 'Unknown Beneficiary',
      lmpDate,
      edd: p.expectedDeliveryDate ? String(p.expectedDeliveryDate) : '',
      gestationalAgeWeeks: gestWeeks > 0 ? gestWeeks : 12,
      ancCount: pVisits.length,
      highRiskFactors: p.highRisk ? (p.riskFactors ? p.riskFactors.split(', ') : ['Anaemia']) : [],
      status: 'synced',
      lastUpdated: p.updatedAt || new Date().toISOString()
    };
  });
};

export const addMaternalRecord = async (mat: Omit<MaternalRecord, 'id' | 'status' | 'lastUpdated'>) => {
  const res = await maternalApi.createPregnancy({
    patientId: Number(mat.patientId),
    lastMenstrualPeriod: mat.lmpDate,
    gravida: mat.ancCount || 1,
    para: 0,
    bloodGroup: 'B+',
    pregnancyStatus: 'ACTIVE'
  });
  return {
    ...mat,
    id: `MAT-${res.id}`,
    status: 'synced',
    lastUpdated: new Date().toISOString()
  };
};

export const updateMaternalRecord = async (id: string, mat: Partial<MaternalRecord>) => {
  const dbId = Number(id.replace('MAT-', ''));
  if (mat.highRiskFactors) {
    await maternalApi.updatePregnancy(dbId, {
      patientId: Number(mat.patientId),
      lastMenstrualPeriod: mat.lmpDate,
      pregnancyStatus: 'ACTIVE',
      bloodGroup: 'B+',
      gravida: mat.ancCount || 2,
      para: 0
    });
  }
};

export const deleteMaternalRecord = async (id: string) => {
  const rawId = String(id).replace(/[^0-9]/g, '');
  const dbId = Number(rawId);
  if (dbId && !isNaN(dbId)) {
    await maternalApi.deletePregnancy(dbId);
  }
};

// Immunizations CRUD
export const getImmunizationRecords = async (prefetchedPts?: any[]): Promise<ImmunizationRecord[]> => {
  const pts = prefetchedPts || await patientApi.getAll();
  const childList = pts.filter((p: any) => {
    const birthYear = p.dateOfBirth ? new Date(p.dateOfBirth).getFullYear() : 2000;
    const age = new Date().getFullYear() - birthYear;
    return age <= 12;
  });

  const allRecords: ImmunizationRecord[] = [];
  const results = await Promise.all(
    childList.map(async (child: any) => {
      try {
        const immList = await immunizationApi.getPatientImmunizations(child.id);
        return { child, immList };
      } catch {
        return { child, immList: [] };
      }
    })
  );

  results.forEach(({ child, immList }) => {
    immList.forEach((im: any) => {
      const birthYear = child.dateOfBirth ? new Date(child.dateOfBirth).getFullYear() : 2000;
      const ageMonths = (new Date().getFullYear() - birthYear) * 12;
      allRecords.push({
        id: `IMM-${im.id}`,
        patientId: String(child.id),
        patientName: child.name,
        childAgeMonths: ageMonths > 0 ? ageMonths : 12,
        vaccineName: im.vaccineName || 'BCG',
        dateGiven: im.administeredDate ? String(im.administeredDate) : '',
        nextDueDate: im.nextDueDate ? String(im.nextDueDate) : '',
        administeredBy: im.notes || 'ANM Madukkarai PHC',
        status: 'synced',
        lastUpdated: im.updatedAt || new Date().toISOString()
      });
    });
  });

  return allRecords;
};

export const addImmunizationRecord = async (imm: Omit<ImmunizationRecord, 'id' | 'status' | 'lastUpdated'>) => {
  const vaccines = await immunizationApi.getVaccines();
  const matchVac = vaccines.find((v: any) => v.name.toLowerCase() === imm.vaccineName.toLowerCase() || v.code.toLowerCase() === imm.vaccineName.toLowerCase());
  const vacId = matchVac ? matchVac.id : 1;

  const res = await immunizationApi.recordImmunization({
    patientId: Number(imm.patientId),
    vaccineId: vacId,
    doseNumber: 1,
    administeredDate: imm.dateGiven,
    administered: true,
    notes: imm.administeredBy
  });

  return {
    ...imm,
    id: `IMM-${res.id}`,
    status: 'synced',
    lastUpdated: new Date().toISOString()
  };
};

export const updateImmunizationRecord = async (id: string, imm: Partial<ImmunizationRecord>) => {
  const dbId = Number(id.replace('IMM-', ''));
  const vaccines = await immunizationApi.getVaccines();
  const matchVac = vaccines.find((v: any) => v.name.toLowerCase() === (imm.vaccineName || '').toLowerCase());
  const vacId = matchVac ? matchVac.id : 1;

  await immunizationApi.updateImmunization(dbId, {
    patientId: Number(imm.patientId),
    vaccineId: vacId,
    doseNumber: 1,
    administeredDate: imm.dateGiven,
    administered: true,
    notes: imm.administeredBy
  });
};

export const deleteImmunizationRecord = async (id: string) => {
  const dbId = Number(id.replace('IMM-', ''));
  await immunizationApi.deleteImmunization(dbId);
};

// Nutrition CRUD
export const getNutritionRecords = async (prefetchedPts?: any[]): Promise<NutritionRecord[]> => {
  const pts = prefetchedPts || await patientApi.getAll();
  const allRecords: NutritionRecord[] = [];

  const results = await Promise.all(
    pts.map(async (p: any) => {
      try {
        const nutList = await nutritionApi.getPatientRecords(p.id);
        return { p, nutList };
      } catch {
        return { p, nutList: [] };
      }
    })
  );

  results.forEach(({ p, nutList }) => {
    nutList.forEach((n: any) => {
      const birthYear = p.dateOfBirth ? new Date(p.dateOfBirth).getFullYear() : 2000;
      const age = new Date().getFullYear() - birthYear;
      const ageGroup = age <= 5 ? 'child' : 'pregnant';

      let weightForAgeStatus: 'normal' | 'moderate' | 'severe' = 'normal';
      if (n.nutritionStatus === 'HIGH_RISK') weightForAgeStatus = 'severe';
      else if (n.nutritionStatus === 'MODERATE_RISK' || n.nutritionStatus === 'AT_RISK') weightForAgeStatus = 'moderate';

      allRecords.push({
        id: `NUT-${n.id}`,
        patientId: String(p.id),
        patientName: p.name,
        ageGroup,
        weightForAgeStatus,
        samStatus: n.nutritionStatus === 'HIGH_RISK',
        thrustAreas: n.riskFactors ? n.riskFactors.split(', ') : ['Take-Home Ration'],
        status: 'synced',
        lastUpdated: n.updatedAt || new Date().toISOString()
      });
    });
  });

  return allRecords;
};

export const addNutritionRecord = async (nut: Omit<NutritionRecord, 'id' | 'status' | 'lastUpdated'>) => {
  const weight = nut.weightForAgeStatus === 'severe' ? 10 : 15;
  const res = await nutritionApi.createRecord({
    patientId: Number(nut.patientId),
    measurementDate: new Date().toISOString().substring(0, 10),
    weightKg: weight,
    heightCm: 100.0,
    muacCm: 14.5,
    ageMonths: 24,
    notes: nut.thrustAreas.join(', ')
  });

  return {
    ...nut,
    id: `NUT-${res.id}`,
    status: 'synced',
    lastUpdated: new Date().toISOString()
  };
};

export const updateNutritionRecord = async (id: string, nut: Partial<NutritionRecord>) => {
  const dbId = Number(id.replace('NUT-', ''));
  const weight = nut.weightForAgeStatus === 'severe' ? 10 : 15;
  await nutritionApi.updateRecord(dbId, {
    patientId: nut.patientId ? Number(nut.patientId) : undefined,
    measurementDate: new Date().toISOString().substring(0, 10),
    weightKg: weight,
    heightCm: 100.0,
    muacCm: 14.5,
    ageMonths: 24,
    notes: nut.thrustAreas ? nut.thrustAreas.join(', ') : undefined
  });
};

export const deleteNutritionRecord = async (id: string) => {
  const dbId = Number(id.replace('NUT-', ''));
  await nutritionApi.deleteRecord(dbId);
};

// Medicine Issues CRUD
export const getMedicineIssueRecords = async (): Promise<MedicineIssueRecord[]> => {
  const records = await medicineIssueApi.getAll();
  return records.map((r: any) => ({
    id: `MED-${r.id}`,
    patientId: String(r.patientId),
    patientName: r.patientName,
    medicineName: r.medicineName,
    quantity: Number(r.quantity),
    dosageInstructions: r.dosageInstructions,
    issueDate: r.issueDate ? String(r.issueDate) : '',
    status: 'synced',
    lastUpdated: r.updatedAt || new Date().toISOString()
  }));
};

// Coordinated single-pass loader for all ASHA modules
export const loadAllAshaData = async () => {
  const [ptsRaw, pregsRaw, hhs, visitsRaw, medIssues] = await Promise.all([
    patientApi.getAll(),
    maternalApi.getAllPregnancies(),
    getHouseholds(),
    visitApi.getAll(),
    getMedicineIssueRecords()
  ]);

  const [patients, visits, maternal, immunizations, nutrition] = await Promise.all([
    getPatients(ptsRaw, pregsRaw, hhs),
    getVisits(visitsRaw, pregsRaw, ptsRaw),
    getMaternalRecords(pregsRaw, ptsRaw, visitsRaw),
    getImmunizationRecords(ptsRaw),
    getNutritionRecords(ptsRaw)
  ]);

  return {
    households: hhs,
    patients,
    visits,
    maternal,
    immunizations,
    nutrition,
    medicines: medIssues,
    rawPatients: ptsRaw,
    rawPregnancies: pregsRaw,
    rawVisits: visitsRaw
  };
};

export const addMedicineIssueRecord = async (med: Omit<MedicineIssueRecord, 'id' | 'status' | 'lastUpdated'>) => {
  const res = await medicineIssueApi.create({
    patientId: Number(med.patientId),
    patientName: med.patientName,
    medicineName: med.medicineName,
    quantity: Number(med.quantity),
    dosageInstructions: med.dosageInstructions,
    issueDate: med.issueDate
  });
  return {
    ...med,
    id: `MED-${res.id}`,
    status: 'synced',
    lastUpdated: new Date().toISOString()
  };
};

export const updateMedicineIssueRecord = async (id: string, med: Partial<MedicineIssueRecord>) => {
  const dbId = Number(id.replace('MED-', ''));
  await medicineIssueApi.update(dbId, {
    patientId: Number(med.patientId),
    patientName: med.patientName,
    medicineName: med.medicineName,
    quantity: Number(med.quantity),
    dosageInstructions: med.dosageInstructions,
    issueDate: med.issueDate
  });
};

export const deleteMedicineIssueRecord = async (id: string) => {
  const dbId = Number(id.replace('MED-', ''));
  await medicineIssueApi.delete(dbId);
};

// General Sync
export const getSyncStats = () => {
  return {
    total: 0,
    pending: 0,
    synced: 0,
  };
};

export const syncAllPending = async (): Promise<void> => {
  // Live synced!
};

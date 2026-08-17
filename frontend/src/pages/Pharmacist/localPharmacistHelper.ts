export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  unit: string;
  price: number;
  lastUpdated: string;
}

export interface MedicineBatch {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  manufactureDate: string;
  expiryDate: string; // YYYY-MM-DD
  location: string;
  status: 'Active' | 'Near Expiry' | 'Expired';
  lastUpdated: string;
}

export interface StockTransaction {
  id: string;
  medicineId: string;
  medicineName: string;
  batchId?: string;
  batchNumber?: string;
  type: 'Inbound' | 'Outbound';
  quantity: number;
  transactionDate: string; // YYYY-MM-DD HH:mm
  reason: string;
  performedBy: string;
}

export interface PharmacistAlert {
  id: string;
  type: 'Stockout' | 'Expiry';
  title: string;
  message: string;
  severity: 'Critical' | 'Warning' | 'Info';
  medicineId?: string;
  batchId?: string;
  dateGenerated: string;
  resolved: boolean;
}

export interface DemandForecast {
  medicineId: string;
  medicineName: string;
  currentStock: number;
  forecastedDemandNextMonth: number;
  seasonalTrend: 'Rising' | 'Stable' | 'Declining';
  confidenceScore: number; // percentage (e.g. 92)
  estimatedOutDate: string; // YYYY-MM-DD or 'Safe'
  recommendedOrderQty: number;
}

export interface MedicineRequest {
  id: string;
  requesterName: string;
  requesterRole: 'ASHA Worker' | 'Sub-Center Clinic' | 'Central Warehouse Requisition' | 'Other';
  medicineId: string;
  medicineName: string;
  quantity: number;
  priority: 'Urgent' | 'Routine' | 'Emergency';
  requestDate: string; // YYYY-MM-DD
  status: 'Pending' | 'Approved' | 'Dispensed' | 'Rejected';
  remarks?: string;
  batchId?: string;
  lastUpdated: string;
}

const KEYS = {
  MEDICINES: 'pharm_medicines',
  BATCHES: 'pharm_batches',
  TRANSACTIONS: 'pharm_transactions',
  ALERTS: 'pharm_alerts',
  FORECASTS: 'pharm_forecasts',
  REQUESTS: 'pharm_requests',
};

const INITIAL_MEDICINES: Medicine[] = [
  { id: 'MED-001', name: 'Paracetamol 500mg', category: 'Analgesic', stock: 1200, minThreshold: 300, unit: 'Tablets', price: 1.5, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-002', name: 'Iron Folic Acid', category: 'Supplements', stock: 2500, minThreshold: 500, unit: 'Tablets', price: 0.8, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-003', name: 'Calcium & Vit D3', category: 'Supplements', stock: 1800, minThreshold: 400, unit: 'Tablets', price: 1.2, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-004', name: 'BCG Vaccine', category: 'Vaccine', stock: 45, minThreshold: 20, unit: 'Vials', price: 12.0, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-005', name: 'OPV Vaccine', category: 'Vaccine', stock: 120, minThreshold: 30, unit: 'Doses', price: 4.5, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-006', name: 'Pentavalent Vaccine', category: 'Vaccine', stock: 18, minThreshold: 25, unit: 'Vials', price: 22.0, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-007', name: 'Rotavirus Vaccine', category: 'Vaccine', stock: 65, minThreshold: 20, unit: 'Doses', price: 15.0, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-008', name: 'MR Vaccine', category: 'Vaccine', stock: 40, minThreshold: 15, unit: 'Vials', price: 18.0, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-009', name: 'DPT Booster', category: 'Vaccine', stock: 8, minThreshold: 15, unit: 'Vials', price: 10.0, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-010', name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 150, minThreshold: 200, unit: 'Capsules', price: 3.0, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-011', name: 'ORS Sachets', category: 'Dehydration', stock: 450, minThreshold: 100, unit: 'Sachets', price: 2.0, lastUpdated: '2026-07-06 12:00' },
  { id: 'MED-012', name: 'Zinc Tablets 20mg', category: 'Supplements', stock: 300, minThreshold: 150, unit: 'Tablets', price: 0.5, lastUpdated: '2026-07-06 12:00' },
];

const INITIAL_BATCHES: MedicineBatch[] = [
  { id: 'BAT-001', medicineId: 'MED-001', medicineName: 'Paracetamol 500mg', batchNumber: 'PM-442', quantity: 1200, manufactureDate: '2026-01-10', expiryDate: '2027-01-10', location: 'Shelf A3', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-002', medicineId: 'MED-002', medicineName: 'Iron Folic Acid', batchNumber: 'IF-121', quantity: 2500, manufactureDate: '2026-02-15', expiryDate: '2027-08-15', location: 'Shelf B1', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-003', medicineId: 'MED-003', medicineName: 'Calcium & Vit D3', batchNumber: 'CA-889', quantity: 1800, manufactureDate: '2026-03-01', expiryDate: '2027-09-01', location: 'Shelf B2', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-004', medicineId: 'MED-004', medicineName: 'BCG Vaccine', batchNumber: 'BCG-124', quantity: 45, manufactureDate: '2026-04-10', expiryDate: '2026-11-10', location: 'Cold Room Box A', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-005', medicineId: 'MED-005', medicineName: 'OPV Vaccine', batchNumber: 'OPV-882', quantity: 120, manufactureDate: '2025-07-01', expiryDate: '2026-07-01', location: 'Cold Room Box B', status: 'Expired', lastUpdated: '2026-07-06 12:00' }, // Expired!
  { id: 'BAT-006', medicineId: 'MED-006', medicineName: 'Pentavalent Vaccine', batchNumber: 'PV-992', quantity: 18, manufactureDate: '2025-08-20', expiryDate: '2026-07-20', location: 'Cold Room Box C', status: 'Near Expiry', lastUpdated: '2026-07-06 12:00' }, // Near Expiry!
  { id: 'BAT-007', medicineId: 'MED-007', medicineName: 'Rotavirus Vaccine', batchNumber: 'RV-102', quantity: 65, manufactureDate: '2026-05-01', expiryDate: '2027-05-01', location: 'Cold Room Box C', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-008', medicineId: 'MED-008', medicineName: 'MR Vaccine', batchNumber: 'MR-771', quantity: 40, manufactureDate: '2026-04-18', expiryDate: '2027-04-18', location: 'Cold Room Box A', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-009', medicineId: 'MED-009', medicineName: 'DPT Booster', batchNumber: 'DB-103', quantity: 8, manufactureDate: '2025-06-15', expiryDate: '2026-06-15', location: 'Cold Room Box B', status: 'Expired', lastUpdated: '2026-07-06 12:00' }, // Expired!
  { id: 'BAT-010', medicineId: 'MED-010', medicineName: 'Amoxicillin 250mg', batchNumber: 'AM-081', quantity: 150, manufactureDate: '2025-08-01', expiryDate: '2026-07-25', location: 'Shelf C1', status: 'Near Expiry', lastUpdated: '2026-07-06 12:00' }, // Near Expiry!
  { id: 'BAT-011', medicineId: 'MED-011', medicineName: 'ORS Sachets', batchNumber: 'ORS-220', quantity: 450, manufactureDate: '2026-01-05', expiryDate: '2028-01-05', location: 'Shelf D1', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-012', medicineId: 'MED-012', medicineName: 'Zinc Tablets 20mg', batchNumber: 'ZN-145', quantity: 300, manufactureDate: '2026-02-10', expiryDate: '2028-02-10', location: 'Shelf D2', status: 'Active', lastUpdated: '2026-07-06 12:00' },
];

const INITIAL_TRANSACTIONS: StockTransaction[] = [
  { id: 'TX-001', medicineId: 'MED-001', medicineName: 'Paracetamol 500mg', batchNumber: 'PM-442', type: 'Inbound', quantity: 1200, transactionDate: '2026-07-01 09:30', reason: 'Routine supply requisition replenishment', performedBy: 'Meera Deshmukh' },
  { id: 'TX-002', medicineId: 'MED-002', medicineName: 'Iron Folic Acid', batchNumber: 'IF-121', type: 'Inbound', quantity: 2500, transactionDate: '2026-07-01 10:15', reason: 'Maternal health supplements supply', performedBy: 'Meera Deshmukh' },
  { id: 'TX-003', medicineId: 'MED-006', medicineName: 'Pentavalent Vaccine', batchNumber: 'PV-992', type: 'Outbound', quantity: 5, transactionDate: '2026-07-05 11:00', reason: 'Dispensed to Child Clinic', performedBy: 'Meera Deshmukh' },
  { id: 'TX-004', medicineId: 'MED-010', medicineName: 'Amoxicillin 250mg', batchNumber: 'AM-081', type: 'Outbound', quantity: 50, transactionDate: '2026-07-06 15:45', reason: 'Dispensed to Patient Sunita Devi', performedBy: 'Meera Deshmukh' },
];

const INITIAL_REQUESTS: MedicineRequest[] = [
  { id: 'REQ-101', requesterName: 'Sunita Sharma (ASHA)', requesterRole: 'ASHA Worker', medicineId: 'MED-002', medicineName: 'Iron Folic Acid', quantity: 300, priority: 'Urgent', requestDate: '2026-07-05', status: 'Pending', remarks: 'Monthly replenishment for Rampur village pregnant mothers', lastUpdated: '2026-07-05 10:30' },
  { id: 'REQ-102', requesterName: 'Sub-Center Khedi', requesterRole: 'Sub-Center Clinic', medicineId: 'MED-011', medicineName: 'ORS Sachets', quantity: 200, priority: 'Routine', requestDate: '2026-07-04', status: 'Approved', remarks: 'Summer diarrhea preparedness kit', lastUpdated: '2026-07-04 14:15' },
  { id: 'REQ-103', requesterName: 'Anjali Verma (ASHA)', requesterRole: 'ASHA Worker', medicineId: 'MED-004', medicineName: 'BCG Vaccine', quantity: 15, priority: 'Emergency', requestDate: '2026-07-06', status: 'Pending', remarks: 'Newborn immunization drive in Zone 3', lastUpdated: '2026-07-06 08:45' },
  { id: 'REQ-104', requesterName: 'Sub-Center Belora', requesterRole: 'Sub-Center Clinic', medicineId: 'MED-001', medicineName: 'Paracetamol 500mg', quantity: 500, priority: 'Routine', requestDate: '2026-07-02', status: 'Dispensed', remarks: 'Outpatient clinic stock', lastUpdated: '2026-07-03 11:00' }
];

import { pharmacyApi, apiRequest } from '../../utils/apiClient';

export const initPharmacistLocalStorage = () => {
  if (!localStorage.getItem(KEYS.REQUESTS)) {
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
};

// --- ALERT GENERATION ---
export const generateAndSaveAlerts = () => {
  // Handled dynamically
};

// --- MEDICINE CRUD ---
export const getMedicines = async (): Promise<Medicine[]> => {
  const [meds, stock] = await Promise.all([
    pharmacyApi.getMedicines(),
    apiRequest<any[]>('/medicine-stock')
  ]);
  return meds.map(m => {
    const s = stock.find(st => String(st.medicineId) === String(m.id));
    return {
      id: String(m.id),
      name: m.name,
      category: m.category || 'Other',
      stock: s ? s.totalQuantity : 0,
      minThreshold: m.reorderLevel,
      unit: m.unit || 'Units',
      price: 1.0,
      lastUpdated: 'Just now'
    };
  });
};

export const saveMedicines = async (list: Medicine[]) => {
  // No-op
};

export const addMedicine = async (med: Omit<Medicine, 'id' | 'lastUpdated'>): Promise<Medicine> => {
  const created = await pharmacyApi.createMedicine({
    name: med.name,
    code: med.name.toUpperCase().substring(0, 3) + '-' + Math.floor(100 + Math.random() * 900),
    category: med.category,
    unit: med.unit,
    reorderLevel: med.minThreshold
  });
  return {
    ...med,
    id: String(created.id),
    lastUpdated: new Date().toISOString().substring(0, 16)
  };
};

export const updateMedicine = async (id: string, updatedFields: Partial<Medicine>): Promise<void> => {
  const meds = await pharmacyApi.getMedicines();
  const existing = meds.find(m => String(m.id) === String(id));
  if (!existing) return;
  await pharmacyApi.updateMedicine(id, {
    name: updatedFields.name ?? existing.name,
    code: existing.code,
    category: updatedFields.category ?? existing.category,
    unit: updatedFields.unit ?? existing.unit,
    reorderLevel: updatedFields.minThreshold ?? existing.reorderLevel
  });
};

export const deleteMedicine = async (id: string): Promise<void> => {
  await pharmacyApi.deleteMedicine(id);
};

// --- BATCH CRUD ---
export const getBatches = async (): Promise<MedicineBatch[]> => {
  const batches = await pharmacyApi.getBatches();
  const today = new Date();
  return batches.map(b => {
    const expiry = new Date(b.expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    let status: 'Active' | 'Near Expiry' | 'Expired' = 'Active';
    if (daysDiff <= 0) status = 'Expired';
    else if (daysDiff <= 30) status = 'Near Expiry';

    return {
      id: String(b.id),
      medicineId: String(b.medicineId),
      medicineName: b.medicineName,
      batchNumber: b.batchNumber,
      quantity: b.quantity,
      manufactureDate: b.manufacturingDate || '2026-01-01',
      expiryDate: b.expiryDate,
      location: 'Shelf ' + (b.phcId || 'Default'),
      status,
      lastUpdated: 'Just now'
    };
  });
};

export const saveBatches = async (list: MedicineBatch[]) => {
  // No-op
};

export const addBatch = async (batch: Omit<MedicineBatch, 'id' | 'status' | 'lastUpdated'>): Promise<MedicineBatch> => {
  const created = await pharmacyApi.receiveBatch({
    medicineId: Number(batch.medicineId),
    batchNumber: batch.batchNumber,
    quantity: batch.quantity,
    expiryDate: batch.expiryDate,
    manufacturingDate: batch.manufactureDate
  });
  return {
    ...batch,
    id: String(created.id),
    status: 'Active',
    lastUpdated: new Date().toISOString().substring(0, 16)
  };
};

export const updateBatch = async (id: string, updatedFields: Partial<MedicineBatch>): Promise<void> => {
  if (updatedFields.quantity !== undefined) {
    const batches = await getBatches();
    const existing = batches.find(b => String(b.id) === String(id));
    if (!existing) return;
    const diff = updatedFields.quantity - existing.quantity;
    if (diff === 0) return;

    await apiRequest<any>('/medicine-transactions/adjust', {
      method: 'POST',
      body: JSON.stringify({
        batchId: Number(id),
        transactionType: diff > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
        quantity: Math.abs(diff),
        reason: 'Manual adjustment from frontend'
      })
    });
  }
};

export const deleteBatch = async (id: string): Promise<void> => {
  const batches = await getBatches();
  const existing = batches.find(b => String(b.id) === String(id));
  if (!existing || existing.quantity <= 0) return;

  await apiRequest<any>('/medicine-transactions/adjust', {
    method: 'POST',
    body: JSON.stringify({
      batchId: Number(id),
      transactionType: 'ADJUSTMENT_OUT',
      quantity: existing.quantity,
      reason: 'Batch deleted/discarded'
    })
  });
};

// --- STOCK TRANSACTIONS CRUD ---
export const getTransactions = async (): Promise<StockTransaction[]> => {
  const txs = await apiRequest<any[]>('/medicine-transactions');
  return txs.map(t => {
    return {
      id: String(t.id),
      medicineId: 'N/A',
      medicineName: t.medicineName || 'Unknown Medicine',
      batchId: String(t.batchId),
      batchNumber: t.batchNumber || 'N/A',
      type: t.transactionType === 'INBOUND' || t.transactionType === 'ADJUSTMENT_IN' || t.transactionType === 'RECEIVED' ? 'Inbound' : 'Outbound',
      quantity: t.quantity,
      transactionDate: t.transactionTime ? t.transactionTime.replace('T', ' ').substring(0, 16) : 'N/A',
      reason: t.reason || 'N/A',
      performedBy: 'User ' + (t.performedByUserId || 'N/A')
    };
  });
};

export const addTransaction = async (tx: Omit<StockTransaction, 'id' | 'transactionDate'>): Promise<any> => {
  if (tx.type === 'Inbound') {
    if (tx.batchId) {
      await apiRequest<any>('/medicine-transactions/adjust', {
        method: 'POST',
        body: JSON.stringify({
          batchId: Number(tx.batchId),
          transactionType: 'ADJUSTMENT_IN',
          quantity: tx.quantity,
          reason: tx.reason || 'Manual inbound adjustment'
        })
      });
    }
  } else {
    if (tx.batchId) {
      await pharmacyApi.dispenseStock({
        batchId: Number(tx.batchId),
        quantity: tx.quantity,
        reason: tx.reason || 'Manual outbound dispense'
      });
    }
  }
};

// --- ALERTS ---
export const getAlerts = async (
  prefetchedMedicines?: Medicine[],
  prefetchedBatches?: MedicineBatch[]
): Promise<PharmacistAlert[]> => {
  const medicines = prefetchedMedicines || await getMedicines();
  const batches = prefetchedBatches || await getBatches();
  const alerts: PharmacistAlert[] = [];
  const today = new Date();
  
  medicines.forEach(med => {
    if (med.stock === 0) {
      alerts.push({
        id: `ALT-SO-${med.id}`,
        type: 'Stockout',
        title: 'Stockout Alert: ' + med.name,
        message: `${med.name} is completely out of stock. Immediate replenishment required!`,
        severity: 'Critical',
        medicineId: med.id,
        dateGenerated: today.toISOString().substring(0, 10),
        resolved: false,
      });
    } else if (med.stock < med.minThreshold) {
      alerts.push({
        id: `ALT-SO-${med.id}`,
        type: 'Stockout',
        title: 'Low Stock Warning: ' + med.name,
        message: `${med.name} stock (${med.stock} ${med.unit}) is below the safe threshold of ${med.minThreshold}.`,
        severity: 'Warning',
        medicineId: med.id,
        dateGenerated: today.toISOString().substring(0, 10),
        resolved: false,
      });
    }
  });

  batches.forEach(batch => {
    const expiry = new Date(batch.expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 0) {
      alerts.push({
        id: `ALT-EXP-${batch.id}`,
        type: 'Expiry',
        title: 'Expired Batch: ' + batch.batchNumber,
        message: `Batch ${batch.batchNumber} of ${batch.medicineName} expired on ${batch.expiryDate}. Discard immediately!`,
        severity: 'Critical',
        medicineId: batch.medicineId,
        batchId: batch.id,
        dateGenerated: today.toISOString().substring(0, 10),
        resolved: false,
      });
    } else if (daysDiff <= 30) {
      alerts.push({
        id: `ALT-EXP-${batch.id}`,
        type: 'Expiry',
        title: 'Batch Expiring Soon: ' + batch.batchNumber,
        message: `Batch ${batch.batchNumber} of ${batch.medicineName} expires in ${daysDiff} days (${batch.expiryDate}).`,
        severity: 'Warning',
        medicineId: batch.medicineId,
        batchId: batch.id,
        dateGenerated: today.toISOString().substring(0, 10),
        resolved: false,
      });
    }
  });

  return alerts;
};

export const resolveAlert = async (id: string): Promise<void> => {
  // Local only resolution or no-op
};

// --- DEMAND FORECAST (MOCK ML DATA) ---
export const getDemandForecasts = async (
  prefetchedMedicines?: Medicine[]
): Promise<DemandForecast[]> => {
  const medicines = prefetchedMedicines || await getMedicines();
  const today = new Date();
  const month = today.getMonth();
  
  return medicines.map(med => {
    let seasonalTrend: 'Rising' | 'Stable' | 'Declining' = 'Stable';
    let multiplier = 1.0;
    
    if (med.category === 'Dehydration') {
      if (month >= 4 && month <= 8) {
        seasonalTrend = 'Rising';
        multiplier = 1.6;
      } else {
        seasonalTrend = 'Declining';
        multiplier = 0.8;
      }
    } else if (med.category === 'Antibiotic' || med.name.includes('Paracetamol')) {
      if ((month >= 6 && month <= 9) || (month >= 11 || month <= 1)) {
        seasonalTrend = 'Rising';
        multiplier = 1.4;
      } else {
        seasonalTrend = 'Stable';
        multiplier = 1.0;
      }
    } else if (med.category === 'Vaccine') {
      seasonalTrend = 'Stable';
      multiplier = 1.1;
    }
    
    const averageConsumption = Math.max(25, Math.floor(med.minThreshold * 0.7));
    const forecastedDemand = Math.floor(averageConsumption * multiplier);
    
    let estimatedOutDate = 'Safe';
    if (med.stock < forecastedDemand) {
      const daysLeft = Math.floor((med.stock / forecastedDemand) * 30);
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + daysLeft);
      estimatedOutDate = estDate.toISOString().substring(0, 10);
    }
    
    return {
      medicineId: med.id,
      medicineName: med.name,
      currentStock: med.stock,
      forecastedDemandNextMonth: forecastedDemand,
      seasonalTrend,
      confidenceScore: 85 + (Number(med.id) % 10),
      estimatedOutDate,
      recommendedOrderQty: med.stock < med.minThreshold ? Math.floor(med.minThreshold * 1.5 - med.stock) : 0,
    };
  });
};

// --- MEDICINE REQUESTS ---
export const getRequests = (): MedicineRequest[] => {
  initPharmacistLocalStorage();
  const raw = localStorage.getItem(KEYS.REQUESTS);
  if (!raw) return INITIAL_REQUESTS;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_REQUESTS;
  }
};

export const saveRequests = (list: MedicineRequest[]) => {
  localStorage.setItem(KEYS.REQUESTS, JSON.stringify(list));
};

export const addRequest = (req: Omit<MedicineRequest, 'id' | 'status' | 'lastUpdated'>): MedicineRequest => {
  const list = getRequests();
  const newReq: MedicineRequest = {
    ...req,
    id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
    status: 'Pending',
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  const updated = [newReq, ...list];
  saveRequests(updated);
  return newReq;
};

export const updateRequestStatus = async (
  id: string, 
  status: 'Approved' | 'Dispensed' | 'Rejected',
  batchId?: string,
  remarks?: string
): Promise<void> => {
  const list = getRequests();
  const req = list.find(r => r.id === id);
  if (!req) return;

  req.status = status;
  if (remarks) req.remarks = remarks;
  if (batchId) req.batchId = batchId;
  req.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 16);

  if (status === 'Dispensed') {
    const batches = await getBatches();
    const activeBatches = batches.filter(b => b.medicineId === req.medicineId && b.status !== 'Expired' && b.quantity > 0);
    
    let targetBatch = activeBatches.find(b => b.id === batchId);
    if (!targetBatch && activeBatches.length > 0) {
      activeBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      targetBatch = activeBatches[0];
    }

    if (targetBatch) {
      const deductQty = Math.min(targetBatch.quantity, req.quantity);
      await updateBatch(targetBatch.id, { quantity: Math.max(0, targetBatch.quantity - deductQty) });
      
      await addTransaction({
        medicineId: req.medicineId,
        medicineName: req.medicineName,
        batchId: targetBatch.id,
        batchNumber: targetBatch.batchNumber,
        type: 'Outbound',
        quantity: req.quantity,
        reason: `Requisition fulfilled for ${req.requesterName} (${req.id})`,
        performedBy: 'Meera Deshmukh'
      });
    } else {
      const meds = await getMedicines();
      const med = meds.find(m => m.id === req.medicineId);
      if (med) {
        await updateMedicine(med.id, { stock: Math.max(0, med.stock - req.quantity) });
        await addTransaction({
          medicineId: req.medicineId,
          medicineName: req.medicineName,
          type: 'Outbound',
          quantity: req.quantity,
          reason: `Requisition fulfilled for ${req.requesterName} (${req.id})`,
          performedBy: 'Meera Deshmukh'
        });
      }
    }
  }

  saveRequests(list);
};

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

const INITIAL_BATCHES: MedicineBatch[] = [
  { id: 'BAT-001', medicineId: 'MED-001', medicineName: 'Paracetamol 500mg', batchNumber: 'PM-442', quantity: 1200, manufactureDate: '2026-01-10', expiryDate: '2027-01-10', location: 'Shelf A3', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-002', medicineId: 'MED-002', medicineName: 'Iron Folic Acid', batchNumber: 'IF-121', quantity: 2500, manufactureDate: '2026-02-15', expiryDate: '2027-08-15', location: 'Shelf B1', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-003', medicineId: 'MED-003', medicineName: 'Calcium & Vit D3', batchNumber: 'CA-889', quantity: 1800, manufactureDate: '2026-03-01', expiryDate: '2027-09-01', location: 'Shelf B2', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-004', medicineId: 'MED-004', medicineName: 'BCG Vaccine', batchNumber: 'BCG-124', quantity: 45, manufactureDate: '2026-04-10', expiryDate: '2026-11-10', location: 'Cold Room Box A', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-005', medicineId: 'MED-005', medicineName: 'OPV Vaccine', batchNumber: 'OPV-882', quantity: 120, manufactureDate: '2025-07-01', expiryDate: '2026-07-01', location: 'Cold Room Box B', status: 'Expired', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-006', medicineId: 'MED-006', medicineName: 'Pentavalent Vaccine', batchNumber: 'PV-992', quantity: 18, manufactureDate: '2025-08-20', expiryDate: '2026-07-20', location: 'Cold Room Box C', status: 'Near Expiry', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-007', medicineId: 'MED-007', medicineName: 'Rotavirus Vaccine', batchNumber: 'RV-102', quantity: 65, manufactureDate: '2026-05-01', expiryDate: '2027-05-01', location: 'Cold Room Box C', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-008', medicineId: 'MED-008', medicineName: 'MR Vaccine', batchNumber: 'MR-771', quantity: 40, manufactureDate: '2026-04-18', expiryDate: '2027-04-18', location: 'Cold Room Box A', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-009', medicineId: 'MED-009', medicineName: 'DPT Booster', batchNumber: 'DB-103', quantity: 8, manufactureDate: '2025-06-15', expiryDate: '2026-06-15', location: 'Cold Room Box B', status: 'Expired', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-010', medicineId: 'MED-010', medicineName: 'Amoxicillin 250mg', batchNumber: 'AM-081', quantity: 150, manufactureDate: '2025-08-01', expiryDate: '2026-07-25', location: 'Shelf C1', status: 'Near Expiry', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-011', medicineId: 'MED-011', medicineName: 'ORS Sachets', batchNumber: 'ORS-220', quantity: 450, manufactureDate: '2026-01-05', expiryDate: '2028-01-05', location: 'Shelf D1', status: 'Active', lastUpdated: '2026-07-06 12:00' },
  { id: 'BAT-012', medicineId: 'MED-012', medicineName: 'Zinc Tablets 20mg', batchNumber: 'ZN-145', quantity: 300, manufactureDate: '2026-02-10', expiryDate: '2028-02-10', location: 'Shelf D2', status: 'Active', lastUpdated: '2026-07-06 12:00' },
];

const KEYS = ['medicineBatches', 'pharm_batches'];

export const load = (): MedicineBatch[] => {
  let data = localStorage.getItem('medicineBatches');
  if (!data) {
    data = localStorage.getItem('pharm_batches');
  }
  
  if (!data) {
    save(INITIAL_BATCHES);
    return INITIAL_BATCHES;
  }
  try {
    const list = JSON.parse(data) as MedicineBatch[];
    const today = new Date();
    // Re-evaluate statuses dynamically
    return list.map(batch => {
      const expiry = new Date(batch.expiryDate);
      const timeDiff = expiry.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      let status: 'Active' | 'Near Expiry' | 'Expired' = 'Active';
      if (daysDiff <= 0) {
        status = 'Expired';
      } else if (daysDiff <= 30) {
        status = 'Near Expiry';
      }
      return { ...batch, status };
    });
  } catch (e) {
    return INITIAL_BATCHES;
  }
};

export const save = (list: MedicineBatch[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<MedicineBatch, 'id' | 'status' | 'lastUpdated'>): MedicineBatch => {
  const list = load();
  const newItem: MedicineBatch = {
    ...item,
    id: `BAT-${crypto.randomUUID()}`,
    status: 'Active',
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  save([...list, newItem]);
  return newItem;
};

export const update = (id: string, fields: Partial<MedicineBatch>): MedicineBatch | null => {
  const list = load();
  const index = list.findIndex(b => b.id === id);
  if (index !== -1) {
    const updated = {
      ...list[index],
      ...fields,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    list[index] = updated;
    save(list);
    return updated;
  }
  return null;
};

export const remove = (id: string): boolean => {
  const list = load();
  const filtered = list.filter(b => b.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): MedicineBatch | undefined => {
  const list = load();
  return list.find(b => b.id === id);
};

export const findAll = (): MedicineBatch[] => {
  return load();
};

export const search = (query: string): MedicineBatch[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(b => 
    b.batchNumber.toLowerCase().includes(q) || 
    b.medicineName.toLowerCase().includes(q) || 
    b.location.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: MedicineBatch) => boolean): MedicineBatch[] => {
  return load().filter(predicate);
};

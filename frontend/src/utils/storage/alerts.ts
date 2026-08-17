export interface StoredAlert {
  id: string;
  type: 'Stockout' | 'Expiry' | 'High-risk pregnancy' | 'Immunization defaulter' | 'Nutrition risk' | 'Priority Visit' | string;
  title: string;
  message: string;
  severity: 'Critical' | 'Warning' | 'Info' | 'Advisory' | string;
  medicineId?: string;
  batchId?: string;
  patientId?: string;
  dateGenerated: string;
  resolved: boolean;
  facility?: string;
  details?: string;
}

const INITIAL_ALERTS: StoredAlert[] = [
  {
    id: 'ALT-SO-MED-004',
    type: 'Stockout',
    title: 'Low Stock Warning: BCG Vaccine',
    message: 'BCG Vaccine stock (45 Vials) is near the safety threshold.',
    severity: 'Warning',
    medicineId: 'MED-004',
    dateGenerated: '2026-07-06',
    resolved: false
  },
  {
    id: 'ALT-EXP-BAT-005',
    type: 'Expiry',
    title: 'Expired Batch: OPV-882',
    message: 'Batch OPV-882 of OPV Vaccine expired on 2026-07-01. Discard immediately!',
    severity: 'Critical',
    medicineId: 'MED-005',
    batchId: 'BAT-005',
    dateGenerated: '2026-07-06',
    resolved: false
  },
  {
    id: 'ALT-HRP-001',
    type: 'High-risk pregnancy',
    title: 'High Risk ANC Exception: Sunita Devi',
    message: 'Gestational Age 33 weeks, diagnosed with severe Anaemia.',
    severity: 'Critical',
    patientId: 'PT-201',
    dateGenerated: '2026-07-06',
    resolved: false
  }
];

const KEYS = ['alerts', 'pharm_alerts', 'sup_med_alerts'];

export const load = (): StoredAlert[] => {
  let data = localStorage.getItem('alerts');
  if (!data) {
    data = localStorage.getItem('pharm_alerts');
  }
  if (!data) {
    data = localStorage.getItem('sup_med_alerts');
  }
  
  if (!data) {
    save(INITIAL_ALERTS);
    return INITIAL_ALERTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_ALERTS;
  }
};

export const save = (list: StoredAlert[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<StoredAlert, 'id' | 'dateGenerated' | 'resolved'>): StoredAlert => {
  const list = load();
  const newItem: StoredAlert = {
    ...item,
    id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    dateGenerated: new Date().toISOString().substring(0, 10),
    resolved: false,
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<StoredAlert>): StoredAlert | null => {
  const list = load();
  const index = list.findIndex(a => a.id === id);
  if (index !== -1) {
    const updated = {
      ...list[index],
      ...fields
    };
    list[index] = updated;
    save(list);
    return updated;
  }
  return null;
};

export const remove = (id: string): boolean => {
  const list = load();
  const filtered = list.filter(a => a.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): StoredAlert | undefined => {
  const list = load();
  return list.find(a => a.id === id);
};

export const findAll = (): StoredAlert[] => {
  return load();
};

export const search = (query: string): StoredAlert[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(a => 
    a.title.toLowerCase().includes(q) || 
    a.message.toLowerCase().includes(q) || 
    a.type.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: StoredAlert) => boolean): StoredAlert[] => {
  return load().filter(predicate);
};

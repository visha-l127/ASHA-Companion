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

const KEYS = ['medicines', 'pharm_medicines'];

export const load = (): Medicine[] => {
  let data = localStorage.getItem('medicines');
  if (!data) {
    data = localStorage.getItem('pharm_medicines');
  }
  
  if (!data) {
    save(INITIAL_MEDICINES);
    return INITIAL_MEDICINES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MEDICINES;
  }
};

export const save = (list: Medicine[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<Medicine, 'id' | 'lastUpdated'>): Medicine => {
  const list = load();
  const newItem: Medicine = {
    ...item,
    id: `MED-${crypto.randomUUID()}`,
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  save([...list, newItem]);
  return newItem;
};

export const update = (id: string, fields: Partial<Medicine>): Medicine | null => {
  const list = load();
  const index = list.findIndex(m => m.id === id);
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
  const filtered = list.filter(m => m.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): Medicine | undefined => {
  const list = load();
  return list.find(m => m.id === id);
};

export const findAll = (): Medicine[] => {
  return load();
};

export const search = (query: string): Medicine[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(m => 
    m.name.toLowerCase().includes(q) || 
    m.category.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: Medicine) => boolean): Medicine[] => {
  return load().filter(predicate);
};

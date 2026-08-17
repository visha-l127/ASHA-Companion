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
}

const INITIAL_VISITS: VisitRecord[] = [
  {
    id: 'VS-301',
    patientId: 'PT-201',
    patientName: 'Sunita Devi',
    visitDate: '2026-07-06',
    purpose: 'ANC',
    symptoms: 'Mild fatigue, no headaches or visual disturbances',
    bp: '110/70 mmHg',
    weight: 58,
    referralNeeded: false,
    referralFacility: '',
    status: 'synced',
    lastUpdated: '2026-07-06 14:50',
  },
  {
    id: 'VS-302',
    patientId: 'PT-202',
    patientName: 'Aarav Kumar',
    visitDate: '2026-07-06',
    purpose: 'Immunization',
    symptoms: 'Healthy, active child, teething',
    bp: 'N/A',
    weight: 11.5,
    referralNeeded: false,
    referralFacility: '',
    status: 'synced',
    lastUpdated: '2026-07-06 14:55',
  }
];

const KEYS = ['visits', 'asha_visits'];

export const load = (): VisitRecord[] => {
  let data = localStorage.getItem('visits');
  if (!data) {
    data = localStorage.getItem('asha_visits');
  }
  
  if (!data || data.includes('Rampur')) {
    save(INITIAL_VISITS);
    return INITIAL_VISITS;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      const seen = new Set<string>();
      return parsed.filter((v: VisitRecord) => {
        if (!v || !v.id || seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      });
    }
    return INITIAL_VISITS;
  } catch (e) {
    return INITIAL_VISITS;
  }
};

export const save = (list: VisitRecord[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<VisitRecord, 'id' | 'status' | 'lastUpdated'>): VisitRecord => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const newItem: VisitRecord = {
    ...item,
    id: `VS-${crypto.randomUUID()}`,
    status: isOffline ? 'pending' : 'synced',
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<VisitRecord>): VisitRecord | null => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const index = list.findIndex(v => v.id === id);
  if (index !== -1) {
    const updated: VisitRecord = {
      ...list[index],
      ...fields,
      status: isOffline ? 'pending' : 'synced',
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
  const filtered = list.filter(v => v.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): VisitRecord | undefined => {
  const list = load();
  return list.find(v => v.id === id);
};

export const findAll = (): VisitRecord[] => {
  return load();
};

export const search = (query: string): VisitRecord[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(v => 
    v.patientName.toLowerCase().includes(q) || 
    v.purpose.toLowerCase().includes(q) || 
    v.symptoms.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: VisitRecord) => boolean): VisitRecord[] => {
  return load().filter(predicate);
};

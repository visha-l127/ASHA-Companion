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
}

const INITIAL_MATERNAL: MaternalRecord[] = [
  {
    id: 'MAT-401',
    patientId: 'PT-201',
    patientName: 'Sunita Devi',
    lmpDate: '2025-11-15',
    edd: '2026-08-22',
    gestationalAgeWeeks: 33,
    ancCount: 3,
    highRiskFactors: ['Anaemia'],
    status: 'synced',
    lastUpdated: '2026-07-06 15:00',
  }
];

const KEYS = ['maternalRecords', 'asha_maternal'];

export const load = (): MaternalRecord[] => {
  let data = localStorage.getItem('maternalRecords');
  if (!data) {
    data = localStorage.getItem('asha_maternal');
  }
  
  if (!data || data.includes('Rampur')) {
    save(INITIAL_MATERNAL);
    return INITIAL_MATERNAL;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MATERNAL;
  }
};

export const save = (list: MaternalRecord[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<MaternalRecord, 'id' | 'status' | 'lastUpdated'>): MaternalRecord => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const newItem: MaternalRecord = {
    ...item,
    id: `MAT-${crypto.randomUUID()}`,
    status: isOffline ? 'pending' : 'synced',
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<MaternalRecord>): MaternalRecord | null => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const index = list.findIndex(m => m.id === id);
  if (index !== -1) {
    const updated: MaternalRecord = {
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
  const filtered = list.filter(m => m.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): MaternalRecord | undefined => {
  const list = load();
  return list.find(m => m.id === id);
};

export const findAll = (): MaternalRecord[] => {
  return load();
};

export const search = (query: string): MaternalRecord[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(m => 
    m.patientName.toLowerCase().includes(q) || 
    m.highRiskFactors.some(rf => rf.toLowerCase().includes(q))
  );
};

export const filter = (predicate: (item: MaternalRecord) => boolean): MaternalRecord[] => {
  return load().filter(predicate);
};

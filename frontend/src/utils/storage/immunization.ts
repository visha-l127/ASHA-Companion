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
}

const INITIAL_IMMUNIZATIONS: ImmunizationRecord[] = [
  {
    id: 'IMM-501',
    patientId: 'PT-202',
    patientName: 'Aarav Kumar',
    childAgeMonths: 24,
    vaccineName: 'Measles-Rubella (MR-2)',
    dateGiven: '2026-07-06',
    nextDueDate: '2026-12-01',
    administeredBy: 'ANM Madukkarai PHC',
    status: 'synced',
    lastUpdated: '2026-07-06 15:10',
  }
];

const KEYS = ['immunizationRecords', 'asha_immunizations'];

export const load = (): ImmunizationRecord[] => {
  let data = localStorage.getItem('immunizationRecords');
  if (!data) {
    data = localStorage.getItem('asha_immunizations');
  }
  
  if (!data || data.includes('Rampur')) {
    save(INITIAL_IMMUNIZATIONS);
    return INITIAL_IMMUNIZATIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_IMMUNIZATIONS;
  }
};

export const save = (list: ImmunizationRecord[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<ImmunizationRecord, 'id' | 'status' | 'lastUpdated'>): ImmunizationRecord => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const newItem: ImmunizationRecord = {
    ...item,
    id: `IMM-${crypto.randomUUID()}`,
    status: isOffline ? 'pending' : 'synced',
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<ImmunizationRecord>): ImmunizationRecord | null => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const index = list.findIndex(i => i.id === id);
  if (index !== -1) {
    const updated: ImmunizationRecord = {
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
  const filtered = list.filter(i => i.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): ImmunizationRecord | undefined => {
  const list = load();
  return list.find(i => i.id === id);
};

export const findAll = (): ImmunizationRecord[] => {
  return load();
};

export const search = (query: string): ImmunizationRecord[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(i => 
    i.patientName.toLowerCase().includes(q) || 
    i.vaccineName.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: ImmunizationRecord) => boolean): ImmunizationRecord[] => {
  return load().filter(predicate);
};

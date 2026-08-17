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

const INITIAL_PATIENTS: AshaPatient[] = [
  {
    id: 'PT-201',
    householdId: 'HH-101',
    householdNumber: 'HH-MDK-042',
    name: 'Sunita Devi',
    age: 24,
    gender: 'F',
    relationToHead: 'Daughter-in-law',
    phone: '+91 99880 11223',
    isPregnant: true,
    isChild: false,
    status: 'synced',
    lastUpdated: '2026-07-06 14:35',
  },
  {
    id: 'PT-202',
    householdId: 'HH-101',
    householdNumber: 'HH-MDK-042',
    name: 'Aarav Kumar',
    age: 2,
    gender: 'M',
    relationToHead: 'Grandson',
    phone: '+91 99880 11223',
    isPregnant: false,
    isChild: true,
    status: 'synced',
    lastUpdated: '2026-07-06 14:40',
  },
  {
    id: 'PT-203',
    householdId: 'HH-102',
    householdNumber: 'HH-MDK-089',
    name: 'Lata Ammal',
    age: 29,
    gender: 'F',
    relationToHead: 'Self (Head)',
    phone: '+91 91234 43210',
    isPregnant: false,
    isChild: false,
    status: 'synced',
    lastUpdated: '2026-07-05 09:20',
  },
  {
    id: 'PT-204',
    householdId: 'HH-103',
    householdNumber: 'HH-SLR-015',
    name: 'Karan Sundaram',
    age: 5,
    gender: 'M',
    relationToHead: 'Son',
    phone: '+91 95432 10987',
    isPregnant: false,
    isChild: true,
    status: 'synced',
    lastUpdated: '2026-07-07 11:30',
  }
];

const KEYS = ['patients', 'asha_patients'];

export const load = (): AshaPatient[] => {
  let data = localStorage.getItem('patients');
  if (!data) {
    data = localStorage.getItem('asha_patients');
  }
  
  if (!data || data.includes('Rampur')) {
    save(INITIAL_PATIENTS);
    return INITIAL_PATIENTS;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      const seen = new Set<string>();
      return parsed.filter((p: AshaPatient) => {
        if (!p || !p.id || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }
    return INITIAL_PATIENTS;
  } catch (e) {
    return INITIAL_PATIENTS;
  }
};

export const save = (list: AshaPatient[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<AshaPatient, 'id' | 'status' | 'lastUpdated'>): AshaPatient => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const newItem: AshaPatient = {
    ...item,
    id: `PT-${crypto.randomUUID()}`,
    status: isOffline ? 'pending' : 'synced',
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<AshaPatient>): AshaPatient | null => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const index = list.findIndex(p => p.id === id);
  if (index !== -1) {
    const updated: AshaPatient = {
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
  const filtered = list.filter(p => p.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): AshaPatient | undefined => {
  const list = load();
  return list.find(p => p.id === id);
};

export const findAll = (): AshaPatient[] => {
  return load();
};

export const search = (query: string): AshaPatient[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.householdNumber.toLowerCase().includes(q) || 
    p.relationToHead.toLowerCase().includes(q) ||
    p.phone.includes(q)
  );
};

export const filter = (predicate: (item: AshaPatient) => boolean): AshaPatient[] => {
  return load().filter(predicate);
};

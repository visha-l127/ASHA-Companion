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

const INITIAL_HOUSEHOLDS: Household[] = [
  {
    id: 'HH-101',
    householdNumber: 'HH-MDK-042',
    headName: 'Ramcharan Pillai',
    village: 'Madukkarai',
    membersCount: 5,
    category: 'BPL',
    waterSource: 'handpump',
    toilet: true,
    status: 'synced',
    lastUpdated: '2026-07-06 14:30',
  },
  {
    id: 'HH-102',
    householdNumber: 'HH-MDK-089',
    headName: 'Saraswati Ammal',
    village: 'Madukkarai',
    membersCount: 4,
    category: 'AAY',
    waterSource: 'well',
    toilet: false,
    status: 'synced',
    lastUpdated: '2026-07-05 09:15',
  },
  {
    id: 'HH-103',
    householdNumber: 'HH-SLR-015',
    headName: 'Vikram Sundaram',
    village: 'Sulur',
    membersCount: 6,
    category: 'APL',
    waterSource: 'piped',
    toilet: true,
    status: 'synced',
    lastUpdated: '2026-07-07 11:22',
  }
];

const KEYS = ['households', 'asha_households'];

export const load = (): Household[] => {
  let data = localStorage.getItem('households');
  if (!data) {
    data = localStorage.getItem('asha_households');
  }
  
  if (!data || data.includes('Rampur')) {
    save(INITIAL_HOUSEHOLDS);
    return INITIAL_HOUSEHOLDS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_HOUSEHOLDS;
  }
};

export const save = (list: Household[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<Household, 'id' | 'status' | 'lastUpdated'>): Household => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const newItem: Household = {
    ...item,
    id: `HH-${crypto.randomUUID()}`,
    status: isOffline ? 'pending' : 'synced',
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<Household>): Household | null => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const index = list.findIndex(h => h.id === id);
  if (index !== -1) {
    const updated: Household = {
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
  const filtered = list.filter(h => h.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): Household | undefined => {
  const list = load();
  return list.find(h => h.id === id);
};

export const findAll = (): Household[] => {
  return load();
};

export const search = (query: string): Household[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(h => 
    h.headName.toLowerCase().includes(q) || 
    h.householdNumber.toLowerCase().includes(q) || 
    h.village.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: Household) => boolean): Household[] => {
  return load().filter(predicate);
};

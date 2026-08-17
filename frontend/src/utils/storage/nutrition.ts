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
}

const INITIAL_NUTRITION: NutritionRecord[] = [
  {
    id: 'NUT-601',
    patientId: 'PT-202',
    patientName: 'Aarav Kumar',
    ageGroup: 'child',
    weightForAgeStatus: 'normal',
    samStatus: false,
    thrustAreas: ['Take-Home Ration', 'IFA Syrups'],
    status: 'synced',
    lastUpdated: '2026-07-06 15:15',
  },
  {
    id: 'NUT-602',
    patientId: 'PT-201',
    patientName: 'Sunita Devi',
    ageGroup: 'pregnant',
    weightForAgeStatus: 'normal',
    samStatus: false,
    thrustAreas: ['Take-Home Ration', 'IFA Tablets', 'Counseling'],
    status: 'synced',
    lastUpdated: '2026-07-06 15:20',
  }
];

const KEYS = ['nutritionRecords', 'asha_nutrition'];

export const load = (): NutritionRecord[] => {
  let data = localStorage.getItem('nutritionRecords');
  if (!data) {
    data = localStorage.getItem('asha_nutrition');
  }
  
  if (!data || data.includes('Rampur')) {
    save(INITIAL_NUTRITION);
    return INITIAL_NUTRITION;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_NUTRITION;
  }
};

export const save = (list: NutritionRecord[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<NutritionRecord, 'id' | 'status' | 'lastUpdated'>): NutritionRecord => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const newItem: NutritionRecord = {
    ...item,
    id: `NUT-${crypto.randomUUID()}`,
    status: isOffline ? 'pending' : 'synced',
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<NutritionRecord>): NutritionRecord | null => {
  const list = load();
  const isOffline = localStorage.getItem('asha_offline_mode') === 'true';
  const index = list.findIndex(n => n.id === id);
  if (index !== -1) {
    const updated: NutritionRecord = {
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
  const filtered = list.filter(n => n.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): NutritionRecord | undefined => {
  const list = load();
  return list.find(n => n.id === id);
};

export const findAll = (): NutritionRecord[] => {
  return load();
};

export const search = (query: string): NutritionRecord[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(n => 
    n.patientName.toLowerCase().includes(q) || 
    n.weightForAgeStatus.toLowerCase().includes(q) ||
    n.ageGroup.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: NutritionRecord) => boolean): NutritionRecord[] => {
  return load().filter(predicate);
};

export interface PriorityVisit {
  id: string;
  patientName: string;
  village: string;
  ashaId: string;
  ashaName: string;
  condition: string;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedDate: string;
  status: 'Pending' | 'Completed';
  notes: string;
}

const INITIAL_PRIORITY_VISITS: PriorityVisit[] = [
  {
    id: 'PV-1001',
    patientName: 'Meera Bai',
    village: 'Madukkarai',
    ashaId: 'ASHA-101',
    ashaName: 'Anjali Sharma',
    condition: 'Severe Anaemia checkup (Hb 8.2 g/dL)',
    urgency: 'Critical',
    assignedDate: '2026-07-07',
    status: 'Pending',
    notes: 'Check if she has received blood infusion reference at PHC. Verify double IFA consumption.'
  },
  {
    id: 'PV-1002',
    patientName: 'Sarita Yadav',
    village: 'Sulur',
    ashaId: 'ASHA-103',
    ashaName: 'Kiran Devi',
    condition: 'Hypertension audit (BP 156/98 mmHg)',
    urgency: 'High',
    assignedDate: '2026-07-06',
    status: 'Completed',
    notes: 'Verify if the patient went to PHC for MO consultation. Check compliance with Methyldopa.'
  }
];

const KEYS = ['priorityVisits', 'sup_priority_visits'];

export const load = (): PriorityVisit[] => {
  let data = localStorage.getItem('priorityVisits');
  if (!data) {
    data = localStorage.getItem('sup_priority_visits');
  }
  
  if (!data) {
    save(INITIAL_PRIORITY_VISITS);
    return INITIAL_PRIORITY_VISITS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_PRIORITY_VISITS;
  }
};

export const save = (list: PriorityVisit[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<PriorityVisit, 'id' | 'assignedDate' | 'status'>): PriorityVisit => {
  const list = load();
  const newItem: PriorityVisit = {
    ...item,
    id: `PV-${crypto.randomUUID()}`,
    assignedDate: new Date().toISOString().substring(0, 10),
    status: 'Pending'
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<PriorityVisit>): PriorityVisit | null => {
  const list = load();
  const index = list.findIndex(v => v.id === id);
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
  const filtered = list.filter(v => v.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): PriorityVisit | undefined => {
  const list = load();
  return list.find(v => v.id === id);
};

export const findAll = (): PriorityVisit[] => {
  return load();
};

export const search = (query: string): PriorityVisit[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(v => 
    v.patientName.toLowerCase().includes(q) || 
    v.village.toLowerCase().includes(q) || 
    v.condition.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: PriorityVisit) => boolean): PriorityVisit[] => {
  return load().filter(predicate);
};

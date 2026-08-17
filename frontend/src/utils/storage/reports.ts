export interface SavedReport {
  id: string;
  name: string;
  date: string;
  generatedBy: string;
  filters: {
    phc: string;
    indicator: string;
    dateRange: string;
    [key: string]: any;
  };
  tableData: any[];
  status: 'Ready' | 'Draft' | 'Expired' | string;
  reportSummary?: {
    activePatients: number;
    vaccinationRate: string;
    highRiskANC: number;
    referralsCount: number;
  };
}

const INITIAL_REPORTS: SavedReport[] = [
  {
    id: 'RPT-101',
    name: 'Q2 Community Health & Maternal Performance Report',
    date: '2026-07-07 20:30',
    generatedBy: 'Dr. Meena Rao',
    filters: {
      phc: 'all',
      indicator: 'all',
      dateRange: '90'
    },
    tableData: [
      { month: 'Apr', maternal: 60, immunization: 138, ncd: 220 },
      { month: 'May', maternal: 58, immunization: 160, ncd: 245 },
      { month: 'Jun', maternal: 65, immunization: 175, ncd: 260 }
    ],
    status: 'Ready',
    reportSummary: {
      activePatients: 1482,
      vaccinationRate: '91.5%',
      highRiskANC: 34,
      referralsCount: 128
    }
  }
];

const KEYS = ['reports'];

export const load = (): SavedReport[] => {
  const data = localStorage.getItem('reports');
  if (!data) {
    save(INITIAL_REPORTS);
    return INITIAL_REPORTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_REPORTS;
  }
};

export const save = (list: SavedReport[]): void => {
  localStorage.setItem('reports', JSON.stringify(list));
};

export const add = (item: Omit<SavedReport, 'id' | 'date'>): SavedReport => {
  const list = load();
  const newItem: SavedReport = {
    ...item,
    id: `RPT-${crypto.randomUUID()}`,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<SavedReport>): SavedReport | null => {
  const list = load();
  const index = list.findIndex(r => r.id === id);
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
  const filtered = list.filter(r => r.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): SavedReport | undefined => {
  const list = load();
  return list.find(r => r.id === id);
};

export const findAll = (): SavedReport[] => {
  return load();
};

export const search = (query: string): SavedReport[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(r => 
    r.name.toLowerCase().includes(q) || 
    r.generatedBy.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: SavedReport) => boolean): SavedReport[] => {
  return load().filter(predicate);
};

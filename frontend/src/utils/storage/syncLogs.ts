export interface SyncLogItem {
  id: string;
  recordId: string;
  module: 'households' | 'patients' | 'visits' | 'maternal' | 'immunizations' | 'nutrition' | 'medicine' | string;
  status: 'Pending' | 'Synced' | 'Failed';
  retryCount: number;
  lastAttemptTime: string;
  errorMessage?: string;
  details: string;
}

const INITIAL_SYNC_LOGS: SyncLogItem[] = [
  {
    id: 'SL-001',
    recordId: 'HH-101',
    module: 'households',
    status: 'Synced',
    retryCount: 0,
    lastAttemptTime: '2026-07-06 14:30',
    details: 'Synced household Ramcharan Pillai (HH-MDK-042)'
  },
  {
    id: 'SL-002',
    recordId: 'PT-201',
    module: 'patients',
    status: 'Synced',
    retryCount: 0,
    lastAttemptTime: '2026-07-06 14:35',
    details: 'Synced patient Sunita Devi'
  }
];

const KEYS = ['syncLogs'];

export const load = (): SyncLogItem[] => {
  const data = localStorage.getItem('syncLogs');
  if (!data) {
    save(INITIAL_SYNC_LOGS);
    return INITIAL_SYNC_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_SYNC_LOGS;
  }
};

export const save = (list: SyncLogItem[]): void => {
  localStorage.setItem('syncLogs', JSON.stringify(list));
};

export const add = (item: Omit<SyncLogItem, 'id' | 'lastAttemptTime'>): SyncLogItem => {
  const list = load();
  const newItem: SyncLogItem = {
    ...item,
    id: `SL-${Math.floor(100 + Math.random() * 900)}`,
    lastAttemptTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<SyncLogItem>): SyncLogItem | null => {
  const list = load();
  const index = list.findIndex(l => l.id === id);
  if (index !== -1) {
    const updated = {
      ...list[index],
      ...fields,
      lastAttemptTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    list[index] = updated;
    save(list);
    return updated;
  }
  return null;
};

export const remove = (id: string): boolean => {
  const list = load();
  const filtered = list.filter(l => l.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): SyncLogItem | undefined => {
  const list = load();
  return list.find(l => l.id === id);
};

export const findAll = (): SyncLogItem[] => {
  return load();
};

export const search = (query: string): SyncLogItem[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(l => 
    l.module.toLowerCase().includes(q) || 
    l.status.toLowerCase().includes(q) ||
    l.details.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: SyncLogItem) => boolean): SyncLogItem[] => {
  return load().filter(predicate);
};

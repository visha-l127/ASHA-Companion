export interface AuditLog {
  id: string;
  facility: string;
  user: string;
  event: string;
  time: string;
  severity: 'info' | 'warning' | 'success';
}

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    facility: 'District HQ',
    user: 'vishal.admin',
    event: 'User Account Created: sunita (ASHA)',
    time: '2026-07-07 10:20',
    severity: 'success',
  },
  {
    id: 'log-2',
    facility: 'District HQ',
    user: 'vishal.admin',
    event: 'System parameters updated',
    time: '2026-07-07 09:15',
    severity: 'info',
  },
  {
    id: 'log-3',
    facility: 'Sulur PHC',
    user: 'arjun',
    event: 'Cold chain alert resolved: Ice pack breach',
    time: '2026-07-06 16:45',
    severity: 'success',
  },
  {
    id: 'log-4',
    facility: 'Madukkarai PHC',
    user: 'sunita',
    event: 'High risk pregnancy Sunita Devi (PT-201) tracked',
    time: '2026-07-06 15:05',
    severity: 'warning',
  }
];

const KEYS = ['auditLogs', 'admin_audit_logs'];

export const load = (): AuditLog[] => {
  let data = localStorage.getItem('auditLogs');
  if (!data) {
    data = localStorage.getItem('admin_audit_logs');
  }
  
  if (!data) {
    save(DEFAULT_AUDIT_LOGS);
    return DEFAULT_AUDIT_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_AUDIT_LOGS;
  }
};

export const save = (list: AuditLog[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<AuditLog, 'id' | 'time'>): AuditLog => {
  const list = load();
  const newItem: AuditLog = {
    ...item,
    id: `log-${crypto.randomUUID()}`,
    time: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<AuditLog>): AuditLog | null => {
  const list = load();
  const index = list.findIndex(l => l.id === id);
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
  const filtered = list.filter(l => l.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): AuditLog | undefined => {
  const list = load();
  return list.find(l => l.id === id);
};

export const findAll = (): AuditLog[] => {
  return load();
};

export const search = (query: string): AuditLog[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(l => 
    l.event.toLowerCase().includes(q) || 
    l.user.toLowerCase().includes(q) ||
    l.facility.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: AuditLog) => boolean): AuditLog[] => {
  return load().filter(predicate);
};

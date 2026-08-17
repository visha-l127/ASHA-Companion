export interface PHC {
  id: string;
  name: string;
  code: string;
  district: string;
  beds: number;
  contactNumber: string;
  status: 'active' | 'inactive';
  establishedYear: number;
}

const DEFAULT_PHCS: PHC[] = [
  {
    id: 'phc-1',
    name: 'Madukkarai PHC',
    code: 'PHC-MDK-01',
    district: 'Coimbatore',
    beds: 15,
    contactNumber: '+91 94421 00101',
    status: 'active',
    establishedYear: 2012,
  },
  {
    id: 'phc-2',
    name: 'Thondamuthur PHC',
    code: 'PHC-TDM-02',
    district: 'Coimbatore',
    beds: 12,
    contactNumber: '+91 94421 00102',
    status: 'active',
    establishedYear: 2015,
  },
  {
    id: 'phc-3',
    name: 'Sulur PHC',
    code: 'PHC-SLR-03',
    district: 'Coimbatore',
    beds: 10,
    contactNumber: '+91 94421 00103',
    status: 'active',
    establishedYear: 2018,
  },
  {
    id: 'phc-4',
    name: 'Karamadai PHC',
    code: 'PHC-KMD-04',
    district: 'Coimbatore',
    beds: 20,
    contactNumber: '+91 94421 00104',
    status: 'active',
    establishedYear: 2005,
  },
  {
    id: 'phc-5',
    name: 'S.S. Kulam PHC',
    code: 'PHC-SSK-05',
    district: 'Coimbatore',
    beds: 8,
    contactNumber: '+91 94421 00105',
    status: 'active',
    establishedYear: 2016,
  },
  {
    id: 'phc-6',
    name: 'Perur PHC',
    code: 'PHC-PRR-06',
    district: 'Coimbatore',
    beds: 14,
    contactNumber: '+91 94421 00106',
    status: 'active',
    establishedYear: 2014,
  },
  {
    id: 'phc-7',
    name: 'Podanur PHC',
    code: 'PHC-PDN-07',
    district: 'Coimbatore',
    beds: 11,
    contactNumber: '+91 94421 00107',
    status: 'active',
    establishedYear: 2011,
  },
  {
    id: 'phc-8',
    name: 'Vellakinar PHC',
    code: 'PHC-VLK-08',
    district: 'Coimbatore',
    beds: 12,
    contactNumber: '+91 94421 00108',
    status: 'active',
    establishedYear: 2013,
  },
  {
    id: 'phc-9',
    name: 'Arisipalayam PHC',
    code: 'PHC-ARP-09',
    district: 'Coimbatore',
    beds: 6,
    contactNumber: '+91 94421 00109',
    status: 'active',
    establishedYear: 2019,
  },
  {
    id: 'phc-10',
    name: 'Seeliyur PHC',
    code: 'PHC-SLY-10',
    district: 'Coimbatore',
    beds: 9,
    contactNumber: '+91 94421 00110',
    status: 'active',
    establishedYear: 2017,
  }
];

const KEYS = ['phcs', 'admin_phcs'];

export const load = (): PHC[] => {
  let data = localStorage.getItem('phcs');
  if (!data) {
    data = localStorage.getItem('admin_phcs');
  }
  
  if (!data || data.includes('Rampur')) {
    save(DEFAULT_PHCS);
    return DEFAULT_PHCS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_PHCS;
  }
};

export const save = (list: PHC[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<PHC, 'id'>): PHC => {
  const list = load();
  const newItem: PHC = {
    ...item,
    id: `phc-${crypto.randomUUID()}`
  };
  save([...list, newItem]);
  return newItem;
};

export const update = (id: string, fields: Partial<PHC>): PHC | null => {
  const list = load();
  const index = list.findIndex(p => p.id === id);
  if (index !== -1) {
    const updated = { ...list[index], ...fields };
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

export const findById = (id: string): PHC | undefined => {
  const list = load();
  return list.find(p => p.id === id);
};

export const findAll = (): PHC[] => {
  return load();
};

export const search = (query: string): PHC[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.code.toLowerCase().includes(q) || 
    p.district.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: PHC) => boolean): PHC[] => {
  return load().filter(predicate);
};

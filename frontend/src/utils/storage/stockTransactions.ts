export interface StockTransaction {
  id: string;
  medicineId: string;
  medicineName: string;
  batchId?: string;
  batchNumber?: string;
  type: 'Inbound' | 'Outbound';
  quantity: number;
  transactionDate: string; // YYYY-MM-DD HH:mm
  reason: string;
  performedBy: string;
}

const INITIAL_TRANSACTIONS: StockTransaction[] = [
  { id: 'TX-001', medicineId: 'MED-001', medicineName: 'Paracetamol 500mg', batchNumber: 'PM-442', type: 'Inbound', quantity: 1200, transactionDate: '2026-07-01 09:30', reason: 'Routine supply requisition replenishment', performedBy: 'Meera Deshmukh' },
  { id: 'TX-002', medicineId: 'MED-002', medicineName: 'Iron Folic Acid', batchNumber: 'IF-121', type: 'Inbound', quantity: 2500, transactionDate: '2026-07-01 10:15', reason: 'Maternal health supplements supply', performedBy: 'Meera Deshmukh' },
  { id: 'TX-003', medicineId: 'MED-006', medicineName: 'Pentavalent Vaccine', batchNumber: 'PV-992', type: 'Outbound', quantity: 5, transactionDate: '2026-07-05 11:00', reason: 'Dispensed to Child Clinic', performedBy: 'Meera Deshmukh' },
  { id: 'TX-004', medicineId: 'MED-010', medicineName: 'Amoxicillin 250mg', batchNumber: 'AM-081', type: 'Outbound', quantity: 50, transactionDate: '2026-07-06 15:45', reason: 'Dispensed to Patient Sunita Devi', performedBy: 'Meera Deshmukh' },
];

const KEYS = ['stockTransactions', 'pharm_transactions'];

export const load = (): StockTransaction[] => {
  let data = localStorage.getItem('stockTransactions');
  if (!data) {
    data = localStorage.getItem('pharm_transactions');
  }
  
  if (!data) {
    save(INITIAL_TRANSACTIONS);
    return INITIAL_TRANSACTIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_TRANSACTIONS;
  }
};

export const save = (list: StockTransaction[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<StockTransaction, 'id' | 'transactionDate'>): StockTransaction => {
  const list = load();
  const newItem: StockTransaction = {
    ...item,
    id: `TX-${crypto.randomUUID()}`,
    transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  save([newItem, ...list]);
  return newItem;
};

export const update = (id: string, fields: Partial<StockTransaction>): StockTransaction | null => {
  const list = load();
  const index = list.findIndex(t => t.id === id);
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
  const filtered = list.filter(t => t.id !== id);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (id: string): StockTransaction | undefined => {
  const list = load();
  return list.find(t => t.id === id);
};

export const findAll = (): StockTransaction[] => {
  return load();
};

export const search = (query: string): StockTransaction[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(t => 
    t.medicineName.toLowerCase().includes(q) || 
    (t.batchNumber && t.batchNumber.toLowerCase().includes(q)) || 
    t.reason.toLowerCase().includes(q) || 
    t.performedBy.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: StockTransaction) => boolean): StockTransaction[] => {
  return load().filter(predicate);
};

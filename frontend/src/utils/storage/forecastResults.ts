export interface ForecastResult {
  medicineId: string;
  medicineName: string;
  currentStock: number;
  forecastedDemandNextMonth: number;
  seasonalTrend: 'Rising' | 'Stable' | 'Declining';
  confidenceScore: number; // percentage (e.g. 92)
  estimatedOutDate: string; // YYYY-MM-DD or 'Safe'
  recommendedOrderQty: number;
  stockoutRisk: 'High' | 'Medium' | 'Low';
  recommendedAction: string;
  forecastDate: string;
}

const INITIAL_FORECASTS: ForecastResult[] = [
  {
    medicineId: 'MED-001',
    medicineName: 'Paracetamol 500mg',
    currentStock: 1200,
    forecastedDemandNextMonth: 1400,
    seasonalTrend: 'Rising',
    confidenceScore: 92,
    estimatedOutDate: '2026-08-01',
    recommendedOrderQty: 500,
    stockoutRisk: 'Medium',
    recommendedAction: 'Place inbound orders ahead of seasonal monsoon spikes.',
    forecastDate: '2026-07-06'
  },
  {
    medicineId: 'MED-010',
    medicineName: 'Amoxicillin 250mg',
    currentStock: 150,
    forecastedDemandNextMonth: 300,
    seasonalTrend: 'Stable',
    confidenceScore: 88,
    estimatedOutDate: '2026-07-20',
    recommendedOrderQty: 250,
    stockoutRisk: 'High',
    recommendedAction: 'Immediate replenishment. Stock is below forecasted usage.',
    forecastDate: '2026-07-06'
  }
];

const KEYS = ['forecastResults', 'pharm_forecasts'];

export const load = (): ForecastResult[] => {
  let data = localStorage.getItem('forecastResults');
  if (!data) {
    data = localStorage.getItem('pharm_forecasts');
  }
  
  if (!data) {
    save(INITIAL_FORECASTS);
    return INITIAL_FORECASTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_FORECASTS;
  }
};

export const save = (list: ForecastResult[]): void => {
  const jsonStr = JSON.stringify(list);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const add = (item: Omit<ForecastResult, 'forecastDate'>): ForecastResult => {
  const list = load();
  const newItem: ForecastResult = {
    ...item,
    forecastDate: new Date().toISOString().substring(0, 10)
  };
  save([...list, newItem]);
  return newItem;
};

export const update = (medicineId: string, fields: Partial<ForecastResult>): ForecastResult | null => {
  const list = load();
  const index = list.findIndex(f => f.medicineId === medicineId);
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

export const remove = (medicineId: string): boolean => {
  const list = load();
  const filtered = list.filter(f => f.medicineId !== medicineId);
  if (filtered.length !== list.length) {
    save(filtered);
    return true;
  }
  return false;
};

export { remove as delete };

export const findById = (medicineId: string): ForecastResult | undefined => {
  const list = load();
  return list.find(f => f.medicineId === medicineId);
};

export const findAll = (): ForecastResult[] => {
  return load();
};

export const search = (query: string): ForecastResult[] => {
  const list = load();
  const q = query.toLowerCase();
  return list.filter(f => 
    f.medicineName.toLowerCase().includes(q) || 
    f.recommendedAction.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: ForecastResult) => boolean): ForecastResult[] => {
  return load().filter(predicate);
};

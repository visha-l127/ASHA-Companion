export interface SystemSettings {
  offlineTtl: number;
  maxDbSize: number;
  compressionRatio: string;
  biometricLock: boolean;
  districtIncharge: string;
  backupSchedule: 'daily' | 'weekly' | 'monthly';
  serverUrl: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  offlineTtl: 30,
  maxDbSize: 500,
  compressionRatio: '1:4',
  biometricLock: true,
  districtIncharge: 'Dr. S. K. Subramanian',
  backupSchedule: 'daily',
  serverUrl: 'https://api.coimbatore-healthcompanion.gov.in/v1',
};

const KEYS = ['systemSettings', 'admin_settings'];

export const load = (): SystemSettings => {
  let data = localStorage.getItem('systemSettings');
  if (!data) {
    data = localStorage.getItem('admin_settings');
  }
  
  if (!data) {
    save(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const save = (settings: SystemSettings): void => {
  const jsonStr = JSON.stringify(settings);
  KEYS.forEach(key => localStorage.setItem(key, jsonStr));
};

export const update = (fields: Partial<SystemSettings>): SystemSettings => {
  const current = load();
  const updated = {
    ...current,
    ...fields
  };
  save(updated);
  return updated;
};

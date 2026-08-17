import { UserRole } from '../../types';
import { loadUsers, saveUsers, PersistedUser } from '../../utils/localStorage';
import { load as loadPHCs, save as savePHCsUtil } from '../../utils/storage/phc';
import { load as loadSettings, save as saveSettingsUtil } from '../../utils/storage/systemSettings';
import { load as loadAudits, save as saveAuditsUtil, add as addAuditUtil } from '../../utils/storage/auditLogs';

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

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  facilityId: string;
  facilityName: string;
  status: 'active' | 'inactive';
  contactNumber: string;
  location: string;
  password?: string | null;
  isActivated?: boolean;
  mustChangePassword?: boolean;
  avatarUrl?: string;
}

export interface RolePermission {
  id: string;
  role: UserRole | string;
  description: string;
  permissions: string[];
}

export interface SystemSettings {
  offlineTtl: number;
  maxDbSize: number;
  compressionRatio: string;
  biometricLock: boolean;
  districtIncharge: string;
  backupSchedule: 'daily' | 'weekly' | 'monthly';
  serverUrl: string;
}

export interface AuditLog {
  id: string;
  facility: string;
  user: string;
  event: string;
  time: string;
  severity: 'info' | 'warning' | 'success';
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

const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'usr-admin-1',
    name: 'Vishal Kumar',
    username: 'vishal.admin',
    email: 'admin@companion.org',
    role: 'admin',
    facilityId: 'phc-4',
    facilityName: 'District Health Administration Office',
    status: 'active',
    contactNumber: '+91 90000 11111',
    location: 'District Headquarter',
    password: 'Admin@123',
    isActivated: true,
  }
];

const DEFAULT_ROLES_PERMISSIONS: RolePermission[] = [
  {
    id: 'rp-1',
    role: 'admin',
    description: 'District level system administrator with full access',
    permissions: ['view_dashboard', 'manage_phc', 'manage_users', 'manage_roles', 'view_reports', 'manage_settings', 'view_audits'],
  },
  {
    id: 'rp-2',
    role: 'supervisor',
    description: 'Medical Officer or Sector Supervisor overseeing cluster PHCs/Sub-Centers',
    permissions: ['view_dashboard', 'view_reports', 'manage_users'],
  },
  {
    id: 'rp-3',
    role: 'asha',
    description: 'Accredited Social Health Activist volunteer inputting village records offline',
    permissions: ['view_dashboard'],
  },
  {
    id: 'rp-4',
    role: 'pharmacist',
    description: 'Sub-Center pharmacist checking cold-chain and dispensing vaccine inventory',
    permissions: ['view_dashboard'],
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  offlineTtl: 30,
  maxDbSize: 50,
  compressionRatio: '8:1',
  biometricLock: true,
  districtIncharge: 'Dr. R. Kannan (DHO Coimbatore)',
  backupSchedule: 'daily',
  serverUrl: 'https://national-health-portal.gov.in/api/v1',
};

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-304',
    facility: 'Madukkarai PHC',
    user: 'Sunita Devi (ASHA)',
    event: 'ASHA Sunita uploaded 4 synced clinical sheets',
    time: '2026-07-07 19:47',
    severity: 'info',
  },
  {
    id: 'LOG-303',
    facility: 'Thondamuthur PHC',
    user: 'System Monitor',
    event: 'High-Risk referral SUNITA DEVI escalated',
    time: '2026-07-07 19:19',
    severity: 'warning',
  },
  {
    id: 'LOG-302',
    facility: 'Sulur PHC',
    user: 'Arjun Singh (Pharmacist)',
    event: 'Vaccine Inventory updated: BCG stock order processed',
    time: '2026-07-07 17:59',
    severity: 'info',
  },
  {
    id: 'LOG-301',
    facility: 'District Health Administration Office',
    user: 'Vishal Kumar (Admin)',
    event: 'Batch validation job successfully merged 18 offline records',
    time: '2026-07-07 13:59',
    severity: 'success',
  },
  {
    id: 'LOG-300',
    facility: 'Karamadai PHC',
    user: 'Dr. Meena (Supervisor)',
    event: 'Cold chain alert resolved: Karamadai PHC vaccine fridge restored to 4°C',
    time: '2026-07-07 10:30',
    severity: 'success',
  },
];

export const initializeLocalStorage = () => {
  const existingPHCs = localStorage.getItem('admin_phcs');
  if (!existingPHCs || !existingPHCs.includes('Madukkarai') || existingPHCs.includes('Rampur')) {
    localStorage.setItem('admin_phcs', JSON.stringify(DEFAULT_PHCS));
    localStorage.setItem('phcs', JSON.stringify(DEFAULT_PHCS));
  }
  
  // Seed and load default users via the storage utility
  loadUsers();

  if (!localStorage.getItem('admin_roles_permissions')) {
    localStorage.setItem('admin_roles_permissions', JSON.stringify(DEFAULT_ROLES_PERMISSIONS));
  }
  const existingSettings = localStorage.getItem('admin_settings');
  if (!existingSettings || existingSettings.includes('Suresh Kumar')) {
    localStorage.setItem('admin_settings', JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem('systemSettings', JSON.stringify(DEFAULT_SETTINGS));
  }
  const existingAuditLogs = localStorage.getItem('admin_audit_logs');
  if (!existingAuditLogs || existingAuditLogs.includes('Rampur')) {
    localStorage.setItem('admin_audit_logs', JSON.stringify(DEFAULT_AUDIT_LOGS));
    localStorage.setItem('auditLogs', JSON.stringify(DEFAULT_AUDIT_LOGS));
  }
};

// PHC Helpers
export const getPHCs = (): PHC[] => {
  initializeLocalStorage();
  return loadPHCs();
};

export const savePHCs = (phcs: PHC[]) => {
  savePHCsUtil(phcs);
};

// Users Helpers
export const getAdminUsers = (): AdminUser[] => {
  initializeLocalStorage();
  return loadUsers() as AdminUser[];
};

export const saveAdminUsers = (users: AdminUser[]) => {
  saveUsers(users as PersistedUser[]);
};

// Roles Helpers
export const getRolesPermissions = (): RolePermission[] => {
  initializeLocalStorage();
  return JSON.parse(localStorage.getItem('admin_roles_permissions') || '[]');
};

export const saveRolesPermissions = (roles: RolePermission[]) => {
  localStorage.setItem('admin_roles_permissions', JSON.stringify(roles));
};

// Settings Helpers
export const getSystemSettings = (): SystemSettings => {
  initializeLocalStorage();
  return loadSettings();
};

export const saveSystemSettings = (settings: SystemSettings) => {
  saveSettingsUtil(settings);
};

// Audit Logs Helpers
export const getAuditLogs = (): AuditLog[] => {
  initializeLocalStorage();
  return loadAudits();
};

export const saveAuditLogs = (logs: AuditLog[]) => {
  saveAuditsUtil(logs);
};

export const addAuditLog = (facility: string, user: string, event: string, severity: 'info' | 'warning' | 'success') => {
  addAuditUtil({
    facility,
    user,
    event,
    severity
  });
};

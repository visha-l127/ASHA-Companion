export type UserRole = 'admin' | 'supervisor' | 'asha' | 'pharmacist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  avatarUrl?: string;
  facilityName: string;
  facilityId?: string;
  status?: 'active' | 'inactive';
  mustChangePassword?: boolean;
}

export interface SyncRecord {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F' | 'O';
  village: string;
  status: 'synced' | 'pending' | 'failed';
  lastUpdated: string;
  diagnosis: string;
  treatment: string;
  workerId: string;
  type: 'maternal' | 'child_immunization' | 'ncd_screening' | 'general';
  phcFacility?: string;
  ashaName?: string;
  timestamp?: string;
  verificationStatus?: 'pending' | 'verified' | 'correction_requested';
  verifiedBy?: string;
  verifiedAt?: string;
  correctionNote?: string;
  data?: any;
}

export interface SyncStats {
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncTime: string | null;
  networkStatus: 'online' | 'offline' | 'poor';
}

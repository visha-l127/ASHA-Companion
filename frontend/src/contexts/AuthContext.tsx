import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, SyncRecord, SyncStats } from '../types';
import { INITIAL_RECORDS } from '../data/mockData';
import { getAdminUsers, saveAdminUsers, initializeLocalStorage } from '../pages/Admin/localStorageHelper';
import { verifyPassword, hashPassword } from '../utils/security';
import { generateToken, verifyToken } from '../utils/jwt';
import { authApi, adminApi } from '../utils/apiClient';

const mapBackendRole = (role: string): UserRole => {
  const lower = (role || '').toLowerCase();
  if (lower.includes('admin')) return 'admin';
  if (lower.includes('sup')) return 'supervisor';
  if (lower.includes('phar')) return 'pharmacist';
  return 'asha';
};

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  networkStatus: 'online' | 'offline' | 'poor';
  syncStats: SyncStats;
  records: SyncRecord[];
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; role: UserRole; token: string; mustChangePassword: boolean }>;
  updateUserPassword: (newPassword: string) => Promise<boolean>;
  logout: () => void;
  setNetworkStatus: (status: 'online' | 'offline' | 'poor') => void;
  syncPendingRecords: () => Promise<void>;
  addNewRecord: (record: Omit<SyncRecord, 'id' | 'status' | 'lastUpdated' | 'workerId'>) => void;
  updateRecordVerification: (recordId: string, verificationStatus: 'verified' | 'correction_requested', verifiedBy?: string, note?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<SyncRecord[]>([]);
  const [networkStatus, setLocalNetworkStatus] = useState<'online' | 'offline' | 'poor'>('online');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize Auth from JWT token & Records from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      initializeLocalStorage();
      const savedToken = sessionStorage.getItem('asha_ehr_token') || localStorage.getItem('asha_ehr_token');
      const savedUserStr = sessionStorage.getItem('asha_ehr_user') || localStorage.getItem('asha_ehr_user');

      if (savedToken && savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
          setToken(savedToken);
        } catch {
          setUser(null);
          setToken(null);
        }
      } else if (savedToken) {
        const { valid, payload } = verifyToken(savedToken);
        if (valid && payload) {
          const allUsers = getAdminUsers();
          const validUser = allUsers.find(
            (u) => u.id === payload.id || u.email.toLowerCase() === payload.email.toLowerCase() || u.username.toLowerCase() === payload.username?.toLowerCase()
          );

          if (validUser && validUser.status === 'active') {
            const activeUser: User = {
              id: validUser.id,
              name: validUser.name,
              email: validUser.email,
              role: validUser.role as UserRole,
              location: validUser.location || 'PHC Context',
              facilityName: validUser.facilityName || 'Health Center',
              facilityId: validUser.facilityId,
              status: validUser.status,
              avatarUrl: validUser.avatarUrl || undefined,
              mustChangePassword: !!validUser.mustChangePassword,
            };
            setUser(activeUser);
            setToken(savedToken);
          }
        }
      }

      const savedRecords = localStorage.getItem('asha_ehr_records');
      let initialList: SyncRecord[] = INITIAL_RECORDS;
      if (savedRecords) {
        try {
          initialList = JSON.parse(savedRecords);
        } catch (e) {
          initialList = INITIAL_RECORDS;
        }
      }

      // Merge local ASHA module records into central EHR records so Supervisor sees them
      const mergedRecords = syncLocalAshaToCentral(initialList);
      setRecords(mergedRecords);
      localStorage.setItem('asha_ehr_records', JSON.stringify(mergedRecords));

      const savedNetwork = localStorage.getItem('asha_ehr_network');
      if (savedNetwork) {
        setLocalNetworkStatus(savedNetwork as 'online' | 'offline' | 'poor');
      }

      const savedSyncTime = localStorage.getItem('asha_ehr_sync_time');
      if (savedSyncTime) {
        setLastSyncTime(savedSyncTime);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Synchronize network status with browser network status automatically
  useEffect(() => {
    const handleNetworkChange = () => {
      if (!navigator.onLine) {
        setLocalNetworkStatus('offline');
        localStorage.setItem('asha_ehr_network', 'offline');
      } else {
        const conn = (navigator as any).connection;
        if (conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g')) {
          setLocalNetworkStatus('poor');
          localStorage.setItem('asha_ehr_network', 'poor');
        } else {
          setLocalNetworkStatus('online');
          localStorage.setItem('asha_ehr_network', 'online');
        }
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // Initial check
    handleNetworkChange();

    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener('change', handleNetworkChange);
    }

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      if (conn) {
        conn.removeEventListener('change', handleNetworkChange);
      }
    };
  }, []);

  const login = async (identifier: string, password: string, rememberMe = false): Promise<{ success: boolean; role: UserRole; token: string; mustChangePassword: boolean }> => {
    setIsLoading(true);
    try {
      // Clear previous user session information completely
      setUser(null);
      setToken(null);
      localStorage.removeItem('asha_ehr_user');
      sessionStorage.removeItem('asha_ehr_user');
      localStorage.removeItem('asha_ehr_token');
      sessionStorage.removeItem('asha_ehr_token');

      const trimmedIdentifier = identifier.trim();
      if (!trimmedIdentifier || !password) {
        throw new Error('Username/Email and Password are required.');
      }

      // Try Live Backend API First
      try {
        const backendRes = await authApi.login({
          username: trimmedIdentifier,
          password: password,
        });

        if (backendRes && backendRes.token) {
          const userRole = mapBackendRole(backendRes.user.role);

          // Check if user is flagged for mustChangePassword in local user directory
          const allLocalUsers = getAdminUsers();
          const matchedLocal = allLocalUsers.find(
            (u) => (u.username && u.username.toLowerCase() === backendRes.user.username.toLowerCase()) || u.email.toLowerCase() === backendRes.user.username.toLowerCase()
          );

          const mustChange = matchedLocal ? !!matchedLocal.mustChangePassword : false;

          const loggedUser: User = {
            id: String(backendRes.user.id),
            name: backendRes.user.name || backendRes.user.username,
            email: backendRes.user.username.includes('@') ? backendRes.user.username : `${backendRes.user.username}@ashacompanion.org`,
            role: userRole,
            location: backendRes.user.phcId || 'PHC Primary Care',
            facilityName: backendRes.user.phcId ? `PHC ${backendRes.user.phcId}` : 'Main District Center',
            facilityId: backendRes.user.phcId,
            status: 'active',
            mustChangePassword: mustChange,
          };

          setUser(loggedUser);
          setToken(backendRes.token);

          if (rememberMe) {
            localStorage.setItem('asha_ehr_token', backendRes.token);
            localStorage.setItem('asha_ehr_user', JSON.stringify(loggedUser));
          } else {
            sessionStorage.setItem('asha_ehr_token', backendRes.token);
            sessionStorage.setItem('asha_ehr_user', JSON.stringify(loggedUser));
          }

          return {
            success: true,
            role: userRole,
            token: backendRes.token,
            mustChangePassword: mustChange,
          };
        }
      } catch (backendErr: any) {
        // If credentials failed on backend, throw exact backend error message
        if (backendErr.message && !backendErr.message.includes('Failed to fetch') && !backendErr.message.includes('NetworkError')) {
          throw backendErr;
        }
        console.warn('Backend service offline or unreachable, falling back to local storage auth:', backendErr);
      }

      // Fallback: Search credentials matching email or username from stored user directory
      const users = getAdminUsers();
      const matched = users.find(
        (u) => u.email.toLowerCase() === trimmedIdentifier.toLowerCase() || (u.username && u.username.toLowerCase() === trimmedIdentifier.toLowerCase())
      );

      if (!matched) {
        throw new Error('Invalid username/email or password.');
      }

      if (matched.status === 'inactive') {
        throw new Error('Your account status is currently suspended. Please contact your administrator.');
      }

      const isPasswordCorrect = verifyPassword(password, matched.password);
      if (!isPasswordCorrect) {
        throw new Error('Invalid username/email or password.');
      }

      const userRole = matched.role as UserRole;
      const issuedToken = generateToken({
        id: matched.id,
        name: matched.name,
        username: matched.username,
        email: matched.email,
        role: userRole,
        facilityId: matched.facilityId,
        facilityName: matched.facilityName,
        location: matched.location,
      });

      const loggedUser: User = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: userRole,
        location: matched.location || 'PHC Context',
        facilityName: matched.facilityName || 'Health Center',
        facilityId: matched.facilityId,
        status: matched.status,
        mustChangePassword: !!matched.mustChangePassword,
      };

      setUser(loggedUser);
      setToken(issuedToken);

      if (rememberMe) {
        localStorage.setItem('asha_ehr_token', issuedToken);
        localStorage.setItem('asha_ehr_user', JSON.stringify(loggedUser));
      } else {
        sessionStorage.setItem('asha_ehr_token', issuedToken);
        sessionStorage.setItem('asha_ehr_user', JSON.stringify(loggedUser));
      }

      return {
        success: true,
        role: userRole,
        token: issuedToken,
        mustChangePassword: !!matched.mustChangePassword,
      };
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPassword = async (newPassword: string): Promise<boolean> => {
    if (!user) throw new Error('No authenticated user session found.');

    try {
      const allUsers = getAdminUsers();
      const userIdent = user.email ? (user.email.includes('@') ? user.email.split('@')[0].toLowerCase() : user.email.toLowerCase()) : '';
      const index = allUsers.findIndex(
        (u) => u.id === user.id || 
               (u.email && u.email.toLowerCase() === user.email.toLowerCase()) || 
               (u.username && u.username.toLowerCase() === userIdent) ||
               (u.name && u.name.toLowerCase() === user.name.toLowerCase())
      );

      // Sync new password to Spring Boot backend Oracle DB via authApi.changePassword
      try {
        await authApi.changePassword({ newPassword });
      } catch (backendErr: any) {
        console.error('Backend password update error:', backendErr);
        throw new Error(backendErr?.message || 'Failed to update password on server.');
      }

      if (index !== -1) {
        const hashedPassword = hashPassword(newPassword);
        allUsers[index].password = hashedPassword;
        allUsers[index].mustChangePassword = false;
        allUsers[index].isActivated = true;
        saveAdminUsers(allUsers);
      }

      const updatedUser: User = {
        ...user,
        mustChangePassword: false,
      };

      let newToken = token;
      // Only generate a new token if we don't have a backend token 
      // (meaning the current token is a local token or doesn't exist)
      const { valid } = token ? verifyToken(token) : { valid: false };
      if (!token || valid) {
        newToken = generateToken({
          id: updatedUser.id,
          name: updatedUser.name,
          username: (index !== -1 && allUsers[index].username) ? allUsers[index].username : updatedUser.email,
          email: updatedUser.email,
          role: updatedUser.role,
          facilityId: updatedUser.facilityId,
          facilityName: updatedUser.facilityName,
          location: updatedUser.location,
        });
      }

      setUser(updatedUser);
      setToken(newToken);

      if (localStorage.getItem('asha_ehr_token')) {
        localStorage.setItem('asha_ehr_token', newToken);
        localStorage.setItem('asha_ehr_user', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('asha_ehr_token', newToken);
        sessionStorage.setItem('asha_ehr_user', JSON.stringify(updatedUser));
      }

      return true;
    } catch (err: any) {
      console.error('Error updating password:', err);
      throw new Error(err.message || 'An error occurred while saving your new password. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('asha_ehr_user');
    sessionStorage.removeItem('asha_ehr_user');
    localStorage.removeItem('asha_ehr_token');
    sessionStorage.removeItem('asha_ehr_token');
    sessionStorage.clear();
  };

  const setNetworkStatus = (status: 'online' | 'offline' | 'poor') => {
    setLocalNetworkStatus(status);
    localStorage.setItem('asha_ehr_network', status);
  };

  const syncPendingRecords = async () => {
    if (networkStatus === 'offline') {
      throw new Error('Cannot sync while offline. Please connect to internet.');
    }
    
    setIsSyncing(true);
    // Simulate latency based on connection status (poor vs online)
    const delay = networkStatus === 'poor' ? 3000 : 1000;
    
    await new Promise((resolve) => setTimeout(resolve, delay));

    const updatedRecords = records.map((rec) => {
      if (rec.status === 'pending' || rec.status === 'failed') {
        // If poor internet, some syncs might fail or take time. Let's make it successfully sync for demonstration
        return { ...rec, status: 'synced' as const, lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16) };
      }
      return rec;
    });

    setRecords(updatedRecords);
    localStorage.setItem('asha_ehr_records', JSON.stringify(updatedRecords));
    
    const nowStr = new Date().toLocaleString();
    setLastSyncTime(nowStr);
    localStorage.setItem('asha_ehr_sync_time', nowStr);
    setIsSyncing(false);
  };

// Helper to merge local ASHA records into central SyncRecord array
function syncLocalAshaToCentral(existingEhrRecords: SyncRecord[]): SyncRecord[] {
  const map = new Map<string, SyncRecord>();
  existingEhrRecords.forEach((r) => map.set(r.id, r));

  const syncKeys = [
    { key: 'asha_visits', type: 'ncd_screening' as const },
    { key: 'asha_maternal', type: 'maternal' as const },
    { key: 'asha_immunization', type: 'child_immunization' as const },
    { key: 'asha_nutrition', type: 'general' as const },
  ];

  syncKeys.forEach(({ key, type }) => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const items = JSON.parse(raw);
        items.forEach((item: any) => {
          if (!item.id) return;
          const existing = map.get(item.id);
          const rec: SyncRecord = {
            id: item.id,
            patientName: item.patientName || item.name || 'Unknown Patient',
            patientAge: existing?.patientAge || item.patientAge || item.age || 28,
            patientGender: existing?.patientGender || item.patientGender || item.gender || 'F',
            village: item.village || 'Madukkarai',
            phcFacility: item.phcFacility || 'Madukkarai PHC',
            status: item.status || 'synced',
            lastUpdated: item.lastUpdated || item.visitDate || new Date().toISOString(),
            diagnosis: item.purpose ? `Visit: ${item.purpose}` : item.vaccineName ? `Vaccine: ${item.vaccineName}` : item.weightForAgeStatus ? `Nutrition: ${item.weightForAgeStatus}` : 'Health Record',
            treatment: item.referralNeeded ? `Referred to ${item.referralFacility || 'PHC'}` : item.dosageInstructions || 'Routine Field Care',
            workerId: item.workerId || 'asha-01',
            type,
            verificationStatus: existing?.verificationStatus || item.verificationStatus || 'pending',
            verifiedBy: existing?.verifiedBy || item.verifiedBy,
            verifiedAt: existing?.verifiedAt || item.verifiedAt,
            correctionNote: existing?.correctionNote || item.correctionNote,
            data: item,
          };
          map.set(item.id, rec);
        });
      } catch (e) {
        // Ignore parse error
      }
    }
  });

  return Array.from(map.values());
}

  const addNewRecord = (newRec: Omit<SyncRecord, 'id' | 'status' | 'lastUpdated' | 'workerId'>) => {
    const freshRecord: SyncRecord = {
      ...newRec,
      id: `REC-${crypto.randomUUID()}`,
      status: networkStatus === 'online' ? 'synced' : 'pending',
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      workerId: user?.id || 'asha-01'
    };

    const newRecordsList = [freshRecord, ...records];
    setRecords(newRecordsList);
    localStorage.setItem('asha_ehr_records', JSON.stringify(newRecordsList));
  };

  const updateRecordVerification = (recordId: string, verificationStatus: 'verified' | 'correction_requested', verifiedBy?: string, note?: string) => {
    const verifierName = verifiedBy || user?.name || 'PHC Supervisor';
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updated = records.map((r) => {
      if (r.id === recordId) {
        return {
          ...r,
          verificationStatus,
          verifiedBy: verifierName,
          verifiedAt: nowIso,
          correctionNote: note || r.correctionNote,
        };
      }
      return r;
    });
    setRecords(updated);
    localStorage.setItem('asha_ehr_records', JSON.stringify(updated));

    // Propagate verification status back to individual module storage keys so ASHA sees it
    const moduleKeys = ['asha_visits', 'asha_maternal', 'asha_immunization', 'asha_nutrition', 'asha_patients'];
    moduleKeys.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          let changed = false;
          const updatedList = list.map((item: any) => {
            if (item.id === recordId) {
              changed = true;
              return {
                ...item,
                verificationStatus,
                verifiedBy: verifierName,
                verifiedAt: nowIso,
                correctionNote: note || item.correctionNote,
              };
            }
            return item;
          });
          if (changed) {
            localStorage.setItem(key, JSON.stringify(updatedList));
          }
        } catch (e) {
          // Ignore
        }
      }
    });
  };

  // Listen for force logout event on expired token/401 API responses
  useEffect(() => {
    const handleForceLogout = () => {
      logout();
    };
    window.addEventListener('auth_logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth_logout', handleForceLogout);
    };
  }, []);

  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const syncedCount = records.filter((r) => r.status === 'synced').length;
  const failedCount = records.filter((r) => r.status === 'failed').length;

  const syncStats: SyncStats = {
    pendingCount,
    syncedCount,
    failedCount,
    lastSyncTime,
    networkStatus
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        token,
        isAuthenticated: !!user,
        isLoading,
        networkStatus,
        syncStats,
        records,
        login,
        updateUserPassword,
        logout,
        setNetworkStatus,
        syncPendingRecords,
        addNewRecord,
        updateRecordVerification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

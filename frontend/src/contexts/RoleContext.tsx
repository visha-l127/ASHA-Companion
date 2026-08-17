import React, { createContext, useContext } from 'react';
import { UserRole } from '../types';
import { useAuth } from './AuthContext';

interface RoleContextType {
  role: UserRole | null;
  facilityName: string | null;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  canAccessPHC: (phcName: string) => boolean;
  canManageUserRole: (targetRole: UserRole) => boolean;
  isAdmin: boolean;
  isASHA: boolean;
  isSupervisor: boolean;
  isPharmacist: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const role = user ? user.role : null;
  const facilityName = user ? user.facilityName : null;

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const canAccessPHC = (phcName: string): boolean => {
    if (!role) return false;
    if (role === 'admin') return true; // District Admin can view all PHCs
    if (!facilityName) return false;
    return facilityName.toLowerCase().includes(phcName.toLowerCase()) || 
           phcName.toLowerCase().includes(facilityName.toLowerCase());
  };

  const canManageUserRole = (targetRole: UserRole): boolean => {
    if (!role) return false;
    if (role === 'admin') {
      // District Admin ONLY creates & manages PHC Supervisors
      return targetRole === 'supervisor';
    }
    if (role === 'supervisor') {
      // PHC Supervisor creates & manages ASHAs and Pharmacists for their PHC
      return targetRole === 'asha' || targetRole === 'pharmacist';
    }
    return false;
  };

  const isAdmin = role === 'admin';
  const isASHA = role === 'asha';
  const isSupervisor = role === 'supervisor';
  const isPharmacist = role === 'pharmacist';

  return (
    <RoleContext.Provider
      value={{
        role,
        facilityName,
        hasRole,
        canAccessPHC,
        canManageUserRole,
        isAdmin,
        isASHA,
        isSupervisor,
        isPharmacist
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};


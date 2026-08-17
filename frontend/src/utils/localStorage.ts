import { UserRole } from '../types';
import { hashPassword } from './security';

export interface PersistedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  assignedPHC: string;
  status: 'active' | 'inactive';
  password?: string | null;
  isActivated?: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;

  // Backwards compatibility properties:
  contactNumber?: string;
  facilityId?: string;
  facilityName?: string;
  location?: string;
}

// Maps PHC name to its ID and location context
const getPHCDetails = (phcName: string) => {
  const nameLower = phcName.toLowerCase();
  if (nameLower.includes('madukkarai')) {
    return { facilityId: 'phc-1', facilityName: 'Madukkarai PHC', location: 'Madukkarai Village' };
  } else if (nameLower.includes('thondamuthur')) {
    return { facilityId: 'phc-2', facilityName: 'Thondamuthur PHC', location: 'Thondamuthur Sector' };
  } else if (nameLower.includes('sulur')) {
    return { facilityId: 'phc-3', facilityName: 'Sulur PHC', location: 'Sulur Block' };
  } else if (nameLower.includes('karamadai')) {
    return { facilityId: 'phc-4', facilityName: 'Karamadai PHC', location: 'Karamadai Sector' };
  } else if (nameLower.includes('admin') || nameLower.includes('office') || nameLower.includes('headquarter')) {
    return { facilityId: 'phc-4', facilityName: 'District Health Administration Office', location: 'District Headquarter' };
  }
  return { facilityId: 'phc-1', facilityName: phcName || 'Madukkarai PHC', location: 'Madukkarai Village' };
};

// Default users matching first run specifications (all passwords BCrypt hashed)
const DEFAULT_USERS: PersistedUser[] = [
  {
    id: 'usr-admin-1',
    name: 'Administrator',
    username: 'admin',
    email: 'admin@ashacompanion.org',
    phone: '+91 90000 11111',
    role: 'admin',
    assignedPHC: 'District Health Administration Office',
    status: 'active',
    password: hashPassword('Admin@123'),
    isActivated: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contactNumber: '+91 90000 11111',
    facilityId: 'phc-4',
    facilityName: 'District Health Administration Office',
    location: 'District Headquarter'
  },
  {
    id: 'usr-admin-2',
    name: 'Vishal Admin',
    username: 'vishal.admin',
    email: 'admin@companion.org',
    phone: '+91 90000 11111',
    role: 'admin',
    assignedPHC: 'District Health Administration Office',
    status: 'active',
    password: hashPassword('Admin@123'),
    isActivated: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contactNumber: '+91 90000 11111',
    facilityId: 'phc-4',
    facilityName: 'District Health Administration Office',
    location: 'District Headquarter'
  },
  {
    id: 'usr-supervisor-1',
    name: 'Dr. Meena Rao',
    username: 'dr.meena',
    email: 'supervisor@companion.org',
    phone: '+91 94421 00102',
    role: 'supervisor',
    assignedPHC: 'Madukkarai PHC',
    status: 'active',
    password: hashPassword('Supervisor@123'),
    isActivated: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contactNumber: '+91 94421 00102',
    facilityId: 'phc-1',
    facilityName: 'Madukkarai PHC',
    location: 'Madukkarai Sector'
  }
];

export const loadUsers = (): PersistedUser[] => {
  const usersJson = localStorage.getItem('users');
  if (!usersJson) {
    // First run initialization: Save and return default users
    saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  try {
    const parsed = JSON.parse(usersJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Return parsed users and ensure backwards compatibility properties are mapped
      const mappedList = parsed.map((user: any) => {
        const mappedUser = { ...user };
        
        // Map required fields to backward-compatible fields if not present
        if (!mappedUser.contactNumber) mappedUser.contactNumber = mappedUser.phone;
        if (!mappedUser.phone) mappedUser.phone = mappedUser.contactNumber || '';
        
        if (!mappedUser.assignedPHC) mappedUser.assignedPHC = mappedUser.facilityName || 'Madukkarai PHC';
        if (!mappedUser.facilityName) mappedUser.facilityName = mappedUser.assignedPHC;

        const phcDetails = getPHCDetails(mappedUser.assignedPHC);
        if (!mappedUser.facilityId) mappedUser.facilityId = phcDetails.facilityId;
        if (!mappedUser.location) mappedUser.location = phcDetails.location;

        return mappedUser;
      });

      // Ensure admin default user is always available
      if (!mappedList.some((u: any) => u.username === 'admin')) {
        mappedList.unshift(DEFAULT_USERS[0]);
      }

      // Filter out Sunita Kumari and Arjun Menon permanently
      const filteredList = mappedList.filter(
        (u: any) => u.email !== 'sunita@companion.org' && u.email !== 'pharmacist@companion.org'
      );

      // Save the cleaned up list back to localStorage
      if (filteredList.length !== parsed.length) {
        localStorage.setItem('users', JSON.stringify(filteredList));
      }

      return filteredList;
    }
  } catch (error) {
    console.error('Error loading users from localStorage, resetting to defaults.', error);
  }

  // Fallback to seeding default users
  saveUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
};

export const saveUsers = (users: PersistedUser[]): void => {
  // Ensure that all users in the array have all fields synchronized
  const sanitizedUsers = users.map((user) => {
    const synchronized = { ...user };
    
    // Sync phone and contactNumber
    if (!synchronized.phone && synchronized.contactNumber) {
      synchronized.phone = synchronized.contactNumber;
    }
    if (!synchronized.contactNumber && synchronized.phone) {
      synchronized.contactNumber = synchronized.phone;
    }

    // Sync assignedPHC and facilityName
    if (!synchronized.assignedPHC && synchronized.facilityName) {
      synchronized.assignedPHC = synchronized.facilityName;
    }
    if (!synchronized.facilityName && synchronized.assignedPHC) {
      synchronized.facilityName = synchronized.assignedPHC;
    }

    const phcDetails = getPHCDetails(synchronized.assignedPHC || 'Madukkarai PHC');
    if (!synchronized.facilityId) synchronized.facilityId = phcDetails.facilityId;
    if (!synchronized.location) synchronized.location = phcDetails.location;

    // Default timestamps
    if (!synchronized.createdAt) synchronized.createdAt = new Date().toISOString();
    if (!synchronized.updatedAt) synchronized.updatedAt = new Date().toISOString();

    return synchronized;
  });

  localStorage.setItem('users', JSON.stringify(sanitizedUsers));
  
  // Also synchronize with 'admin_users' to keep existing dashboard/management views operating smoothly
  localStorage.setItem('admin_users', JSON.stringify(sanitizedUsers));
};

export const addUser = (user: Omit<PersistedUser, 'id' | 'createdAt' | 'updatedAt'>): PersistedUser => {
  const users = loadUsers();
  const newUser: PersistedUser = {
    ...user,
    id: `usr-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  return newUser;
};

export const updateUser = (updatedUser: PersistedUser): PersistedUser => {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  
  const updatedWithTimestamp = {
    ...updatedUser,
    updatedAt: new Date().toISOString(),
  };

  if (index !== -1) {
    users[index] = updatedWithTimestamp;
  } else {
    users.push(updatedWithTimestamp);
  }

  saveUsers(users);
  return updatedWithTimestamp;
};

export const deleteUser = (userId: string): boolean => {
  const users = loadUsers();
  const filtered = users.filter((u) => u.id !== userId);
  
  if (filtered.length !== users.length) {
    saveUsers(filtered);
    return true;
  }
  return false;
};

export const findUser = (query: (user: PersistedUser) => boolean): PersistedUser | undefined => {
  const users = loadUsers();
  return users.find(query);
};

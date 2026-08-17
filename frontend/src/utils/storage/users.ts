import { loadUsers, saveUsers, addUser, deleteUser, PersistedUser } from '../localStorage';

export const load = (): PersistedUser[] => {
  return loadUsers();
};

export const save = (users: PersistedUser[]): void => {
  saveUsers(users);
};

export const add = (user: Omit<PersistedUser, 'id' | 'createdAt' | 'updatedAt'>): PersistedUser => {
  return addUser(user);
};

export const update = (id: string, fields: Partial<PersistedUser>): PersistedUser | null => {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    const updated = {
      ...users[index],
      ...fields,
      updatedAt: new Date().toISOString()
    };
    users[index] = updated;
    saveUsers(users);
    return updated;
  }
  return null;
};

export const remove = (id: string): boolean => {
  return deleteUser(id);
};

// Expose standard "delete" but using the name "delete" might conflict with reserve word if not handled carefully, so we name the export as deleteUserFn or delete_ (or use delete as a property name on object/export)
export { remove as delete };

export const findById = (id: string): PersistedUser | undefined => {
  const users = loadUsers();
  return users.find(u => u.id === id);
};

export const findAll = (): PersistedUser[] => {
  return loadUsers();
};

export const search = (query: string): PersistedUser[] => {
  const users = loadUsers();
  const q = query.toLowerCase();
  return users.filter(u => 
    u.name.toLowerCase().includes(q) || 
    u.username.toLowerCase().includes(q) || 
    u.email.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  );
};

export const filter = (predicate: (item: PersistedUser) => boolean): PersistedUser[] => {
  const users = loadUsers();
  return users.filter(predicate);
};

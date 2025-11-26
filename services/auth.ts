import { User } from '../types';

// Stored users interface with password hash simulation
interface StoredUser extends User {
  passwordHash: string;
}

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'admin-1',
    email: 'info@writgo.nl',
    name: 'Writgo Admin',
    role: 'ADMIN',
    avatarUrl: 'https://ui-avatars.com/api/?name=Writgo+Admin&background=3b82f6&color=fff',
    passwordHash: 'CM120309cm!!' // In production, this would be properly hashed
  }
];

const STORAGE_KEY_USERS = 'writgo_users';
const STORAGE_KEY_AUTH = 'writgo_auth_user';
const STORAGE_KEY_SESSION = 'writgo_session';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a simple session token
const generateSessionToken = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Get all users from storage
export const getUsers = (): StoredUser[] => {
  const stored = localStorage.getItem(STORAGE_KEY_USERS);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default users
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
};

// Save users to storage
const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

// Get users without password hashes for display
export const getUsersForDisplay = (): User[] => {
  return getUsers().map(({ passwordHash, ...user }) => user);
};

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800); // Fake network latency

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user && user.passwordHash === password) {
    const sessionToken = generateSessionToken();
    const { passwordHash, ...userWithoutPassword } = user;
    
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userWithoutPassword));
    localStorage.setItem(STORAGE_KEY_SESSION, sessionToken);
    
    return userWithoutPassword;
  }
  
  throw new Error('Ongeldige inloggegevens');
};

export const logout = async (): Promise<void> => {
  await delay(200);
  localStorage.removeItem(STORAGE_KEY_AUTH);
  localStorage.removeItem(STORAGE_KEY_SESSION);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY_AUTH);
  const session = localStorage.getItem(STORAGE_KEY_SESSION);
  
  if (stored && session) {
    return JSON.parse(stored);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// Create a new user (admin only)
export const createUser = async (
  email: string, 
  password: string, 
  name: string, 
  role: 'ADMIN' | 'USER' = 'USER'
): Promise<User> => {
  await delay(500);
  
  const users = getUsers();
  
  // Check if email already exists
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Een gebruiker met dit e-mailadres bestaat al');
  }
  
  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    email,
    name,
    role,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${role === 'ADMIN' ? '3b82f6' : '10b981'}&color=fff`,
    passwordHash: password
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const { passwordHash, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Update user (admin only)
export const updateUser = async (
  userId: string,
  updates: { name?: string; email?: string; role?: 'ADMIN' | 'USER'; password?: string }
): Promise<User> => {
  await delay(500);
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Gebruiker niet gevonden');
  }
  
  // Check email uniqueness if email is being updated
  if (updates.email && updates.email.toLowerCase() !== users[userIndex].email.toLowerCase()) {
    if (users.find(u => u.email.toLowerCase() === updates.email!.toLowerCase())) {
      throw new Error('Een gebruiker met dit e-mailadres bestaat al');
    }
  }
  
  const updatedUser: StoredUser = {
    ...users[userIndex],
    ...(updates.name && { name: updates.name }),
    ...(updates.email && { email: updates.email }),
    ...(updates.role && { role: updates.role }),
    ...(updates.password && { passwordHash: updates.password }),
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(updates.name || users[userIndex].name)}&background=${(updates.role || users[userIndex].role) === 'ADMIN' ? '3b82f6' : '10b981'}&color=fff`
  };
  
  users[userIndex] = updatedUser;
  saveUsers(users);
  
  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

// Delete user (admin only)
export const deleteUser = async (userId: string): Promise<void> => {
  await delay(500);
  
  const users = getUsers();
  const currentUser = getCurrentUser();
  
  // Prevent deleting yourself
  if (currentUser && currentUser.id === userId) {
    throw new Error('Je kunt je eigen account niet verwijderen');
  }
  
  // Prevent deleting the last admin
  const admins = users.filter(u => u.role === 'ADMIN');
  const userToDelete = users.find(u => u.id === userId);
  
  if (userToDelete?.role === 'ADMIN' && admins.length <= 1) {
    throw new Error('Je kunt de laatste admin niet verwijderen');
  }
  
  const filteredUsers = users.filter(u => u.id !== userId);
  saveUsers(filteredUsers);
};
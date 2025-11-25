import { User } from '../types';

const MOCK_ADMIN: User = {
  id: 'admin-1',
  email: 'info@writgo.nl',
  name: 'Writgo Admin',
  role: 'ADMIN',
  avatarUrl: 'https://ui-avatars.com/api/?name=Writgo+Admin&background=3b82f6&color=fff'
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800); // Fake network latency

  if (email === 'info@writgo.nl' && password === 'CM120309cm!!') {
    localStorage.setItem('writgo_auth_user', JSON.stringify(MOCK_ADMIN));
    return MOCK_ADMIN;
  }
  
  throw new Error('Ongeldige inloggegevens');
};

export const logout = async (): Promise<void> => {
  await delay(200);
  localStorage.removeItem('writgo_auth_user');
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('writgo_auth_user');
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
}
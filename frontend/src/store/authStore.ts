import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  userRole: 'ADMIN' | 'EMPLOYEE';
  setRole: (role: 'ADMIN' | 'EMPLOYEE') => void;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  userRole: (localStorage.getItem('userRole') as 'ADMIN' | 'EMPLOYEE') || 'ADMIN',
  setRole: (role) => {
    localStorage.setItem('userRole', role);
    set({ userRole: role });
  },
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));

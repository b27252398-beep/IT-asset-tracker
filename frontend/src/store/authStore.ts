import { create } from 'zustand';

type UserRole = 'ADMIN' | 'EMPLOYEE' | 'TECH_TEAM';

interface AuthState {
  token: string | null;
  user: any | null;
  userRole: UserRole;
  setRole: (role: UserRole) => void;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  userRole: (localStorage.getItem('userRole') as UserRole) || 'ADMIN',

  setRole: (role) => {
    localStorage.setItem('userRole', role);
    set({ userRole: role });
  },

  // Auto-sets role from user.role returned by the login API
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    const role: UserRole = (user?.role as UserRole) || 'ADMIN';
    localStorage.setItem('userRole', role);
    set({ token, user, userRole: role });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    set({ token: null, user: null, userRole: 'ADMIN' });
  },
}));

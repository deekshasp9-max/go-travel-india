import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gotravel_user', JSON.stringify(user));
      localStorage.setItem('gotravel_token', token);
    }
    set({ user, token, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gotravel_user');
      localStorage.removeItem('gotravel_token');
    }
    set({ user: null, token: null, isLoading: false });
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  },

  checkSession: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    const savedUser = localStorage.getItem('gotravel_user');
    const savedToken = localStorage.getItem('gotravel_token');
    if (savedUser && savedToken) {
      try {
        set({ user: JSON.parse(savedUser), token: savedToken, isLoading: false });
      } catch {
        set({ user: null, token: null, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));

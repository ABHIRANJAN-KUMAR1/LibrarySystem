import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, removeToken, setToken, authAPI } from '@/services/api';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  reputation_points: number;
  username: string;
  full_name?: string;
  member_id?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, captchaId?: string, captchaAnswer?: number) => Promise<void>;
  register: (email: string, password: string, role?: 'admin' | 'user', fullName?: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Try to fetch user info or validate token
          // For now, we'll assume the token is valid and extract user info from it
          // In production, you'd have a separate endpoint to fetch current user
          const decoded = parseJwt(token);
          if (decoded) {
            setUser(decoded);
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, captchaId?: string, captchaAnswer?: number) => {
    try {
      const response = await authAPI.login(email, password, captchaId, captchaAnswer);
      const { access: token, user: userData } = response.data;
      
      setToken(token);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, role: 'admin' | 'user' = 'user', fullName: string = ''): Promise<any> => {
    try {
      const response = await authAPI.register(email, password, role, fullName);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to parse JWT
function parseJwt(token: string): User | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return {
      id: payload.user_id || payload.id,
      email: payload.email,
      role: payload.role || 'user',
      reputation_points: payload.reputation_points || 0,
      username: payload.username || payload.email?.split('@')[0] || 'User',
      avatar: payload.avatar,
    };
  } catch (error) {
    return null;
  }
}

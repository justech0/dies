
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'advisor' | 'user';
  phone?: string;
  image?: string;
  instagram?: string;
  facebook?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
        const token = localStorage.getItem('dies_token');
        if (token) {
            try {
                const userData = await api.auth.me();
                setUser(userData);
            } catch (error) {
                console.error("Session expired or invalid", error);
                localStorage.removeItem('dies_token');
            }
        }
        setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    // If token is provided (fresh login), save it. 
    // If updating profile (no token param), keep existing token.
    if (token) {
        localStorage.setItem('dies_token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dies_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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

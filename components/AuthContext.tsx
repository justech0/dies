
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
  // İlk yüklemede localStorage'dan veriyi alarak "disappearing name" sorununu çözüyoruz
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('dies_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
        const token = localStorage.getItem('dies_token');
        if (token) {
            try {
                const userData = await api.auth.me();
                setUser(userData);
                localStorage.setItem('dies_user', JSON.stringify(userData));
            } catch (error) {
                // Eğer hata 404 ise (backend hazır değilse) oturumu kapatma, eldeki veriyi koru
                const err = error as Error;
                if (err.message?.includes('401') || err.message?.includes('token')) {
                    logout();
                }
                console.warn("Auth check failed (likely no backend):", error);
            }
        } else {
            setUser(null);
            localStorage.removeItem('dies_user');
        }
        setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('dies_user', JSON.stringify(userData));
    if (token) {
        localStorage.setItem('dies_token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dies_token');
    localStorage.removeItem('dies_user');
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

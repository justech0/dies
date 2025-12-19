
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
  const [user, setUser] = useState<User | null>(() => {
    // Başlangıçta localStorage'dan önbelleğe alınmış kullanıcıyı oku
    const savedUser = localStorage.getItem('dies_user');
    return savedUser ? JSON.parse(savedUser) : null;
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
                console.error("Oturum geçersiz veya süresi dolmuş", error);
                // Sadece API gerçekten hata verirse temizle (404 hariç)
                if ((error as Error).message?.includes('401') || (error as Error).message?.includes('token')) {
                    logout();
                }
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

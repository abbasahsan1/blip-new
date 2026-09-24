import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, removeToken, saveToken } from '../services/auth';
import { loginApi, signupApi } from '../services/api';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, username: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadToken() {
      try {
        const stored = await getToken();
        if (stored) {
          setToken(stored);
        }
      } catch (err) {
        console.warn('Failed to load auth token:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await loginApi(email, pass);
    await saveToken(data.access_token);
    setToken(data.access_token);
  };

  const signup = async (email: string, username: string, pass: string) => {
    const data = await signupApi(email, username, pass);
    await saveToken(data.access_token);
    setToken(data.access_token);
  };

  const logout = async () => {
    await removeToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

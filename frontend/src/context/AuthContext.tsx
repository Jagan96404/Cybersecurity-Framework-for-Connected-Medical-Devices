import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS = {
  administrator: { email: 'admin@medsentinel.hospital', pass: 'Admin@123', label: 'Admin (CISO)' },
  security_analyst: { email: 'analyst@medsentinel.hospital', pass: 'Analyst@123', label: 'Security Analyst' },
  clinician: { email: 'clinician@medsentinel.hospital', pass: 'Clinician@123', label: 'ICU Clinician (MD)' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('medsentinel_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('medsentinel_token');
      if (savedToken) {
        try {
          const u = await api.getMe();
          setUser(u);
        } catch (e) {
          localStorage.removeItem('medsentinel_token');
          setToken(null);
          // Fallback to default admin for quick demo usage
          await switchDemoRole('administrator');
        }
      } else {
        // Auto-login as administrator so user sees the website immediately!
        await switchDemoRole('administrator');
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('medsentinel_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    const creds = DEMO_CREDENTIALS[targetRole];
    if (creds) {
      try {
        await login(creds.email, creds.pass);
      } catch (err) {
        console.error("Demo login error:", err);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('medsentinel_token');
    setToken(null);
    setUser(null);
  };

  const role = user?.role || 'administrator';

  return (
    <AuthContext.Provider value={{ user, role, token, login, switchDemoRole, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

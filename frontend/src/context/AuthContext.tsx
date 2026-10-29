import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthSession, getStoredSession, loginArtist, logoutArtist } from '../services/auth';

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  useEffect(() => {
    const s = getStoredSession();
    if (s && s.expiresAt > Date.now()) {
      setSession(s);
    } else {
      setSession(null);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const newSession = await loginArtist(email, pass);
    setSession(newSession);
  };

  const logout = () => {
    logoutArtist();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

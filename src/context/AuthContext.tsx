import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, logout as logoutApi } from '../lib/auth';
import type { AuthSessionUser } from '../lib/session';
import {
  AUTH_USER_KEY,
  clearStoredUser,
  getDisplayName,
  readStoredUser,
  writeStoredUser,
} from '../lib/session';

interface AuthContextValue {
  user: AuthSessionUser | null;
  isAuthenticated: boolean;
  displayName: string;
  setAuthenticatedUser: (user: AuthSessionUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSessionUser | null>(() => readStoredUser());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== AUTH_USER_KEY) {
        return;
      }

      setUser(readStoredUser());
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    void getCurrentUser()
      .then((nextUser) => {
        if (cancelled) {
          return;
        }
        writeStoredUser(nextUser);
        setUser(nextUser);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        clearStoredUser();
        setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const setAuthenticatedUser = (nextUser: AuthSessionUser) => {
    writeStoredUser(nextUser);
    setUser(nextUser);
  };

  const logout = () => {
    void logoutApi().catch(() => undefined);
    clearStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        displayName: getDisplayName(user),
        setAuthenticatedUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

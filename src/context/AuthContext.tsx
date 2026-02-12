import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearStoredSession, getStoredSession, storeSession } from '../storage/authStorage';
import { isSessionValid, signIn as signInService } from '../services/authService';
import type { AuthSession, SignInPayload } from '../types/Auth';

interface AuthContextValue {
  isLoading: boolean;
  session: AuthSession | null;
  isAuthenticated: boolean;
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  const loadSession = useCallback(async () => {
    const stored = await getStoredSession();

    if (stored && isSessionValid(stored)) {
      setSession(stored);
    } else {
      setSession(null);
      await clearStoredSession();
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signIn = useCallback(async (payload: SignInPayload) => {
    const newSession = await signInService(payload);
    await storeSession(newSession);
    setSession(newSession);
  }, []);

  const signOut = useCallback(async () => {
    await clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      session,
      isAuthenticated: Boolean(session),
      signIn,
      signOut,
    }),
    [isLoading, session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

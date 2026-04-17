import React, { createContext, useContext, useEffect, useState } from 'react';
import { siteData } from '@/api/siteDataClient';

const AuthContext = createContext();

const AUTH_REQUIRED = 'auth_required';
const INVALID_CREDENTIALS = 'invalid_credentials';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await siteData.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
      return currentUser;
    } catch (error) {
      if (error?.status === 401) {
        setAuthError({ type: AUTH_REQUIRED, message: 'Authentication required.' });
      } else {
        setAuthError({ type: 'unknown', message: error?.message || 'Authentication check failed.' });
      }
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const login = async (email, password) => {
    setIsLoadingAuth(true);
    try {
      await siteData.auth.login(email, password);
      const currentUser = await siteData.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
      return currentUser;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      if (error?.status === 401 || error?.status === 429) {
        setAuthError({ type: INVALID_CREDENTIALS, message: error.message });
      } else {
        setAuthError({ type: 'unknown', message: error?.message || 'Login failed.' });
      }
      throw error;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await siteData.auth.logout();
    } catch {
      // Ignore logout transport errors and clear local auth state anyway.
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: AUTH_REQUIRED, message: 'Authentication required.' });
      if (shouldRedirect && typeof window !== 'undefined') {
        const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.href = `/admin/login?next=${next}`;
      }
    }
  };

  const navigateToLogin = () => {
    if (typeof window === 'undefined') return;
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    siteData.auth.redirectToLogin(`/admin/login?next=${next}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        appPublicSettings: null,
        authChecked,
        login,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState: checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

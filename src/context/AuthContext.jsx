import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchMe,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  setAccessToken,
} from '../api';

const TOKEN_STORAGE_KEY = 'kanbanfocus_access_token';

const AuthContext = createContext(null);

const extractAccessToken = (payload) =>
  payload?.access_token ??
  payload?.accessToken ??
  payload?.token ??
  payload?.data?.access_token ??
  payload?.data?.accessToken ??
  payload?.data?.token ??
  null;

const extractUser = (payload) => payload?.user ?? payload?.data?.user ?? payload ?? null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearAuthState = useCallback(() => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const applyAccessToken = useCallback((token) => {
    setAccessToken(token);
    setAccessTokenState(token);

    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const response = await fetchMe();
    const nextUser = extractUser(response.data);
    setUser(nextUser);
    return nextUser;
  }, []);

  const ensureAccessToken = useCallback(
    async (payload) => {
      let token = extractAccessToken(payload);

      if (!token) {
        try {
          const refreshResponse = await refreshToken();
          token = extractAccessToken(refreshResponse.data);
        } catch {
          token = null;
        }
      }

      if (token) {
        applyAccessToken(token);
      }

      return token;
    },
    [applyAccessToken],
  );

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        setIsInitializing(false);
        return;
      }

      applyAccessToken(storedToken);

      try {
        await loadCurrentUser();
      } catch {
        try {
          const refreshResponse = await refreshToken();
          const refreshedToken = extractAccessToken(refreshResponse.data);

          if (refreshedToken) {
            applyAccessToken(refreshedToken);
          }

          await loadCurrentUser();
        } catch {
          clearAuthState();
        }
      } finally {
        setIsInitializing(false);
      }
    };

    bootstrapAuth();
  }, [applyAccessToken, clearAuthState, loadCurrentUser]);

  const login = useCallback(
    async ({ identifier, password }) => {
      const attempts = [
        { email: identifier, password },
        { username: identifier, password },
      ];

      let response = null;
      let lastError = null;

      for (const payload of attempts) {
        try {
          response = await loginUser(payload);
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!response) {
        throw lastError;
      }

      await ensureAccessToken(response.data);

      try {
        await loadCurrentUser();
      } catch (error) {
        const fallbackUser = extractUser(response.data);
        if (fallbackUser) {
          setUser(fallbackUser);
        } else {
          throw error;
        }
      }
    },
    [ensureAccessToken, loadCurrentUser],
  );

  const register = useCallback(
    async ({ username, email, password }) => {
      const response = await registerUser({ username, email, password });
      const token = await ensureAccessToken(response.data);

      if (!token) {
        await login({ identifier: email, password });
        return response.data;
      }

      try {
        await loadCurrentUser();
      } catch {
        const nextUser = extractUser(response.data);
        if (nextUser) {
          setUser(nextUser);
        } else {
          await login({ identifier: email, password });
        }
      }

      return response.data;
    },
    [ensureAccessToken, loadCurrentUser, login],
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isInitializing,
      login,
      register,
      logout,
    }),
    [accessToken, isInitializing, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auror_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('auror_token') || null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Sync token changes to API client layer automatically via localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('auror_token', token);
    } else {
      localStorage.removeItem('auror_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auror_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auror_user');
    }
  }, [user]);

  // Attempt to re-authenticate / fetch profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      let currentToken = token;
      
      // Capture token from URL if we just redirected back from GitHub OAuth
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        currentToken = urlToken;
        setToken(urlToken);
        // Remove token from the URL for security and clean UI
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (currentToken && !user) {
        try {
          // Since the API client might not have the new token in localStorage yet,
          // it will automatically pick it up if we set it in localStorage here first,
          // or we ensure the API client reads the latest token from localStorage.
          if (urlToken) {
             localStorage.setItem('auror_token', urlToken);
          }
          
          const res = await api.auth.getMe();
          setUser({
            id: res.user.id,
            name: res.user.username,
            team: res.claims.university_id === 1 ? 'Jacked Nerds' : 'Other',
            avatar: res.user.avatar_url || 'https://github.com/identicons/default.png',
            trustIndex: res.user.trust_score,
            codeIntegrity: res.user.code_integrity,
            velocityScore: res.user.velocity_score,
            telemetryStream: res.user.telemetryStream || [],
            skills: res.user.skills || []
          });
        } catch (err) {
          console.error("Session expired or backend unavailable", err);
          logout();
        }
      }
    };
    initAuth();
  }, []);

  const loginWithGitHub = async () => {
    setIsAuthenticating(true);
    try {
      const res = await api.auth.getGithubLoginUrl();
      if (res && res.auth_url) {
        window.location.href = res.auth_url;
      }
    } catch (err) {
      console.error("Failed to fetch GitHub OAuth URL", err);
      setIsAuthenticating(false);
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auror_user');
    localStorage.removeItem('auror_token');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.auth.getMe();
      setUser((prev) => ({
        ...prev,
        trustIndex: res.user.trust_score,
        codeIntegrity: res.user.code_integrity,
        velocityScore: res.user.velocity_score,
        telemetryStream: res.user.telemetryStream || [],
        skills: res.user.skills || []
      }));
    } catch (err) {
      console.error("Failed to refresh profile", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAuthenticating,
        loginWithGitHub,
        logout,
        refreshProfile
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

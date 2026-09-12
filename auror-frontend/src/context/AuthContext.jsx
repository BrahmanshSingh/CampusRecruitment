import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../data/mockUser';
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
      if (token && !user) {
        try {
          const res = await api.auth.getMe();
          setUser({
            ...mockUser,
            id: res.user.id,
            name: res.user.username,
            team: res.claims.university_id === 1 ? 'Jacked Nerds' : 'Other',
            avatar: res.user.avatar_url || mockUser.avatar,
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
      } else if (!token) {
        // For development/hackathon, auto-login if no token
        loginWithGitHub();
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

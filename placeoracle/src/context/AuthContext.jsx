import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../data/mockUser';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('placeoracle_user');
    return saved ? JSON.parse(saved) : mockUser; // default pre-authenticated for quick hackathon review or can toggle
  });
  const [token, setToken] = useState(() => localStorage.getItem('placeoracle_token') || 'jwt-placeoracle-operative-9942');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('placeoracle_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('placeoracle_user');
    }
  }, [user]);

  const loginWithGitHub = async () => {
    setIsAuthenticating(true);
    // Simulate GitHub OAuth roundtrip handshake
    await new Promise((resolve) => setTimeout(resolve, 1400));
    const generatedToken = 'jwt-oracle-' + Math.random().toString(36).substring(2, 10);
    setToken(generatedToken);
    localStorage.setItem('placeoracle_token', generatedToken);
    setUser(mockUser);
    setIsAuthenticating(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('placeoracle_user');
    localStorage.removeItem('placeoracle_token');
  };

  const updateTrustIndex = (delta) => {
    if (!user) return;
    setUser((prev) => {
      const newScore = Math.min(100, Math.max(0, prev.trustIndex + delta));
      return {
        ...prev,
        trustIndex: newScore,
        telemetryStream: [
          {
            id: `tx-${Date.now()}`,
            timestamp: "Just now",
            event: "Zero-Day Challenge Solved & Validated",
            score: `+${delta} pts`,
            hash: "0x" + Math.random().toString(16).substring(2, 10) + "..."
          },
          ...prev.telemetryStream
        ]
      };
    });
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
        updateTrustIndex
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

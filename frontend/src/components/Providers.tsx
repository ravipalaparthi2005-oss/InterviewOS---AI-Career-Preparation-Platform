'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure URL with environment variable support
const getApiUrl = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const getSocketUrl = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

// Debug helper for network errors
const debugNetworkError = (context: string, error: any) => {
  console.error(`[${context}] Network Error:`, {
    message: error?.message,
    name: error?.name,
    stack: error?.stack,
    url: API_URL
  });
};

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load and validate JWT from local storage on startup
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('interviewos_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem('interviewos_token');
        }
      } catch (err) {
        debugNetworkError('loadUser', err);
        // Continue with loading=false even if initial load fails
        // User can retry by logging in again
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn('[Login] Authentication failed:', { status: res.status, error: data.error });
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem('interviewos_token', data.token);
      setUser(data.user);
      setToken(data.token);
      console.log('[Login] Success for user:', data.user.email);
      return { success: true };
    } catch (err: any) {
      debugNetworkError('login', err);
      
      // Provide more specific error messages
      let errorMsg = 'Network error - please check your connection';
      if (err.message.includes('Failed to fetch')) {
        errorMsg = `Cannot reach server at ${API_URL}. Is the backend running on port 5000?`;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      return { success: false, error: errorMsg };
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn('[Register] Account creation failed:', { status: res.status, error: data.error });
        return { success: false, error: data.error || 'Registration failed' };
      }

      localStorage.setItem('interviewos_token', data.token);
      setUser(data.user);
      setToken(data.token);
      console.log('[Register] Success for user:', data.user.email);
      return { success: true };
    } catch (err: any) {
      debugNetworkError('register', err);
      
      // Provide more specific error messages
      let errorMsg = 'Network error - please check your connection';
      if (err.message.includes('Failed to fetch')) {
        errorMsg = `Cannot reach server at ${API_URL}. Is the backend running on port 5000?`;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('interviewos_token');
    setUser(null);
    setToken(null);
    window.location.href = '/';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

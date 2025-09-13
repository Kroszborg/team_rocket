'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api' // Import our new API client
import { AuthApiResponse, LoginResponse, RegisterResponse, BackendUser } from '@/lib/types'

// 1. Define the User object based on our backend's response
// The BackendUser interface is now imported from @/lib/types and no longer defined here.

// 2. Update the context type for the new auth flow
interface AuthContextType {
  user: BackendUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 3. Update state variables to hold backend user and token
  const [user, setUser] = useState<BackendUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          apiClient.setAuthToken(token);
          const data: AuthApiResponse = await apiClient.getMe();
          if (data.success) {
            setUser(data.user);
          }
        } catch (err) {
          // Token is invalid or expired
          console.error('Session restore error:', err)
          localStorage.removeItem('authToken');
          apiClient.setAuthToken(null);
        }
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data: LoginResponse = await apiClient.login({ email, password });
      if (data.success && data.access_token) {
        localStorage.setItem('authToken', data.access_token);
        apiClient.setAuthToken(data.access_token);
        setUser(data.user);
        router.push('/dashboard');
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const data: RegisterResponse = await apiClient.register({ email, password, full_name: fullName });
      if (data.success) {
        // Optionally, redirect to login or show a success message
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    apiClient.setAuthToken(null);
    router.push('/login');
    // No need to call backend logout as we are clearing client-side session
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login')
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}
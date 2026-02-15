'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Role } from '@/types';
import { userApi } from '@/api/user.api';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    // Check for existing token on mount
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token validity (simple expiration check)
          const decoded = jwtDecode<{ exp: number; sub?: number | string }>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            logout();
          } else {
            // Ideally fetch fresh profile, but for now use decoded or stored user if available
            // Let's fetch profile to be sure
            try {
              // Extract ID from token to fetch user profile
              const userId = decoded.sub;
              if (userId) {
                const profile = await userApi.getUser(userId);
                setUser(profile);
              } else {
                 logout();
              }
            } catch (error) {
              console.error("Failed to fetch profile", error);
              // Fallback to decoding token if profile fetch fails but token seems valid?
              // Or just logout. Safer to logout if API rejects.
              logout();
            }
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = async (token: string, userData?: User) => {
    localStorage.setItem('token', token);
    
    let currentUser = userData;
    
    // If user data is missing, try to fetch it or decode from token
    if (!currentUser) {
      try {
        const decoded = jwtDecode<{ sub?: number | string }>(token);
        if (decoded.sub) {
           currentUser = await userApi.getUser(decoded.sub);
        }
      } catch (error) {
        console.error("Failed to fetch profile on login", error);
        // Fallback: decode token to get basic info if possible
        try {
          const decoded = jwtDecode<{ sub?: number | string; username?: string; role?: string }>(token);
          // Map decoded token fields to User interface if they exist
          if (decoded.sub && decoded.username) {
             currentUser = {
               id: Number(decoded.sub),
              username: decoded.username,
              role: (decoded.role || 'user').toLowerCase() as Role, 
            };
          }
        } catch (decodeError) {
          console.error("Failed to decode token", decodeError);
        }
      }
    }

    if (currentUser) {
      const normalizedUser = { ...currentUser, role: currentUser.role.toLowerCase() as Role };
      setUser(normalizedUser);
      
      // Redirect based on role
      if (normalizedUser.role === 'admin') {
        router.push('/admin');
      } else if (normalizedUser.role === 'registrar') {
        router.push('/registrar');
      } else {
        router.push('/dashboard');
      }
    } else {
      // Should not happen if token is valid, but good to handle
       toast.error("Login successful but failed to load user profile.");
    }
  };

  

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

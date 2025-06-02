import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState, AuthMethod } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType extends AuthState {
  sendOTP: (type: AuthMethod, value: string) => Promise<void>;
  verifyOTP: (type: AuthMethod, value: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  bypassAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const checkAuthStatus = async () => {
    try {
      // Check for admin bypass in localStorage
      const adminBypass = localStorage.getItem('adminBypass');
      if (adminBypass === 'true') {
        setState({
          user: { id: 'admin', isAdmin: true },
          isAuthenticated: true,
          isLoading: false
        });
        return;
      }

      const response = await authAPI.getMe();
      setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const sendOTP = async (type: AuthMethod, value: string) => {
    try {
      await authAPI.sendOTP(type, value);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (type: AuthMethod, value: string, otp: string) => {
    try {
      const response = await authAPI.verifyOTP(type, value, otp);
      setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('adminBypass');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  };

  const bypassAuth = () => {
    localStorage.setItem('adminBypass', 'true');
    setState({
      user: { id: 'admin', isAdmin: true },
      isAuthenticated: true,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        sendOTP,
        verifyOTP,
        logout,
        bypassAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
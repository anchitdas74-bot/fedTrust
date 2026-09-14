import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserSession } from '../types';
import { authService, type LoginParams } from '../services/api/authService';

interface AuthContextType {
  session: UserSession | null;
  isAuthenticated: boolean;
  step1Completed: boolean;
  loginStep1Data: LoginParams | null;
  loginError: string | null;
  otpError: string | null;
  is2FAVerificationPending: boolean;
  loginStep1: (params: LoginParams) => Promise<boolean>;
  verify2FA: (otp: string) => Promise<boolean>;
  resend2FAOTP: () => Promise<string>;
  logout: () => void;
  clearErrors: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('fedtrust_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [step1Completed, setStep1Completed] = useState(false);
  const [loginStep1Data, setLoginStep1Data] = useState<LoginParams | null>(null);
  const [is2FAVerificationPending, setIs2FAVerificationPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      localStorage.setItem('fedtrust_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('fedtrust_session');
    }
  }, [session]);

  const loginStep1 = async (params: LoginParams): Promise<boolean> => {
    setLoginError(null);
    try {
      await authService.loginStep1(params);
      setLoginStep1Data(params);
      setStep1Completed(true);
      setIs2FAVerificationPending(true);
      return true;
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Verify Bank ID & credentials.');
      return false;
    }
  };

  const verify2FA = async (otp: string): Promise<boolean> => {
    setOtpError(null);
    if (!loginStep1Data) {
      setOtpError('Session expired. Please log in again.');
      return false;
    }

    try {
      const userSession = await authService.verify2FA({
        institutionId: loginStep1Data.institutionId,
        username: loginStep1Data.username,
        otp
      });
      setSession(userSession);
      setIs2FAVerificationPending(false);
      setStep1Completed(true);
      return true;
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed.');
      return false;
    }
  };

  const resend2FAOTP = async (): Promise<string> => {
    if (!loginStep1Data) return 'Session expired';
    const res = await authService.resendOTP();
    return res.message;
  };

  const logout = () => {
    authService.logout();
    setSession(null);
    setStep1Completed(false);
    setLoginStep1Data(null);
    setIs2FAVerificationPending(false);
    setLoginError(null);
    setOtpError(null);
  };

  const clearErrors = () => {
    setLoginError(null);
    setOtpError(null);
  };

  const isAuthenticated = !!(session && session.isAuthenticated && session.is2FAVerified);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated,
        step1Completed,
        loginStep1Data,
        loginError,
        otpError,
        is2FAVerificationPending,
        loginStep1,
        verify2FA,
        resend2FAOTP,
        logout,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

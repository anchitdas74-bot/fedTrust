import { apiClient } from './apiClient';
import type { UserSession } from '../../types';

export interface LoginParams {
  institutionId: string;
  username: string;
  password?: string;
}

export interface OTPVerifyParams {
  institutionId: string;
  username: string;
  otp: string;
}

// Store the real backend MFA token between login and OTP verification
let currentMfaToken: string | null = null;

export const authService = {
  async loginStep1(
    params: LoginParams
  ): Promise<{ requires2FA: boolean; message: string }> {
    try {
      const res = await apiClient.post('/auth/login', {
        institution_id: params.institutionId,
        username: params.username,
        password: params.password,
        terminal_id: 'POS-MUM-001',
      });

      if (!res.data.mfa_token) {
        throw new Error(
          'Backend did not return an MFA token.'
        );
      }

      // Store the REAL token returned by the backend
      currentMfaToken = res.data.mfa_token;

      return {
        requires2FA: true,
        message:
          'Step 1 complete. 2FA OTP dispatched to authorized mobile device.',
      };
    } catch (err: any) {
      currentMfaToken = null;

      throw new Error(
        err.response?.data?.detail ||
        err.message ||
        'Unable to authenticate with the backend.'
      );
    }
  },

  async verify2FA(
    params: OTPVerifyParams
  ): Promise<UserSession> {
    if (!currentMfaToken) {
      throw new Error(
        'Your login session has expired. Please log in again.'
      );
    }

    if (!/^\d{6}$/.test(params.otp)) {
      throw new Error(
        'Please enter a valid 6-digit OTP.'
      );
    }

    try {
      const res = await apiClient.post(
        '/auth/verify-otp',
        {
          mfa_token: currentMfaToken,
          otp: params.otp,
        }
      );

      const user = res.data.user;

      if (!user || !res.data.access_token) {
        throw new Error(
          'Invalid authentication response from backend.'
        );
      }

      const session: UserSession = {
        institutionId: user.institution_id,
        institutionName: user.institution_name,
        username: user.username,
        terminalId: 'POS-MUM-001',
        isAuthenticated: true,
        is2FAVerified: true,
        token: res.data.access_token,
        loginTime: new Date().toLocaleTimeString(),
      };

      localStorage.setItem(
        'fedtrust_token',
        session.token!
      );

      // OTP challenges are one-time use
      currentMfaToken = null;

      return session;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.detail ||
        err.message ||
        'Invalid or expired OTP.'
      );
    }
  },

  async resendOTP(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!currentMfaToken) {
      throw new Error(
        'Your login session has expired. Please log in again.'
      );
    }

    try {
      const res = await apiClient.post(
        '/auth/resend-otp',
        {
          mfa_token: currentMfaToken,
        }
      );

      if (!res.data.mfa_token) {
        throw new Error(
          'Backend did not return a new MFA token.'
        );
      }

      // IMPORTANT:
      // The backend creates a NEW challenge,
      // so we must replace the old token.
      currentMfaToken = res.data.mfa_token;

      return {
        success: true,
        message:
          'A new 6-digit OTP has been generated for your registered device.',
      };
    } catch (err: any) {
      throw new Error(
        err.response?.data?.detail ||
        err.message ||
        'Unable to resend the OTP.'
      );
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Even if backend logout fails,
      // clear the local session.
    } finally {
      localStorage.removeItem(
        'fedtrust_token'
      );

      currentMfaToken = null;
    }
  },
};
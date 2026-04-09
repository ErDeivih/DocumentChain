import { api } from '../lib/api';
import type { AuthResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

/**
 * Auth API - Traditional authentication only
 * Users login/register with username/email and password
 * Wallets are ONLY for signing blockchain transactions, NOT for authentication
 */
export const authApi = {
  /**
   * Register a new user
   * Backend generates RSA keypair and encrypts private key with password
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login with username and password
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Complete login after 2FA challenge
   */
  verifyTwoFactor: async (tempToken: string, token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/2fa/verify', { tempToken, token });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  /**
   * Refresh access token
   */
  refresh: async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    const response = await api.post<{ accessToken: string; expiresIn: number }>('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Get current user info
   */
  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  /**
   * Request a password reset email
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with recovery key
   */
  resetPassword: async (data: { token: string; recoveryKey: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }
};

// Aliases for backward compatibility
export const register = authApi.register;
export const login = authApi.login;
export const verifyTwoFactor = authApi.verifyTwoFactor;
export const logout = authApi.logout;
export const getMe = authApi.getMe;
export const changePassword = authApi.changePassword;
export const forgotPassword = authApi.forgotPassword;
export const resetPassword = authApi.resetPassword;

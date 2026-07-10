import api from './axios';
import type { User } from '@/types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', payload);
  return data.data as AuthResponse;
}

export interface RegisterOtpResponse {
  email: string;
}

// Registration is two-step: this only sends an OTP to the email — the
// account isn't created until verifyRegistrationOtp succeeds.
export async function register(payload: RegisterPayload): Promise<RegisterOtpResponse> {
  const { data } = await api.post('/auth/register', payload);
  return data.data as RegisterOtpResponse;
}

export async function verifyRegistrationOtp(email: string, otp: string): Promise<AuthResponse> {
  const { data } = await api.post('/auth/register/verify-otp', { email, otp });
  return data.data as AuthResponse;
}

export async function resendRegistrationOtp(email: string): Promise<void> {
  await api.post('/auth/register/resend-otp', { email });
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(email: string, otp: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', { email, otp, password });
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
  await api.patch('/auth/change-password', payload);
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get('/users/me');
  return data.data as User;
}

export async function updateProfile(payload: Partial<Pick<User, 'name' | 'phone'>>): Promise<User> {
  console.log("payload =>",payload)
  const { data } = await api.patch('/users/me', payload);
  return data.data as User;
}

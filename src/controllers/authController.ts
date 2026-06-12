import type { Request, Response } from 'express';
import { sendOtpEmail } from '../utils/sendEmail.js';
import * as authService from '../services/authServices.js';
import * as adminService from '../services/adminService.js';
import asyncHandler from 'express-async-handler';
export const signupWithEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, name } = req.body;

  const existingUser = await authService.findUserByEmail(email); 
  if (existingUser) {
    res.status(409).json({ status: 'Error', message: 'This email is already registered. Please log in instead.' });
    return;
  }

  const otp = authService.generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const hashedOtp = await authService.hashData(otp);

  await authService.createUserWithInitialOtp(email, name, hashedOtp, otpExpiresAt);
  await sendOtpEmail(email, otp);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Dev] Signup OTP for ${email}: ${otp}`);
  }

  res.status(201).json({ status: 'Success', message: 'Account created! Please check your email for the OTP.' });
});

export const loginWithEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await authService.findUserByEmail(email);

  if (!user) {
    res.status(200).json({ status: 'Success', message: 'If this email is registered, an OTP has been sent to it.' });
    return;
  }

  const otp = await authService.sendAndSaveOtp(email);
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Dev] Login OTP for ${email}: ${otp}`);
  }

  res.status(200).json({ status: 'Success', message: 'If this email is registered, an OTP has been sent to it.' });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await authService.findUserByEmail(email);

  if (!user || user.isVerified) {
    res.status(200).json({ status: 'Success', message: 'If this email exists and is unverified, a new OTP has been sent.' });
    return;
  }

  const otp = await authService.sendAndSaveOtp(email);
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Dev] Resend OTP for ${email}: ${otp}`);
  }

  res.status(200).json({ status: 'Success', message: 'If this email exists and is unverified, a new OTP has been sent.' });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  const user = await authService.findUserByEmail(email);

  if (!user?.otp || !user?.otpExpiresAt || new Date() > user.otpExpiresAt) {
    res.status(400).json({ status: 'Error', message: 'Invalid or expired OTP' });
    return;
  }

  const isOtpValid = await authService.compareData(otp, user.otp);
  if (!isOtpValid) {
    res.status(400).json({ status: 'Error', message: 'Invalid or expired OTP' });
    return;
  }

  const updatedUser = await authService.verifyUserAndClearOtp(email);
  const token = authService.generateToken(updatedUser.id, updatedUser.role);

  res.status(200).json({ status: 'Success', message: 'Logged in successfully', data: { token, user: updatedUser } });
});

export const loginWithPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await authService.findUserByEmail(email);
  if (!user || !user.password) {
    res.status(401).json({ status: 'Error', message: 'Invalid email or password' });
    return;
  }

  const isPasswordValid = await authService.compareData(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ status: 'Error', message: 'Invalid email or password' });
    return;
  }

  if (!user.isVerified) {
    res.status(403).json({ status: 'Error', message: 'Please verify your account first' });
    return;
  }

  const token = authService.generateToken(user.id, user.role);
  res.status(200).json({ status: 'Success', message: `Welcome back, ${user.role}!`, data: { token, role: user.role } });
});

export const createAdminBySuper = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, name } = req.body;
  const admin = await adminService.createAdminAccountService(email, name);
  res.status(201).json({ status: 'Success', message: 'Admin account created successfully', data: { admin } });
});
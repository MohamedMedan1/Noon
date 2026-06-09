import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendOtpEmail } from '../utils/sendEmail.js';
import { requestOtpSchema, verifyOtpSchema } from '../validator/authValidator.js';

const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

// POST /api/v1/auth/request-otp
export const authWithEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = requestOtpSchema.safeParse(req.body);
    if (!validation.success) {
      const issue = validation.error?.issues?.[0];
      res.status(400).json({
        status: 'Error',
        message: issue?.message ?? 'Invalid request data',
      });
      return;
    }

    const { email } = validation.data;
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        otp: hashedOtp,
        otpExpiresAt,
        isVerified: false,
        role: 'Customer',
      },
      update: {
        otp: hashedOtp,
        otpExpiresAt,
      },
    });

    
    await sendOtpEmail(email, otp);
    console.log(`OTP for ${email}: ${otp}`); 

    res.status(200).json({
      status: 'Success',
      message: 'OTP sent to your email. Valid for 5 minutes.',
    });
  } catch (error: any) {
    console.error('authWithEmail error:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// POST /api/v1/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = verifyOtpSchema.safeParse(req.body);
    if (!validation.success) {
      const issue = validation.error?.issues?.[0];
      res.status(400).json({
        status: 'Error',
        message: issue?.message ?? 'Invalid request data',
      });
      return;
    }

    const { email, otp } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otp || !user.otpExpiresAt) {
      res.status(400).json({ status: 'Error', message: 'Invalid or expired OTP' });
      return;
    }

    if (new Date() > user.otpExpiresAt) {
      res.status(400).json({ status: 'Error', message: 'Invalid or expired OTP' });
      return;
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      res.status(400).json({ status: 'Error', message: 'Invalid or expired OTP' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpiresAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });

    const token = generateToken(updatedUser.id, updatedUser.role);

    res.status(200).json({
      status: 'Success',
      message: 'Logged in successfully',
      data: { token, user: updatedUser },
    });
  } catch (error: any) {
    console.error('verifyOtp error:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// POST /api/v1/auth/resend-otp
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ status: 'Error', message: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(200).json({
        status: 'Success',
        message: 'If this email exists, a new OTP has been sent.',
      });
      return;
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { email },
      data: { otp: hashedOtp, otpExpiresAt },
    });

    await sendOtpEmail(email, otp);
    console.log(`OTP for ${email}: ${otp}`); // development only

    res.status(200).json({
      status: 'Success',
      message: 'If this email exists, a new OTP has been sent.',
    });
  } catch (error: any) {
    console.error('resendOtp error:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// POST /api/v1/auth/create-admin
export const createAdminBySuper = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;

    if (!email) {
      res.status(400).json({ status: 'Error', message: 'Email is required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ status: 'Error', message: 'This email is already registered' });
      return;
    }

    const admin = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        role: 'Admin',
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });

    res.status(201).json({
      status: 'Success',
      message: 'Admin account created successfully',
      data: { admin },
    });
  } catch (error: any) {
    console.error('createAdminBySuper error:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};
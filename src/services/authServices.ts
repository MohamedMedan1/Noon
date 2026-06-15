import { prisma } from '../config/prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendOtpEmail } from '../utils/sendEmail.js';

export const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

export const hashData = async (data: string): Promise<string> =>
  await bcrypt.hash(data, 10);

export const compareData = async (data: string, encrypted: string): Promise<boolean> =>
  await bcrypt.compare(data, encrypted);

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      otp: true,
      otpExpiresAt: true,
      password: true,
    },
  });
};

export const sendAndSaveOtp = async (email: string): Promise<string> => {
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const hashedOtp = await hashData(otp);

  await prisma.user.update({
    where: { email },
    data: { otp: hashedOtp, otpExpiresAt },
  });

  await sendOtpEmail(email, otp);
  return otp;
};

export const createUserWithInitialOtp = async (
  email: string,
  name: string,
  hashedOtp: string,
  otpExpiresAt: Date
) => {
  return await prisma.user.create({
    data: {
      email,
      name,
      otp: hashedOtp,
      otpExpiresAt,
      isVerified: false,
      role: 'Customer',
      cart:{
        create:{}
      }
    },
  });
};

export const verifyUserAndClearOtp = async (email: string) => {
  return await prisma.user.update({
    where: { email },
    data: { isVerified: true, otp: null, otpExpiresAt: null },
    select: { id: true, email: true, name: true, role: true, isVerified: true },
  });
};
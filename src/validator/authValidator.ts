import { z } from 'zod';

export const requestOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .toLowerCase()
    .email({ message: 'A valid email is required' }),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .toLowerCase()
    .email({ message: 'A valid email is required' }),
  otp: z
    .string()
    .trim()
    .min(1, { message: 'OTP is required' })
    .length(6, { message: 'OTP must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'OTP must contain numbers only' }),
});

export const updateMeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, { message: 'Name must be at least 3 characters' })
      .max(15, { message: 'Name cannot exceed 15 characters' })
      .optional(),
    phone: z
      .string()
      .trim()
      .min(10, { message: 'Phone must be at least 10 characters' })
      .max(15, { message: 'Phone cannot exceed 15 characters' })
      .optional(),
    address: z
      .string()
      .trim()
      .min(5, { message: 'Address must be at least 5 characters' })
      .optional(),
  })
  .refine((data) => Object.keys(data).filter((key) => data[key as keyof typeof data] !== undefined).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const sellerProfileSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(1, { message: 'Store name is required' })
    .min(3, { message: 'Store name must be at least 3 characters' })
    .max(50, { message: 'Store name cannot exceed 50 characters' }),
  storeDescription: z
    .string()
    .trim()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .optional(),
  businessEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid business email format' })
    .optional(),
  businessPhone: z
    .string()
    .trim()
    .min(10, { message: 'Business phone must be at least 10 characters' })
    .optional(),
  businessAddress: z
    .string()
    .trim()
    .optional(),
  taxNumber: z
    .string()
    .trim()
    .optional(),
});

export const sellerRequestSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(1, { message: 'Store name is required' })
    .min(3, { message: 'Store name must be at least 3 characters' })
    .max(50, { message: 'Store name cannot exceed 50 characters' }),
  storeDescription: z
    .string()
    .trim()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .optional(),
  businessEmail: z
    .string()
    .trim()
    .min(1, { message: 'Business email is required' })
    .toLowerCase()
    .email({ message: 'Invalid business email format' }),
  businessPhone: z
    .string()
    .trim()
    .min(10, { message: 'Business phone must be at least 10 characters' })
    .optional(),
  businessAddress: z
    .string()
    .trim()
    .optional(),
  taxNumber: z
    .string()
    .trim()
    .optional(),
});
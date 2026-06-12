import { z } from 'zod';

// Signup: email + name 
export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .toLowerCase()
    .email({ message: 'A valid email is required' }),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(15, { message: 'Name cannot exceed 15 characters' }),
});

// Login — email (Unified name to fix loginEmailSchema import error)
export const loginEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .toLowerCase()
    .email({ message: 'A valid email is required' }),
});

// Verify OTP 
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

// Resend OTP Schema
export const resendOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .toLowerCase()
    .email({ message: 'A valid email is required' }),
});

// Login Password Schema (Used for Admins & Sellers)
export const loginPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .toLowerCase()
    .email({ message: 'A valid email is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

// Create Admin Schema (Used by SuperAdmin)
export const createAdminSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .toLowerCase()
    .email({ message: 'A valid email is required' }),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(15)
    .nullable()
    .optional(),
});

// Update Me 
export const updateMeSchema = z
  .object({
    name: z.string().trim().min(3, { message: 'Name must be at least 3 characters' }).max(15).optional(),
    phone: z.string().trim().min(10, { message: 'Phone must be at least 10 digits' }).max(15).optional(),
    address: z.string().trim().min(5, { message: 'Address must be at least 5 characters' }).optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: 'At least one field must be provided for update' }
  );

// Seller Profile (Used for Upsert / Update)
export const sellerProfileSchema = z.object({
  storeName: z.string().trim().min(3, { message: 'Store name must be at least 3 characters' }).max(50).optional(),
  storeDescription: z.string().trim().max(500, { message: 'Description cannot exceed 500 characters' }).optional(),
  businessEmail: z.string().trim().toLowerCase().email({ message: 'Invalid business email format' }).optional(),
  businessPhone: z.string().trim().min(10, { message: 'Business phone must be at least 10 digits' }).optional(),
  businessAddress: z.string().trim().optional(),
  taxNumber: z.string().trim().optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided for update' }
);

// Seller Request (Used for first time onboarding/application)
export const sellerRequestSchema = z.object({
  storeName: z.string().trim().min(3, { message: 'Store name must be at least 3 characters' }).max(50),
  storeDescription: z.string().trim().max(500).optional(),
  businessEmail: z.string().trim().toLowerCase().email({ message: 'Invalid business email format' }),
  businessPhone: z.string().trim().min(10, { message: 'Business phone must be at least 10 digits' }).optional(),
  businessAddress: z.string().trim().optional(),
  taxNumber: z.string().trim().optional(),
});
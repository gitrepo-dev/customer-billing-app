import { z } from 'zod';
import { customerRepository } from '@/database/customersRepo';

export const personalInfoSchema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters'),
    email: z.string().trim().email('Invalid email address').or(z.literal('')),
    phone: z.string().trim().min(10, 'Invalid Phone number').or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    // validating if email is empty, phone is mandatory, and vice versa
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide at least an email or phone number',
        path: ['email'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide at least an email or phone number',
        path: ['phone'],
      });
    }
  });

export const addressBlockSchema = z.object({
  street: z.string().trim().min(2, 'Street is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  zipCode: z.string().trim().min(5, 'Postal code is required'),
});

export const addressInfoSchema = z.object({
  sameAsBilling: z.boolean(),
  billingAddress: addressBlockSchema,
  shippingAddress: addressBlockSchema,
});

export const customerFullSchema = z.object({
  personal: personalInfoSchema,
  address: addressInfoSchema,
});

export const checkEmailUniqueness = async (email?: string, excludeId?: string): Promise<boolean> => {
  if (!email) return true;
  const taken = await customerRepository.emailExists(email, excludeId);
  return !taken;
};
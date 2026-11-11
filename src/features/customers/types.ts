import { z } from 'zod';
import { customerFullSchema, personalInfoSchema, addressInfoSchema } from './schema';

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type AddressInfo = z.infer<typeof addressInfoSchema>;
export type CustomerFormData = z.infer<typeof customerFullSchema>;

export interface Customer extends CustomerFormData {
  id: string;
  createdAt: string;
}
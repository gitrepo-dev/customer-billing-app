import { z } from 'zod';
import { invoiceFormSchema, invoiceItemSchema } from './schema';

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export interface Invoice extends InvoiceFormData {
  id: string;
  customerId: string;
  total: number;
  status: 'paid' | 'unpaid';
  createdAt: string;
}
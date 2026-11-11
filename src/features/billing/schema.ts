import { z } from 'zod';

export const invoiceItemSchema = z.object({
  itemName: z.string().trim().min(3, 'Service or product name is required'),
  price: z.string().superRefine((val, ctx) => {
    const trimmed = val ? val.trim() : '';
  
  
    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price is required',
      });
      return;
    }
  

    const num = Number(trimmed);
    if (Number.isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price must be a valid number',
      });
      return;
    }
  

    if (num <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price must be greater than 0',
      });
      return;
    }
  
    const integerPart = trimmed.split('.')[0].replace(/[^0-9]/g, '');
    if (integerPart.length > 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price cannot exceed 5 digits',
      });
    }
  }),
  taxRate: z.string().min(0.01, 'Tax rate is required.'),
});

export const invoiceFormSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
}).refine((val)=>{
  if(val.dueDate >= val.date) return true
  return false
},{
  message: 'Due date cannot be earlier than invoice date',
  path: ['dueDate'],
});
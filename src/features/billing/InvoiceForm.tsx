import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceFormSchema } from '@/features/billing/schema';
import { Invoice, InvoiceFormData } from '@/features/billing/types';
import { invoiceRepository } from '@/database/invoiceRepo';
import { CustomerFormData } from '@/features/customers/types'

const percentages = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

interface Props {
  customerId: string;
  onInvoiceCreated: () => void;
  customers: CustomerFormData[]
}

export const InvoiceForm: React.FC<Props> = ({ customerId, onInvoiceCreated, customers }) => {
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    mode: 'onBlur',
    defaultValues: {
      date: today,
      dueDate: today,
      items: [{ itemName: '', taxRate: '', price: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = async (data: InvoiceFormData) => {
    const invoice: Invoice = {
      ...data,
      id: crypto.randomUUID(),
      customerId,
      total: grandTotal,
      status: 'unpaid',
      createdAt: new Date().toISOString(),
    };

    await invoiceRepository.save(invoice);
    reset({
      date: today,
      dueDate: today,
      items: [{ itemName: '', taxRate: '', price: '' }],
    });
    onInvoiceCreated();
  };


  const watchedItems = watch('items') || [];

  const { subtotal, totalTax, grandTotal } = watchedItems.reduce(
    (acc, item) => {
      const price = Number(item?.price) || 0;
      const taxRate = Number(item?.taxRate) || 0;

      const itemTax = price * (taxRate / 100);

      acc.subtotal += price;
      acc.totalTax += itemTax;
      acc.grandTotal += price + itemTax;

      return acc;
    },
    { subtotal: 0, totalTax: 0, grandTotal: 0 }
  );

  const notPickPast = new Date().toISOString().split('T')[0];
  const invoiceDate = watch('date');


  console.log(customers, "customers")

  return (
    <>
      <span className="font-bold text-gray-800 text-md mb-4 inline-block">Create New Invoice</span>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">

          <div className='col-span-2'>
            <label className="block text-xs  capitlize text-gray-600 mb-1">Customer *</label>

            <select {...register('customer')} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full">
              {customers.map((cust:any) => <option key={cust?.id} value={`${cust?.personal?.name}${' '}${cust?.personal?.email}`}>{cust?.personal?.name}{' '}({cust?.personal?.email})</option>)}
            </select>

          </div>


          <div>
            <label className="block text-xs  capitlize text-gray-600 mb-1">Invoice Date *</label>
            <input
              type="date"
              min={notPickPast}
              {...register('date')}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full"
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-xs  capitlize text-gray-600 mb-1">Due Date *</label>
            <input
              type="date"
              min={invoiceDate || notPickPast}
              disabled={!invoiceDate}
              {...register('dueDate')}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full"
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
          </div>
        </div>

        {/* Dynamic Items Table */}
        <p className="block text-xs  capitlize text-gray-600 mb-3">Items</p>
        <div className="bg-gray-50 p-1 rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-gray-700 capitlize">
              <tr>
                <th className="px-3 pb-2 min-w-36">Item Name *</th>
                <th className="px-3 pb-2 w-46">Price *</th>
                <th className="px-3 pb-2 w-40 text-right">Tax Rate (%) *</th>
                {watchedItems?.length > 1 ? <th className="px-3 pb-2 w-12 text-center"></th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((field, idx) => {
                return (
                  <tr key={field.id}>
                    <td className="p-2">
                      <input
                        {...register(`items.${idx}.itemName`)}
                        placeholder="Service or product name"
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                      {errors.items?.[idx]?.itemName && (
                        <p className="text-xs text-red-500 absolute">{errors.items[idx]?.itemName?.message}</p>
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        step="0.01"
                        min="0"
                        {...register(`items.${idx}.price`)}
                        className="w-full border rounded px-2 py-1 text-sm text-right"
                      />
                      {errors.items?.[idx]?.price && (
                        <p className="text-xs text-red-500 absolute">{errors.items[idx]?.price?.message}</p>
                      )}
                    </td>
                    <td className="p-2">
                      <select {...register(`items.${idx}.taxRate`)}
                        defaultValue="" className="w-full border rounded px-2 py-1 text-sm text-center">
                        <option value="" disabled>

                        </option>
                        {percentages.map((percentage: number) => <option key={percentage} value={percentage}>{percentage} %</option>)}
                      </select>
                      {errors.items?.[idx]?.taxRate && (
                        <p className="text-xs text-red-500 absolute">{errors.items[idx]?.taxRate?.message}</p>
                      )}
                    </td>

                    {fields.length > 1 && (
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          &times;
                        </button>
                      </td>
                    )}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-2 flex justify-between items-center">
          <button
            type="button"
            onClick={() => append({ itemName: '', taxRate: '', price: '' })}
            className="px-4 py-2 rounded text-sm cursor-pointer transition-colors bg-blue-600/15 text-blue-700 border border-blue-600/20 hover:bg-blue-600 hover:text-white disabled:opacity-50"
          >
            + Add Item
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-2">
          {/* Top Row: Subtotal and Total Tax */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200/75">
            <div>
              <span className="block text-sm text-gray-800">Subtotal:</span>
              <span className="block text-sm font-medium text-gray-900 mt-1">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="block text-sm text-gray-800">Total Tax:</span>
              <span className="block text-sm font-medium text-gray-900 mt-1">
                ${totalTax.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bottom Row: Grand Total */}
          <div className="pt-4">
            <span className="block text-sm text-gray-800">Grand Total:</span>
            <span className="block text-sm font-bold text-gray-900 mt-1">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer  text-sm  hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </>
  );
};
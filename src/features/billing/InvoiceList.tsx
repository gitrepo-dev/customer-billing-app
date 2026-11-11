import React from 'react';
import { Invoice } from '@/features/billing/types';
import { invoiceRepository } from '@/database/invoiceRepo';

interface Props {
  invoices: Invoice[];
  onRefresh: () => void;
}

export const InvoiceList: React.FC<Props> = ({ invoices, onRefresh }) => {
  const handleToggle = async (invoiceId: string) => {
    await invoiceRepository.toggleStatus(invoiceId);
    onRefresh();
  };



  return (
    <div className='mt-10'>
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-gray-800 text-md">
          Recent Invoices
        </span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'}
        </span>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border rounded border-dashed">
          No invoices have been issued for this customer yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs capitlize text-gray-700 border-b">
              <tr>
                <th className="px-3 py-2">Invoice #</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Date</th>                
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2.5 font-mono text-xs">{inv.id.slice(0, 7)}</td>
                  <td className="px-3 py-2.5 capitalize">{inv?.customer?.split(' ')?.slice(0, -1).join(' ') || ''}</td> 
                  <td className="px-3 py-2.5">{inv.date}</td>                  
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                    ${inv.total.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded  ${
                        inv.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => handleToggle(inv.id)}
                      className="text-xs text-blue-600 hover:underline cursor-pointer"
                    >
                      Mark as {inv.status === 'paid' ? 'Unpaid' : 'Paid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
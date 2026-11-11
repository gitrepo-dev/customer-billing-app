import React, { useState, useMemo } from 'react';
import { Customer } from '@/features/customers/types';

interface Props {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (id: string) => void;
  onOpenCreate: () => void;
}

export const CustomerList: React.FC<Props> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onOpenCreate,
}) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'createdAt'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredAndSorted = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = customers.filter(
      (c) =>
        c.personal.name.toLowerCase().includes(query) ||
        c.personal.email.toLowerCase().includes(query) ||
        c.personal.phone.includes(query)
    );

    result.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'name') {
        comparison = a.personal.name.localeCompare(b.personal.name);
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [customers, search, sortKey, sortAsc]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b flex flex-wrap gap-3 items-center justify-between">

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Filter by name, email, or phone..."
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
        />


        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as 'name' | 'createdAt')}
            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="createdAt">Sort by Date</option>
          </select>

          <button
            type="button"
            onClick={() => setSortAsc(!sortAsc)}
            className="w-full border px-2.5 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-50 text-center"
          >
            {sortAsc ? 'Asc ▲' : 'Desc ▼'}
          </button>

          <button
            type="button"
            onClick={onOpenCreate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-1.5 rounded text-center"
          >
            + Add Customer
          </button>
        </div>

      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 capitalize">
          <thead className="bg-gray-50 text-xs capitlize text-gray-700 border-b">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">City/State</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  No customers found.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((cust) => {
                const isSelected = cust.id === selectedCustomerId;
                return (
                  <tr
                    key={cust.id}
                    className={`hover:bg-blue-50/50 cursor-pointer ${isSelected ? 'bg-blue-50 font-medium' : ''}`}
                    onClick={() => onSelectCustomer(cust.id)}
                  >
                    <td className="px-4 py-3 text-gray-900">{cust.personal.name}</td>
                    <td className="px-4 py-3 text-xs normal-case">
                      <div>{cust.personal.email || '—'}</div>
                      <div className="text-gray-400">{cust.personal.phone || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {cust.address.billingAddress.city}, {cust.address.billingAddress.state}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs px-2.5 py-1 rounded font-normal ${isSelected ? 'bg-blue-600 text-white' : 'text-blue-600 border border-blue-600'
                          }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="p-3 border-t flex justify-between items-center text-xs text-gray-500">
        <span>
          Showing {paginatedCustomers.length} of {filteredAndSorted.length} entries
        </span>
        <div className="flex gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="px-2 py-1">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
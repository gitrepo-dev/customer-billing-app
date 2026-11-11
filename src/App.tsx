import '@/App.css';
import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/features/customers/types';
import { Invoice } from '@/features/billing/types';
import { customerRepository } from '@/database/customersRepo';
import { invoiceRepository } from '@/database/invoiceRepo';
import { CustomerList } from '@/features/customers/CustomerList';
import { CustomerForm } from '@/features/customers/CustomerForm';
import { InvoiceForm } from '@/features/billing/InvoiceForm';
import { InvoiceList } from '@/features/billing/InvoiceList';

export default function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);


  const fetchCustomers = useCallback(async () => {
    const list = await customerRepository.getAll();
    setCustomers(list);
    if (!selectedCustomerId && list.length > 0) {
      setSelectedCustomerId(list[0].id);
    }
  }, [selectedCustomerId]);

  const fetchInvoices = useCallback(async () => {
    if (!selectedCustomerId) {
      setInvoices([]);
      return;
    }
    const list = await invoiceRepository.getByCustomerId(selectedCustomerId);
    setInvoices(list);
  }, [selectedCustomerId]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
      <header className="max-w-7xl mx-auto mb-6 flex justify-between items-center border-b pb-4 bg-white px-6 py-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Billing  Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Customers */}
        <section className="lg:col-span-5 space-y-4">
          <CustomerList
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={(id) => {
              setSelectedCustomerId(id);
              setIsCreatingCustomer(false);
            }}
            onOpenCreate={() => setIsCreatingCustomer(true)}
          />

          {isCreatingCustomer && (
            <div className="mt-4">
              <CustomerForm
                onSuccess={() => {
                  setIsCreatingCustomer(false);
                  fetchCustomers();
                }}
                onCancel={() => setIsCreatingCustomer(false)}
              />
            </div>
          )}
        </section>

        {/* Right column: Billing & Invoicing */}
        <section className="lg:col-span-7 space-y-6">
          {activeCustomer ? (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <InvoiceForm
                customerId={activeCustomer.id}
                onInvoiceCreated={fetchInvoices}
                customers={customers}
              />
              <InvoiceList
                invoices={invoices}
                onRefresh={fetchInvoices}
              />
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-10 text-center text-gray-400">
              Select or register a customer to begin creating invoices.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
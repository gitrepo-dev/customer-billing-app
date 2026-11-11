import { invoiceStore } from '@/database/dbConfig';
import { Invoice } from '@/features/billing/types';

export const invoiceRepository = {
  async getByCustomerId(customerId: string): Promise<Invoice[]> {
    const invoices: Invoice[] = [];
    await invoiceStore.iterate<Invoice, void>((item) => {
      if (item.customerId === customerId) {
        invoices.push(item);
      }
    });
    return invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async save(invoice: Invoice): Promise<Invoice> {
    await invoiceStore.setItem(invoice.id, invoice);
    return invoice;
  },

  async toggleStatus(id: string): Promise<Invoice | null> {
    const invoice = await invoiceStore.getItem<Invoice>(id);
    if (!invoice) return null;

    const updated: Invoice = {
      ...invoice,
      status: invoice.status === 'paid' ? 'unpaid' : 'paid',
    };
    await invoiceStore.setItem(id, updated);
    return updated;
  },
};
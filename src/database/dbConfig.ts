import localforage from 'localforage';

export const customerStore = localforage.createInstance({
  name: 'BILLING_APP_DATABASE',
  storeName: 'customers',
  description: 'Stores all customer profile information',
});

export const invoiceStore = localforage.createInstance({
  name: 'BILLING_APP_DATABASE',
  storeName: 'invoices',
  description: 'Stores all invoices linked by customerId stored in the customers stores',
});
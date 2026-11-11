import { customerStore } from '@/database/dbConfig';
import { Customer } from '@/features/customers/types';

export const customerRepository = {


  async getAll(): Promise<Customer[]> {
    const records: Customer[] = [];
    await customerStore.iterate<Customer, void>((value) => {
      records.push(value);
    });
    return records;
  },

  
  async getById(id: string): Promise<Customer | null> {
    const item = await customerStore.getItem<Customer>(id);
    return item ?? null;
  },


  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    let found = false;

    await customerStore.iterate<Customer, void>((val) => {
      if (val.personal.email?.toLowerCase() === normalized) {
        if (!excludeId || val.id !== excludeId) {
          found = true;
        }
      }
    });

    return found;
  },

  async save(customer: Customer): Promise<Customer> {
    await customerStore.setItem(customer.id, customer);
    return customer;
  },

  async remove(id: string): Promise<void> {
    await customerStore.removeItem(id);
  },

};
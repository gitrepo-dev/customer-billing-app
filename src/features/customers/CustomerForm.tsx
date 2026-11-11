import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerFullSchema, checkEmailUniqueness } from '@/features/customers/schema';
import { Customer, CustomerFormData } from '@/features/customers/types';
import { customerRepository } from '@/database/customersRepo';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [asyncEmailError, setAsyncEmailError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFullSchema),
    mode: 'onBlur',
    defaultValues: {
      personal: { name: '', email: '', phone: '' },
      address: {
        sameAsBilling: false,
        billingAddress: { street: '', city: '', state: '', zipCode: '' },
        shippingAddress: { street: '', city: '', state: '', zipCode: '' },
      },
    },
  });

  const sameAsBilling = watch('address.sameAsBilling');

  const handleCopyBillingToShipping = (checked: boolean) => {
    setValue('address.sameAsBilling', checked);
    if (checked) {
      const billing = getValues('address.billingAddress');
      setValue('address.shippingAddress', { ...billing });
    }
  };

  const handleNextStep1 = async () => {
    setAsyncEmailError(null);
    const valid = await trigger('personal');
    if (!valid) return;

    const email = getValues('personal.email');
    if (email) {
      const isUnique = await checkEmailUniqueness(email);
      if (!isUnique) {
        setAsyncEmailError('This email is already registered in the system.');
        return;
      }
    }
    setStep(2);
  };

  const handleNextStep2 = async () => {
    if (sameAsBilling) {
      const billing = getValues('address.billingAddress');
      setValue('address.shippingAddress', { ...billing });
    }
    const valid = await trigger('address');
    if (valid) {
      setStep(3);
    }
  };

  const onSave = async (formData: CustomerFormData) => {
    const finalCustomer: Customer = {
      ...formData,
      id: `cust_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    await customerRepository.save(finalCustomer);
    onSuccess();
  };


  const watchedValues = watch();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto shadow-sm">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <span className="text-md font-bold text-gray-800">Add New Customer</span>
        <div className="flex items-center space-x-2 text-sm font-medium">
          <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>1. Personal</span>
          <span>&rarr;</span>
          <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>2. Address</span>
          <span>&rarr;</span>
          <span className={`px-2 py-1 rounded ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>3. Review</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSave)}>
        {/* STEP 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                {...register('personal.name')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Jane Doe"
              />
              {errors.personal?.name && <p className="text-xs text-red-500 mt-1">{errors.personal.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register('personal.email')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="jane@example.com"
              />
              {errors.personal?.email && <p className="text-xs text-red-500 mt-1">{errors.personal.email.message}</p>}
              {asyncEmailError && <p className="text-xs text-red-500 mt-1">{asyncEmailError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                {...register('personal.phone')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="+1 555-0199"
              />
              {errors.personal?.phone && <p className="text-xs text-red-500 mt-1">{errors.personal.phone.message}</p>}
            </div>

            <p className="text-xs text-gray-500 italic">* Note: Either Email or Phone number must be provided.</p>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep1}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Address Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className=" text-gray-800 mb-2">Billing Address</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input
                    {...register('address.billingAddress.street')}
                    placeholder="Street Address *"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  {errors.address?.billingAddress?.street && (
                    <p className="text-xs text-red-500 mt-1">{errors.address.billingAddress.street.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('address.billingAddress.city')}
                    placeholder="City *"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  {errors.address?.billingAddress?.city && (
                    <p className="text-xs text-red-500 mt-1">{errors.address.billingAddress.city.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('address.billingAddress.state')}
                    placeholder="State *"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  {errors.address?.billingAddress?.state && (
                    <p className="text-xs text-red-500 mt-1">{errors.address.billingAddress.state.message}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <input
                    {...register('address.billingAddress.zipCode')}
                    placeholder="Postal / Zip Code *"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  {errors.address?.billingAddress?.zipCode && (
                    <p className="text-xs text-red-500 mt-1">{errors.address.billingAddress.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <label className="flex items-center space-x-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => handleCopyBillingToShipping(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-sm font-medium text-gray-700">Shipping address matches billing address</span>
              </label>

              {!sameAsBilling && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input
                      {...register('address.shippingAddress.street')}
                      placeholder="Shipping Street Address *"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                    {errors.address?.shippingAddress?.street && (
                      <p className="text-xs text-red-500 mt-1">{errors.address.shippingAddress.street.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register('address.shippingAddress.city')}
                      placeholder="City *"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                    {errors.address?.shippingAddress?.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.address.shippingAddress.city.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register('address.shippingAddress.state')}
                      placeholder="State *"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                    {errors.address?.shippingAddress?.state && (
                      <p className="text-xs text-red-500 mt-1">{errors.address.shippingAddress.state.message}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <input
                      {...register('address.shippingAddress.zipCode')}
                      placeholder="Postal / Zip Code *"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                    {errors.address?.shippingAddress?.zipCode && (
                      <p className="text-xs text-red-500 mt-1">{errors.address.shippingAddress.zipCode.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
                &larr; Back
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
              >
                Review &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Submission */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded text-sm border space-y-3">
              <div>
                <span className=" text-gray-700 block">Personal Details:</span>
                <p>Name: {watchedValues.personal.name}</p>
                <p>Email: {watchedValues.personal.email || '—'}</p>
                <p>Phone: {watchedValues.personal.phone || '—'}</p>
              </div>
              <div className="border-t pt-2">
                <span className=" text-gray-700 block">Billing Address:</span>
                <p>
                  {watchedValues.address.billingAddress.street}, {watchedValues.address.billingAddress.city},{' '}
                  {watchedValues.address.billingAddress.state} {watchedValues.address.billingAddress.zipCode}
                </p>
              </div>
              <div className="border-t pt-2">
                <span className=" text-gray-700 block">Shipping Address:</span>
                <p>
                  {watchedValues.address.sameAsBilling
                    ? 'Same as billing address'
                    : `${watchedValues.address.shippingAddress.street}, ${watchedValues.address.shippingAddress.city}, ${watchedValues.address.shippingAddress.state} ${watchedValues.address.shippingAddress.zipCode}`}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button type="button" onClick={() => setStep(2)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
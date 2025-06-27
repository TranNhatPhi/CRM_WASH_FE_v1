'use client';

import React, { useState } from 'react';
import { POSCustomer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, Car, Star } from 'lucide-react';

interface CustomerFormProps {
  customer: POSCustomer | null;
  onCustomerChange: (customer: POSCustomer | null) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onCustomerChange }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    vehiclePlate: customer?.vehiclePlate || '',
    isVIP: customer?.isVIP || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const newCustomer: POSCustomer = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        vehiclePlate: formData.vehiclePlate.trim() || undefined,
        isVIP: formData.isVIP,
      };

      onCustomerChange(newCustomer);
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehiclePlate: '',
      isVIP: false,
    });
    setErrors({});
    onCustomerChange(null);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }; return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
          <User className="w-5 h-5 mr-2" />
          Customer Info
        </CardTitle>
      </CardHeader>

      <CardContent className="h-full flex flex-col">
        <form onSubmit={handleSubmit} className="space-y-3 flex-1">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                placeholder="Enter customer name"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone & Email Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  placeholder="+1-555-0123"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                  placeholder="customer@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
              )}
            </div>
          </div>          {/* Vehicle Plate & VIP Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-end">
            {/* Vehicle Plate Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                License Plate
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.vehiclePlate}
                  onChange={(e) => handleInputChange('vehiclePlate', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                  placeholder="ABC123"
                />
              </div>
            </div>

            {/* VIP Toggle */}
            <div className="flex items-center space-x-3 pb-2">
              <input
                type="checkbox"
                id="isVIP"
                checked={formData.isVIP}
                onChange={(e) => handleInputChange('isVIP', e.target.checked)}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="isVIP" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Star className="w-4 h-4 mr-1 text-amber-500" />
                VIP (10% off)
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              type="submit"
              className="flex-1 text-sm py-2"
              disabled={!formData.name.trim() || !formData.phone.trim()}
            >
              {customer ? 'Update Customer' : 'Add Customer'}
            </Button>            {(customer || formData.name || formData.phone) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="text-gray-600 hover:text-gray-700 text-sm py-2 px-3"
              >
                Clear
              </Button>
            )}
          </div>
        </form>

        {/* Customer Preview */}
        {customer && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-green-900 dark:text-green-300 truncate">
                  {customer.name}
                  {customer.isVIP && (
                    <Star className="inline w-4 h-4 ml-1 text-amber-500" />
                  )}
                </h4>
                <p className="text-xs text-green-700 dark:text-green-400 truncate">
                  {customer.phone}
                  {customer.vehiclePlate && ` • ${customer.vehiclePlate}`}
                </p>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 ml-2">
                ✓ Ready
              </div>
            </div>
          </div>
        )}</CardContent>
    </Card>
  );
};

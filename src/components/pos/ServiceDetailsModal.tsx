'use client';

import React from 'react';
import { POSService } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Clock, Tag, DollarSign, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils';

interface ServiceDetailsModalProps {
  service: POSService | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (service: POSService) => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  service,
  isOpen,
  onClose,
  onAddToCart
}) => {
  if (!isOpen || !service) return null;

  const handleAddToCart = () => {
    onAddToCart(service);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Service Details
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Service Header */}
          <div className="flex items-start gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: service.color }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {service.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {service.description}
              </p>
            </div>
          </div>

          {/* Service Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(service.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {service.duration} min
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {service.category}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

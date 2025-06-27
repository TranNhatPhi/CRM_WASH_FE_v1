'use client';

import React, { useState } from 'react';
import { POSService } from '@/types';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { ServiceDetailsModal } from './ServiceDetailsModal';

interface ServiceGridProps {
  services: POSService[];
  onAddToCart: (service: POSService) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services, onAddToCart }) => {
  const [selectedService, setSelectedService] = useState<POSService | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Services', color: '#6B7280' },
    { id: 'basic', name: 'Basic', color: '#10B981' },
    { id: 'premium', name: 'Premium', color: '#3B82F6' },
    { id: 'deluxe', name: 'Deluxe', color: '#8B5CF6' },
    { id: 'addon', name: 'Add-ons', color: '#F59E0B' }
  ];

  const getServicesByCategory = (category: string) => {
    if (category === 'all') return services;
    return services.filter(service => service.category === category);
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-green-600 hover:bg-green-700';
      case 'premium': return 'bg-blue-600 hover:bg-blue-700';
      case 'deluxe': return 'bg-purple-600 hover:bg-purple-700';
      case 'addon': return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'basic': return 'Basic';
      case 'premium': return 'Prem';
      case 'deluxe': return 'Delu';
      case 'addon': return 'Add+';
      default: return 'Serv';
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Category Selector */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setExpandedCategory(category.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${expandedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                {category.name} ({getServicesByCategory(category.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getServicesByCategory(expandedCategory).map((service) => (
              <div
                key={service.id}
                className={`${getCategoryStyle(service.category)} text-white rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 group relative min-h-[160px] shadow-lg hover:shadow-xl transform hover:scale-105`}
                onClick={() => onAddToCart(service)}
              >
                {/* Service Name and Description */}
                <div className="mb-3">
                  <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                    {service.name}
                  </h4>
                  <p className="text-white text-opacity-90 text-sm leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center mt-2 text-white text-opacity-80 text-xs">
                    <span className="mr-3">⏱ {service.duration}m</span>
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                      {getCategoryLabel(service.category)}
                    </span>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xl font-bold text-white">
                    ${service.price.toFixed(2)}
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(service);
                    }}
                    className="bg-white text-gray-800 px-3 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                  >
                    + Add
                  </button>
                </div>

                {/* Info Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedService(service);
                  }}
                  className="absolute top-3 right-3 text-white hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white bg-opacity-20 rounded-full p-1 hover:bg-opacity-30"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </>
  );
};

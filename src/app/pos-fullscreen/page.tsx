'use client';

import React, { useState, useEffect } from 'react';
import { POSService, CartItem, POSCustomer } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils';
import { Minus, Plus, X, Save, User, DollarSign } from 'lucide-react';

// Extended services data based on the image
const fullscreenPOSServices: POSService[] = [
  // WASHES - Main Services
  { id: 'wash-1', name: 'Outside Sedan/Hatch', price: 15.00, duration: 20, description: 'Basic exterior wash for sedan and hatchback', category: 'wash', color: '#3B82F6' },
  { id: 'wash-2', name: 'Outside Wagon/SUV', price: 18.00, duration: 25, description: 'Basic exterior wash for wagon and SUV', category: 'wash', color: '#3B82F6' },
  { id: 'wash-3', name: 'Outside 4WD/7 Seater', price: 22.00, duration: 30, description: 'Basic exterior wash for 4WD and 7 seater', category: 'wash', color: '#3B82F6' },
  { id: 'wash-4', name: 'Inside+Outside Sedan/Hatch', price: 25.00, duration: 35, description: 'Full wash inside and outside for sedan/hatch', category: 'wash', color: '#3B82F6' },
  { id: 'wash-5', name: 'Inside+Outside Wagon/SUV', price: 30.00, duration: 40, description: 'Full wash inside and outside for wagon/SUV', category: 'wash', color: '#3B82F6' },
  { id: 'wash-6', name: 'Inside+Outside 4WD/7 Seater', price: 35.00, duration: 45, description: 'Full wash inside and outside for 4WD/7 seater', category: 'wash', color: '#3B82F6' },
  { id: 'wash-7', name: 'Wash+Polish Sedan/Hatch', price: 40.00, duration: 50, description: 'Wash and polish for sedan/hatch', category: 'wash', color: '#3B82F6' },
  { id: 'wash-8', name: 'Wash+Polish Wagon/SUV', price: 45.00, duration: 55, description: 'Wash and polish for wagon/SUV', category: 'wash', color: '#3B82F6' },
  { id: 'wash-9', name: 'Wash+Polish 4WD/7 Seater', price: 50.00, duration: 60, description: 'Wash and polish for 4WD/7 seater', category: 'wash', color: '#3B82F6' },

  // ADDONS
  { id: 'addon-1', name: 'Door Handles Scratches', price: 8.00, duration: 10, description: 'Remove scratches from door handles', category: 'addon', color: '#F59E0B' },
  { id: 'addon-2', name: 'Heavy Bugs/Tar/Rust etc', price: 12.00, duration: 15, description: 'Remove heavy bugs, tar, and rust', category: 'addon', color: '#F59E0B' },
  { id: 'addon-3', name: 'Interior Trim Polished', price: 15.00, duration: 20, description: 'Polish interior trim pieces', category: 'addon', color: '#F59E0B' },
  { id: 'addon-4', name: 'Matte Steam Cleaned', price: 20.00, duration: 25, description: 'Steam clean matte surfaces', category: 'addon', color: '#F59E0B' },
  { id: 'addon-5', name: 'Protective Wax', price: 10.00, duration: 15, description: 'Apply protective wax coating', category: 'addon', color: '#F59E0B' },
  { id: 'addon-6', name: 'Dash Console and Trim Detail', price: 18.00, duration: 20, description: 'Detail dashboard console and trim', category: 'addon', color: '#F59E0B' },
  { id: 'addon-7', name: 'Claybar & Polish', price: 25.00, duration: 30, description: 'Claybar treatment and polish', category: 'addon', color: '#F59E0B' },
  { id: 'addon-8', name: 'MISC', price: 5.00, duration: 10, description: 'Miscellaneous services', category: 'addon', color: '#F59E0B' },

  // DETAILING
  { id: 'detail-1', name: 'Hand Wax & Polish', price: 35.00, duration: 45, description: 'Professional hand wax and polish', category: 'detailing', color: '#10B981' },
  { id: 'detail-2', name: 'Leather Clean & Condition', price: 30.00, duration: 40, description: 'Clean and condition leather seats', category: 'detailing', color: '#10B981' },
  { id: 'detail-3', name: 'Carpet Steam Cleaned', price: 25.00, duration: 35, description: 'Steam clean carpets thoroughly', category: 'detailing', color: '#10B981' },
  { id: 'detail-4', name: 'Seats Steam Cleaned', price: 28.00, duration: 35, description: 'Steam clean all seats', category: 'detailing', color: '#10B981' },
  { id: 'detail-5', name: 'Cut & Polish', price: 45.00, duration: 60, description: 'Professional cut and polish service', category: 'detailing', color: '#10B981' },
  { id: 'detail-6', name: 'Interior Steam Clean', price: 32.00, duration: 40, description: 'Complete interior steam cleaning', category: 'detailing', color: '#10B981' },
  { id: 'detail-7', name: 'Full Detail', price: 80.00, duration: 120, description: 'Complete full detailing service', category: 'detailing', color: '#10B981' },
  { id: 'detail-8', name: 'Mini Detail', price: 40.00, duration: 60, description: 'Mini detailing package', category: 'detailing', color: '#10B981' },

  // NEW CAR PROTECTION
  { id: 'protection-1', name: 'Interior Protection', price: 60.00, duration: 45, description: 'Protect interior surfaces', category: 'protection', color: '#8B5CF6' },
  { id: 'protection-2', name: 'Paint Protection', price: 120.00, duration: 90, description: 'Professional paint protection', category: 'protection', color: '#8B5CF6' },
  { id: 'protection-3', name: 'Scratch & Dent Repairs', price: 80.00, duration: 60, description: 'Repair scratches and dents', category: 'protection', color: '#8B5CF6' },
  { id: 'protection-4', name: 'Alloy Wheel Repair', price: 50.00, duration: 45, description: 'Repair alloy wheels', category: 'protection', color: '#8B5CF6' },
  { id: 'protection-5', name: 'Bumper Repair', price: 70.00, duration: 60, description: 'Professional bumper repair', category: 'protection', color: '#8B5CF6' },
  { id: 'protection-6', name: 'Panel Repair', price: 90.00, duration: 75, description: 'Professional panel repair', category: 'protection', color: '#8B5CF6' },
];

// Food/Beverage services (based on left panel in image)
const foodServices = [
  { id: 'prepaid-1', name: 'Prepaid Sales', price: 0, category: 'prepaid', color: '#FCD34D' },
  { id: 'bakery-1', name: 'Bakery Items', price: 5.00, category: 'bakery', color: '#FB923C' },
  { id: 'sandwich-1', name: 'Sandwiches', price: 8.00, category: 'food', color: '#FB923C' },
  { id: 'pastries-1', name: 'Pastries', price: 4.00, category: 'food', color: '#FB923C' },
  { id: 'icecream-1', name: 'Ice Creams', price: 3.50, category: 'food', color: '#38BDF8' },
  { id: 'cold-1', name: 'Cold Drinks', price: 2.50, category: 'drinks', color: '#4ADE80' },
  { id: 'hot-1', name: 'Hot Drinks', price: 3.00, category: 'drinks', color: '#F87171' },
];

const categories = [
  { id: 'wash', name: 'WASHES', color: '#3B82F6', services: fullscreenPOSServices.filter(s => s.category === 'wash') },
  { id: 'addon', name: 'Addons', color: '#F59E0B', services: fullscreenPOSServices.filter(s => s.category === 'addon') },
  { id: 'detailing', name: 'Detailing', color: '#10B981', services: fullscreenPOSServices.filter(s => s.category === 'detailing') },
  { id: 'protection', name: 'New Car Protection', color: '#8B5CF6', services: fullscreenPOSServices.filter(s => s.category === 'protection') },
];

export default function FullscreenPOSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<POSCustomer | null>(null);
  const [currentCode, setCurrentCode] = useState('');
  const [currentTag, setCurrentTag] = useState('111XXX');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (service: POSService) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.service.id === service.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1, subtotal: item.subtotal + service.price }
            : item
        );
      } else {
        return [...prevCart, { service, quantity: 1, subtotal: service.price }];
      }
    });
  };

  const updateQuantity = (serviceId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.service.id !== serviceId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.service.id === serviceId
            ? { ...item, quantity: newQuantity, subtotal: item.service.price * newQuantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setTotal(0);
  };

  const handleNumberPad = (num: string) => {
    if (num === 'clear') {
      setCurrentCode('');
    } else {
      setCurrentCode(prev => prev + num);
    }
  };

  const NumberButton = ({ children, onClick, className = "" }: { children: React.ReactNode, onClick: () => void, className?: string }) => (
    <button
      onClick={onClick}
      className={`h-16 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-xl transition-colors ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Left Panel - Food & Control */}
      <div className="w-64 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="text-sm text-gray-600">
            <div>Operator: HUBRISTIC</div>
            <div>Tag: {currentTag}</div>
          </div>
        </div>

        {/* Code Entry */}
        <div className="p-4 border-b">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-600 mb-1">CODE</div>
            <div className="font-mono text-lg h-8 bg-white px-2 py-1 rounded border">
              {currentCode}
            </div>
          </div>
        </div>

        {/* Food Categories */}
        <div className="flex-1 p-2 space-y-2">
          {[
            { name: 'WASH DISCOUNTS', color: '#3B82F6' },
            { name: 'PREPAID SALES', color: '#FCD34D' },
            { name: 'BAKERY', color: '#FB923C' },
            { name: 'SANDWICHES', color: '#FB923C' },
            { name: 'PASTRIES', color: '#FB923C' },
            { name: 'ICE CREAMS', color: '#38BDF8' },
            { name: 'COLD DRINKS', color: '#4ADE80' },
            { name: 'HOT DRINKS', color: '#F87171' },
          ].map((category, index) => (
            <button
              key={index}
              className="w-full h-12 rounded text-white font-medium text-sm"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Number Pad */}
        <div className="p-4 border-t">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <NumberButton key={num} onClick={() => handleNumberPad(num.toString())}>
                {num}
              </NumberButton>
            ))}
            <NumberButton onClick={() => handleNumberPad('20')} className="bg-purple-200">
              20
            </NumberButton>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button className="h-12 bg-green-500 hover:bg-green-600 text-white rounded font-bold">
              ↑
            </button>
            <button className="h-12 bg-green-500 hover:bg-green-600 text-white rounded font-bold">
              ↓
            </button>
            <button className="h-12 bg-red-500 hover:bg-red-600 text-white rounded font-bold">
              ×
            </button>
            <button className="h-12 bg-purple-500 hover:bg-purple-600 text-white rounded font-bold text-xs">
              Manager
            </button>
          </div>

          {/* Save Button */}
          <button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded font-bold mb-2">
            SAVE
          </button>        {/* Total Display */}
          <div className="bg-gray-800 text-white p-3 rounded">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold">{formatCurrency(total)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Petty Cash
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar with Cart Summary */}
        <div className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-800">Car Wash POS</div>
              <div className="text-sm text-gray-600">
                Items: {cart.reduce((sum, item) => sum + item.quantity, 0)} |
                Total: {formatCurrency(total)}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={clearCart} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Checkout
              </Button>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-4 gap-6 h-full">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col">
                {/* Category Header */}
                <div
                  className="text-white p-3 rounded-t-lg font-bold text-center"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </div>

                {/* Services in Category */}
                <div className="bg-white rounded-b-lg border border-t-0 flex-1 p-2 space-y-2 overflow-y-auto">
                  {category.services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => addToCart(service)}
                      className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded border text-left transition-colors group"
                    >
                      <div className="font-medium text-sm text-gray-800 mb-1">
                        {service.name}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(service.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {service.duration} min
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Cart - Right Panel */}
        {cart.length > 0 && (
          <div className="w-80 bg-white border-l border-t p-4 max-h-64 overflow-y-auto">
            <h3 className="font-bold text-lg mb-3">Current Order</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.service.name}</div>
                    <div className="text-xs text-gray-600">{formatCurrency(item.service.price)} each</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                      className="w-6 h-6 bg-red-500 text-white rounded text-xs"
                    >
                      <Minus className="w-3 h-3 mx-auto" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                      className="w-6 h-6 bg-green-500 text-white rounded text-xs"
                    >
                      <Plus className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                  <div className="w-16 text-right font-bold">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

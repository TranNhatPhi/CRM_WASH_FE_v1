'use client';

import React, { useState, useEffect } from 'react';
import { POSService, CartItem } from '@/types';
import { formatCurrency } from '@/utils';
import { Minus, Plus, X, Save, Calculator, User, Clock } from 'lucide-react';

// Service data matching the image layout exactly
const washServices = [
  { id: 'w1', name: 'Outside\nSedan / Hatch', price: 15.00, category: 'wash' },
  { id: 'w2', name: 'Outside\nWagon / SUV', price: 18.00, category: 'wash' },
  { id: 'w3', name: 'Outside\n4WD / 7 Seater', price: 22.00, category: 'wash' },
  { id: 'w4', name: 'Inside+Outside\nSedan / Hatch', price: 25.00, category: 'wash' },
  { id: 'w5', name: 'Inside+Outside\nWagon / SUV', price: 30.00, category: 'wash' },
  { id: 'w6', name: 'Inside+Outside\n4WD / 7 Seater', price: 35.00, category: 'wash' },
  { id: 'w7', name: 'Wash+Polish\nSedan / Hatch', price: 40.00, category: 'wash' },
  { id: 'w8', name: 'Wash+Polish\nWagon / SUV', price: 45.00, category: 'wash' },
  { id: 'w9', name: 'Wash+Polish\n4WD / 7 Seater', price: 50.00, category: 'wash' },
];

const addonServices = [
  { id: 'a1', name: 'Door Handles\nScratches', price: 8.00, category: 'addon' },
  { id: 'a2', name: 'Heavy\nBugs/Tar/Rust etc', price: 12.00, category: 'addon' },
  { id: 'a3', name: 'Interior Trim\nPolished', price: 15.00, category: 'addon' },
  { id: 'a4', name: 'Matte Steam\nCleaned', price: 20.00, category: 'addon' },
  { id: 'a5', name: 'Protective Wax', price: 10.00, category: 'addon' },
  { id: 'a6', name: 'Dash Console and\nTrim Detail', price: 18.00, category: 'addon' },
  { id: 'a7', name: 'Claybar & Polish', price: 25.00, category: 'addon' },
  { id: 'a8', name: 'MISC', price: 5.00, category: 'addon' },
];

const detailingServices = [
  { id: 'd1', name: 'Hand Wax & Polish', price: 35.00, category: 'detailing' },
  { id: 'd2', name: 'Leather Clean &\nCondition', price: 30.00, category: 'detailing' },
  { id: 'd3', name: 'Carpet Steam\nCleaned', price: 25.00, category: 'detailing' },
  { id: 'd4', name: 'Seats Steam\nCleaned', price: 28.00, category: 'detailing' },
  { id: 'd5', name: 'Cut & Polish', price: 45.00, category: 'detailing' },
  { id: 'd6', name: 'Interior Steam Clean', price: 32.00, category: 'detailing' },
  { id: 'd7', name: 'Full Detail', price: 80.00, category: 'detailing' },
  { id: 'd8', name: 'Mini Detail', price: 40.00, category: 'detailing' },
];

const protectionServices = [
  { id: 'p1', name: 'Interior Protection', price: 60.00, category: 'protection' },
  { id: 'p2', name: 'Paint Protection', price: 120.00, category: 'protection' },
  { id: 'p3', name: 'Scratch & Dent Repairs', price: 80.00, category: 'protection' },
  { id: 'p4', name: 'Alloy Wheel Repair', price: 50.00, category: 'protection' },
  { id: 'p5', name: 'Bumper Repair', price: 70.00, category: 'protection' },
  { id: 'p6', name: 'Panel Repair', price: 90.00, category: 'protection' },
];

export default function POSFullscreenInterface() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [total, setTotal] = useState(0);
  const [operator] = useState('HUBRISTIC');
  const [tag] = useState('111XXX');

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (service: any) => {
    const posService: POSService = {
      id: service.id,
      name: service.name,
      price: service.price,
      duration: 30,
      description: service.name,
      category: service.category as 'basic' | 'premium' | 'deluxe' | 'addon',
      color: '#3B82F6'
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.service.id === service.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1, subtotal: item.subtotal + service.price }
            : item
        );
      } else {
        return [...prevCart, { service: posService, quantity: 1, subtotal: service.price }];
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
    } else if (num === 'backspace') {
      setCurrentCode(prev => prev.slice(0, -1));
    } else {
      setCurrentCode(prev => prev + num);
    }
  };

  const ServiceButton = ({ service, onClick }: { service: any, onClick: () => void }) => (
    <button
      onClick={onClick}
      className="h-16 bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg shadow-md transition-all duration-150 active:scale-95 flex flex-col items-center justify-center p-2 text-xs font-medium leading-tight"
    >
      <div className="text-center whitespace-pre-line">
        {service.name}
      </div>
      <div className="text-yellow-200 font-bold mt-1">
        ${service.price.toFixed(2)}
      </div>
    </button>
  );

  const CategoryHeader = ({ title, color }: { title: string, color: string }) => (
    <div
      className="h-12 flex items-center justify-center text-white font-bold text-sm rounded-t-lg"
      style={{ backgroundColor: color }}
    >
      {title}
    </div>
  );

  const FoodCategoryButton = ({ name, color }: { name: string, color: string }) => (
    <button
      className="h-10 rounded text-white font-medium text-xs shadow-md hover:shadow-lg transition-shadow"
      style={{ backgroundColor: color }}
    >
      {name}
    </button>
  );

  const NumberPadButton = ({ children, onClick, className = "" }: { children: React.ReactNode, onClick: () => void, className?: string }) => (
    <button
      onClick={onClick}
      className={`h-12 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded font-bold text-lg transition-colors shadow-sm ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden font-sans">
      {/* Left Control Panel */}
      <div className="w-56 bg-white border-r border-gray-300 flex flex-col shadow-lg">
        {/* Header Info */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-700 space-y-1">
            <div><span className="font-medium">Operator:</span> {operator}</div>
            <div><span className="font-medium">Tag:</span> {tag}</div>
          </div>
        </div>

        {/* Code Entry */}
        <div className="p-3 border-b border-gray-200">
          <div className="mb-2">
            <div className="text-xs font-bold text-gray-700 mb-1 bg-green-600 text-white p-1 rounded text-center">CODE</div>
            <div className="h-8 bg-white border border-gray-300 rounded px-2 py-1 font-mono text-sm">
              {currentCode || '\u00A0'}
            </div>
          </div>
        </div>

        {/* Food Categories */}
        <div className="p-2 space-y-1.5 border-b border-gray-200">
          <FoodCategoryButton name="WASH DISCOUNTS" color="#1E40AF" />
          <FoodCategoryButton name="PREPAID SALES" color="#F59E0B" />
          <FoodCategoryButton name="BAKERY" color="#EA580C" />
          <FoodCategoryButton name="SANDWICHES" color="#EA580C" />
          <FoodCategoryButton name="PASTRIES" color="#EA580C" />
          <FoodCategoryButton name="ICE CREAMS" color="#0EA5E9" />
          <FoodCategoryButton name="COLD DRINKS" color="#16A34A" />
          <FoodCategoryButton name="HOT DRINKS" color="#DC2626" />
        </div>

        {/* Number Pad */}
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <NumberPadButton key={num} onClick={() => handleNumberPad(num.toString())}>
                {num}
              </NumberPadButton>
            ))}
            <NumberPadButton onClick={() => handleNumberPad('0')}>0</NumberPadButton>
            <NumberPadButton onClick={() => handleNumberPad('20')} className="bg-purple-200 hover:bg-purple-300">
              20
            </NumberPadButton>
          </div>

          {/* Control Buttons Row */}
          <div className="grid grid-cols-4 gap-1.5">
            <NumberPadButton onClick={() => { }} className="bg-green-500 hover:bg-green-600 text-white">
              ↑
            </NumberPadButton>
            <NumberPadButton onClick={() => { }} className="bg-green-500 hover:bg-green-600 text-white">
              ↓
            </NumberPadButton>
            <NumberPadButton onClick={clearCart} className="bg-red-500 hover:bg-red-600 text-white">
              ×
            </NumberPadButton>
            <NumberPadButton onClick={() => { }} className="bg-purple-500 hover:bg-purple-600 text-white text-xs">
              Mgr
            </NumberPadButton>
          </div>

          {/* Save Button */}
          <NumberPadButton onClick={() => { }} className="w-full bg-green-600 hover:bg-green-700 text-white">
            SAVE
          </NumberPadButton>

          {/* Total Display */}
          <div className="bg-gray-900 text-white p-3 rounded shadow-inner">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">Total</span>
              <span className="text-xl font-bold">${total.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Petty Cash</div>
          </div>
        </div>
      </div>

      {/* Main Service Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top Status Bar */}
        <div className="bg-white border-b border-gray-300 p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-gray-800">Car Wash Point of Sale</h1>
              <div className="text-sm text-gray-600 flex items-center space-x-4">
                <span className="flex items-center">
                  <Calculator className="w-4 h-4 mr-1" />
                  Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold text-green-600">
                Total: ${total.toFixed(2)}
              </div>
              <button
                onClick={clearCart}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
              >
                Clear All
              </button>
              <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors">
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 h-full">
            {/* WASHES Column */}
            <div className="flex flex-col h-full">
              <CategoryHeader title="WASHES" color="#1E40AF" />
              <div className="bg-white rounded-b-lg border border-t-0 border-gray-300 flex-1 p-2 space-y-2 overflow-y-auto shadow-md">
                <div className="grid grid-cols-3 gap-1 text-xs font-medium text-center mb-2 bg-blue-50 p-1 rounded">
                  <div>Outside</div>
                  <div>Outside</div>
                  <div>Outside</div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs font-medium text-center mb-3 bg-blue-50 p-1 rounded">
                  <div>Sedan/Hatch</div>
                  <div>Wagon/SUV</div>
                  <div>4WD/7 Seater</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {washServices.map((service) => (
                    <ServiceButton
                      key={service.id}
                      service={service}
                      onClick={() => addToCart(service)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ADDONS Column */}
            <div className="flex flex-col h-full">
              <CategoryHeader title="Addons" color="#0891B2" />
              <div className="bg-white rounded-b-lg border border-t-0 border-gray-300 flex-1 p-2 space-y-2 overflow-y-auto shadow-md">
                <div className="grid grid-cols-2 gap-2">
                  {addonServices.map((service) => (
                    <ServiceButton
                      key={service.id}
                      service={service}
                      onClick={() => addToCart(service)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* DETAILING Column */}
            <div className="flex flex-col h-full">
              <CategoryHeader title="Detailing" color="#059669" />
              <div className="bg-white rounded-b-lg border border-t-0 border-gray-300 flex-1 p-2 space-y-2 overflow-y-auto shadow-md">
                <div className="grid grid-cols-2 gap-2">
                  {detailingServices.map((service) => (
                    <ServiceButton
                      key={service.id}
                      service={service}
                      onClick={() => addToCart(service)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* NEW CAR PROTECTION Column */}
            <div className="flex flex-col h-full">
              <CategoryHeader title="New Car Protection" color="#7C3AED" />
              <div className="bg-white rounded-b-lg border border-t-0 border-gray-300 flex-1 p-2 space-y-2 overflow-y-auto shadow-md">
                <div className="grid grid-cols-2 gap-2">
                  {protectionServices.map((service) => (
                    <ServiceButton
                      key={service.id}
                      service={service}
                      onClick={() => addToCart(service)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Display at Bottom */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-300 p-4 shadow-lg max-h-48 overflow-y-auto">
            <h3 className="font-bold text-lg mb-3 text-gray-800">Current Order</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cart.map((item) => (
                <div key={item.service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 truncate">{item.service.name}</div>
                    <div className="text-xs text-gray-600">${item.service.price.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                      className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                      className="w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="w-16 text-right font-bold text-sm ml-3">
                    ${item.subtotal.toFixed(2)}
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

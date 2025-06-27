'use client';

import React, { useState, useEffect } from 'react';
import { POSService, CartItem, POSCustomer } from '@/types';
import { formatCurrency } from '@/utils';
import { Minus, Plus, X, User, Phone, Mail, Car, Star, ShoppingCart } from 'lucide-react';

// Service data matching the new layout
const modernPOSServices: POSService[] = [
    // Add-On Services
    { id: 'addon-1', name: 'Interior Protection', price: 35000, duration: 15, description: 'Fabric protection and leather conditioning', category: 'addon', color: '#F59E0B' },
    { id: 'addon-2', name: 'Tire Black', price: 20000, duration: 10, description: 'Tire shine and protection treatment', category: 'addon', color: '#F59E0B' },
    { id: 'addon-3', name: 'Air Freshener', price: 15000, duration: 5, description: 'Premium car air freshener application', category: 'addon', color: '#F59E0B' },
    { id: 'addon-4', name: 'Wax Protection', price: 25000, duration: 10, description: 'Premium wax application for paint protection', category: 'addon', color: '#F59E0B' },

    // Premium Services
    { id: 'premium-1', name: 'Premium Wash', price: 55000, duration: 35, description: 'Full wash, wax application, interior...', category: 'premium', color: '#3B82F6' },
    { id: 'premium-2', name: 'Semi Clean', price: 45000, duration: 30, description: 'Exterior wash, basic interior clean, dashboar...', category: 'premium', color: '#3B82F6' },
    { id: 'premium-3', name: 'VIP Package', price: 85000, duration: 50, description: 'Complete premium service with hand detailing', category: 'premium', color: '#3B82F6' },

    // Basic Services
    { id: 'basic-1', name: 'Express Wash', price: 25000, duration: 15, description: 'Quick exterior wash and rinse', category: 'basic', color: '#10B981' },
    { id: 'basic-2', name: 'Basic Package', price: 35000, duration: 25, description: 'Standard wash with interior vacuum', category: 'basic', color: '#10B981' },
    { id: 'basic-3', name: 'Economy Clean', price: 30000, duration: 20, description: 'Budget-friendly wash solution', category: 'basic', color: '#10B981' },

    // Deluxe Services
    { id: 'deluxe-1', name: 'Detail Wash', price: 85000, duration: 60, description: 'Complete detailing, leather treatment, engine bay cleaning', category: 'deluxe', color: '#8B5CF6' },
    { id: 'deluxe-2', name: 'Supreme Package', price: 120000, duration: 90, description: 'Ultimate car care with full detailing and protection', category: 'deluxe', color: '#8B5CF6' },
    { id: 'deluxe-3', name: 'Luxury Detail', price: 95000, duration: 75, description: 'Premium detailing with leather care and wax', category: 'deluxe', color: '#8B5CF6' },
];

type ServiceCategory = 'all' | 'addon' | 'premium' | 'basic' | 'deluxe';

const categoryTabs = [
    { id: 'all' as ServiceCategory, name: 'All Services', color: '#6B7280' },
    { id: 'addon' as ServiceCategory, name: 'Add-On Services', color: '#F59E0B' },
    { id: 'premium' as ServiceCategory, name: 'Premium Services', color: '#3B82F6' },
    { id: 'basic' as ServiceCategory, name: 'Basic Services', color: '#10B981' },
    { id: 'deluxe' as ServiceCategory, name: 'Deluxe Services', color: '#8B5CF6' },
];

export default function ModernPOSPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<POSCustomer>({
        name: 'dawa',
        phone: '02131230123',
        email: 'akquyen@gmail.com',
        vehiclePlate: 'DUADAUD',
        isVIP: true
    });
    const [activeCategory, setActiveCategory] = useState<ServiceCategory>('addon');
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
        const discount = customer?.isVIP ? subtotal * 0.1 : 0;
        setTotal(subtotal - discount);
    }, [cart, customer]);

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
    };

    const updateCustomer = (field: keyof POSCustomer, value: string | boolean) => {
        setCustomer(prev => ({ ...prev!, [field]: value }));
    };

    const filteredServices = activeCategory === 'all'
        ? modernPOSServices
        : modernPOSServices.filter(service => service.category === activeCategory);

    const ServiceCard = ({ service }: { service: POSService }) => (
        <div className="bg-gray-800 rounded-lg p-4 text-white relative group hover:bg-gray-700 transition-colors">
            {/* Category dot */}
            <div
                className="w-3 h-3 rounded-full absolute top-4 right-4"
                style={{ backgroundColor: service.color }}
            />

            <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{service.description}</p>

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-3">⏱ {service.duration} min</span>
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                        {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{formatCurrency(service.price)}</div>
                <button
                    onClick={() => addToCart(service)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                </button>
            </div>
        </div>
    );

    return (<div className="h-screen bg-gray-900 text-white flex">
        {/* Left Panel - Shopping Cart */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        <h2 className="text-lg font-semibold">Shopping Cart</h2>
                    </div>
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                </div>
            </div>        {/* Cart Items - Fixed Height */}
            <div className="flex-1 p-4 overflow-hidden">
                {cart.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-base">Your cart is empty</p>
                        <p className="text-sm text-gray-500">Add services to get started</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-full">
                        {cart.slice(0, 4).map((item) => (<div key={item.service.id} className="bg-gray-700 rounded-lg p-2 shadow-lg">
                            <div className="flex items-start justify-between mb-1">
                                <div className="flex-1">
                                    <h4 className="font-medium text-xs">{item.service.name}</h4>
                                    <p className="text-xs text-gray-400">{formatCurrency(item.service.price)} each</p>
                                </div>
                                <button
                                    onClick={() => updateQuantity(item.service.id, 0)}
                                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900 hover:bg-opacity-30 rounded"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                                        className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded text-xs flex items-center justify-center transition-colors"
                                    >
                                        <Minus className="w-2 h-2" />
                                    </button>
                                    <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                                        className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center justify-center transition-colors"
                                    >
                                        <Plus className="w-2 h-2" />
                                    </button>
                                </div>
                                <div className="font-bold text-sm">{formatCurrency(item.subtotal)}</div>
                            </div>
                        </div>
                        ))}              {cart.length > 4 && (
                            <div className="text-center text-gray-400 text-xs">
                                +{cart.length - 4} more items
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
                <div className="border-t border-gray-700 p-4 space-y-3 bg-gray-800">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(cart.reduce((sum, item) => sum + item.subtotal, 0))}</span>
                        </div>
                        {customer?.isVIP && (
                            <div className="flex justify-between text-green-400">
                                <span>VIP Discount (10%):</span>
                                <span>-{formatCurrency(cart.reduce((sum, item) => sum + item.subtotal, 0) * 0.1)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t border-gray-600 pt-2">
                            <span>Total:</span>
                            <span className="text-green-400">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={clearCart}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Clear Cart
                        </button>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors text-sm">
                            Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Middle Panel - Services */}
        <div className="flex-1 flex flex-col">
            {/* Service Category Tabs */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <h1 className="text-xl font-bold mb-4">Services</h1>
                <div className="flex flex-wrap gap-2">
                    {categoryTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveCategory(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeCategory === tab.id
                                    ? 'text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            style={{
                                backgroundColor: activeCategory === tab.id ? tab.color : undefined
                            }}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>        {/* Services Grid - Fixed Height */}
            <div className="flex-1 p-4 overflow-hidden">
                <h2 className="text-lg font-semibold mb-3 capitalize">
                    {activeCategory === 'all' ? 'All Services' : `${activeCategory} Services`}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 h-full max-h-[calc(100vh-200px)]">
                    {filteredServices.slice(0, 9).map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>

                {/* Show count if more services available */}
                {filteredServices.length > 9 && (
                    <div className="text-center text-gray-500 text-sm mt-2">
                        Showing 9 of {filteredServices.length} services
                    </div>
                )}
            </div>
        </div>

        {/* Right Panel - Customer Information */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center mb-4">
                    <User className="w-5 h-5 mr-2" />
                    <h2 className="text-lg font-semibold">Customer Information</h2>
                </div>
            </div>        {/* Customer Form - Fixed Height */}
            <div className="flex-1 p-4 overflow-hidden">
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Customer Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <input
                                type="text"
                                value={customer?.name || ''}
                                onChange={(e) => updateCustomer('name', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter customer name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Phone Number <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <input
                                type="tel"
                                value={customer?.phone || ''}
                                onChange={(e) => updateCustomer('phone', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1">Email (Optional)</label>
                        <div className="relative">
                            <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <input
                                type="email"
                                value={customer?.email || ''}
                                onChange={(e) => updateCustomer('email', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter email address"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1">Vehicle Plate (Optional)</label>
                        <div className="relative">
                            <Car className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <input
                                type="text"
                                value={customer?.vehiclePlate || ''}
                                onChange={(e) => updateCustomer('vehiclePlate', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter plate number"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="vip"
                            checked={customer?.isVIP || false}
                            onChange={(e) => updateCustomer('isVIP', e.target.checked)}
                            className="w-3 h-3 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="vip" className="ml-2 text-xs flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 mr-1" />
                            VIP Customer (10% discount)
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg font-medium transition-colors text-xs">
                            Update Customer
                        </button>
                        <button
                            onClick={() => setCustomer({ name: '', phone: '', email: '', vehiclePlate: '', isVIP: false })}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-xs"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Customer Preview */}
                    {customer?.name && (
                        <div className="bg-blue-900 bg-opacity-50 border border-blue-600 rounded-lg p-2 mt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-sm">{customer.name}</div>
                                    <div className="text-xs text-gray-300">
                                        {customer.phone}
                                        {customer.vehiclePlate && ` • ${customer.vehiclePlate}`}
                                    </div>
                                    {customer.isVIP && (
                                        <div className="flex items-center text-yellow-400 text-xs mt-1">
                                            <Star className="w-2 h-2 mr-1" />
                                            VIP Customer
                                        </div>
                                    )}
                                </div>
                                <div className="text-green-400 text-xs">✓ Ready</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
}

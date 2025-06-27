'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { POSService, CartItem } from '@/types';
import { formatCurrency } from '@/utils';
import { Minus, Plus, X, ShoppingCart, CreditCard, Sun, Moon } from 'lucide-react';

// Updated service data with improved colors
const washServices = [
    { id: 'w1', name: 'Outside Only - Sedan/Hatch', price: 15.00, category: 'wash', color: '#14B8A6', darkColor: '#0D9488' },
    { id: 'w2', name: 'Outside Only - Wagon/SUV', price: 18.00, category: 'wash', color: '#14B8A6', darkColor: '#0D9488' },
    { id: 'w3', name: 'Outside Only - 4WD/7 Seater', price: 22.00, category: 'wash', color: '#14B8A6', darkColor: '#0D9488' },
    { id: 'w4', name: 'Inside+Outside - Sedan/Hatch', price: 25.00, category: 'wash', color: '#14B8A6', darkColor: '#0D9488' },
    { id: 'w5', name: 'Inside+Outside - Wagon/SUV', price: 30.00, category: 'wash', color: '#14B8A6', darkColor: '#0D9488' },
    { id: 'w6', name: 'Inside+Outside - 4WD/7 Seater', price: 35.00, category: 'wash', color: '#14B8A6', darkColor: '#0D9488' },
    { id: 'w7', name: 'Wash+Polish - Sedan/Hatch', price: 40.00, category: 'wash', color: '#14B8A6', darkColor: '#0D9488' },
    { id: 'w8', name: 'Wash+Polish - Wagon/SUV', price: 45.00, category: 'wash', color: '#14B8A6', darkColor: '#0D9488' },
    { id: 'w9', name: 'Wash+Polish - 4WD/7 Seater', price: 50.00, category: 'wash', color: '#14B8A6', darkColor: '#0D9488' },
];

const addonServices = [
    { id: 'a1', name: 'Door Handle Scratches', price: 8.00, category: 'addon', color: '#F97316', darkColor: '#EA580C' },
    { id: 'a2', name: 'Heavy Bugs/Tar/Rust etc', price: 12.00, category: 'addon', color: '#F97316', darkColor: '#EA580C' },
    { id: 'a3', name: 'Interior Trim Polished', price: 15.00, category: 'addon', color: '#F97316', darkColor: '#EA580C' },
    { id: 'a4', name: 'Matte Steam Cleaned', price: 20.00, category: 'addon', color: '#F97316', darkColor: '#EA580C' },
    { id: 'a5', name: 'Protective Wax', price: 10.00, category: 'addon', color: '#F97316', darkColor: '#EA580C' },
    { id: 'a6', name: 'Dash Console & Trim Detail', price: 18.00, category: 'addon', color: '#F97316', darkColor: '#EA580C' },
    { id: 'a7', name: 'Claybar & Polish', price: 25.00, category: 'addon', color: '#F97316', darkColor: '#EA580C' },
    { id: 'a8', name: 'Miscellaneous', price: 5.00, category: 'addon', color: '#F97316', darkColor: '#EA580C' },
];

const detailingServices = [
    { id: 'd1', name: 'Hand Wax & Polish', price: 35.00, category: 'detailing', color: '#059669', darkColor: '#047857' },
    { id: 'd2', name: 'Leather Clean & Condition', price: 30.00, category: 'detailing', color: '#059669', darkColor: '#047857' },
    { id: 'd3', name: 'Carpet Steam Cleaned', price: 25.00, category: 'detailing', color: '#059669', darkColor: '#047857' },
    { id: 'd4', name: 'Seats Steam Cleaned', price: 28.00, category: 'detailing', color: '#059669', darkColor: '#047857' },
    { id: 'd5', name: 'Cut & Polish', price: 45.00, category: 'detailing', color: '#059669', darkColor: '#047857' },
    { id: 'd6', name: 'Interior Steam Clean', price: 32.00, category: 'detailing', color: '#059669', darkColor: '#047857' },
    { id: 'd7', name: 'Full Detail', price: 80.00, category: 'detailing', color: '#059669', darkColor: '#047857' },
    { id: 'd8', name: 'Mini Detail', price: 40.00, category: 'detailing', color: '#059669', darkColor: '#047857' },
];

const protectionServices = [
    { id: 'p1', name: 'Interior Protection', price: 60.00, category: 'protection', color: '#8B5CF6', darkColor: '#7C3AED' },
    { id: 'p2', name: 'Paint Protection', price: 120.00, category: 'protection', color: '#8B5CF6', darkColor: '#7C3AED' },
    { id: 'p3', name: 'Scratch & Dent Repairs', price: 80.00, category: 'protection', color: '#8B5CF6', darkColor: '#7C3AED' },
    { id: 'p4', name: 'Alloy Wheel Repair', price: 50.00, category: 'protection', color: '#8B5CF6', darkColor: '#7C3AED' },
    { id: 'p5', name: 'Bumper Repair', price: 70.00, category: 'protection', color: '#8B5CF6', darkColor: '#7C3AED' },
    { id: 'p6', name: 'Panel Repair', price: 90.00, category: 'protection', color: '#8B5CF6', darkColor: '#7C3AED' },
];

export default function POSPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeCategory, setActiveCategory] = useState('WASHES');
    const router = useRouter();

    useEffect(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
        setTotal(subtotal);
    }, [cart]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const addToCart = (service: any) => {
        const posService: POSService = {
            id: service.id,
            name: service.name,
            price: service.price,
            duration: 30,
            description: service.name,
            category: service.category as 'basic' | 'premium' | 'deluxe' | 'addon' | 'wash' | 'detailing' | 'protection' | 'maintenance',
            color: service.color
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

    const removeFromCart = (serviceId: string) => {
        setCart(prevCart => prevCart.filter(item => item.service.id !== serviceId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const processTransaction = () => {
        if (cart.length === 0) {
            alert('Please add services to cart');
            return;
        }

        // Save cart to localStorage for payment page
        localStorage.setItem('pos-cart', JSON.stringify(cart));

        // Navigate to payment page
        router.push('/payment');
    };

    // Service Button Component
    const ServiceButton = ({ service, onClick }: { service: any; onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`h-20 border rounded-lg transition-all duration-200 text-xs font-medium p-2 text-center shadow-sm hover:shadow-lg transform hover:scale-105 ${isDarkMode
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-white'
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900'
                }`}
            style={{
                borderTopColor: isDarkMode ? service.darkColor : service.color,
                borderTopWidth: '3px',
            }}
        >
            <div className="flex flex-col justify-between h-full">
                <div className="font-medium text-center text-xs leading-tight">
                    {service.name}
                </div>
                <div className={`font-bold text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    ${service.price.toFixed(2)}
                </div>
            </div>
        </button>
    );

    const categories = [
        { id: 'WASHES', name: 'WASHES', color: 'bg-blue-600', active: true },
        { id: 'WASH_DISCOUNTS', name: 'WASH DISCOUNTS', color: 'bg-gray-600' },
        { id: 'PREPAID_SALES', name: 'PREPAID SALES', color: 'bg-yellow-500' },
        { id: 'BAKERY', name: 'BAKERY', color: 'bg-orange-500' },
        { id: 'SANDWICHES', name: 'SANDWICHES', color: 'bg-amber-600' },
        { id: 'PASTRIES', name: 'PASTRIES', color: 'bg-yellow-600' },
        { id: 'ICE_CREAMS', name: 'ICE CREAMS', color: 'bg-cyan-500' },
        { id: 'COLD_DRINKS', name: 'COLD DRINKS', color: 'bg-green-500' },
        { id: 'HOT_DRINKS', name: 'HOT DRINKS', color: 'bg-red-500' },
    ];

    return (
        <div className={`h-screen flex flex-col transition-all duration-300 ${isDarkMode
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
            }`}>
            {/* Header */}
            <div className={`border-b p-4 shadow-lg backdrop-blur-sm ${isDarkMode
                ? 'bg-gray-800/90 border-gray-700'
                : 'bg-white/90 border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🚗 Point of Sale
                    </h1>
                    <div className="flex items-center space-x-6">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode
                                ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                                : 'bg-gray-800 hover:bg-gray-700 text-white'
                                }`}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Cart: {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                        </div>
                        <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            Total: {formatCurrency(total)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Horizontal Layout */}
            <div className="flex-1 flex gap-4 p-4">
                {/* Left Sidebar - Category Navigation */}
                <div className="w-48 flex flex-col space-y-1">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`w-full p-3 text-center font-bold text-white rounded-lg shadow-lg transition-all duration-200 text-sm ${activeCategory === category.id
                                ? category.color + ' opacity-100'
                                : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-500 hover:bg-gray-600')
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}

                    {/* Petty Cash Button */}
                    <button className={`w-full p-3 mt-4 text-center font-bold bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-all duration-200 text-sm`}>
                        Petty Cash
                    </button>
                </div>

                {/* Main Services Area */}
                <div className="flex-1 flex gap-4">
                    {/* Services Panel */}
                    <div className="flex-1 flex flex-col">
                        <div className={`flex-1 rounded-lg border shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-white border-gray-300'}`}>
                            {/* Header Bar */}
                            <div className={`border-b p-3 flex items-center justify-between ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                                <div className="flex items-center space-x-4">
                                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Washes</h2>
                                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                        NOTES
                                    </button>
                                </div>
                                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    100%
                                </div>
                            </div>

                            {/* Services Content */}
                            <div className="p-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                                {/* Washes Section */}
                                <div>
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {washServices.map((service) => (
                                            <ServiceButton
                                                key={service.id}
                                                service={service}
                                                onClick={() => addToCart(service)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Addons Section */}
                                <div>
                                    <div className={`border-b pb-2 mb-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Addons</h3>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3 mb-6">
                                        {addonServices.map((service) => (
                                            <ServiceButton
                                                key={service.id}
                                                service={service}
                                                onClick={() => addToCart(service)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Detailing Section */}
                                <div>
                                    <div className={`border-b pb-2 mb-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Detailing</h3>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3 mb-6">
                                        {detailingServices.map((service) => (
                                            <ServiceButton
                                                key={service.id}
                                                service={service}
                                                onClick={() => addToCart(service)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* New Car Protection Section */}
                                <div>
                                    <div className={`border-b pb-2 mb-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>New Car Protection</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
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

                    {/* Shopping Cart Panel */}
                    <div className="w-80 flex flex-col">
                        <div className={`rounded-lg border p-4 shadow-xl backdrop-blur-sm flex-1 ${isDarkMode
                            ? 'bg-gray-800/70 border-gray-600'
                            : 'bg-white/90 border-gray-300'
                            }`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`font-bold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <ShoppingCart className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                    Shopping Cart
                                </h3>
                                {cart.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className={`text-sm font-medium transition-colors ${isDarkMode
                                            ? 'text-red-400 hover:text-red-300'
                                            : 'text-red-600 hover:text-red-800'
                                            }`}
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                                {cart.length === 0 ? (
                                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <ShoppingCart className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                                        <p>Cart is empty</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map((item) => (
                                            <div key={item.service.id} className={`rounded-lg p-3 border transition-all duration-200 hover:shadow-md ${isDarkMode
                                                ? 'bg-gray-700/50 border-gray-600'
                                                : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className={`font-semibold text-sm leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {item.service.name}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.service.id)}
                                                        className={`ml-2 transition-colors hover:scale-110 ${isDarkMode
                                                            ? 'text-red-400 hover:text-red-300'
                                                            : 'text-red-500 hover:text-red-700'
                                                            }`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isDarkMode
                                                                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                                }`}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className={`w-8 text-center text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isDarkMode
                                                                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                                }`}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <span className={`font-bold text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                        {formatCurrency(item.subtotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cart Summary */}
                            <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(cart.reduce((sum, item) => sum + item.subtotal, 0))}</span>
                                    </div>
                                    <div className={`flex justify-between font-bold text-lg border-t pt-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                        <span>Total:</span>
                                        <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Process Transaction Button */}
                                <button
                                    onClick={processTransaction}
                                    disabled={cart.length === 0}
                                    className={`w-full mt-4 py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center shadow-lg ${cart.length === 0
                                        ? isDarkMode
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : isDarkMode
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/25'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-500/25'
                                        }`}
                                >
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Process Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

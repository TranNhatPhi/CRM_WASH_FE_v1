'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ShoppingCart,
    Plus,
    Minus,
    CreditCard,
    Smartphone,
    DollarSign,
    Users,
    Clock,
    Car,
    Sun,
    Moon
} from 'lucide-react';
import { formatCurrency } from '@/utils';
import { mockPOSServices } from '@/lib/data';
import { POSService } from '@/types';

interface CartItem {
    service: POSService;
    quantity: number;
    subtotal: number;
}

export default function PocketPOSPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]); const [selectedCategory, setSelectedCategory] = useState('basic');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const categories = [
        { id: 'basic', name: 'Basic', icon: '🚗', color: 'teal' },
        { id: 'premium', name: 'Premium', icon: '✨', color: 'blue' },
        { id: 'deluxe', name: 'Deluxe', icon: '💎', color: 'purple' },
        { id: 'addon', name: 'Add-ons', icon: '🔧', color: 'orange' }
    ]; const getFilteredServices = () => {
        return mockPOSServices.filter((service: POSService) => service.category === selectedCategory);
    };

    const addToCart = (service: POSService) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.service.id === service.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.service.id === service.id
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.service.price }
                        : item
                );
            } else {
                return [...prevCart, {
                    service,
                    quantity: 1,
                    subtotal: service.price
                }];
            }
        });
    };

    const removeFromCart = (serviceId: string) => {
        setCart(prevCart => {
            return prevCart.reduce((acc, item) => {
                if (item.service.id === serviceId) {
                    if (item.quantity > 1) {
                        acc.push({
                            ...item,
                            quantity: item.quantity - 1,
                            subtotal: (item.quantity - 1) * item.service.price
                        });
                    }
                } else {
                    acc.push(item);
                }
                return acc;
            }, [] as CartItem[]);
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + item.subtotal, 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;

        // Store cart data in localStorage for payment page
        localStorage.setItem('cartData', JSON.stringify({
            items: cart,
            total: getTotalAmount(),
            timestamp: Date.now()
        }));

        router.push('/payment');
    };

    return (
        <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10`}>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => router.push('/login')}
                        className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold">PocketPOS</h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <div className="relative">
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${cart.length === 0
                                    ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                                    : `${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                                }`}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="hidden sm:inline">Cart</span>
                            {getTotalItems() > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4`}>
                <div className="flex space-x-1 overflow-x-auto">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${selectedCategory === category.id
                                    ? `border-${category.color}-500 text-${category.color}-600 ${isDarkMode ? 'text-' + category.color + '-400' : ''}`
                                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                                }`}
                        >
                            <span className="text-lg">{category.icon}</span>
                            <span>{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
                {/* Services Grid */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {getFilteredServices().map((service: POSService) => {
                            const cartItem = cart.find(item => item.service.id === service.id);
                            const quantity = cartItem?.quantity || 0;

                            return (
                                <div
                                    key={service.id}
                                    className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer`}
                                    onClick={() => addToCart(service)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-sm leading-tight">{service.name}</h3>
                                        {quantity > 0 && (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFromCart(service.id);
                                                    }}
                                                    className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                    {quantity}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(service);
                                                    }}
                                                    className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                            {formatCurrency(service.price)}
                                        </span>
                                        {quantity === 0 && (
                                            <Plus className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Cart Sidebar (Mobile: Bottom Sheet, Desktop: Right Panel) */}
                {cart.length > 0 && (
                    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t lg:border-l lg:border-t-0 lg:w-80 p-4`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Order Summary</h2>
                            <button
                                onClick={clearCart}
                                className={`text-sm ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors`}
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="space-y-3 mb-4 max-h-60 lg:max-h-96 overflow-y-auto">
                            {cart.map((item) => (
                                <div key={item.service.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-sm">{item.service.name}</h4>
                                        <span className="font-bold text-sm">
                                            {formatCurrency(item.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => removeFromCart(item.service.id)}
                                                className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => addToCart(item.service)}
                                                className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {formatCurrency(item.service.price)} each
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t pt-4`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                    {formatCurrency(getTotalAmount())}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${isDarkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                <span>Proceed to Payment</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
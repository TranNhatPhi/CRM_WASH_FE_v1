'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, Printer, Gift, Mail, Sun, Moon } from 'lucide-react';
import { formatCurrency } from '@/utils';

interface CartItem {
    service: {
        id: string;
        name: string;
        price: number;
    };
    quantity: number;
    subtotal: number;
}

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [showCashModal, setShowCashModal] = useState(false);
    const [amountGiven, setAmountGiven] = useState('');
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [carInfo, setCarInfo] = useState<any>(null);
    const [customerInfo, setCustomerInfo] = useState<any>(null); useEffect(() => {
        // Get cart data from localStorage or URL params
        const cartData = localStorage.getItem('pos-cart');
        if (cartData) {
            const parsedData = JSON.parse(cartData);
            // Handle both old format (direct cart array) and new format (transaction object)
            const cartItems = Array.isArray(parsedData) ? parsedData : parsedData.cart || [];

            // Set car and customer info if available
            if (parsedData.carInfo) {
                setCarInfo(parsedData.carInfo);
            }
            if (parsedData.customerInfo) {
                setCustomerInfo(parsedData.customerInfo);
            }
            // Legacy support for old customer format
            if (parsedData.customer) {
                setCustomerInfo(parsedData.customer);
            } setCart(cartItems);

            const subtotalAmount = cartItems.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0);

            // Apply VIP discount if customer is VIP
            const isVip = parsedData.customerInfo?.isVip || false;
            const discountedSubtotal = isVip ? subtotalAmount * 0.9 : subtotalAmount; // 10% discount for VIP
            const taxAmount = discountedSubtotal * 0.1; // 10% tax

            setSubtotal(subtotalAmount); // Keep original subtotal for display
            setTax(taxAmount);
            setTotal(discountedSubtotal + taxAmount);
        }
    }, []); const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const formatStatus = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'in-progress':
                return 'In Progress';
            case 'finished':
                return 'Finished';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in-progress':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'finished':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColorDark = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-blue-800 text-blue-200 border-blue-600';
            case 'in-progress':
                return 'bg-orange-800 text-orange-200 border-orange-600';
            case 'finished':
                return 'bg-green-800 text-green-200 border-green-600';
            default:
                return 'bg-gray-700 text-gray-300 border-gray-600';
        }
    };

    // Function to update car status
    const updateCarStatus = (newStatus: string) => {
        if (carInfo) {
            const updatedCarInfo = { ...carInfo, status: newStatus };
            setCarInfo(updatedCarInfo);

            // Also update localStorage to persist the change
            const cartData = localStorage.getItem('pos-cart');
            if (cartData) {
                const parsedData = JSON.parse(cartData);
                parsedData.carInfo = updatedCarInfo;
                localStorage.setItem('pos-cart', JSON.stringify(parsedData));
            }
        }
    };

    // Handler for Start WASH button
    const handleStartWash = () => {
        updateCarStatus('in-progress');
    };

    // Handler for Finish WASH button
    const handleFinishWash = () => {
        updateCarStatus('finished');
    };

    // Handler for Cancel button
    const handleCancel = () => {
        updateCarStatus('pending');
    }; const handlePaymentMethod = (method: string) => {
        setPaymentMethod(method);
        if (method === 'Cash') {
            setShowCashModal(true);
        } else {
            // For other payment methods, complete payment immediately
            completePayment(method);
        }
    };

    const handleCashPayment = () => {
        const given = parseFloat(amountGiven);
        if (given >= total) {
            completePayment('Cash');
            setShowCashModal(false);
        }
    };

    const completePayment = (method: string) => {
        setPaymentComplete(true);
        setPaymentMethod(method);
        // Clear cart from localStorage
        localStorage.removeItem('pos-cart');
    }; const handleCompleteSale = () => {
        router.push('/pos');
    }; const handleBack = () => {
        router.push('/pos');
    };

    const handleMainMenu = () => {
        router.push('/pos-dashboard');
    };

    if (paymentComplete) {
        return (
            <div className={`h-screen transition-all duration-300 ${isDarkMode
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                : 'bg-gradient-to-br from-gray-100 via-gray-50 to-white'
                }`}>
                {/* Header */}
                <div className={`p-4 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBack}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDarkMode
                                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                    }`}
                            >
                                Back to POS
                            </button>
                            <button
                                onClick={handleMainMenu}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDarkMode
                                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                    }`}>
                                Main Menu
                            </button>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode
                                ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900'
                                : 'bg-slate-800 hover:bg-slate-700 text-white'
                                }`}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(100vh-80px)]">                    {/* Left Panel - Sale Details */}
                    <div className={`w-2/5 p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} flex flex-col`}>                        {/* Car Info Box */}
                        <div className={`mb-6 p-4 border-2 border-dashed rounded-lg ${isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-400 bg-gray-50'
                            }`}>
                            <div className={`text-center font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Customer & Vehicle Information
                            </div>
                            <div className={`text-center text-sm mt-2 space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                {customerInfo ? (
                                    <>
                                        <div><strong>Name:</strong> {customerInfo.name}</div>
                                        <div><strong>Phone:</strong> {customerInfo.phone}</div>
                                        {customerInfo.email && (
                                            <div><strong>Email:</strong> {customerInfo.email}</div>
                                        )}
                                        {customerInfo.vehiclePlate && (
                                            <div><strong>Vehicle Plate:</strong> {customerInfo.vehiclePlate}</div>
                                        )}
                                        {carInfo?.licensePlate && (
                                            <div><strong>Car Registration:</strong> {carInfo.licensePlate}</div>
                                        )}
                                    </>
                                ) : carInfo ? (
                                    `${carInfo.licensePlate} Name: ${carInfo.customer} Time: ${carInfo.time}`
                                ) : (
                                    'ABC-123 Name: Minh Phone: 012312310'
                                )}
                            </div>
                        </div>

                        {/* Scrollable Items List */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 ${isDarkMode ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-800' : ''}`}>
                                <div className="space-y-3 pr-2">
                                    {cart.map((item, index) => (
                                        <div key={item.service.id} className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${isDarkMode ? 'border-slate-600 bg-slate-700 hover:bg-slate-600' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {item.service.name}
                                                    </div>
                                                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                                        Qty: {item.quantity}
                                                    </div>
                                                </div>
                                                <div className={`font-bold text-blue-600 text-lg`}>
                                                    {formatCurrency(item.subtotal)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {cart.length === 0 && (
                                        <div className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                            <p>No items in cart</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Section - Fixed at bottom */}
                        <div className={`border-t pt-4 space-y-2 mt-4 ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                            <div className={`flex justify-between ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                <span>Tax (10%)</span>
                                <span>{formatCurrency(tax)}</span>
                            </div>
                            <div className={`flex justify-between font-bold text-lg border-t pt-3 ${isDarkMode ? 'border-slate-600 text-white' : 'border-gray-200 text-gray-900'
                                }`}>
                                <span>SALE TOTAL</span>
                                <span className="text-green-600">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>                        {/* Payment Status */}
                        <div className={`mt-6 pt-4 space-y-3 ${isDarkMode ? 'border-t border-slate-600' : 'border-t border-gray-200'}`}>
                            <div className="space-y-2">
                                <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    PAID: {formatCurrency(total)}
                                </div>
                                <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold">
                                    Remaining: $0.00
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Car Wash Controls */}
                    <div className={`flex-1 p-8 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                        <div className="text-center mb-8">
                            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                Amount to Pay
                            </h1>
                            <div className="text-5xl font-bold text-green-600 mb-4">
                                {formatCurrency(total)}
                            </div>
                            <button className="text-sm text-blue-600 hover:underline transition-colors">
                                Edit to make a partial payment
                            </button>
                        </div>

                        {/* Payment Method Buttons */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <button className="py-4 px-4 text-lg font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                💵 Cash
                            </button>
                            <button className="py-4 px-4 text-lg font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                🎁 Gift Card
                            </button>
                            <button className="py-4 px-4 text-lg font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                💳 Card Payment
                            </button>
                        </div>

                        <div className="mb-8">
                            <button className="w-full py-4 text-xl font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                ⚡ Lightspeed Payments
                            </button>
                        </div>

                        {/* Customer Status and Controls */}
                        <div className="text-center space-y-4">
                            <div className="text-sm text-gray-600 mb-4">
                                Add a customer to pay with the following options:
                            </div>                            <div className={`p-4 rounded-lg border ${isDarkMode ? getStatusColorDark(carInfo?.status || 'pending') : getStatusColor(carInfo?.status || 'pending')} text-center`}>
                                <div className="font-medium">
                                    Car Status: {formatStatus(carInfo?.status || 'pending')}
                                </div>
                            </div>                            {/* Action Buttons */}
                            <div className="flex space-x-4 mt-8">
                                {carInfo?.status === 'pending' && (
                                    <button
                                        onClick={handleStartWash}
                                        className="flex-1 py-4 text-xl font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                    >
                                        Start WASH
                                    </button>
                                )}
                                {carInfo?.status === 'in-progress' && (
                                    <button
                                        onClick={handleFinishWash}
                                        className="flex-1 py-4 text-xl font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                    >
                                        Finish WASH
                                    </button>
                                )}
                                {carInfo?.status === 'finished' && (
                                    <button
                                        onClick={handleCompleteSale}
                                        className="flex-1 py-4 text-xl font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                    >
                                        Complete
                                    </button>
                                )}
                                {!carInfo?.status && (
                                    <>
                                        <button
                                            onClick={handleStartWash}
                                            className="flex-1 py-4 text-xl font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                        >
                                            Start WASH
                                        </button>
                                        <button
                                            onClick={handleCompleteSale}
                                            className="flex-1 py-4 text-xl font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                        >
                                            Finish
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 py-4 text-xl font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } return (
        <div className={`h-screen transition-all duration-300 ${isDarkMode
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-gray-100 via-gray-50 to-white'
            }`}>
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBack}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDarkMode
                                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                                }`}
                        >
                            Back to POS
                        </button>
                        <button
                            onClick={handleMainMenu}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDarkMode
                                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                                }`}>
                            Main Menu
                        </button>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                            }`}
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex h-[calc(100vh-80px)]">
                {/* Left Panel - Sale Details */}
                <div className={`w-2/5 p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} flex flex-col`}>
                    {/* Car Info Box - Always show for consistency */}
                    <div className={`mb-6 p-4 border rounded-lg shadow-sm ${isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-300 bg-white'}`}>
                        <div className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            🚗 Car Info
                        </div>

                        {carInfo ? (
                            <div className={`space-y-1 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                <div><span className="font-medium">License Plate:</span> {carInfo.licensePlate}</div>
                                <div><span className="font-medium">Customer:</span> {carInfo.customer}</div>
                                <div><span className="font-medium">Time:</span> {carInfo.time}</div>
                            </div>
                        ) : customerInfo ? (
                            <div className={`space-y-1 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                <div><span className="font-medium">Name:</span> {customerInfo.name}</div>
                                <div><span className="font-medium">Phone:</span> {customerInfo.phone}</div>
                                {customerInfo.isVip && (
                                    <div className="text-yellow-400 font-semibold">⭐ VIP Customer (10% discount applied)</div>
                                )}
                            </div>
                        ) : (
                            <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                <div><span className="font-medium">License Plate:</span> ABC-123</div>
                                <div><span className="font-medium">Name:</span> Minh</div>
                                <div><span className="font-medium">Phone:</span> 012312310</div>
                            </div>
                        )}
                    </div>

                    {/* Scrollable Items List */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className={`mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'} font-semibold`}>
                            Items ({cart.length})
                        </div>
                        <div className={`flex-1 overflow-y-auto scrollbar-thin pr-2 ${isDarkMode ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-800' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200'}`}
                            style={{ maxHeight: 'calc(100vh - 450px)' }}>
                            <div className="space-y-3">
                                {cart.map((item, index) => (
                                    <div key={item.service.id} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${isDarkMode ? 'border-slate-600 bg-slate-700 hover:bg-slate-600' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 pr-3">
                                                <div className={`font-semibold text-base mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {item.service.name}
                                                </div>
                                                <div className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                                    <span>Qty: {item.quantity}</span>
                                                    <span>•</span>
                                                    <span>{formatCurrency(item.service.price)}/each</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-blue-600 text-lg">
                                                    {formatCurrency(item.subtotal)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {cart.length === 0 && (
                                    <div className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                        <div className="text-4xl mb-4">🛒</div>
                                        <p className="text-lg font-medium">No items in cart</p>
                                        <p className="text-sm mt-2">Add services to get started</p>
                                    </div>
                                )}
                                {/* Add padding at bottom for better scroll experience */}
                                {cart.length > 0 && <div className="h-4"></div>}
                            </div>
                        </div>
                    </div>                    {/* Summary Section - Fixed at bottom */}
                    <div className={`border-t pt-4 space-y-2 mt-4 ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                        <div className={`flex justify-between ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {customerInfo?.isVip && (
                            <div className={`flex justify-between text-sm ${isDarkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
                                <span>⭐ VIP Discount (10%)</span>
                                <span>-{formatCurrency(subtotal * 0.1)}</span>
                            </div>
                        )}
                        <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            <span>Tax (10%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>                        <div className={`flex justify-between font-bold text-lg border-t pt-3 ${isDarkMode ? 'border-slate-600 text-white' : 'border-gray-200 text-gray-900'
                            }`}>
                            <span>SALE TOTAL</span>
                            <span className="text-green-600">
                                {formatCurrency(total)}
                            </span>
                        </div>

                        {/* Payment Status */}
                        <div className={`mt-6 pt-4 space-y-3 ${isDarkMode ? 'border-t border-slate-600' : 'border-t border-gray-200'}`}>
                            <div className="space-y-2">
                                <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    PAID: $0.00
                                </div>
                                <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold">
                                    Remaining: {formatCurrency(total)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Payment Options */}
                <div className={`flex-1 p-8 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <div className="text-center mb-8">
                        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Amount to Pay
                        </h1>
                        <div className="text-5xl font-bold text-green-600 mb-4">
                            {formatCurrency(total)}
                        </div>
                        <button className="text-sm text-blue-600 hover:underline transition-colors">
                            Edit to make a partial payment
                        </button>
                    </div>

                    {/* Payment Method Buttons */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <button
                            onClick={() => handlePaymentMethod('Cash')}
                            className="py-4 px-4 text-lg font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            💵 Cash
                        </button>
                        <button
                            onClick={() => handlePaymentMethod('Gift Card')}
                            className="py-4 px-4 text-lg font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            🎁 Gift Card
                        </button>
                        <button
                            onClick={() => handlePaymentMethod('Card Payment')}
                            className="py-4 px-4 text-lg font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            💳 Card Payment
                        </button>
                    </div>

                    <div className="mb-8">
                        <button
                            onClick={() => handlePaymentMethod('Lightspeed Payments')}
                            className="w-full py-4 text-xl font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            ⚡ Lightspeed Payments
                        </button>
                    </div>

                    {/* Customer Options */}
                    <div className="text-center">
                        <div className={`text-sm mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                            Add a customer to pay with the following options:
                        </div>                        {/* Car Status */}
                        <div className={`p-4 rounded-lg mt-6 border ${isDarkMode ? getStatusColorDark(carInfo?.status || 'pending') : getStatusColor(carInfo?.status || 'pending')} text-center`}>
                            <div className="font-medium">
                                Car Status: {formatStatus(carInfo?.status || 'pending')}
                            </div>
                        </div>                        {/* Action Buttons */}
                        <div className="flex space-x-4 mt-6">
                            {carInfo?.status === 'pending' && (
                                <button
                                    onClick={handleStartWash}
                                    className="flex-1 py-4 text-xl font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                >
                                    Start WASH
                                </button>
                            )}
                            {carInfo?.status === 'in-progress' && (
                                <button
                                    onClick={handleFinishWash}
                                    className="flex-1 py-4 text-xl font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                >
                                    Finish WASH
                                </button>
                            )}
                            {carInfo?.status === 'finished' && (
                                <button className="flex-1 py-4 text-xl font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                    Complete
                                </button>
                            )}
                            {!carInfo?.status && (
                                <>
                                    <button
                                        onClick={handleStartWash}
                                        className="flex-1 py-4 text-xl font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                                    >
                                        Start WASH
                                    </button>
                                    <button className="flex-1 py-4 text-xl font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200 hover:scale-105 shadow-lg">
                                        Finish
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-4 text-xl font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105 shadow-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>{/* Cash Payment Modal */}
            {showCashModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`rounded-xl p-6 w-96 shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Cash Payment
                            </h3>
                            <button onClick={() => setShowCashModal(false)}>
                                <X className={`w-6 h-6 ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Amount to pay: <span className="text-green-600">{formatCurrency(total)}</span>
                            </div>
                            <div className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Amount given by customer:
                            </div>

                            <div className="flex items-center space-x-2 mb-4">
                                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$</span>
                                <input
                                    type="number"
                                    value={amountGiven}
                                    onChange={(e) => setAmountGiven(e.target.value)}
                                    className={`flex-1 px-4 py-3 border rounded-lg text-right text-xl font-semibold ${isDarkMode
                                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setAmountGiven(total.toFixed(2))}
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {formatCurrency(total)}
                                </button>
                                <button
                                    onClick={() => setAmountGiven((Math.ceil(total)).toFixed(2))}
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    ${Math.ceil(total)}.00
                                </button>
                                <button
                                    onClick={() => setAmountGiven('100.00')}
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    $100.00
                                </button>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowCashModal(false)}
                                className={`flex-1 py-3 px-4 border rounded-lg font-medium transition-colors ${isDarkMode
                                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCashPayment}
                                disabled={!amountGiven || parseFloat(amountGiven) < total}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${!amountGiven || parseFloat(amountGiven) < total
                                    ? isDarkMode
                                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                Complete Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payment page...</p>
                </div>
            </div>
        }>
            <PaymentContent />
        </Suspense>
    );
}

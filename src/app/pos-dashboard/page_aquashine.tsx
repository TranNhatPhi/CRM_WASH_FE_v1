'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mock data for car wash services
const carServices = [
    {
        id: 1,
        licensePlate: 'ABC-123',
        time: '9:30 AM',
        status: 'pending',
        paymentStatus: 'unpaid',
        services: ['Premium Wash', 'Wax'],
        customer: 'John Doe',
        total: 45.00
    },
    {
        id: 2,
        licensePlate: 'XYZ-789',
        time: '9:15 AM',
        status: 'in-progress',
        paymentStatus: 'paid',
        services: ['Basic Wash'],
        customer: 'Jane Smith',
        total: 25.00
    },
    {
        id: 3,
        licensePlate: 'DEF-456',
        time: '8:45 AM',
        status: 'finished',
        paymentStatus: 'paid',
        services: ['Deluxe Wash', 'Interior Clean'],
        customer: 'Mike Johnson',
        total: 65.00
    },
    {
        id: 4,
        licensePlate: 'MNO-678',
        time: '9:45 AM',
        status: 'in-progress',
        paymentStatus: 'paid',
        services: ['Premium Wash'],
        customer: 'Sarah Wilson',
        total: 35.00
    },
    {
        id: 5,
        licensePlate: 'PQR-901',
        time: '10:00 AM',
        status: 'pending',
        paymentStatus: 'paid',
        services: ['Basic Wash', 'Vacuum'],
        customer: 'Tom Brown',
        total: 30.00
    },
    {
        id: 6,
        licensePlate: 'STU-234',
        time: '9:00 AM',
        status: 'finished',
        paymentStatus: 'unpaid',
        services: ['Deluxe Wash'],
        customer: 'Lisa Davis',
        total: 50.00
    }
];

export default function POSDashboard() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [filteredServices, setFilteredServices] = useState(carServices);
    const router = useRouter();

    useEffect(() => {
        const filtered = carServices.filter(service => {
            const matchesSearch = service.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.customer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
            const matchesPayment = paymentFilter === 'all' || service.paymentStatus === paymentFilter;

            return matchesSearch && matchesStatus && matchesPayment;
        });
        setFilteredServices(filtered);
    }, [searchQuery, statusFilter, paymentFilter]);

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

    const getPaymentColor = (paymentStatus: string) => {
        switch (paymentStatus) {
            case 'unpaid':
                return 'bg-red-600 text-white';
            case 'paid':
                return 'bg-green-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
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

    const getCurrentDate = () => {
        const now = new Date();
        return now.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`min-h-screen transition-all duration-300 ${isDarkMode
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-900'
            }`}>
            {/* Header */}
            <div className={`px-6 py-4 shadow-sm border-b ${isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">AquaShine Car Wash</h1>
                            <p className="text-sm text-gray-500">Active Services</p>
                        </div>
                    </div>

                    {/* Date/Time and Theme Toggle */}
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm font-medium">{getCurrentDate()}</div>
                            <div className="text-xs text-gray-500">{getCurrentTime()}</div>
                        </div>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode
                                    ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                                }`}
                        >
                            {isDarkMode ? '🌞' : '🌙'}
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 mt-4">
                    <button
                        onClick={() => router.push('/pos')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>CHECK IN</span>
                    </button>
                    <button
                        onClick={() => router.push('/pos')}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-7M7 13l2.5 7M17 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
                        </svg>
                        <span>SALE</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by license plate, customer name, or vehicle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${isDarkMode
                                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                            </svg>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={`px-3 py-2 rounded-lg border transition-colors ${isDarkMode
                                        ? 'bg-gray-800 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="finished">Finished</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className={`px-3 py-2 rounded-lg border transition-colors ${isDarkMode
                                        ? 'bg-gray-800 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            >
                                <option value="all">All Payments</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className={`rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isDarkMode
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-white border-gray-200'
                                }`}
                        >
                            {/* Card Header */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold">{service.licensePlate}</h3>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {service.time}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">{service.customer}</p>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                <div className="space-y-3">
                                    {/* Services */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Services:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {service.services.map((svc, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-2 py-1 text-xs rounded-full ${isDarkMode
                                                            ? 'bg-gray-700 text-gray-300'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {svc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Total:</span>
                                        <span className="font-bold text-lg">${service.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-4 pb-4">
                                {/* Status */}
                                <div className={`w-full py-2 px-3 rounded-lg text-center text-sm font-medium border ${getStatusColor(service.status)}`}>
                                    {formatStatus(service.status)}
                                </div>

                                {/* Payment Status */}
                                {service.paymentStatus === 'unpaid' && (
                                    <div className={`w-full mt-2 py-2 px-3 rounded-lg text-center text-sm font-bold ${getPaymentColor(service.paymentStatus)}`}>
                                        UNPAID
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredServices.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09m8.291-8.09A7.962 7.962 0 0112 9c-2.034 0-3.9-.785-5.291-2.09" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

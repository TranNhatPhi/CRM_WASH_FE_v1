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
    },
    {
        id: 7,
        licensePlate: 'VWX-567',
        time: '10:15 AM',
        status: 'pending',
        paymentStatus: 'unpaid',
        services: ['Basic Wash', 'Interior Clean'],
        customer: 'Robert Garcia',
        total: 40.00
    },
    {
        id: 8,
        licensePlate: 'YZA-890',
        time: '10:30 AM',
        status: 'in-progress',
        paymentStatus: 'paid',
        services: ['Premium Wash', 'Wax', 'Vacuum'],
        customer: 'Emily Martinez',
        total: 55.00
    },
    {
        id: 9,
        licensePlate: 'BCD-123',
        time: '10:45 AM',
        status: 'pending',
        paymentStatus: 'unpaid',
        services: ['Deluxe Wash', 'Interior Clean'],
        customer: 'David Wilson',
        total: 60.00
    },
    {
        id: 10,
        licensePlate: 'EFG-456',
        time: '11:00 AM',
        status: 'finished',
        paymentStatus: 'paid',
        services: ['Basic Wash'],
        customer: 'Jennifer Lee',
        total: 25.00
    },
    {
        id: 11,
        licensePlate: 'HIJ-789',
        time: '11:15 AM',
        status: 'in-progress',
        paymentStatus: 'paid',
        services: ['Premium Wash', 'Interior Clean'],
        customer: 'Michael Brown',
        total: 50.00
    },
    {
        id: 12,
        licensePlate: 'KLM-012',
        time: '11:30 AM',
        status: 'pending',
        paymentStatus: 'unpaid',
        services: ['Deluxe Wash', 'Wax'],
        customer: 'Amanda Taylor',
        total: 55.00
    },
    {
        id: 13,
        licensePlate: 'NOP-345',
        time: '11:45 AM',
        status: 'finished',
        paymentStatus: 'paid',
        services: ['Basic Wash', 'Vacuum'],
        customer: 'Christopher Davis',
        total: 35.00
    },
    {
        id: 14,
        licensePlate: 'QRS-678',
        time: '12:00 PM',
        status: 'in-progress',
        paymentStatus: 'paid',
        services: ['Premium Wash'],
        customer: 'Jessica Miller',
        total: 35.00
    },
    {
        id: 15,
        licensePlate: 'TUV-901',
        time: '12:15 PM',
        status: 'pending',
        paymentStatus: 'unpaid',
        services: ['Deluxe Wash', 'Interior Clean', 'Wax'],
        customer: 'Daniel Anderson',
        total: 70.00
    },
    {
        id: 16,
        licensePlate: 'WXY-234',
        time: '12:30 PM',
        status: 'finished',
        paymentStatus: 'paid',
        services: ['Basic Wash', 'Interior Clean'],
        customer: 'Ashley Rodriguez',
        total: 40.00
    },
    {
        id: 17,
        licensePlate: 'ZAB-567',
        time: '12:45 PM',
        status: 'in-progress',
        paymentStatus: 'paid',
        services: ['Premium Wash', 'Wax'],
        customer: 'James Thompson',
        total: 45.00
    },
    {
        id: 18,
        licensePlate: 'CDE-890',
        time: '1:00 PM',
        status: 'pending',
        paymentStatus: 'unpaid',
        services: ['Deluxe Wash', 'Vacuum'],
        customer: 'Michelle White',
        total: 55.00
    },
    {
        id: 19,
        licensePlate: 'FGH-123',
        time: '1:15 PM',
        status: 'finished',
        paymentStatus: 'paid',
        services: ['Basic Wash'],
        customer: 'Kevin Harris',
        total: 25.00
    },
    {
        id: 20,
        licensePlate: 'IJK-456',
        time: '1:30 PM',
        status: 'in-progress',
        paymentStatus: 'paid',
        services: ['Premium Wash', 'Interior Clean', 'Wax'],
        customer: 'Stephanie Clark',
        total: 65.00
    },
    {
        id: 21,
        licensePlate: 'LMN-789',
        time: '1:45 PM',
        status: 'pending',
        paymentStatus: 'unpaid',
        services: ['Deluxe Wash'],
        customer: 'Brian Lewis',
        total: 50.00
    },
    {
        id: 22,
        licensePlate: 'OPQ-012',
        time: '2:00 PM',
        status: 'finished',
        paymentStatus: 'paid',
        services: ['Basic Wash', 'Vacuum', 'Interior Clean'],
        customer: 'Nicole Walker',
        total: 45.00
    },
    {
        id: 23,
        licensePlate: 'RST-345',
        time: '2:15 PM',
        status: 'in-progress',
        paymentStatus: 'paid',
        services: ['Premium Wash'],
        customer: 'Anthony Hall',
        total: 35.00
    },
    {
        id: 24,
        licensePlate: 'UVW-678',
        time: '2:30 PM',
        status: 'pending',
        paymentStatus: 'unpaid',
        services: ['Deluxe Wash', 'Wax', 'Interior Clean'],
        customer: 'Rachel Allen',
        total: 70.00
    }, {
        id: 25,
        licensePlate: 'XYZ-901',
        time: '2:45 PM',
        status: 'finished',
        paymentStatus: 'paid',
        services: ['Basic Wash', 'Interior Clean'],
        customer: 'Mark Young',
        total: 40.00
    },
    {
        id: 26,
        licensePlate: 'AAA-999',
        time: '3:00 PM',
        status: 'pending',
        paymentStatus: 'unpaid',
        services: ['Premium Wash', 'Wax'],
        customer: 'Jennifer Adams',
        total: 45.00
    }
];

export default function POSDashboard() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [filteredServices, setFilteredServices] = useState(carServices);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
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
        setCurrentPage(1); // Reset to first page when filters change
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
    }; const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentServices = filteredServices.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }; const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleCarPayment = (service: any) => {
        // Create cart data with the services for this car
        const cartItems = service.services.map((serviceName: string, index: number) => ({
            service: {
                id: `service_${index}`,
                name: serviceName,
                price: service.total / service.services.length // Distribute total across services
            },
            quantity: 1,
            subtotal: service.total / service.services.length
        }));

        // Create transaction data for payment page
        const transactionData = {
            cart: cartItems,
            customer: {
                name: service.customer,
                phone: "0123456789", // Default phone if not available
                vehiclePlate: service.licensePlate,
                isVIP: false
            }, carInfo: {
                licensePlate: service.licensePlate,
                customer: service.customer,
                time: service.time,
                total: service.total,
                status: service.status,
                paymentStatus: service.paymentStatus
            }
        };

        // Save to localStorage for payment page
        localStorage.setItem('pos-cart', JSON.stringify(transactionData));

        // Navigate to payment page
        router.push('/payment');
    };
    return (
        <div className={`h-screen flex flex-col transition-all duration-300 overflow-hidden ${isDarkMode
            ? 'bg-gray-900 text-white'
            : 'bg-gray-50 text-gray-900'
            }`}>
            {/* Header */}      <div className={`px-4 py-3 shadow-sm border-b flex-shrink-0 ${isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center justify-between">                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3">                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            {/* Car Body */}
                            <path d="M7 17h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2z" fill="currentColor" opacity="0.8" />

                            {/* Car Windows */}
                            <path d="M8 9h8v4H8z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />

                            {/* Wheels */}
                            <circle cx="9" cy="17" r="1.5" fill="currentColor" opacity="0.9" />
                            <circle cx="15" cy="17" r="1.5" fill="currentColor" opacity="0.9" />

                            {/* Water Droplets */}
                            <circle cx="12" cy="5" r="1" fill="currentColor" opacity="0.4" />
                            <circle cx="10" cy="4" r="0.8" fill="currentColor" opacity="0.3" />
                            <circle cx="14" cy="4.5" r="0.7" fill="currentColor" opacity="0.3" />
                            <circle cx="8" cy="5.5" r="0.6" fill="currentColor" opacity="0.2" />
                            <circle cx="16" cy="5.2" r="0.6" fill="currentColor" opacity="0.2" />

                            {/* Shine Effect */}
                            <path d="M10 11l2-2 2 2" stroke="currentColor" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
                        </svg>
                    </div><div>
                            <h1 className="text-xl font-bold text-gray-900">Car Wash</h1>
                            <p className="text-xs text-gray-500">Active Services</p>
                        </div>
                    </div>

                    {/* Date/Time and Theme Toggle */}          <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <div className="text-xs font-medium">{getCurrentDate()}</div>
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
                </div>        {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 mt-3">
                    <button
                        onClick={() => router.push('/pos')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>CHECK IN</span>
                    </button>
                    <button
                        onClick={() => router.push('/pos')}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-7M7 13l2.5 7M17 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
                        </svg>
                        <span>SALE</span>
                    </button>
                </div>
            </div>      {/* Main Content */}
            <div className="p-4 flex-1 overflow-hidden">                {/* Search and Filters */}
                <div className="mb-4 space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>            <input
                            type="text"
                            placeholder="Search by license plate, customer name, or vehicle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${isDarkMode
                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                    </div>          {/* Filters and Pagination */}
                    <div className="flex items-center justify-between">
                        {/* Filters */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                </svg>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={`px-2 py-1.5 rounded-lg border transition-colors text-sm ${isDarkMode
                                        ? 'bg-gray-800 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="finished">Finished</option>
                                </select>
                            </div>            <div>
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    className={`px-2 py-1.5 rounded-lg border transition-colors text-sm ${isDarkMode
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

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center space-x-4">
                                {/* Results Info */}
                                <div className="text-sm text-gray-500">
                                    {startIndex + 1}-{Math.min(endIndex, filteredServices.length)} of {filteredServices.length}
                                </div>

                                {/* Pagination Buttons */}
                                <div className="flex items-center space-x-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : isDarkMode
                                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            // Show first page, last page, current page, and pages around current page
                                            const showPage =
                                                page === 1 ||
                                                page === totalPages ||
                                                Math.abs(page - currentPage) <= 1;

                                            if (!showPage) {
                                                // Show ellipsis for gaps
                                                if (page === 2 && currentPage > 4) {
                                                    return <span key={page} className="px-2 text-gray-400">...</span>;
                                                }
                                                if (page === totalPages - 1 && currentPage < totalPages - 3) {
                                                    return <span key={page} className="px-2 text-gray-400">...</span>;
                                                }
                                                return null;
                                            }

                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => goToPage(page)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                        ? 'bg-blue-600 text-white'
                                                        : isDarkMode
                                                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : isDarkMode
                                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>{/* Services Grid */}
                <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1">                        {currentServices.map((service) => (
                        <div
                            key={service.id}
                            onClick={() => handleCarPayment(service)}
                            className={`rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer hover:scale-105 ${isDarkMode
                                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                        >                                {/* Card Header */}
                            <div className="p-3 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-lg font-bold">{service.licensePlate}</h3>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {service.time}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600">{service.customer}</p>
                                <div className="mt-2 text-xs text-blue-600 font-medium">
                                    Click to go to Payment →
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-3">
                                <div className="space-y-2">
                                    {/* Services */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Services:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {service.services.map((svc, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-2 py-0.5 text-xs rounded-full ${isDarkMode
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
                                        <span className="text-xs text-gray-500">Total:</span>
                                        <span className="font-bold text-sm">${service.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>                                {/* Card Footer */}
                            <div className="px-3 pb-3 relative">
                                {/* Status */}
                                <div className={`w-full py-2 px-2 rounded-lg text-center text-xs font-medium border ${getStatusColor(service.status)}`}>
                                    {formatStatus(service.status)}
                                </div>

                                {/* Payment Status - Partial Overlay */}
                                {service.paymentStatus === 'unpaid' && (
                                    <div className={`absolute inset-x-3 top-5 w-auto py-1.5 px-2 rounded-lg text-center text-xs font-bold shadow-lg z-10 ${getPaymentColor(service.paymentStatus)}`}>
                                        UNPAID
                                    </div>
                                )}
                            </div></div>
                    ))}                    </div>
                </div>{/* Empty State */}
                {currentServices.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09m8.291-8.09A7.962 7.962 0 0112 9c-2.034 0-3.9-.785-5.291-2.09" />
                            </svg>
                        </div>                        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

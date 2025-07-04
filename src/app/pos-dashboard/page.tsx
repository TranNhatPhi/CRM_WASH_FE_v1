'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DB, supabase } from '@/lib/supabase-client';
import SmartWashController from '@/components/SmartWashController';

// Types for our dashboard data
interface DashboardService {
    id: string;
    licensePlate: string;
    customer: string;
    time: string;
    services: string[];
    total: number;
    status: 'booked' | 'in-progress' | 'departed' | 'completed' | 'cancelled';
    paymentStatus: 'paid' | 'unpaid' | 'refunded';
    customerPhone?: string;
    vehicleInfo?: {
        make?: string;
        model?: string;
        color?: string;
    };
    assignedStaff?: string;
    bookingDate?: string;
}

export default function POSDashboard() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // Default to active orders
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('today');
    const [staffFilter, setStaffFilter] = useState('all');
    const [services, setServices] = useState<DashboardService[]>([]);
    const [filteredServices, setFilteredServices] = useState<DashboardService[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Function to fetch bookings data from Supabase
    const fetchBookingsData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch bookings with customer, vehicle, and booking state data
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
                    id,
                    date,
                    total_price,
                    notes,
                    createdAt,
                    updatedAt,
                    booking_state_id,
                    customers!bookings_customer_id_fkey (
                        id,
                        name,
                        phone,
                        email
                    ),
                    vehicles!bookings_vehicle_id_fkey (
                        id,
                        license_plate,
                        make,
                        model,
                        color
                    ),
                    booking_state!bookings_booking_state_id_fkey (
                        id,
                        state_name,
                        description
                    ),
                    booking_services!booking_services_booking_id_fkey (
                        services!booking_services_service_id_fkey (
                            id,
                            name,
                            price
                        )
                    )
                `)
                .order('createdAt', { ascending: false })
                .limit(50);

            if (bookingsError) {
                throw new Error(bookingsError.message);
            }

            // Transform booking data to dashboard service format
            const transformedServices: DashboardService[] = bookingsData?.map((booking: any) => {
                // Get services from booking_services
                const services = booking.booking_services?.map((bs: any) => bs.services?.name).filter(Boolean) || [];

                // Calculate total from services or use stored total_price
                const total = booking.total_price ||
                    booking.booking_services?.reduce((sum: number, bs: any) =>
                        sum + (bs.services?.price || 0), 0) || 0;

                // Map booking states to UI states
                const mapStateToUI = (stateName: string): 'booked' | 'in-progress' | 'departed' | 'completed' | 'cancelled' => {
                    switch (stateName) {
                        case 'pending':
                        case 'draft':
                        case 'confirmed':
                            return 'booked';
                        case 'in_progress':
                        case 'washing':
                        case 'drying':
                            return 'in-progress';
                        case 'finished':
                        case 'completed':
                            return 'completed';
                        case 'departed':
                            return 'departed';
                        case 'cancelled':
                        case 'no_show':
                            return 'cancelled';
                        default:
                            return 'booked';
                    }
                };

                // Determine payment status based on booking notes or state
                const determinePaymentStatus = (notes: string, stateName: string) => {
                    // Priority: Check if payment was completed (paid status overrides unpaid)
                    if (notes?.includes('Payment Status: paid')) {
                        return 'paid';
                    }

                    // Check for explicit unpaid status
                    if (notes?.includes('Payment Status: unpaid')) {
                        return 'unpaid';
                    }

                    // If booking is in progress or finished, check for payment method
                    if (stateName === 'in_progress' || stateName === 'finished' || stateName === 'completed') {
                        // Check if there's payment method info in notes (indicating payment was made)
                        if (notes?.includes('Method:')) {
                            return 'paid';
                        }
                    }

                    // Default to unpaid for pending bookings
                    return 'unpaid';
                };

                const paymentStatus = determinePaymentStatus(booking.notes || '', booking.booking_state?.state_name || '');

                return {
                    id: booking.id.toString(),
                    licensePlate: booking.vehicles?.license_plate || 'N/A',
                    customer: booking.customers?.name || 'Unknown Customer',
                    customerPhone: booking.customers?.phone || '',
                    time: new Date(booking.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    services: services,
                    total: total,
                    status: mapStateToUI(booking.booking_state?.state_name || 'pending'),
                    paymentStatus: paymentStatus as 'paid' | 'unpaid' | 'refunded',
                    assignedStaff: booking.assigned_staff || 'Unassigned',
                    bookingDate: new Date(booking.createdAt).toLocaleDateString(),
                    vehicleInfo: {
                        make: booking.vehicles?.make || undefined,
                        model: booking.vehicles?.model || undefined,
                        color: booking.vehicles?.color || undefined,
                    }
                };
            }) || [];

            setServices(transformedServices);
        } catch (err) {
            console.error('Error fetching bookings data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
            setServices([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchBookingsData();
    }, []);

    // Filter services based on search and filter criteria
    useEffect(() => {
        const filtered = services.filter((service: DashboardService) => {
            const matchesSearch = service.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.customer.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Status filter logic
            let matchesStatus = false;
            if (statusFilter === 'all') {
                matchesStatus = true;
            } else if (statusFilter === 'active') {
                // Active orders: booked, in-progress, completed
                matchesStatus = ['booked', 'in-progress', 'completed'].includes(service.status);
            } else {
                matchesStatus = service.status === statusFilter;
            }
            
            const matchesPayment = paymentFilter === 'all' || service.paymentStatus === paymentFilter;
            
            // Date filter logic
            let matchesDate = true;
            const today = new Date();
            const serviceDate = new Date(service.bookingDate || today);
            
            if (dateFilter === 'today') {
                matchesDate = serviceDate.toDateString() === today.toDateString();
            } else if (dateFilter === 'tomorrow') {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                matchesDate = serviceDate.toDateString() === tomorrow.toDateString();
            } else if (dateFilter === 'this-week') {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                matchesDate = serviceDate >= weekStart && serviceDate <= weekEnd;
            }
            
            const matchesStaff = staffFilter === 'all' || service.assignedStaff === staffFilter;

            return matchesSearch && matchesStatus && matchesPayment && matchesDate && matchesStaff;
        });
        setFilteredServices(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchQuery, statusFilter, paymentFilter, dateFilter, staffFilter, services]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'booked':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in-progress':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'departed':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
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
            case 'refunded':
                return 'bg-yellow-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    const formatStatus = (status: string) => {
        switch (status) {
            case 'booked':
                return 'Booked';
            case 'in-progress':
                return 'In Progress';
            case 'departed':
                return 'Departed';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
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
        console.log('handleCarPayment called with service:', service);
        console.log('Payment status:', service.paymentStatus);

        // Generate cart items from services (same for both paid and unpaid)
        let cartItems = [];

        if (service.services && service.services.length > 0) {
            console.log('Using actual services from booking');
            // Use actual services
            cartItems = service.services.map((serviceName: string, index: number) => ({
                service: {
                    id: `service_${index}`,
                    name: serviceName,
                    price: service.total / service.services.length // Distribute total across services
                },
                quantity: 1,
                subtotal: service.total / service.services.length
            }));
        } else {
            console.log('No services found, creating fallback service');
            // Fallback: create a single generic service if no services found
            cartItems = [{
                service: {
                    id: 'service_generic',
                    name: 'Car Wash Service',
                    price: service.total || 100 // Use service total or default $100
                },
                quantity: 1,
                subtotal: service.total || 100
            }];
        }

        console.log('Generated cart items:', cartItems);

        // Check payment status
        if (service.paymentStatus === 'paid') {
            // Already paid - show cart items with paid status
            const paidTransactionData = {
                cart: cartItems, // Show cart items for paid bookings
                customer: {
                    name: service.customer,
                    phone: service.customerPhone || "0123456789",
                    vehiclePlate: service.licensePlate,
                    isVIP: false
                },
                carInfo: {
                    licensePlate: service.licensePlate,
                    customer: service.customer,
                    time: service.time,
                    total: service.total,
                    status: service.status,
                    paymentStatus: 'paid',
                    bookingId: service.id,
                    paidAmount: service.total // Full amount already paid
                },
                viewOnly: true // Flag to indicate this is view-only mode
            };

            console.log('Setting as PAID - viewOnly: true with cart items');
            localStorage.setItem('pos-cart', JSON.stringify(paidTransactionData));
        } else {
            console.log('Setting as UNPAID - viewOnly: false');

            // Unpaid - show cart with items for payment

            const unpaidTransactionData = {
                cart: cartItems,
                customer: {
                    name: service.customer,
                    phone: service.customerPhone || "0123456789",
                    vehiclePlate: service.licensePlate,
                    isVIP: false
                },
                carInfo: {
                    licensePlate: service.licensePlate,
                    customer: service.customer,
                    time: service.time,
                    total: service.total,
                    status: service.status,
                    paymentStatus: 'unpaid',
                    bookingId: service.id,
                    remainingAmount: service.total // Amount still to be paid
                },
                viewOnly: false // Flag to indicate payment is still needed
            };

            console.log('unpaidTransactionData:', unpaidTransactionData);
            localStorage.setItem('pos-cart', JSON.stringify(unpaidTransactionData));
        }

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
                                    <option value="active">Active Orders</option>
                                    <option value="booked">Booked</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="departed">Departed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
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
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className={`px-2 py-1.5 rounded-lg border transition-colors text-sm ${isDarkMode
                                        ? 'bg-gray-800 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                >
                                    <option value="all">All Dates</option>
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                    <option value="this-week">This Week</option>
                                </select>
                            </div>

                            {/* Staff Filter */}
                            <div>
                                <select
                                    value={staffFilter}
                                    onChange={(e) => setStaffFilter(e.target.value)}
                                    className={`px-2 py-1.5 rounded-lg border transition-colors text-sm ${isDarkMode
                                        ? 'bg-gray-800 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                >
                                    <option value="all">All Staff</option>
                                    <option value="John">John</option>
                                    <option value="Sarah">Sarah</option>
                                    <option value="Mike">Mike</option>
                                    <option value="Unassigned">Unassigned</option>
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
                </div>                {/* Services Grid */}
                <div className="flex-1 flex flex-col">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading vehicles...</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please wait while we fetch the latest data</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load data</h3>
                                <p className="text-gray-500 mb-4">{error}</p>
                                <button
                                    onClick={fetchBookingsData}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Services Grid */}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1">{currentServices.map((service) => (
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

                                    {/* Payment Status - Show UNPAID for started but unpaid bookings */}
                                    {/* Show UNPAID for in-progress and finished unpaid bookings only */}
                                    {/* Hide for pending bookings and all paid bookings */}
                                    {service.paymentStatus === 'unpaid' && (service.status === 'in-progress' || service.status === 'completed') && (
                                        <div className={`absolute inset-x-3 top-5 w-auto py-1.5 px-2 rounded-lg text-center text-xs font-bold shadow-lg z-10 ${getPaymentColor(service.paymentStatus)}`}>
                                            UNPAID
                                        </div>
                                    )}
                                </div></div>
                        ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && currentServices.length === 0 && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09m8.291-8.09A7.962 7.962 0 0112 9c-2.034 0-3.9-.785-5.291-2.09" />
                                    </svg>
                                </div>
                                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No services found</h3>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Try adjusting your search or filters to find what you're looking for.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
    
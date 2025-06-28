'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { POSService, CartItem, APIService, ServicesByCategory, ServicesAPIResponse } from '@/types';
import { formatCurrency } from '@/utils';
import { Minus, Plus, X, ShoppingCart, CreditCard, Sun, Moon, Search, User, Phone, Car, Edit } from 'lucide-react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { DB } from '@/lib/supabase-client';

// Staff members data
const staffMembers = [
  { id: 'staff1', name: 'John Smith', role: 'Manager' },
  { id: 'staff2', name: 'Sarah Wilson', role: 'Senior Washer' },
  { id: 'staff3', name: 'Mike Johnson', role: 'Detailer' },
  { id: 'staff4', name: 'Emma Davis', role: 'Cashier' },
  { id: 'staff5', name: 'David Brown', role: 'Washer' },
  { id: 'staff6', name: 'Lisa Garcia', role: 'Supervisor' },
];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState('WASHES');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [carRego, setCarRego] = useState('');
  const [isVipCustomer, setIsVipCustomer] = useState(false);

  // Customer check states
  const [isCheckingRego, setIsCheckingRego] = useState(false);
  const [customerExists, setCustomerExists] = useState<boolean | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showFullFormModal, setShowFullFormModal] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Full form states
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNote, setVehicleNote] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerMembership, setCustomerMembership] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // API service data state
  const [services, setServices] = useState<ServicesByCategory>({
    WASHES: [],
    DETAILING: [],
    ADDONS: [],
    NEW_CAR_PROTECTION: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/services');
      const result = await response.json();

      // Check if response is successful - backend returns statusCode: 200 with data
      if (response.ok && result.statusCode === 200 && result.data) {
        // Group services by category - support both English and Vietnamese categories
        const servicesArray = result.data;
        const groupedServices = {
          WASHES: servicesArray.filter((s: any) =>
            s.category === 'WASHES'
          ) || [],
          DETAILING: servicesArray.filter((s: any) =>
            s.category === 'DETAILING'
          ) || [],
          ADDONS: servicesArray.filter((s: any) =>
            s.category === 'ADDONS'
          ) || [],
          NEW_CAR_PROTECTION: servicesArray.filter((s: any) =>
            s.category === 'NEW_CAR_PROTECTION'
          ) || []
        };

        setServices(groupedServices);
      } else {
        // Handle API error (backend not available)
        const errorMsg = result.message || result.error || 'Failed to fetch services';
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load services';
      setError(errorMessage);

      // Set empty services when API fails - no mock data
      setServices({
        WASHES: [],
        DETAILING: [],
        ADDONS: [],
        NEW_CAR_PROTECTION: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Restore cart data from localStorage (when returning from payment page)
  useEffect(() => {
    const savedCartData = localStorage.getItem('pos-cart');
    if (savedCartData) {
      try {
        const parsedData = JSON.parse(savedCartData);

        // Restore if it came from payment page OR if there's existing data to restore
        if ((parsedData.fromPayment && parsedData.cart && Array.isArray(parsedData.cart)) ||
          (parsedData.cart && Array.isArray(parsedData.cart) && parsedData.customerExists !== undefined)) {

          // Restore cart
          if (parsedData.cart && Array.isArray(parsedData.cart)) {
            setCart(parsedData.cart);
          }

          // Restore customer and vehicle information
          if (parsedData.customerInfo) {
            setCustomerName(parsedData.customerInfo.name || '');
            setCustomerPhone(parsedData.customerInfo.phone || '');
            setIsVipCustomer(parsedData.customerInfo.isVip || false);
          }

          // Restore customer check state
          if (parsedData.customerExists !== undefined) {
            setCustomerExists(parsedData.customerExists);
          }

          if (parsedData.customerData) {
            setCustomerData(parsedData.customerData);
          }

          // Restore car registration
          if (parsedData.carRegistration) {
            setCarRego(parsedData.carRegistration);
          } else if (parsedData.carInfo && parsedData.carInfo.licensePlate) {
            setCarRego(parsedData.carInfo.licensePlate);
          }

          // Clear the fromPayment flag to prevent re-loading on subsequent visits
          if (parsedData.fromPayment) {
            const updatedData = { ...parsedData, fromPayment: false };
            localStorage.setItem('pos-cart', JSON.stringify(updatedData));
          }
        }
      } catch (error) {
        console.error('Error restoring cart data:', error);
        // Clear invalid data
        localStorage.removeItem('pos-cart');
      }
    }
  }, []);

  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discountedTotal = isVipCustomer ? subtotal * 0.9 : subtotal; // 10% discount for VIP
    setTotal(discountedTotal);
  }, [cart, isVipCustomer]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Check vehicle registration in database
  const checkVehicleRego = async () => {
    if (!carRego.trim()) {
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter vehicle license plate',
        confirmButtonColor: '#3b82f6',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
      });
      return;
    }

    try {
      setIsCheckingRego(true);

      // Use Supabase to find vehicle by license plate with customer data
      const { data: vehicleData, error } = await DB.vehicles.getByLicensePlate(carRego.trim());

      if (error) {
        // If error is "not found", it means the vehicle doesn't exist
        if (error.code === 'PGRST116') {
          // Vehicle doesn't exist - show full form modal
          setCustomerExists(false);
          setCustomerData(null);
          setShowCustomerForm(false);
          setShowFullFormModal(true);
          // Initialize vehicle plate with current rego
          setVehiclePlate(carRego);
          // Reset other form fields
          setVehicleModel('');
          setVehicleNote('');
          setCustomerName('');
          setCustomerPhone('');
          setCustomerEmail('');
          setCustomerAddress('');
          setCustomerMembership('');
          setCustomerNote('');
          setIsVipCustomer(false);
        } else {
          throw error;
        }
      } else if (vehicleData) {
        // Vehicle found with customer data
        setCustomerExists(true);
        setCustomerData(vehicleData.customers);
        setCustomerName(vehicleData.customers?.name || '');
        setCustomerPhone(vehicleData.customers?.phone || '');
        setShowCustomerForm(false);

        // Check if VIP customer
        setIsVipCustomer(vehicleData.customers?.tags && vehicleData.customers.tags.includes('VIP'));
      }
    } catch (error) {
      console.error('Error checking vehicle registration:', error);
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Could not check license plate. Please try again.',
        confirmButtonColor: '#ef4444',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
      });
    } finally {
      setIsCheckingRego(false);
    }
  };

  // Reset customer data when rego changes
  const handleRegoChange = (value: string) => {
    setCarRego(value.toUpperCase());
    setCustomerExists(null);
    setCustomerData(null);
    setShowCustomerForm(false);
    setShowFullFormModal(false);
    if (!value.trim()) {
      clearAllCustomerData();
    }
  };

  // Clear all customer and vehicle data
  const clearAllCustomerData = () => {
    setCustomerName('');
    setCustomerPhone('');
    setIsVipCustomer(false);
    // Reset full form states
    setVehiclePlate('');
    setVehicleModel('');
    setVehicleNote('');
    setCustomerEmail('');
    setCustomerAddress('');
    setCustomerMembership('');
    setCustomerNote('');
  };

  // Handle Main Menu navigation - clear all data for fresh start
  const handleMainMenuNavigation = () => {
    // Clear cart
    setCart([]);

    // Clear customer data
    clearAllCustomerData();

    // Reset customer check states
    setCustomerExists(null);
    setCustomerData(null);
    setShowCustomerForm(false);
    setShowFullFormModal(false);

    // Clear vehicle registration
    setCarRego('');

    // Clear localStorage
    localStorage.removeItem('pos-cart');

    // Navigate to dashboard
    router.push('/pos-dashboard');
  };

  // Save customer and vehicle to backend
  const saveCustomerAndVehicle = async () => {
    if (!vehiclePlate.trim() || !customerPhone.trim() || !customerName.trim()) {
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields (*)',
        confirmButtonColor: '#f59e0b',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
      });
      return;
    }

    try {
      setIsSavingCustomer(true);

      // Prepare data in the format expected by backend
      const customerVehicleData = {
        vehicle: {
          license_plate: vehiclePlate.trim(),
          model: vehicleModel.trim() || "Unknown",
          color: "white", // default value
          notes: vehicleNote.trim() || "New vehicle"
        },
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || "customer@example.com",
          address: customerAddress.trim() || "123 Street, District, City",
          customer_notes: customerNote.trim() || "New customer"
        }
      };

      console.log('Sending customer and vehicle data:', customerVehicleData);

      const response = await fetch('/api/customers-vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerVehicleData),
      });

      const result = await response.json();

      if (response.ok && result.statusCode === 201) {
        // Success - update UI with new customer data
        setCustomerExists(true);
        setCustomerData({
          id: result.data.customer.id,
          name: result.data.customer.name,
          phone: result.data.customer.phone,
          email: result.data.customer.email,
          address: result.data.customer.address,
          tags: customerMembership === 'VIP' ? ['VIP'] : []
        });

        // Update rego with the plate number
        setCarRego(vehiclePlate);

        // Close modal
        setShowFullFormModal(false);

        // Show success message
        console.log('About to show SweetAlert2 success message');
        const Swal = (await import('sweetalert2')).default;
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Customer and vehicle created successfully!',
          timer: 5000,
          timerProgressBar: true,
          confirmButtonColor: '#10b981',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#f3f4f6' : '#1f2937',
          showConfirmButton: true,
          confirmButtonText: 'Close',
          customClass: {
            popup: 'swal-success-popup',
            title: 'swal-success-title'
          }
        });
        console.log('SweetAlert2 success message completed');

        console.log('Customer and vehicle created successfully:', result.data);
      } else {
        throw new Error(result.message || 'Failed to create customer and vehicle');
      }
    } catch (error) {
      console.error('Error saving customer and vehicle:', error);
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'error',
        title: 'Error Creating Customer',
        text: error instanceof Error ? error.message : 'Could not create customer',
        confirmButtonColor: '#ef4444',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
      });
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const addToCart = (service: APIService) => {
    const posService: POSService = {
      id: service.id,
      name: service.name,
      price: service.price,
      duration: 30,
      description: service.name,
      category: service.category.toLowerCase() as 'basic' | 'premium' | 'deluxe' | 'addon' | 'wash' | 'detailing' | 'protection' | 'maintenance',
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
  }; const processTransaction = async () => {
    if (cart.length === 0) {
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'warning',
        title: 'Giỏ hàng trống',
        text: 'Vui lòng thêm dịch vụ vào giỏ hàng',
        confirmButtonColor: '#f59e0b',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
      });
      return;
    }

    // If we have new customer data but haven't created the customer yet
    if (showCustomerForm && customerExists === false && customerName.trim() && customerPhone.trim()) {
      try {
        // Create new customer
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: customerName.trim(),
            phone: customerPhone.trim(),
            rego: carRego.trim(),
            tags: isVipCustomer ? 'VIP,Regular' : 'Regular'
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to create customer');
        }

        // Update customer data
        setCustomerData(result.data);
        setCustomerExists(true);
        setShowCustomerForm(false);
      } catch (error) {
        console.error('Error creating customer:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi tạo khách hàng',
          text: 'Không thể tạo khách hàng mới. Vui lòng thử lại.',
          confirmButtonColor: '#ef4444',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#f3f4f6' : '#1f2937',
        });
        return;
      }
    }

    // Validate required customer information
    if (!customerName.trim()) {
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng nhập tên khách hàng',
        confirmButtonColor: '#f59e0b',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
      });
      return;
    }

    if (!customerPhone.trim()) {
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng nhập số điện thoại khách hàng',
        confirmButtonColor: '#f59e0b',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
      });
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'warning',
        title: 'Số điện thoại không hợp lệ',
        text: 'Vui lòng nhập số điện thoại hợp lệ',
        confirmButtonColor: '#f59e0b',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
      });
      return;
    }

    if (!carRego.trim()) {
      const proceed = confirm('Chưa nhập biển số xe. Tiếp tục?');
      if (!proceed) return;
    }    // Prepare transaction data
    const transactionData = {
      cart,
      staffMember: selectedStaff ? staffMembers.find(staff => staff.id === selectedStaff) : null,
      customerInfo: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        isVip: isVipCustomer,
        email: customerData?.email || '',
        address: customerData?.address || '',
        id: customerData?.id || null
      },
      carRegistration: carRego.trim() || null,
      timestamp: new Date().toISOString(),
      // Preserve customer check state
      customerExists: customerExists,
      customerData: customerData,
      carInfo: carRego.trim() ? {
        licensePlate: carRego.trim(),
        customer: customerName.trim(),
        time: new Date().toLocaleTimeString()
      } : null
    };

    // Save transaction data to localStorage for payment page
    localStorage.setItem('pos-cart', JSON.stringify(transactionData));

    // Navigate to payment page
    router.push('/payment');
  };  // Service Button Component - Optimized for compact display
  const ServiceButton = ({ service, onClick }: { service: APIService; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`min-h-[48px] h-auto border rounded transition-all duration-200 text-xs font-medium p-1.5 text-center shadow-sm hover:shadow-md transform hover:scale-102 ${isDarkMode
        ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-white'
        : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900'
        }`}
      style={{
        borderTopColor: isDarkMode ? service.darkColor : service.color,
        borderTopWidth: '2px',
      }}      >
      <div className="flex flex-col justify-between h-full min-h-[44px]">
        <div className="font-medium text-center text-xs leading-tight line-clamp-2 flex-1 flex items-center justify-center">
          {service.name}
        </div>
        <div className={`font-bold text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          ${service.price.toFixed(2)}
        </div>
      </div>
    </button>
  );
  const categories = [
    { id: 'WASHES', name: 'WASHES', color: 'bg-blue-600', active: true },
    { id: 'DETAILING', name: 'DETAILING', color: 'bg-green-600' },
    { id: 'ADDONS', name: 'ADDONS', color: 'bg-orange-500' },
    { id: 'NEW_CAR_PROTECTION', name: 'NEW CAR PROTECTION', color: 'bg-purple-600' },
  ]; return (
    <div className={`h-screen flex flex-col transition-all duration-300 overflow-hidden ${isDarkMode
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
      : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
      }`}>      {/* Header */}
      <div className={`border-b p-2 shadow-lg backdrop-blur-sm flex-shrink-0 ${isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-600'
        : 'bg-gradient-to-br from-blue-50 via-white to-gray-100 border-gray-200'
        }`}><div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMainMenuNavigation}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-500'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm'
                }`}
              title="Back to POS Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              🚗 Point of Sale
            </h1>
          </div>          <div className="flex items-center space-x-4">


            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode
                ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>            <div className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
              Cart: {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </div>
            <div className="flex flex-col items-end">
              <div className={`text-sm font-bold ${isDarkMode ? 'text-emerald-300' : 'text-green-600'}`}>
                Total: {formatCurrency(total)}
              </div>
              {isVipCustomer && (
                <div className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-orange-600'}`}>
                  ⭐ VIP 10% OFF
                </div>
              )}
            </div>
            {/* Staff Member Selection */}
            <div className="flex items-center space-x-4">
              {/* <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                👤 Staff Member:
              // </span> */} todo
              {/* <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className={`p-2 rounded border text-sm transition-colors min-w-[140px] ${isDarkMode
                  ? 'bg-gray-700 border-gray-500 text-gray-100 focus:border-blue-300'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
              >
                <option value="">Select Staff</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              // </select> */} todo
            </div>
          </div>
        </div>
      </div>      {/* Main Content - Horizontal Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 min-h-0 overflow-hidden">        {/* Left Sidebar - Category Navigation */}
        <div className="w-full lg:w-40 flex flex-row lg:flex-col space-x-1 lg:space-x-0 lg:space-y-1 flex-shrink-0 overflow-x-auto lg:overflow-visible">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`min-w-max lg:w-full p-2 text-center font-bold text-white rounded-lg shadow-lg transition-all duration-200 text-xs ${activeCategory === category.id
                ? category.color + ' opacity-100'
                : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-500 hover:bg-gray-600')
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>        {/* Main Services Area */}
        <div className="flex-1 flex flex-col xl:flex-row gap-2 min-w-0 overflow-hidden">
          {/* Services Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex flex-col">              {/* Header Bar */}
              <div className={`border-b p-3 flex items-center justify-between flex-shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-500' : 'bg-gradient-to-br from-blue-50 via-white to-gray-100 border-gray-200'}`}>
                <div className="flex items-center space-x-4">
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Washes</h2>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    NOTES
                  </button>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                  100%
                </div>              </div>              {/* Services Content - Balanced Symmetrical Layout */}
              <div className="p-2 flex-1 space-y-2 overflow-auto">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p>Loading services...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="flex items-center justify-center py-12">
                    <div className={`text-center max-w-md mx-auto ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'}`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">⚠️ Không thể tải dịch vụ</h3>
                      <p className="text-sm opacity-75 mb-4">{error}</p>
                      <div className="space-y-2">
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          💡 Backend API không khả dụng. Hãy kiểm tra kết nối hoặc khởi động backend server.
                        </p>
                        <button
                          onClick={fetchServices}
                          className={`mt-3 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isDarkMode
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                            }`}
                        >
                          🔄 Thử lại
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Services Grid - Only show when not loading and no error */}
                {!isLoading && !error && (
                  <>
                    {/* Top Row - Washes and Detailing (Symmetrical) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3" style={{ minHeight: '280px' }}>
                      {/* Washes Section */}
                      <div className="flex flex-col">
                        <div className={`border-b pb-1 mb-2 ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Washes</h3>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                            {(services.WASHES || []).slice(0, 8).map((service: APIService) => (
                              <ServiceButton
                                key={service.id}
                                service={service}
                                onClick={() => addToCart(service)}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                            {(services.WASHES || []).slice(8, 16).map((service: APIService) => (
                              <ServiceButton
                                key={service.id}
                                service={service}
                                onClick={() => addToCart(service)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Detailing Section */}
                      <div className="flex flex-col">
                        <div className={`border-b pb-1 mb-2 ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Detailing</h3>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                            {(services.DETAILING || []).slice(0, 8).map((service: APIService) => (
                              <ServiceButton
                                key={service.id}
                                service={service}
                                onClick={() => addToCart(service)}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                            {(services.DETAILING || []).slice(8, 16).map((service: APIService) => (
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

                    {/* Bottom Row - Addons and New Car Protection (Symmetrical) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3" style={{ minHeight: '280px' }}>
                      {/* Addons Section */}
                      <div className="flex flex-col">
                        <div className={`border-b pb-1 mb-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Addons</h3>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                            {(services.ADDONS || []).slice(0, 8).map((service: APIService) => (
                              <ServiceButton
                                key={service.id}
                                service={service}
                                onClick={() => addToCart(service)}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                            {(services.ADDONS || []).slice(8, 16).map((service: APIService) => (
                              <ServiceButton
                                key={service.id}
                                service={service}
                                onClick={() => addToCart(service)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* New Car Protection Section */}
                      <div className="flex flex-col">
                        <div className={`border-b pb-1 mb-2 ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>New Car Protection</h3>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                            {(services.NEW_CAR_PROTECTION || []).slice(0, 8).map((service: APIService) => (
                              <ServiceButton
                                key={service.id}
                                service={service}
                                onClick={() => addToCart(service)}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                            {(services.NEW_CAR_PROTECTION || []).slice(8, 16).map((service: APIService) => (
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
                  </>
                )}
              </div>
            </div>          </div>          {/* Right Panel - Staff, Car, and Cart */}          <div className="w-full xl:w-60 flex flex-col space-y-2 flex-shrink-0">            {/* Customer Information Section */}


            {/* Car Registration Section */}            <div className={`rounded-lg border-2 p-3 shadow-lg backdrop-blur-sm ${isDarkMode
              ? 'bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border-gray-600'
              : 'bg-gradient-to-br from-blue-50/90 via-white/80 to-gray-100/90 border-gray-300'
              }`}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                  <Car className="w-4 h-4 text-white" />
                </div>
                <h3 className={`font-bold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Vehicle Registration
                </h3>
              </div>

              {/* Input and Check Button */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={carRego}
                  onChange={(e) => handleRegoChange(e.target.value)}
                  placeholder="Enter rego (e.g. ABC123)"
                  className={`flex-1 min-w-0 p-2.5 rounded-lg border-2 text-sm transition-all duration-200 font-mono tracking-wider ${isDarkMode
                    ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-blue-400 focus:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:shadow-sm'
                    }`}
                  maxLength={10}
                  style={{ minWidth: '140px' }}
                />

                {/* Show CHECK button when no customer data exists */}
                {!customerExists && !showCustomerForm && (
                  <button
                    onClick={checkVehicleRego}
                    disabled={!carRego.trim() || isCheckingRego}
                    className={`flex-shrink-0 px-2 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1 whitespace-nowrap shadow-md ${!carRego.trim() || isCheckingRego
                      ? isDarkMode
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-2 border-gray-500'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-200'
                      : isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-500 hover:shadow-lg transform hover:scale-105'
                        : 'bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-400 hover:shadow-lg transform hover:scale-105'
                      }`}
                  >
                    {isCheckingRego ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Search className="w-3 h-3" />
                    )}
                    CHECK
                  </button>
                )}
              </div>

              {/* Customer Information Display */}
              {customerExists === true && customerData && (
                <div className={`rounded-lg p-3 border-2 shadow-sm ${isDarkMode
                  ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border-green-600 text-green-100'
                  : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-green-800'
                  }`}>
                  {/* Header with customer name and VIP badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${isDarkMode ? 'bg-green-700' : 'bg-green-200'}`}>
                        <User className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-bold">{customerData.name}</span>
                    </div>
                    {customerData.tags && customerData.tags.includes('VIP') && (
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${isDarkMode
                        ? 'bg-yellow-600 text-yellow-100 shadow-md'
                        : 'bg-yellow-400 text-yellow-900 shadow-sm'
                        }`}>
                        ⭐ VIP
                      </span>
                    )}
                  </div>

                  {/* Contact and vehicle info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${isDarkMode ? 'bg-green-700' : 'bg-green-200'}`}>
                        <Phone className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-medium">{customerData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${isDarkMode ? 'bg-green-700' : 'bg-green-200'}`}>
                        <Car className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-mono font-bold tracking-wider bg-white/20 px-2 py-1 rounded">
                        {carRego}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-green-600' : 'border-green-300'
                    }`}>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          // Toggle edit mode or handle edit details
                          console.log('Edit customer details');
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 shadow-md ${isDarkMode
                          ? 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-500 hover:shadow-lg transform hover:scale-105'
                          : 'bg-green-500 hover:bg-green-600 text-white border-2 border-green-400 hover:shadow-lg transform hover:scale-105'
                          }`}
                      >
                        <Edit className="w-3 h-3" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => {
                          // Clear customer data and reset form
                          setCustomerExists(null);
                          setCustomerData(null);
                          setShowCustomerForm(false);
                          setShowFullFormModal(false);
                          setCarRego('');
                          clearAllCustomerData();
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 shadow-md ${isDarkMode
                          ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-500 hover:shadow-lg transform hover:scale-105'
                          : 'bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 hover:shadow-lg transform hover:scale-105'
                          }`}
                      >
                        <X className="w-3 h-3" />
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Form for New Customer */}
              {showCustomerForm && customerExists === false && (
                <div className={`rounded-lg p-3 border-2 shadow-sm ${isDarkMode
                  ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/30 border-yellow-600'
                  : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                  }`}>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1 rounded-full ${isDarkMode ? 'bg-yellow-700' : 'bg-yellow-200'}`}>
                      <User className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                        Khách hàng mới
                      </h4>
                      <p className={`text-xs opacity-75 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        Biển số chưa có trong hệ thống
                      </p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                        Tên khách hàng *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nhập tên khách hàng"
                        className={`w-full p-2 rounded border text-xs transition-colors ${isDarkMode
                          ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-yellow-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-500'
                          }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        className={`w-full p-2 rounded border text-xs transition-colors ${isDarkMode
                          ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-yellow-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-500'
                          }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="vip-checkbox"
                        checked={isVipCustomer}
                        onChange={(e) => setIsVipCustomer(e.target.checked)}
                        className={`rounded border-2 ${isDarkMode ? 'border-yellow-500' : 'border-yellow-400'}`}
                      />
                      <label
                        htmlFor="vip-checkbox"
                        className={`text-xs font-medium cursor-pointer ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}
                      >
                        ⭐ Khách hàng VIP (giảm 10%)
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={`mt-3 pt-2 border-t ${isDarkMode ? 'border-yellow-600' : 'border-yellow-300'
                    }`}>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          // Toggle edit mode or handle edit details
                          console.log('Edit new customer details');
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 shadow-md ${isDarkMode
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white border-2 border-yellow-500 hover:shadow-lg transform hover:scale-105'
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-400 hover:shadow-lg transform hover:scale-105'
                          }`}
                      >
                        <Edit className="w-3 h-3" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => {
                          // Clear customer data and reset form
                          setCustomerExists(null);
                          setCustomerData(null);
                          setShowCustomerForm(false);
                          setShowFullFormModal(false);
                          setCarRego('');
                          clearAllCustomerData();
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 shadow-md ${isDarkMode
                          ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-500 hover:shadow-lg transform hover:scale-105'
                          : 'bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 hover:shadow-lg transform hover:scale-105'
                          }`}
                      >
                        <X className="w-3 h-3" />
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>            {/* Shopping Cart Panel */}            <div className={`rounded-lg border p-2 shadow-xl backdrop-blur-sm flex-1 ${isDarkMode
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-500'
              : 'bg-gradient-to-br from-blue-50 via-white to-gray-100 border-gray-300'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-bold text-sm flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  <ShoppingCart className={`w-3 h-3 mr-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                  Cart
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className={`text-xs font-medium transition-colors hover:scale-105 ${isDarkMode
                      ? 'text-red-300 hover:text-red-200'
                      : 'text-red-600 hover:text-red-800'
                      }`}
                  >
                    Clear                  </button>)}
              </div>
              <div className="flex-1 overflow-y-auto mb-2 max-h-40">
                {cart.length === 0 ? (
                  <div className={`text-center py-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    <ShoppingCart className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`} />
                    <p className="text-sm">Cart is empty</p>
                  </div>
                ) : (<div className="space-y-2 pr-1">
                  {cart.map((item) => (
                    <div key={item.service.id} className={`rounded-lg p-2 border transition-all duration-200 ${isDarkMode
                      ? 'bg-gray-700/70 border-gray-500 hover:bg-gray-700/90'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-semibold text-xs leading-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {item.service.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.service.id)}
                          className={`ml-1 transition-colors hover:scale-110 ${isDarkMode
                            ? 'text-red-300 hover:text-red-200'
                            : 'text-red-500 hover:text-red-700'
                            }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isDarkMode
                              ? 'bg-gray-600 hover:bg-gray-500 text-gray-100'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                          >
                            <Minus className="w-2 h-2" />
                          </button>
                          <span className={`w-6 text-center text-xs font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isDarkMode
                              ? 'bg-gray-600 hover:bg-gray-500 text-gray-100'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                          >
                            <Plus className="w-2 h-2" />
                          </button>
                        </div>
                        <span className={`font-bold text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>             Cart Summary
              <div className={`border-t pt-2 ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                <div className={`rounded-md p-2 shadow-sm ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-600' : 'bg-gradient-to-br from-blue-50 via-white to-gray-100 border border-gray-100'}`}>
                  <div className={`space-y-1 text-xs ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className={isDarkMode ? 'text-gray-100' : 'text-gray-800'}>{formatCurrency(cart.reduce((sum, item) => sum + item.subtotal, 0))}</span>
                    </div>
                    <div className={`flex justify-between font-bold text-sm border-t pt-1 ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                      <span>Total:</span>
                      <span className={isDarkMode ? 'text-emerald-300' : 'text-green-600'}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Process Transaction Button */}
                <button
                  onClick={processTransaction}
                  disabled={cart.length === 0}
                  className={`w-full mt-2 py-2 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center shadow-md ${cart.length === 0
                    ? isDarkMode
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed border border-gray-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border border-blue-400 shadow-blue-500/20'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
                    }`}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Form Modal */}
      {showFullFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl ${isDarkMode
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-600'
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
            }`}>

            {/* Modal Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  New Customer & Vehicle
                </h2>
                <button
                  onClick={() => setShowFullFormModal(false)}
                  className={`p-1 rounded-full transition-colors ${isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Two Columns */}
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column - Vehicle Section */}
                <div>
                  <h3 className={`text-md font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    <Car className="w-4 h-4" />
                    VEHICLE
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Plate Number *
                      </label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                        placeholder="Enter plate number"
                        className={`w-full p-2.5 rounded-lg border text-sm font-mono tracking-wider transition-colors ${isDarkMode
                          ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-blue-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          }`}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Model
                      </label>
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="Enter vehicle model"
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${isDarkMode
                          ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-blue-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Note
                      </label>
                      <textarea
                        value={vehicleNote}
                        onChange={(e) => setVehicleNote(e.target.value)}
                        placeholder="Vehicle notes..."
                        rows={4}
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors resize-none ${isDarkMode
                          ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-blue-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Customer Section */}
                <div>
                  <h3 className={`text-md font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    <User className="w-4 h-4" />
                    CUSTOMER
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${isDarkMode
                          ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-blue-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Name *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${isDarkMode
                          ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-blue-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Enter email address"
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${isDarkMode
                          ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-blue-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Address
                      </label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Enter address"
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${isDarkMode
                          ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-blue-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Membership and Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Membership
                  </label>
                  <select
                    value={customerMembership}
                    onChange={(e) => setCustomerMembership(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${isDarkMode
                      ? 'bg-gray-700 border-gray-500 text-gray-100 focus:border-blue-400'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }`}
                  >
                    <option value="">Select membership</option>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Customer Note
                  </label>
                  <textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Customer notes..."
                    rows={2}
                    className={`w-full p-2.5 rounded-lg border text-sm transition-colors resize-none ${isDarkMode
                      ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400 focus:border-blue-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      }`}
                  />
                </div>
              </div>

              {/* Required Fields Note */}
              <div className={`text-xs italic mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                (*) Required fields
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 mt-2">
                <button
                  onClick={saveCustomerAndVehicle}
                  disabled={!vehiclePlate.trim() || !customerPhone.trim() || !customerName.trim() || isSavingCustomer}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${!vehiclePlate.trim() || !customerPhone.trim() || !customerName.trim() || isSavingCustomer
                    ? isDarkMode
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white border border-green-500 hover:shadow-lg'
                      : 'bg-green-500 hover:bg-green-600 text-white border border-green-400 hover:shadow-lg'
                    }`}
                >
                  {isSavingCustomer ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      Save Customer
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowFullFormModal(false)}
                  disabled={isSavingCustomer}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${isSavingCustomer
                    ? isDarkMode
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-700 text-white border border-gray-500 hover:shadow-lg'
                      : 'bg-gray-400 hover:bg-gray-500 text-white border border-gray-300 hover:shadow-lg'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

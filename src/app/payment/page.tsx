'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, X, Printer, Gift, Mail, Sun, Moon } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { supabase } from '@/lib/supabase-client';
import { BookingService } from '@/lib/booking-service';
import Swal from 'sweetalert2/dist/sweetalert2.js';

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
    const [originalCart, setOriginalCart] = useState<CartItem[]>([]); // Store original cart items for display after payment
    const [total, setTotal] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [showCashModal, setShowCashModal] = useState(false);
    const [amountGiven, setAmountGiven] = useState('');
    const [finalAmountGiven, setFinalAmountGiven] = useState(''); // Store final amount after payment
    const [paidAmount, setPaidAmount] = useState(0); // Track total amount paid
    const [remainingAmount, setRemainingAmount] = useState(0); // Track remaining amount
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [carInfo, setCarInfo] = useState<any>(null);
    const [customerInfo, setCustomerInfo] = useState<any>(null);
    const [isViewOnly, setIsViewOnly] = useState(false); // New state for view-only mode

    useEffect(() => {
        // Get cart data from localStorage or URL params
        const cartData = localStorage.getItem('pos-cart');
        console.log('Payment page - cartData from localStorage:', cartData);

        if (cartData) {
            const parsedData = JSON.parse(cartData);
            console.log('Payment page - parsedData:', parsedData);
            console.log('Payment page - viewOnly flag:', parsedData.viewOnly);

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
            }

            // Check if this is viewOnly mode (for paid bookings)
            if (parsedData.viewOnly === true) {
                console.log('Setting ViewOnly mode: TRUE (paid booking)');
                setIsViewOnly(true);
                // For paid bookings, use the total from carInfo
                const totalFromCarInfo = parsedData.carInfo?.total || 0;
                setSubtotal(totalFromCarInfo);
                setTax(0); // No tax calculation needed for view-only
                setTotal(totalFromCarInfo);
                setRemainingAmount(0); // No remaining amount for paid bookings
                setPaidAmount(totalFromCarInfo); // Full amount already paid
                setPaymentComplete(true);
                // For view-only mode, still show the cart items but mark as paid
                setCart(cartItems); // Show cart items for paid bookings
                setOriginalCart(cartItems); // Store original cart items
            } else {
                console.log('Setting ViewOnly mode: FALSE (unpaid booking)');
                // Normal payment flow for unpaid bookings
                setIsViewOnly(false);

                setCart(cartItems);
                setOriginalCart(cartItems); // Store original cart for post-payment display

                const subtotalAmount = cartItems.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0);

                // Apply VIP discount if customer is VIP
                const isVip = parsedData.customerInfo?.isVip || false;
                const discountedSubtotal = isVip ? subtotalAmount * 0.9 : subtotalAmount; // 10% discount for VIP
                const taxAmount = discountedSubtotal * 0.1; // 10% tax

                setSubtotal(subtotalAmount); // Keep original subtotal for display
                setTax(taxAmount);
                setTotal(discountedSubtotal + taxAmount);
                setRemainingAmount(discountedSubtotal + taxAmount); // Initialize remaining amount
            }
        }
    }, []);

    const toggleTheme = () => {
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
    const handleStartWash = async () => {
        try {
            let bookingId = carInfo?.bookingId;

            if (!bookingId) {
                console.log('No booking ID found, creating new booking...');

                // Create new booking
                const newBooking = await createBookingInDatabase();
                if (newBooking && newBooking.id) {
                    bookingId = newBooking.id;

                    // Update carInfo with new booking ID
                    const updatedCarInfo = { ...carInfo, bookingId: bookingId };
                    setCarInfo(updatedCarInfo);

                    // Update localStorage
                    const cartData = localStorage.getItem('pos-cart');
                    if (cartData) {
                        const parsedData = JSON.parse(cartData);
                        parsedData.carInfo = updatedCarInfo;
                        localStorage.setItem('pos-cart', JSON.stringify(parsedData));
                    }

                    console.log('New booking created with ID:', bookingId);
                } else {
                    throw new Error('Failed to create booking');
                }
            }

            if (bookingId) {
                console.log('Updating booking status to in_progress for booking:', bookingId);

                // Update booking status in database
                const { data: bookingState, error: stateError } = await supabase
                    .from('booking_state')
                    .select('id')
                    .eq('state_name', 'in_progress')
                    .single();

                if (stateError) {
                    console.error('Error finding in_progress state:', stateError);
                    throw stateError;
                }

                // Prepare notes with payment info if available
                let notes = carInfo?.notes || '';

                // Add payment information to notes if payment was made
                if (paymentComplete && paymentMethod) {
                    const paymentInfo = `\nPayment Status: paid\nPayment Method: ${paymentMethod}\nAmount Paid: $${paidAmount}\nPayment Date: ${new Date().toLocaleString()}`;
                    notes += paymentInfo;
                } else if (paidAmount > 0) {
                    const partialPaymentInfo = `\nPayment Status: partial\nAmount Paid: $${paidAmount}\nRemaining: $${remainingAmount}\nPayment Date: ${new Date().toLocaleString()}`;
                    notes += partialPaymentInfo;
                } else {
                    notes += `\nPayment Status: unpaid`;
                }

                notes += `\nStatus updated to in_progress at ${new Date().toLocaleString()}`;

                // Update booking with new status and current timestamp
                const { error: updateError } = await supabase
                    .from('bookings')
                    .update({
                        booking_state_id: bookingState.id,
                        updatedAt: new Date().toISOString(),
                        notes: notes
                    })
                    .eq('id', bookingId);

                if (updateError) {
                    console.error('Error updating booking:', updateError);
                    throw updateError;
                }

                console.log('Booking status updated successfully');

                // Show success message
                const Swal = (await import('sweetalert2')).default;
                const result = await Swal.fire({
                    title: 'Wash Started!',
                    html: `
                        <div style="text-align: center; font-size: 16px;">
                            <p><strong>Booking #${bookingId}</strong></p>
                            <p>Wash has been started successfully!</p>
                            <p style="margin-top: 15px;">You can view this booking in the POS Dashboard.</p>
                        </div>
                    `,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Go to Dashboard',
                    cancelButtonText: 'Stay Here',
                    confirmButtonColor: '#10b981'
                });

                // If user wants to go to dashboard
                if (result.isConfirmed) {
                    // Clear cart and go to dashboard
                    localStorage.removeItem('pos-cart');
                    router.push('/pos-dashboard');
                    return; // Exit early
                }
            }

            // Update local state
            updateCarStatus('in-progress');
        } catch (error) {
            console.error('Error starting wash:', error);

            // Show error message with more detail
            const Swal = (await import('sweetalert2')).default;
            let errorMessage = 'Failed to start wash. Please try again.';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            await Swal.fire({
                title: 'Error Starting Wash',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    // Handler for Finish WASH button
    const handleFinishWash = async () => {
        try {
            const bookingId = carInfo?.bookingId;

            if (bookingId) {
                console.log('Checking payment status before finishing wash for booking:', bookingId);

                // Get current booking data first to check payment status
                const { data: currentBooking, error: fetchError } = await supabase
                    .from('bookings')
                    .select('notes')
                    .eq('id', bookingId)
                    .single();

                if (fetchError) {
                    console.error('Error fetching current booking:', fetchError);
                    throw fetchError;
                }

                // Check if payment has been completed
                const existingNotes = currentBooking?.notes || '';
                const hasPaymentCompleted = existingNotes.includes('Payment Status: paid') || existingNotes.includes('Method:');

                if (!hasPaymentCompleted) {
                    // Payment not completed - show confirmation dialog for "pay later" option
                    const Swal = (await import('sweetalert2')).default;
                    const result = await Swal.fire({
                        title: 'Payment Options',
                        html: `
                            <div style="text-align: center; font-size: 16px; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};">
                                <div style="margin: 15px 0; padding: 12px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; color: #dc2626; font-weight: 600;">
                                    &#9888;&#65039; Payment has not been completed yet.
                                </div>
                                <p style="margin: 15px 0; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'}; font-weight: 500;">Choose an option:</p>
                                <div style="margin: 20px 0; padding: 15px; background: #fef3cd; border-radius: 8px; border-left: 4px solid #fbbf24; color: #92400e;">
                                    <strong>Option 1:</strong> Complete payment now before finishing
                                </div>
                                <div style="margin: 20px 0; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6; color: #1e40af;">
                                    <strong>Option 2:</strong> Finish wash and allow customer to pay later
                                </div>
                            </div>
                        `,
                        icon: 'question',
                        showDenyButton: true,
                        showCancelButton: true,
                        confirmButtonText: '&#128176; Complete Payment First',
                        denyButtonText: '&#9197;&#65039; Finish & Pay Later',
                        cancelButtonText: '&#10060; Cancel',
                        confirmButtonColor: '#10b981',
                        denyButtonColor: '#3b82f6',
                        cancelButtonColor: '#6b7280',
                        background: isDarkMode ? '#1f2937' : '#ffffff',
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    });

                    if (result.isConfirmed) {
                        // User chose to complete payment first - don't finish wash
                        await Swal.fire({
                            title: 'Complete Payment',
                            text: 'Please complete the payment using the options above, then try finishing the wash again.',
                            icon: 'info',
                            confirmButtonColor: '#3b82f6',
                            background: isDarkMode ? '#1f2937' : '#ffffff',
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                        });
                        return; // Stop execution - don't finish wash
                    } else if (result.isDenied) {
                        // User chose to finish wash and pay later - continue with unpaid status
                        console.log('✅ User chose "pay later" option - proceeding to finish wash with unpaid status');
                    } else {
                        // User cancelled
                        return; // Stop execution
                    }
                } else {
                    console.log('✅ Payment confirmed - proceeding to finish wash for booking:', bookingId);
                }

                // Update booking status in database
                const { data: bookingState, error: stateError } = await supabase
                    .from('booking_state')
                    .select('id')
                    .eq('state_name', 'finished')
                    .single();

                if (stateError) {
                    console.error('Error finding finished state:', stateError);
                    throw stateError;
                }

                // Preserve existing notes and append finish status
                const finishStatusNote = `\nStatus updated to finished at ${new Date().toLocaleString()}`;
                const updatedNotes = existingNotes + finishStatusNote;

                // Update booking with new status and current timestamp
                const { error: updateError } = await supabase
                    .from('bookings')
                    .update({
                        booking_state_id: bookingState.id,
                        updatedAt: new Date().toISOString(),
                        notes: updatedNotes
                    })
                    .eq('id', bookingId);

                if (updateError) {
                    console.error('Error updating booking:', updateError);
                    throw updateError;
                }

                console.log('Booking status updated successfully');

                // Update carInfo with new notes
                const updatedCarInfo = { ...carInfo, notes: updatedNotes };
                setCarInfo(updatedCarInfo);

                // Update localStorage
                const cartData = localStorage.getItem('pos-cart');
                if (cartData) {
                    const parsedData = JSON.parse(cartData);
                    parsedData.carInfo = updatedCarInfo;
                    localStorage.setItem('pos-cart', JSON.stringify(parsedData));
                }

                // Show success message with payment status info
                const finalPaymentStatus = updatedNotes.includes('Payment Status: paid') || updatedNotes.includes('Method:');
                const Swal = (await import('sweetalert2')).default;
                await Swal.fire({
                    title: 'Wash Finished!',
                    html: `
                        <div style="text-align: center; font-size: 16px; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};">
                            <p style="margin: 10px 0; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};"><strong>Booking #${bookingId}</strong> wash has been completed.</p>
                            <div style="margin: 15px 0; padding: 10px; border-radius: 8px; ${finalPaymentStatus
                            ? 'background: #d1fae5; color: #065f46;'
                            : 'background: #fef3cd; color: #92400e;'
                        }">
                                Payment Status: ${finalPaymentStatus ? '✅ PAID' : '⏳ UNPAID (Pay Later)'}
                            </div>
                        </div>
                    `,
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false
                });
            }

            // Update local state
            updateCarStatus('finished');
        } catch (error) {
            console.error('Error finishing wash:', error);

            // Show error message
            const Swal = (await import('sweetalert2')).default;
            await Swal.fire({
                title: 'Error',
                text: 'Failed to finish wash. Please try again.',
                icon: 'error'
            });
        }
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

    const handleCashPayment = async () => {
        const given = parseFloat(amountGiven);
        const currentRemainingAmount = remainingAmount > 0 ? remainingAmount : total;

        if (given > 0) { // Allow any positive amount
            // Store the final amount given for display in success screen
            setFinalAmountGiven(amountGiven);

            // Update paid and remaining amounts
            const newPaidAmount = paidAmount + given;
            const newRemainingAmount = total - newPaidAmount;

            setPaidAmount(newPaidAmount);
            setRemainingAmount(Math.max(0, newRemainingAmount)); // Don't go below 0

            if (given >= currentRemainingAmount || newRemainingAmount <= 0) {
                // Full payment or overpayment
                const change = given - currentRemainingAmount;

                if (change > 0) {
                    const Swal = (await import('sweetalert2')).default;
                    await Swal.fire({
                        icon: 'success',
                        title: 'Payment Complete!',
                        html: `
                            <div style="text-align: center; font-size: 16px;">
                                <p style="margin: 10px 0;"><strong>Amount Paid:</strong> ${formatCurrency(given)}</p>
                                <p style="margin: 10px 0;"><strong>Total Paid:</strong> ${formatCurrency(newPaidAmount)}</p>
                                <p style="margin: 10px 0;"><strong>Sale Total:</strong> ${formatCurrency(total)}</p>
                                <p style="margin: 15px 0; font-size: 20px; font-weight: bold; color: #10b981;">
                                    <strong>Change Due:</strong> ${formatCurrency(change)}
                                </p>
                            </div>
                        `,
                        confirmButtonColor: '#10b981',
                        confirmButtonText: 'Continue',
                        background: isDarkMode ? '#1f2937' : '#ffffff',
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    });
                }

                completePayment('Cash');
            } else {
                // Partial payment
                const Swal = (await import('sweetalert2')).default;
                await Swal.fire({
                    icon: 'info',
                    title: 'Partial Payment Received',
                    html: `
                        <div style="text-align: center; font-size: 16px;">
                            <p style="margin: 10px 0;"><strong>Amount Paid:</strong> ${formatCurrency(given)}</p>
                            <p style="margin: 10px 0;"><strong>Total Paid:</strong> ${formatCurrency(newPaidAmount)}</p>
                            <p style="margin: 10px 0;"><strong>Sale Total:</strong> ${formatCurrency(total)}</p>
                            <p style="margin: 15px 0; font-size: 18px; font-weight: bold; color: #f59e0b;">
                                <strong>Remaining:</strong> ${formatCurrency(newRemainingAmount)}
                            </p>
                        </div>
                    `,
                    confirmButtonColor: '#3b82f6',
                    confirmButtonText: 'Continue',
                    background: isDarkMode ? '#1f2937' : '#ffffff',
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                });
            }

            setShowCashModal(false);
            setAmountGiven('');
        }
    };

    const completePayment = async (method: string) => {
        setPaymentComplete(true);
        setPaymentMethod(method);

        // Update booking in database with payment status and create transaction
        try {
            const bookingId = carInfo?.bookingId;
            if (bookingId) {
                console.log('Updating booking with payment status for booking:', bookingId);

                // Normalize payment method to lowercase for API
                const normalizedMethod = method.toLowerCase();

                // Create transaction record first
                console.log('Creating transaction record...');
                const transactionResult = await BookingService.createTransaction(
                    bookingId,
                    total,
                    normalizedMethod
                );

                if (transactionResult.success) {
                    console.log('Transaction created successfully:', transactionResult.transaction);
                } else {
                    console.error('Failed to create transaction:', transactionResult.error);
                    // Don't fail the payment completion if transaction creation fails
                    // but log the error for debugging
                }

                // Prepare payment notes
                const paymentNotes = `Payment Status: paid | Payment Method: ${method} | Amount Paid: $${total} | Payment Date: ${new Date().toLocaleString()}`;
                let updatedNotes = carInfo?.notes || '';

                // Replace "Payment Status: unpaid" with new payment status
                if (updatedNotes.includes('Payment Status: unpaid')) {
                    updatedNotes = updatedNotes.replace('Payment Status: unpaid', paymentNotes);
                } else {
                    updatedNotes = `${updatedNotes}\n${paymentNotes}`;
                }

                const { error: updateError } = await supabase
                    .from('bookings')
                    .update({
                        notes: updatedNotes,
                        updatedAt: new Date().toISOString()
                    })
                    .eq('id', bookingId);

                if (updateError) {
                    console.error('Error updating booking payment status:', updateError);
                } else {
                    console.log('Booking payment status updated successfully');

                    // Update carInfo with new notes
                    const updatedCarInfo = { ...carInfo, notes: updatedNotes };
                    setCarInfo(updatedCarInfo);

                    // Update localStorage
                    const cartData = localStorage.getItem('pos-cart');
                    if (cartData) {
                        const parsedData = JSON.parse(cartData);
                        parsedData.carInfo = updatedCarInfo;
                        localStorage.setItem('pos-cart', JSON.stringify(parsedData));
                    }
                }
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
        }

        // Don't clear cart from localStorage yet - wait until user goes back to POS
        // localStorage.removeItem('pos-cart');
    }; const handleCompleteSale = () => {
        // Clear cart when completing sale (going back to POS after payment)
        localStorage.removeItem('pos-cart');
        router.push('/pos');
    }; const handleBackAfterPayment = () => {
        // Clear cart when going back to POS after successful payment
        localStorage.removeItem('pos-cart');
        router.push('/pos');
    };

    // Function to create booking in database
    const createBookingInDatabase = async () => {
        try {
            console.log('Creating booking with data:', { customerInfo, carInfo, cart, total });

            if (!customerInfo || !carInfo) {
                throw new Error('Missing customer or car information');
            }

            // Check for existing customer by phone
            let customerId = null;
            try {
                const { data: existingCustomer, error: customerCheckError } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('phone', customerInfo.phone)
                    .single();

                if (customerCheckError && customerCheckError.code !== 'PGRST116') {
                    console.error('Error checking existing customer:', customerCheckError);
                    // Don't throw error, continue with creating new customer
                }

                if (existingCustomer) {
                    customerId = existingCustomer.id;
                    console.log('Found existing customer:', customerId);
                }
            } catch (error) {
                console.log('Customer check failed, will create new customer');
            }

            if (!customerId) {
                // Create new customer with minimal required fields
                try {
                    const customerData: any = {
                        name: customerInfo.name || 'Unknown Customer',
                        phone: customerInfo.phone || '0000000000'
                    };

                    // Only add email if it exists and is valid
                    if (customerInfo.email && customerInfo.email.includes('@')) {
                        customerData.email = customerInfo.email;
                    }

                    const { data: newCustomer, error: customerError } = await supabase
                        .from('customers')
                        .insert({
                            name: customerData.name,
                            phone: customerData.phone,
                            email: customerData.email || null,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        })
                        .select('id')
                        .single();

                    if (customerError) {
                        console.error('Error creating customer:', customerError);
                        // Use fallback ID instead of throwing error
                        customerId = 1;
                        console.log('Using fallback customer ID:', customerId);
                    } else {
                        customerId = newCustomer.id;
                        console.log('Created new customer:', customerId);
                    }
                } catch (error) {
                    console.error('Failed to create customer, using fallback ID:', error);
                    customerId = 1; // Fallback to existing customer ID
                }
            }

            // Check for existing vehicle
            let vehicleId = null;
            try {
                const { data: existingVehicle, error: vehicleCheckError } = await supabase
                    .from('vehicles')
                    .select('id')
                    .eq('license_plate', carInfo.licensePlate)
                    .single();

                if (vehicleCheckError && vehicleCheckError.code !== 'PGRST116') {
                    console.error('Error checking existing vehicle:', vehicleCheckError);
                    // Don't throw error, continue with creating new vehicle
                }

                if (existingVehicle) {
                    vehicleId = existingVehicle.id;
                    console.log('Found existing vehicle:', vehicleId);
                }
            } catch (error) {
                console.log('Vehicle check failed, will create new vehicle');
            }

            if (!vehicleId) {
                // Create new vehicle
                try {
                    const { data: newVehicle, error: vehicleError } = await supabase
                        .from('vehicles')
                        .insert({
                            customer_id: customerId, // Required field
                            license_plate: carInfo.licensePlate || 'UNKNOWN',
                            make: 'Unknown',
                            model: 'Unknown',
                            color: 'Unknown',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        })
                        .select('id')
                        .single();

                    if (vehicleError) {
                        console.error('Error creating vehicle:', vehicleError);
                        // Use fallback ID instead of throwing error
                        vehicleId = 1;
                        console.log('Using fallback vehicle ID:', vehicleId);
                    } else {
                        vehicleId = newVehicle.id;
                        console.log('Created new vehicle:', vehicleId);
                    }
                } catch (error) {
                    console.error('Failed to create vehicle, using fallback ID:', error);
                    vehicleId = 1; // Fallback to existing vehicle ID
                }
            }

            // Get booking state ID
            let stateId = 1; // Default fallback
            try {
                const { data: bookingState, error: stateError } = await supabase
                    .from('booking_state')
                    .select('id')
                    .eq('state_name', 'in_progress')
                    .single();

                if (stateError) {
                    console.error('Error getting booking state:', stateError);
                    // Fallback to any available state
                    const { data: fallbackState, error: fallbackError } = await supabase
                        .from('booking_state')
                        .select('id')
                        .limit(1)
                        .single();

                    if (fallbackState) {
                        stateId = fallbackState.id;
                        console.log('Using fallback booking state:', stateId);
                    } else {
                        console.log('No booking states found, using default ID 1');
                    }
                } else {
                    stateId = bookingState.id;
                }
            } catch (error) {
                console.error('Error retrieving booking state:', error);
                console.log('Using default booking state ID:', stateId);
            }

            // Create booking
            const bookingData = {
                customer_id: customerId,
                vehicle_id: vehicleId,
                booking_state_id: stateId,
                date: new Date().toISOString().split('T')[0], // Current date
                total_price: total,
                notes: `Booking created from POS at ${new Date().toLocaleString()}\nCustomer: ${customerInfo.name}\nVehicle: ${carInfo.licensePlate}`,
                created_by: 1, // Required field - using admin user ID
                updated_by: 1, // Required field - using admin user ID
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('Creating booking with data:', bookingData);

            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert(bookingData)
                .select('id')
                .single();

            if (bookingError) {
                console.error('Error creating booking:', bookingError);
                throw new Error(`Failed to create booking: ${bookingError.message}`);
            }

            if (!booking || !booking.id) {
                throw new Error('Booking was created but no ID returned');
            }

            console.log('Booking created successfully with ID:', booking.id);

            // Add services to booking
            if (cart && cart.length > 0) {
                console.log('🛠️ Processing cart for services:', cart);
                try {
                    const bookingServices = cart.map((item, index) => {
                        console.log(`Processing cart item ${index}:`, item);

                        // Handle different service ID formats
                        let serviceId = 1; // Default fallback

                        if (item.service && item.service.id) {
                            const id = item.service.id;
                            console.log(`Service ID processing: ${id} (type: ${typeof id})`);

                            // If it's already a number
                            if (typeof id === 'number') {
                                serviceId = id;
                            }
                            // If it's a string with 'service_' prefix
                            else if (typeof id === 'string' && id.includes('service_')) {
                                serviceId = parseInt(id.replace('service_', '')) || 1;
                            }
                            // If it's a string number
                            else if (typeof id === 'string') {
                                serviceId = parseInt(id) || 1;
                            }

                            console.log(`Final service ID: ${serviceId}`);
                        }

                        return {
                            booking_id: booking.id,
                            service_id: serviceId,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                    });

                    console.log('Adding services to booking:', bookingServices);

                    const { error: servicesError } = await supabase
                        .from('booking_services')
                        .insert(bookingServices);

                    if (servicesError) {
                        console.error('Error adding services to booking:', servicesError);
                        // Don't throw error here, booking was created successfully
                        console.log('Continuing despite service insertion error...');
                    } else {
                        console.log('Services added successfully to booking');
                    }
                } catch (error) {
                    console.error('Exception while adding services:', error);
                    // Don't throw error here, booking was created successfully
                }
            } else {
                console.log('No cart items to add as services');
            }

            // Return the complete booking object
            console.log('✅ Booking creation completed successfully:', {
                id: booking.id,
                customer_id: customerId,
                vehicle_id: vehicleId,
                total_price: total,
                status: 'in_progress'
            });

            return booking;
        } catch (error) {
            console.error('Error in createBookingInDatabase:', error);
            throw error;
        }
    };

    const handleBack = () => {
        // Preserve cart data when going back to POS for additional services
        const cartData = {
            cart: cart,
            customerInfo: customerInfo,
            carInfo: carInfo,
            timestamp: new Date().toISOString(),
            fromPayment: true, // Flag to indicate this came from payment page
            // Preserve customer check state for complete restoration
            customerExists: customerInfo ? true : null,
            customerData: customerInfo,
            carRegistration: carInfo?.licensePlate || ''
        };
        localStorage.setItem('pos-cart', JSON.stringify(cartData));
        router.push('/pos');
    };

    const handleMainMenu = () => {
        // Clear all data when going to main menu
        localStorage.removeItem('pos-cart');
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
                                onClick={handleBackAfterPayment}
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
                                    {/* Show original cart items after payment completion, or current cart during payment */}
                                    {(paymentComplete && !isViewOnly ? originalCart : cart).map((item, index) => (
                                        <div key={item.service.id} className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${isDarkMode ? 'border-slate-600 bg-slate-700 hover:bg-slate-600' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} ${paymentComplete ? 'border-green-200 bg-green-50' : ''}`}>
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <div className={`font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {item.service.name}
                                                        {paymentComplete && (
                                                            <span className="text-green-600 text-lg" title="Đã thanh toán">✓</span>
                                                        )}
                                                    </div>
                                                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                                        Qty: {item.quantity}
                                                        {paymentComplete && (
                                                            <span className="ml-2 text-green-600 text-xs font-medium">• Đã thanh toán</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`font-bold text-lg ${paymentComplete ? 'text-green-600' : 'text-blue-600'}`}>
                                                    {formatCurrency(item.subtotal)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Show "No items" only when there are genuinely no items to display */}
                                    {((paymentComplete && !isViewOnly) ? originalCart.length === 0 : cart.length === 0) && (
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
                                <div className={`text-lg font-bold text-green-600`}>
                                    ✅ PAID: {formatCurrency(total)}
                                </div>
                                {paymentMethod && (
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                        Payment Method: <span className="font-bold">{paymentMethod}</span>
                                    </div>
                                )}
                                <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold">
                                    Payment Complete ✅
                                </div>
                                {paymentMethod === 'Cash' && finalAmountGiven && parseFloat(finalAmountGiven) > total && (
                                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
                                        Change Given: {formatCurrency(parseFloat(finalAmountGiven) - total)}
                                    </div>
                                )}
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
                            </div>                            {/* Payment Status Indicator for In-Progress */}
                            {carInfo?.status === 'in-progress' && (
                                <div className={`p-3 rounded-lg border text-center ${paymentComplete
                                    ? 'bg-green-100 border-green-200 text-green-800'
                                    : 'bg-blue-100 border-blue-200 text-blue-800'
                                    }`}>
                                    <div className="font-medium text-sm">
                                        Payment Status: {paymentComplete ? '✅ PAID' : '⏳ PENDING'}
                                    </div>
                                    {!paymentComplete && (
                                        <div className="text-xs mt-1">
                                            💰 Pay now or finish wash & pay later
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
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

                    {/* Cart Section - Hidden in View Only Mode */}
                    {!isViewOnly && (
                        <>
                            {/* Scrollable Items List */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className={`mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'} font-semibold`}>
                                    Items ({paymentComplete && !isViewOnly ? originalCart.length : cart.length})
                                </div>
                                <div className={`flex-1 overflow-y-auto scrollbar-thin pr-2 ${isDarkMode ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-800' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200'}`}
                                    style={{ maxHeight: 'calc(100vh - 450px)' }}>
                                    <div className="space-y-3">
                                        {/* Show original cart items after payment completion, or current cart during payment */}
                                        {(paymentComplete && !isViewOnly ? originalCart : cart).map((item, index) => (
                                            <div key={item.service.id} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${isDarkMode ? 'border-slate-600 bg-slate-700 hover:bg-slate-600' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} ${paymentComplete ? 'border-green-200 bg-green-50' : ''}`}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 pr-3">
                                                        <div className={`font-semibold text-base mb-1 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {item.service.name}
                                                            {paymentComplete && (
                                                                <span className="text-green-600 text-lg" title="Đã thanh toán">✓</span>
                                                            )}
                                                        </div>
                                                        <div className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                                            <span>Qty: {item.quantity}</span>
                                                            <span>•</span>
                                                            <span>{formatCurrency(item.service.price)}/each</span>
                                                            {paymentComplete && (
                                                                <span className="text-green-600 text-xs font-medium">• Đã thanh toán</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`font-bold text-lg ${paymentComplete ? 'text-green-600' : 'text-blue-600'}`}>
                                                            {formatCurrency(item.subtotal)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Show "No items" only when there are genuinely no items to display */}
                                        {((paymentComplete && !isViewOnly) ? originalCart.length === 0 : cart.length === 0) && (
                                            <div className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                                <div className="text-4xl mb-4">🛒</div>
                                                <p className="text-lg font-medium">No items in cart</p>
                                                <p className="text-sm mt-2">Add services to get started</p>
                                            </div>
                                        )}
                                        {/* Add padding at bottom for better scroll experience */}
                                        {(paymentComplete && !isViewOnly ? originalCart.length > 0 : cart.length > 0) && <div className="h-4"></div>}
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
                                        <div className={`text-lg font-bold ${paidAmount > 0 ? 'text-green-600' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            PAID: {formatCurrency(paidAmount)}
                                        </div>
                                        <div className={`px-4 py-2 rounded-lg font-bold text-white ${remainingAmount > 0 ? 'bg-orange-500' : 'bg-green-500'}`}>
                                            {remainingAmount > 0 ? `Remaining: ${formatCurrency(remainingAmount)}` : 'Fully Paid ✅'}
                                        </div>
                                        {paidAmount > 0 && remainingAmount > 0 && (
                                            <div className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
                                                📋 Partial payment received. Continue payment for remaining amount.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* View Only Message for Paid Bookings */}
                    {isViewOnly && (
                        <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                            <div className="text-center">
                                <div className="text-6xl mb-4">✅</div>
                                <h3 className="text-xl font-semibold mb-2">Payment Complete</h3>
                                <p className="text-sm">This booking has been fully paid.</p>
                                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
                                    <div className="font-semibold">Total Paid: {formatCurrency(total)}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Payment Options */}
                <div className={`flex-1 p-8 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <div className="text-center mb-8">
                        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Amount to Pay
                        </h1>
                        <div className="text-5xl font-bold text-green-600 mb-4">
                            {formatCurrency(remainingAmount > 0 ? remainingAmount : total)}
                        </div>
                        {paidAmount > 0 && (
                            <div className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                                Total: {formatCurrency(total)} | Paid: {formatCurrency(paidAmount)}
                            </div>
                        )}
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
                        </div>                        {/* Payment Status Indicator for In-Progress */}
                        {carInfo?.status === 'in-progress' && (
                            <div className={`p-3 rounded-lg border text-center ${paymentComplete
                                ? 'bg-green-100 border-green-200 text-green-800'
                                : 'bg-yellow-100 border-yellow-200 text-yellow-800'
                                }`}>
                                <div className="font-medium text-sm">
                                    Payment Status: {paymentComplete ? '✅ PAID' : '⏳ PENDING'}
                                </div>
                                {!paymentComplete && (
                                    <div className="text-xs mt-1">
                                        Complete payment to finish wash
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
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
                                Amount to pay: <span className="text-green-600">{formatCurrency(remainingAmount > 0 ? remainingAmount : total)}</span>
                            </div>
                            {paidAmount > 0 && (
                                <div className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                                    Total Bill: {formatCurrency(total)} | Already Paid: {formatCurrency(paidAmount)}
                                </div>
                            )}
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

                            <div className="grid grid-cols-3 gap-3 mb-3">
                                <button
                                    onClick={() => setAmountGiven((remainingAmount > 0 ? remainingAmount : total).toFixed(2))}
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {formatCurrency(remainingAmount > 0 ? remainingAmount : total)}
                                </button>
                                <button
                                    onClick={() => setAmountGiven((Math.ceil(remainingAmount > 0 ? remainingAmount : total)).toFixed(2))}
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    ${Math.ceil(remainingAmount > 0 ? remainingAmount : total)}.00
                                </button>
                                <button
                                    onClick={() => setAmountGiven('50.00')}
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    $50.00
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setAmountGiven('100.00')}
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    $100.00
                                </button>
                                <button
                                    onClick={() => setAmountGiven('200.00')}
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    $200.00
                                </button>
                                <button
                                    onClick={() => setAmountGiven('')}
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-red-600 text-white hover:bg-red-500'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                        }`}
                                >
                                    Clear
                                </button>
                            </div>

                            {/* Show change calculation */}
                            {amountGiven && parseFloat(amountGiven) >= (remainingAmount > 0 ? remainingAmount : total) && (
                                <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-green-800 border border-green-600' : 'bg-green-50 border border-green-200'}`}>
                                    <div className={`text-lg font-semibold ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                                        Change: {formatCurrency(parseFloat(amountGiven) - (remainingAmount > 0 ? remainingAmount : total))}
                                    </div>
                                </div>
                            )}

                            {/* Show partial payment info */}
                            {amountGiven && parseFloat(amountGiven) > 0 && parseFloat(amountGiven) < (remainingAmount > 0 ? remainingAmount : total) && (
                                <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-yellow-800 border border-yellow-600' : 'bg-yellow-50 border border-yellow-200'}`}>
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                                        Partial Payment: {formatCurrency(parseFloat(amountGiven))}
                                    </div>
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                                        Will Remain: {formatCurrency((remainingAmount > 0 ? remainingAmount : total) - parseFloat(amountGiven))}
                                    </div>
                                </div>
                            )}
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
                                disabled={!amountGiven || parseFloat(amountGiven) <= 0}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${!amountGiven || parseFloat(amountGiven) <= 0
                                    ? isDarkMode
                                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : parseFloat(amountGiven) >= (remainingAmount > 0 ? remainingAmount : total)
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {parseFloat(amountGiven) >= (remainingAmount > 0 ? remainingAmount : total) ? 'Complete Payment' : 'Partial Payment'}
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

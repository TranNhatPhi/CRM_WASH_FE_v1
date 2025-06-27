'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServiceGrid, ShoppingCart, TransactionHistory, CustomerForm } from '@/components/pos';
import { POSService, CartItem, POSCustomer, POSTransaction } from '@/types';
import { fetchPOSServices, generatePOSTransactions } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useScreenReader } from '@/hooks/useAccessibility';
import { AccessibilityTestSuite } from '@/components/ui/AccessibilityTestSuite';

export default function POSPage() {
  const { theme } = useTheme();
  const [services, setServices] = useState<POSService[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<POSCustomer | null>(null);
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [showA11yTests, setShowA11yTests] = useState(false);
  
  // Accessibility features
  const { announce } = useScreenReader();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData] = await Promise.all([
          fetchPOSServices(),
        ]);

        setServices(servicesData);
        setTransactions(generatePOSTransactions());
      } catch (error) {
        console.error('Error loading POS data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const removeFromCart = (serviceId: string) => {
    setCart(prevCart => prevCart.filter(item => item.service.id !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(serviceId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.service.id === serviceId
          ? { ...item, quantity, subtotal: item.service.price * quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
  };

  const processTransaction = async () => {
    if (!customer || cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = customer.isVIP ? subtotal * 0.1 : 0;
    const tax = (subtotal - discount) * 0.1;
    const total = subtotal - discount + tax;

    const newTransaction: POSTransaction = {
      id: `TXN-${String(transactions.length + 1).padStart(4, '0')}`,
      customer,
      items: [...cart],
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: 'cash',
      timestamp: new Date(),
      status: 'pending',
    };

    setTransactions(prev => [newTransaction, ...prev]);
    clearCart();

    announce(`Transaction ${newTransaction.id} processed successfully for ${customer.name}. Total amount: $${total.toFixed(2)}`);
    alert('Transaction processed successfully!');
  };

  if (loading) {
    return (
      <DashboardLayout title="Point of Sale">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Point of Sale">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
          {/* Services Section */}
          <div className="flex-1 min-w-0">
            <Card className="h-full">
              <div className="p-3 sm:p-4 lg:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Services
                </h2>
                <ServiceGrid services={services} onAddToCart={addToCart} />
              </div>
            </Card>
          </div>

          {/* Cart and Customer Section */}
          <div className="w-full xl:w-96 2xl:w-[400px] space-y-4 sm:space-y-6 order-first xl:order-last">
            <CustomerForm customer={customer} onCustomerChange={setCustomer} />
            <ShoppingCart
              items={cart}
              customer={customer}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onProcessTransaction={processTransaction}
            />
          </div>
        </div>

        {/* Transaction History Section */}
        <Card>
          <div className="p-3 sm:p-4 lg:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="recent" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Recent Transactions</span>
                  <span className="sm:hidden">Recent</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Pending Orders</span>
                  <span className="sm:hidden">Pending</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">Done</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="mt-4 sm:mt-6">
                <TransactionHistory
                  transactions={transactions}
                  filter="all"
                />
              </TabsContent>
              <TabsContent value="pending" className="mt-4 sm:mt-6">
                <TransactionHistory
                  transactions={transactions.filter(t => t.status === 'pending' || t.status === 'in-progress')}
                  filter="pending"
                />
              </TabsContent>
              <TabsContent value="completed" className="mt-4 sm:mt-6">
                <TransactionHistory
                  transactions={transactions.filter(t => t.status === 'completed')}
                  filter="completed"
                />
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        {/* Accessibility Test Suite */}
        <AccessibilityTestSuite
          isVisible={showA11yTests}
          onClose={() => setShowA11yTests(false)}
        />

        {/* Floating Accessibility Button (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setShowA11yTests(true)}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Open Accessibility Test Suite"
            title="Test Accessibility"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5S6.41 3.5 10 3.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z" />
              <circle cx="10" cy="7" r="1" />
              <path d="M10 9c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1v-3c0-.55-.45-1-1-1z" />
            </svg>
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}

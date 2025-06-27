'use client';

import React from 'react';
import { Search, Bell, Settings, User, Sun, Moon, ShoppingCart as ShoppingCartIcon, X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { CartItem, POSCustomer } from '@/types';
import { formatCurrency } from '@/utils';

interface POSHeaderProps {
  onMenuClick: () => void;
  title?: string;
  isFullscreen?: boolean;
  // Cart related props
  cart: CartItem[];
  customer: POSCustomer | null;
  onUpdateQuantity: (serviceId: string, quantity: number) => void;
  onRemoveItem: (serviceId: string) => void;
  onClearCart: () => void;
  onProcessTransaction: () => void;
}

export const POSHeader: React.FC<POSHeaderProps> = ({
  onMenuClick,
  title = 'Point of Sale',
  isFullscreen = false,
  cart,
  customer,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProcessTransaction
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = customer?.isVIP ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  if (isFullscreen) {
    return null; // Hide header completely in fullscreen mode
  }

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700 relative z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Left side - Title */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>

          {/* Right side - Compact navigation with shopping cart */}
          <div className="flex items-center space-x-2">
            {/* Shopping Cart with dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Shopping Cart
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCartOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Cart Items */}
                    <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                      {cart.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                          <ShoppingCartIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Your cart is empty</p>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div
                            key={item.service.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {item.service.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {formatCurrency(item.service.price)} each
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center bg-white dark:bg-slate-600 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => onUpdateQuantity(item.service.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-500 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center font-medium text-gray-900 dark:text-white text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.service.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-500 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => onRemoveItem(item.service.id)}
                                className="w-6 h-6 flex items-center justify-center rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Cart Summary */}
                    {cart.length > 0 && (
                      <>
                        <div className="border-t border-gray-200 dark:border-slate-600 pt-3 mb-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                              <span className="text-gray-900 dark:text-white">
                                {formatCurrency(subtotal)}
                              </span>
                            </div>
                            {customer?.isVIP && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-green-600 dark:text-green-400">VIP Discount (10%)</span>
                                <span className="text-green-600 dark:text-green-400">
                                  -{formatCurrency(discount)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-base font-bold pt-1 border-t border-gray-200 dark:border-slate-600">
                              <span className="text-gray-900 dark:text-white">Total</span>
                              <span className="text-gray-900 dark:text-white">
                                {formatCurrency(total)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onClearCart();
                              setIsCartOpen(false);
                            }}
                            className="text-xs"
                          >
                            Clear
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              alert('Cart saved successfully!');
                              setIsCartOpen(false);
                            }}
                            className="text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              onProcessTransaction();
                              setIsCartOpen(false);
                            }}
                            disabled={!customer}
                            className="text-xs bg-green-600 hover:bg-green-700"
                          >
                            Pay
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Info */}
            {customer && (
              <div className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">
                <span className="font-medium text-gray-900 dark:text-white">{customer.name}</span>
                {customer.isVIP && (
                  <span className="ml-1 bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs">VIP</span>
                )}
              </div>
            )}

            {/* Compact navigation buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-1 ring-white dark:ring-slate-900" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay to close cart when clicking outside */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </header>
  );
};

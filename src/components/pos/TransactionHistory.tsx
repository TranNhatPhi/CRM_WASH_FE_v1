'use client';

import React from 'react';
import { POSTransaction } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Car,
  CreditCard,
  Banknote,
  Smartphone,
  Star
} from 'lucide-react';
import { formatCurrency } from '@/utils';
import { useVirtualScrolling, useResponsiveItemHeight } from '@/hooks/useVirtualScrolling';

interface TransactionHistoryProps {
  transactions: POSTransaction[];
  filter: 'all' | 'pending' | 'completed';
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'Pending',
  },
  'in-progress': {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'In Progress',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    label: 'Completed',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    label: 'Cancelled',
  },
};

const paymentMethodConfig = {
  cash: {
    icon: Banknote,
    label: 'Cash',
    color: 'text-green-600 dark:text-green-400',
  },
  card: {
    icon: CreditCard,
    label: 'Card',
    color: 'text-blue-600 dark:text-blue-400',
  },
  digital: {
    icon: Smartphone,
    label: 'Digital',
    color: 'text-purple-600 dark:text-purple-400',
  },
};

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  filter
}) => {
  const itemHeight = useResponsiveItemHeight();
  const [containerHeight, setContainerHeight] = React.useState(600);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setContainerHeight(Math.min(600, window.innerHeight * 0.6));
    }
  }, []);

  // Use virtual scrolling only for large datasets (>10 items)
  const shouldUseVirtualScrolling = transactions.length > 10;

  const virtualScrolling = useVirtualScrolling(transactions, {
    itemHeight,
    containerHeight,
    overscan: 3,
  });

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
        <Receipt className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
        <p className="text-xs sm:text-sm">No transactions found</p>
        <p className="text-xs mt-1">
          {filter === 'pending' ? 'No pending orders' :
            filter === 'completed' ? 'No completed transactions' :
              'Start processing orders to see history'}
        </p>
      </div>
    );
  }

  if (shouldUseVirtualScrolling) {
    return (
      <div className="relative">
        <div {...virtualScrolling.containerProps}>
          <div style={{ height: virtualScrolling.totalHeight, position: 'relative' }}>
            {virtualScrolling.virtualItems.map(({ index, item, style }) => (
              <div key={item.id} style={style} className="px-1">
                <div className="h-full py-2">
                  <TransactionCard transaction={item} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Scroll indicator for large lists */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {transactions.length} items
        </div>
      </div>
    );
  }

  // Regular rendering for smaller lists
  return (
    <div className="space-y-3 sm:space-y-4">
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
};

interface TransactionCardProps {
  transaction: POSTransaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const status = statusConfig[transaction.status];
  const StatusIcon = status.icon;
  const paymentMethod = paymentMethodConfig[transaction.paymentMethod];
  const PaymentIcon = paymentMethod.icon;

  return (
    <Card className="hover:shadow-sm transition-shadow duration-200">
      <CardContent className="p-2">
        <div className="flex flex-col gap-2">
          {/* Transaction Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 dark:text-white text-xs">
                {transaction.id}
              </h4>
              <div className={`flex items-center px-1.5 py-0.5 rounded text-xs ${status.bg} ${status.border} border`}>
                <StatusIcon className={`w-2 h-2 mr-1 ${status.color}`} />
                <span className={`${status.color} text-xs`}>{status.label}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {transaction.timestamp.toLocaleDateString()}
            </div>
          </div>

          {/* Customer Info - Compact */}
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center min-w-0">
              <User className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{transaction.customer.name}</span>
              {transaction.customer.isVIP && (
                <Star className="w-2 h-2 ml-1 text-amber-500 flex-shrink-0" />
              )}
            </div>
            {transaction.customer.vehiclePlate && (
              <div className="flex items-center">
                <Car className="w-3 h-3 mr-1" />
                <span>{transaction.customer.vehiclePlate}</span>
              </div>
            )}
          </div>

          {/* Services - Compact List */}
          <div className="space-y-0.5">
            {transaction.items.slice(0, 2).map((item) => (
              <div key={item.service.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center min-w-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: item.service.color }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {item.service.name}
                    {item.quantity > 1 && (
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        × {item.quantity}
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400 ml-2 flex-shrink-0">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
            {transaction.items.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{transaction.items.length - 2} more items
              </div>
            )}
          </div>          {/* Summary - Single Line */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <PaymentIcon className={`w-3 h-3 ${paymentMethod.color}`} />
              <span className="text-gray-600 dark:text-gray-400">{paymentMethod.label}</span>
              {transaction.discount > 0 && (
                <span className="text-green-600 dark:text-green-400">
                  -{formatCurrency(transaction.discount)}
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCurrency(transaction.total)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

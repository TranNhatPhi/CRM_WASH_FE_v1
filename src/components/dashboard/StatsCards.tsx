'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types';
import { formatCurrency, formatNumber } from '@/utils';
import { Car, DollarSign, TrendingUp, Activity } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statItems = [
    {
      title: 'Total Vehicles',
      value: formatNumber(stats.totalCars),
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      change: '+12.5%',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      change: '+8.2%',
    },
    {
      title: 'Average Revenue',
      value: formatCurrency(stats.averageRevenue),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      change: '+5.1%',
    },
    {
      title: 'Active Stations',
      value: formatNumber(stats.activeStations),
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      change: '100%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (<Card key={index} className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {item.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.value}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {item.change} since yesterday
              </p>
            </div>
            <div className={`p-3 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
      ))}
    </div>
  );
};

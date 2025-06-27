'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@/components/charts/LineChart';
import { HourlyStats } from '@/types';
import { formatCurrency } from '@/utils';

interface HourlyStatsChartProps {
  data: HourlyStats[];
}

export const HourlyStatsChart: React.FC<HourlyStatsChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.hour),
    datasets: [
      {
        label: 'Cars / Hour',
        data: data.map(item => item.carsPerHour),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Revenue / Hour (Million VND)',
        data: data.map(item => item.grossPerHour / 1000000),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
      },
    ],
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Hourly Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <LineChart data={chartData} height={320} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total cars today</p>
            <p className="text-xl font-bold text-blue-600">
              {data.reduce((sum, item) => sum + item.carsPerHour, 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total revenue today</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.grossPerHour, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@/components/charts/LineChart';
import { ComparisonData } from '@/types';

interface ComparisonChartProps {
  data: ComparisonData[];
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Cars Yesterday',
        data: data.map(item => item.carsYesterday),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
      {
        label: 'Cars Today',
        data: data.map(item => item.carsToday),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Today vs Yesterday Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <LineChart data={chartData} height={320} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Yesterday</p>
            <p className="text-xl font-bold text-red-600">
              {data.reduce((sum, item) => sum + item.carsYesterday, 0)} cars
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Today</p>
            <p className="text-xl font-bold text-blue-600">
              {data.reduce((sum, item) => sum + item.carsToday, 0)} cars
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

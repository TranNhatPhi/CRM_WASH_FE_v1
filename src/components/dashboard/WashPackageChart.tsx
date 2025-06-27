'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from '@/components/charts/PieChart';
import { WashPackage } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils';

interface WashPackageChartProps {
  data: WashPackage[];
}

export const WashPackageChart: React.FC<WashPackageChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.percentage),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 2,
      },
    ],
  };
  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Wash Package Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <PieChart data={chartData} height={320} />
        </div>
        <div className="mt-4 space-y-2">
          {data.map((pkg, index) => (
            <div key={pkg.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: pkg.color }}
                />
                <span className="text-gray-700 dark:text-gray-300">{pkg.name}</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-gray-900 dark:text-white">{formatPercentage(pkg.percentage)}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  ({formatCurrency(pkg.price)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

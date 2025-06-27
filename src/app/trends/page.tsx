'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';

export default function TrendsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trends</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Analyze business trends and future forecasts</p>
        </div>

        <Card>
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Feature in Development</h3>
            <p className="text-gray-600 dark:text-gray-300">The trends analysis page will be completed soon with forecasting features and market trend analysis.</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

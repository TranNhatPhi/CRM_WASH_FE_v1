'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import { generateReportData, generateMonthlyRevenueData, generateHourlyCustomerData } from '@/lib/data';
import { formatCurrency, formatNumber } from '@/utils';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const reportData = generateReportData();
  const monthlyRevenue = generateMonthlyRevenueData();
  const hourlyData = generateHourlyCustomerData();

  const currentData = reportData[selectedPeriod as keyof typeof reportData];

  const monthlyChartData = {
    labels: monthlyRevenue.map(item => item.month), datasets: [
      {
        label: 'Revenue',
        data: monthlyRevenue.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const hourlyChartData = {
    labels: hourlyData.map(item => `${item.hour}:00`), datasets: [
      {
        label: 'Customers',
        data: hourlyData.map(item => item.customers),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      default: return 'This Month';
    }
  };
  const downloadReport = () => {
    // Mock download functionality
    const reportContent = `BUSINESS REPORT - ${getPeriodLabel(selectedPeriod).toUpperCase()}
==============================================

OVERVIEW:
- Customers: ${formatNumber(currentData.customers)}
- Revenue: ${formatCurrency(currentData.revenue)}
- Avg Value/Customer: ${formatCurrency(currentData.averageTicket)}
- Efficiency: ${currentData.efficiency}%

Report generated at: ${new Date().toLocaleString('en-US')}`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">          <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Comprehensive reports and business data analysis</p>
        </div>
          <div className="flex space-x-3">            <Button variant="outline" onClick={downloadReport}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Customize Report
            </Button>
          </div>
        </div>        {/* Period Selector */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Report Period</h2>
              <div className="flex space-x-2">
                {[
                  { key: 'daily', label: 'Today' },
                  { key: 'weekly', label: 'This Week' },
                  { key: 'monthly', label: 'This Month' },
                ].map((period) => (
                  <Button
                    key={period.key}
                    variant={selectedPeriod === period.key ? 'default' : 'outline'}
                    onClick={() => setSelectedPeriod(period.key)}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>        {/* Key Metrics for Selected Period */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(currentData.customers)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{getPeriodLabel(selectedPeriod)}</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentData.revenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">+12% vs previous period</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Value/Customer</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentData.averageTicket)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">+8% vs previous period</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentData.efficiency}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">Target: 85%</p>
            </div>
          </Card>
        </div>        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue Trend</h3>
              <LineChart data={monthlyChartData} />
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Distribution by Hour</h3>
              <BarChart data={hourlyChartData} />
            </div>
          </Card>
        </div>        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Report by Period</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Metric</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Today</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">This Week</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">This Month</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Comparison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Customers</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{formatNumber(reportData.daily.customers)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{formatNumber(reportData.weekly.customers)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{formatNumber(reportData.monthly.customers)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">+12%</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Revenue</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{formatCurrency(reportData.daily.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{formatCurrency(reportData.weekly.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{formatCurrency(reportData.monthly.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">+15%</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Avg Value/Customer</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{formatCurrency(reportData.daily.averageTicket)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{formatCurrency(reportData.weekly.averageTicket)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{formatCurrency(reportData.monthly.averageTicket)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">+8%</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Efficiency</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{reportData.daily.efficiency}%</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{reportData.weekly.efficiency}%</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{reportData.monthly.efficiency}%</td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">+5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Reports</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-green-900 dark:text-green-100">Growing Revenue</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">+15% increase from previous period</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-blue-900 dark:text-blue-100">High Efficiency</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Achieved {currentData.efficiency}% of target</p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-yellow-900 dark:text-yellow-100">Attention Needed</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Staff costs are increasing</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium text-purple-900 dark:text-purple-100">Recommendation</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Boost weekend marketing</p>
                </div>
              </div>
            </div>
          </Card>
        </div>        {/* Export Options */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={downloadReport}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </Button>
              <Button variant="outline" onClick={downloadReport}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </Button>
              <Button variant="outline" onClick={downloadReport}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17" />
                </svg>
                Send Email
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

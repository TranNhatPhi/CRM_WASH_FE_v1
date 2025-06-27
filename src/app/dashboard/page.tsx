'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { HourlyStatsChart } from '@/components/dashboard/HourlyStatsChart';
import { ComparisonChart } from '@/components/dashboard/ComparisonChart';
import { WashPackageChart } from '@/components/dashboard/WashPackageChart';
import {
  fetchDashboardData,
  fetchHourlyStats,
  fetchComparisonData,
  fetchWashPackages,
  fetchLaborData,
  fetchMonthlyComparison
} from '@/lib/data';
import {
  DashboardStats,
  HourlyStats,
  ComparisonData,
  WashPackage,
  LaborData,
  MonthlyComparison
} from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/components/charts/BarChart';
import { formatCurrency } from '@/utils';

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [washPackages, setWashPackages] = useState<WashPackage[]>([]);
  const [laborData, setLaborData] = useState<LaborData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, hourly, comparison, packages, labor, monthly] = await Promise.all([
          fetchDashboardData(),
          fetchHourlyStats(),
          fetchComparisonData(),
          fetchWashPackages(),
          fetchLaborData(),
          fetchMonthlyComparison()
        ]);

        setDashboardStats(stats);
        setHourlyStats(hourly);
        setComparisonData(comparison);
        setWashPackages(packages);
        setLaborData(labor);
        setMonthlyData(monthly);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  // Monthly comparison chart data
  const monthlyChartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Cars - February',
        data: monthlyData.map(item => item.carsFeb),
        backgroundColor: '#EF4444',
      },
      {
        label: 'Cars - March',
        data: monthlyData.map(item => item.carsMarch),
        backgroundColor: '#3B82F6',
      },
    ],
  };
  // Labor chart data
  const laborChartData = {
    labels: laborData.map(item => item.employee),
    datasets: [
      {
        label: 'Hours Today',
        data: laborData.map(item => item.hrsToday),
        backgroundColor: '#10B981',
      },
      {
        label: 'Hours Yesterday',
        data: laborData.map(item => item.hrsYesterday),
        backgroundColor: '#F59E0B',
      },
    ],
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        {dashboardStats && <StatsCards stats={dashboardStats} />}

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HourlyStatsChart data={hourlyStats} />
          <ComparisonChart data={comparisonData} />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WashPackageChart data={washPackages} />
          {/* Monthly Comparison Chart */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <BarChart data={monthlyChartData} height={320} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">February</p>
                  <p className="text-xl font-bold text-red-600">
                    {monthlyData.reduce((sum, item) => sum + item.carsFeb, 0)} cars
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">March</p>
                  <p className="text-xl font-bold text-blue-600">
                    {monthlyData.reduce((sum, item) => sum + item.carsMarch, 0)} cars
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">          {/* Labor Chart */}
          <Card className="dashboard-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Labor Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <BarChart data={laborChartData} height={320} />
              </div>
            </CardContent>
          </Card>

          {/* Current Labor Stats */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Staff Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {laborData.map((worker, index) => (
                  <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900 dark:text-white">{worker.employee}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{worker.hrsToday}h</p>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Yesterday: {worker.hrsYesterday}h</span>
                      <span className={`font-medium ${worker.hrsToday > worker.hrsYesterday ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {worker.hrsToday > worker.hrsYesterday ? '+' : ''}
                        {(worker.hrsToday - worker.hrsYesterday).toFixed(1)}h
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {laborData.reduce((sum, item) => sum + item.hrsToday, 0).toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total hours today</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(laborData.length * 1.52 * 8)} {/* 25000 VND -> 1.52 AUD */}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Labor cost</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

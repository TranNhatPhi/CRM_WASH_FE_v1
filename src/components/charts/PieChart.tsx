'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { PieChartData } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: PieChartData;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 300,
  showLegend = true,
  showPercentage = true,
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return showPercentage ? `${label}: ${percentage}%` : `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (<div style={{ height: `${height}px` }}>
    <Pie data={data} options={options} />
  </div>
  );
};

export default PieChart;

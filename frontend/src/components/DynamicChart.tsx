"use client";

import type { ChartData, ChartOptions } from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler
);

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';

interface DynamicChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  className?: string;
}

export default function DynamicChart({ type, data, options, className }: DynamicChartProps) {
  
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data as ChartData<'bar'>} options={options as ChartOptions<'bar'>} />;
      case 'line':
        return <Line data={data as ChartData<'line'>} options={options as ChartOptions<'line'>} />;
      case 'pie':
        return <Pie data={data as ChartData<'pie'>} options={options as ChartOptions<'pie'>} />;
      case 'doughnut':
        return <Doughnut data={data as ChartData<'doughnut'>} options={options as ChartOptions<'doughnut'>} />;
      case 'radar':
        return <Radar data={data as ChartData<'radar'>} options={options as ChartOptions<'radar'>} />;
      case 'polarArea':
        return <PolarArea data={data as ChartData<'polarArea'>} options={options as ChartOptions<'polarArea'>} />;
      default:
        console.warn('Invalid chart type specified:', type);
        return null;
    }
  };

  return (
    <div className={className}>
      {renderChart()}
    </div>
  );
}
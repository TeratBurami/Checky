import React, { FC } from 'react'; // 1. Import FC (Functional Component)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface QuizData {
  month: string;
  score: number;
  mean: number;
}

const data: QuizData[] = [
  { month: 'Jan', score: 36, mean: 68 },
  { month: 'Feb', score: 21, mean: 41 },
  { month: 'Mar', score: 63, mean: 72 },
  { month: 'Apr', score: 35, mean: 52 },
  { month: 'May', score: 15, mean: 24 }
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: QuizData;
    [key: string]: any;
  }>;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#3A3A5A] text-white p-3 rounded-md shadow-lg">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 bg-[#F4CFA8] rounded-sm mr-2" />
          <p className="font-bold">{data.score}</p>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#FBF3E4] rounded-sm mr-2" />
          <p className="font-bold">{data.mean}</p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend: FC = () => {
  return (
    <div className="flex items-center justify-start space-x-4 mb-12 mt-2">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-[#F4CFA8] rounded-sm mr-2" />
        <span className="text-sm text-gray-600">Score</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-[#FBF3E4] rounded-sm mr-2" />
        <span className="text-sm text-gray-600">Mean</span>
      </div>
    </div>
  );
};

const RecentQuizzesChart: FC = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
        barGap="-100%"
        barCategoryGap="30%"
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false} 
          stroke="#EAEAEA"
        />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ fill: 'transparent' }} 
        />
        <Legend 
          content={<CustomLegend />} 
          verticalAlign="top" 
          align="left"
        />
        <Bar 
          dataKey="mean" 
          fill="#FBF3E4"
          radius={8}
        />
        <Bar 
          dataKey="score" 
          fill="#F4CFA8"
          radius={8}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RecentQuizzesChart;
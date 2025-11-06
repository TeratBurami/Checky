"use client";

import { useState, useEffect } from "react";
import { DashboardData } from "@/lib/types";
import { FaSpinner } from "react-icons/fa6";
import { motion } from "framer-motion";
import { mockFetchDashboardData } from "@/lib/mockDashboardData";
import StudentDashboard from "@/components/dashboard-components/StudentDashboard";

type Timeframe = '7d' | '30d' | 'all';

export default function MyDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        
        // (Mock API)
        const result = await mockFetchDashboardData(timeframe);
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <FaSpinner className="text-4xl text-orange-500 animate-spin" />
        <p className="ml-4 text-lg">Loading your performance data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center text-lg text-red-600">
        <p>Error: {error || "Could not find dashboard data."}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      
      {/* --- Header & Time Filter --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-bold text-gray-800">My Performance</h1>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          {(['7d', '30d', 'all'] as Timeframe[]).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-all ${
                timeframe === t 
                ? 'bg-orange-500 text-white shadow' 
                : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === '7d' ? '7 Days' : (t === '30d' ? '30 Days' : 'All Time')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Render the reusable dashboard component with the fetched data */}
      <StudentDashboard data={data} />
    </motion.div>
  );
}
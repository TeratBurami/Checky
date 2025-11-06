"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardData } from "@/lib/types";
import { FaSpinner, FaUser } from "react-icons/fa6";

// (Mock API) In a real app, your API would use the studentId
import { mockFetchDashboardData } from "@/lib/mockDashboardData";

// (NEW) Import the reusable UI component
import StudentDashboard from "@/components/dashboard-components/StudentDashboard";

export default function TeacherStudentViewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const studentId = params.student_id as string;
  const classId = params.class_id as string;

  useEffect(() => {
    if (!studentId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // (Real API call would be here)
        // const response = await fetch(`/api/v1/performance/dashboard/${studentId}`, { credentials: "include" });
        // if (!response.ok) throw new Error("Failed to fetch student data");
        // const result = await response.json();

        // (Mock API) We'll just get the '30d' mock data for this example
        const result = await mockFetchDashboardData('30d'); 
        
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <FaSpinner className="animate-spin text-4xl text-orange-500" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="p-12 text-center text-lg text-red-600">Error: {error || "Could not load data for this student."}</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
          <FaUser /> Viewing Dashboard for Student (ID: {studentId})
        </h1>
        <p className="text-gray-500">
          This is the performance report you see as a teacher.
        </p>
      </div>

      {/* Render the reusable dashboard component with the fetched data */}
      <StudentDashboard data={data} />
    </div>
  );
}
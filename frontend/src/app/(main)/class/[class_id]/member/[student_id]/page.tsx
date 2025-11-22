"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardData, MainWeakness } from "@/lib/types";
import { 
  FaSpinner, FaUser, FaChartLine, FaThumbsUp, FaThumbsDown, 
  FaLightbulb, FaStopwatch, FaCheck 
} from "react-icons/fa6";
import type { ChartData, ChartOptions } from 'chart.js';
import Link from "next/link";
import DynamicChart from "@/components/DynamicChart";
import { mockFetchDashboardData } from "@/lib/mockDashboardData";

interface Assignment {
  assignmentId: number;
  title: string;
  openDate: string;
  deadline: string;
  status: "GRADED" | "SUBMITTED" | "OVERDUE" | "PENDING";
}

interface ClassData {
  classId: number;
  name: string;
  assignments: Assignment[];
  completeness: number;
  avgScore: number;
}

const mockClassData: ClassData = {
  classId: 1,
  name: "Introduction to Literature",
  assignments: [
    {
      assignmentId: 1,
      title: "Essay on Modern Poetry",
      openDate: "2025-10-26T07:24:24.551Z",
      deadline: "2025-11-15T16:59:59.000Z",
      status: "GRADED"
    },
    {
      assignmentId: 5,
      title: "Literary Analysis of Gatsby",
      openDate: "2025-10-26T07:24:24.551Z",
      deadline: "2025-11-10T16:59:59.000Z",
      status: "SUBMITTED"
    },
    {
      assignmentId: 6,
      title: "Poetry Annotation Draft",
      openDate: "2025-10-26T07:24:24.551Z",
      deadline: "2025-11-03T16:59:59.000Z",
      status: "OVERDUE"
    },
    {
      assignmentId: 7,
      title: "Final Thesis Outline",
      openDate: "2025-11-20T07:24:24.551Z",
      deadline: "2025-12-01T16:59:59.000Z",
      status: "PENDING"
    }
  ],
  completeness: 66.66,
  avgScore: 80
};

const mockScores: { [key: number]: { score: number, maxScore: number } } = {
  1: { score: 92, maxScore: 100 },
  5: { score: 0, maxScore: 100 },
  6: { score: 0, maxScore: 100 },
};

const mockFetchClassData = (classId: string): Promise<ClassData> => {
  console.log(`Mock fetching class data for classId: ${classId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClassData);
    }, 500);
  });
};

const TOPIC_COLORS: { [key: string]: string } = {
  'Overall Score': '#F97316', 
  'Grammar': '#3B82F6',       
  'Structure': '#EF4444',     
  'Clarity': '#10B981',       
  'Vocabulary': '#8B5CF6',    
  'Citation': '#EAB308',      
};

const getTopicColor = (topic: string) => {
  return TOPIC_COLORS[topic] || '#6B7280';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export default function TeacherStudentViewPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const studentId = params.student_id as string;
  const classId = params.class_id as string;

  useEffect(() => {
    if (!studentId || !classId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashboardResult, classResult] = await Promise.all([
          mockFetchDashboardData('30d'),
          mockFetchClassData(classId)  
        ]);
        
        setDashboardData(dashboardResult);
        setClassData(classResult);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, classId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <FaSpinner className="animate-spin text-4xl text-orange-500" />
      </div>
    );
  }

  if (error || !dashboardData || !classData) {
    return <p className="p-12 text-center text-lg text-red-600">Error: {error || "Could not load data for this student."}</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
          <FaUser /> Viewing Dashboard for Student (ID: {studentId})
        </h1>
        <p className="text-gray-500">
          Class: {classData.name} (ID: {classId})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <ImprovementTrackingCard data={dashboardData.improvementTrackingData} />
          <ProgressTracking assignments={classData.assignments} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <TopStrengthsCard strengths={dashboardData.topStrengths} />
          <TopWeaknessesCard weaknesses={dashboardData.mainWeaknesses} />
        </div>
      </div>
    </div>
  );
}

function ImprovementTrackingCard({ data }: { data: DashboardData['improvementTrackingData'] }) {
  const [toggledTopics, setToggledTopics] = useState<string[]>(['Overall Score']);
  const [graphData, setGraphData] = useState<ChartData<'line'>>({ labels: [], datasets: [] });
  const [graphOptions, setGraphOptions] = useState<ChartOptions<'line'>>({});

  useEffect(() => {
    const activeDatasets = data.datasets
      .filter(dataset => toggledTopics.includes(dataset.label))
      .map(dataset => ({
        ...dataset,
        borderColor: getTopicColor(dataset.label),
        backgroundColor: `${getTopicColor(dataset.label)}1A`,
        tension: 0.1,
        fill: true,
      }));

    setGraphData({
      labels: data.labels,
      datasets: activeDatasets,
    });

    setGraphOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: { 
        y: { min: 0, max: 100, title: { display: true, text: 'Score (0-100)' } } 
      }
    });
  }, [data, toggledTopics]);

  const handleTopicToggle = (topic: string) => {
    setToggledTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
        <FaChartLine /> Improvement Tracking
      </h2>
      <div className="flex flex-wrap gap-2 mt-4">
        {data.datasets.map(dataset => (
          <button
            key={dataset.label}
            onClick={() => handleTopicToggle(dataset.label)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
              toggledTopics.includes(dataset.label)
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
            }`}
            style={{ 
              backgroundColor: toggledTopics.includes(dataset.label) ? getTopicColor(dataset.label) : undefined
            }}
          >
            <FaCheck className={toggledTopics.includes(dataset.label) ? 'opacity-100' : 'opacity-0'} />
            {dataset.label}
          </button>
        ))}
      </div>
      <div className="mt-4 h-80">
        <DynamicChart 
          type="line"
          data={graphData}
          options={graphOptions}
        />
      </div>
    </div>
  );
}

function TopStrengthsCard({ strengths }: { strengths: DashboardData['topStrengths'] }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2">
        <FaThumbsUp /> Top Strengths
      </h2>
      <ul className="mt-4 space-y-4">
        {strengths.slice(0, 3).map((item) => (
          <li key={item.topic}>
            <strong className="text-gray-800">{item.topic}</strong>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopWeaknessesCard({ weaknesses }: { weaknesses: MainWeakness[] }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
        <FaThumbsDown /> Top Weaknesses
      </h2>
      {weaknesses.length > 0 ? (
        <ul className="mt-4 space-y-5">
          {weaknesses.slice(0, 2).map((weakness) => (
            <li key={weakness.topic} className="pb-4 border-b border-gray-100 last:border-b-0">
              <strong className="text-gray-800">{weakness.topic}</strong>
              <p className="text-gray-600 text-sm mt-1">{weakness.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center mt-4 text-gray-500">
          <FaCheck className="text-3xl text-green-500 mx-auto" />
          <p className="mt-2 font-semibold">Great job!</p>
          <p className="text-sm">No major weaknesses detected.</p>
        </div>
      )}
    </div>
  );
}

function ProgressTracking({ assignments }: { assignments: Assignment[] }) {

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'GRADED':
        return <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Graded</span>;
      case 'SUBMITTED':
        return <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Submitted</span>;
      case 'OVERDUE':
        return <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Overdue</span>;
      case 'PENDING':
        return <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">Pending</span>;
      default:
        return null;
    }
  };

  const getScoreDisplay = (assignment: Assignment) => {
    const scoreData = mockScores[assignment.assignmentId];
    
    if (assignment.status === 'GRADED' && scoreData) {
      return (
        <span className="text-lg font-bold text-gray-800">
          {scoreData.score}<span className="text-sm text-gray-500">/{scoreData.maxScore}</span>
        </span>
      );
    }
    if (assignment.status === 'SUBMITTED') {
      return <span className="text-sm font-semibold text-blue-600">Pending</span>;
    }
    if (assignment.status === 'OVERDUE') {
      return <span className="text-sm font-semibold text-red-600">N/A</span>;
    }
    return <span className="text-sm font-semibold text-gray-500">N/A</span>;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
        <FaStopwatch /> Assignment Progress Tracking
      </h2>
      <ul className="divide-y divide-gray-100 mt-3">
        {assignments.map((assignment) => (
          <li key={assignment.assignmentId} className="flex flex-col sm:flex-row justify-between sm:items-center py-4 gap-3">
            <div className="flex-1">
              <Link href="#" className="font-semibold text-blue-600 hover:underline" title={assignment.title}>
                {assignment.title}
              </Link>
              <div className="flex items-center gap-3 mt-1.5">
                {getStatusBadge(assignment.status)}
                <span className="text-sm text-gray-500">
                  Due: {formatDate(assignment.deadline)}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 sm:ml-4">
              {getScoreDisplay(assignment)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import {
  FaChartLine, FaThumbsUp, FaThumbsDown, FaStar, FaStopwatch,
  FaBook, FaLightbulb, FaLink, FaVideo, FaPenRuler, FaCheck
} from "react-icons/fa6";
import { DashboardData, MainWeakness } from "@/lib/types";
import DynamicChart from "@/components/DynamicChart";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { ChartData, ChartOptions } from 'chart.js';

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'video': return <FaVideo className="text-red-500" />;
    case 'article': return <FaBook className="text-blue-500" />;
    case 'exercise': return <FaPenRuler className="text-green-500" />;
    default: return <FaLink className="text-gray-500" />;
  }
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

export default function StudentDashboard({ data }: { data: DashboardData }) {
  const [toggledTopics, setToggledTopics] = useState<string[]>(['Overall Score']);
  const [graphData, setGraphData] = useState<ChartData<'line'>>({ labels: [], datasets: [] });
  const [graphOptions, setGraphOptions] = useState<ChartOptions<'line'>>({});

  useEffect(() => {
    if (!data) return;

    const activeDatasets = data.improvementTrackingData.datasets
      .filter(dataset => toggledTopics.includes(dataset.label))
      .map(dataset => ({
        ...dataset,
        borderColor: getTopicColor(dataset.label),
        backgroundColor: `${getTopicColor(dataset.label)}1A`,
        tension: 0.1,
        fill: true,
      }));

    setGraphData({
      labels: data.improvementTrackingData.labels,
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
    setToggledTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={data.metadata.timeframe}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-orange-500">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaStar className="text-yellow-500" /> Overall Status
            </h2>
            <p className={`text-3xl font-bold mt-2 ${
              data.overallStatus.level === 'Improving' ? 'text-green-600' : 'text-gray-800'
            }`}>{data.overallStatus.level}</p>
            <p className="text-gray-600 mt-1 text-lg">{data.overallStatus.summary}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaChartLine /> Improvement Tracking
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {data.improvementTrackingData.datasets.map(dataset => (
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

        </div>

        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2">
              <FaThumbsUp /> Top Strengths
            </h2>
            <ul className="mt-4 space-y-4">
              {data.topStrengths.map((item) => (
                <li key={item.topic}>
                  <strong className="text-gray-800">{item.topic}</strong>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaStopwatch /> Recent Scores
            </h2>
            <ul className="divide-y divide-gray-100 mt-3">
              {data.recentScores.map((score) => (
                <li key={score.assignmentId} className="flex justify-between items-center py-3">
                  <Link href={score.link} className="font-semibold text-blue-600 hover:underline truncate" title={score.title}>
                    {score.title}
                  </Link>
                  <span className="text-lg font-bold text-gray-800 ml-4">{score.score}</span>
                </li>
              ))}
            </ul>
          </div>
          
        </div>

        <div className="lg:col-span-3 mt-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Action Plan</h2>
          {data.mainWeaknesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.mainWeaknesses.map(weakness => (
                <WeaknessCard key={weakness.topic} weakness={weakness} />
              ))}
            </div>
          ) : (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
              <FaCheck className="text-5xl text-green-500 mx-auto" />
              <h3 className="text-2xl font-semibold mt-4">Great job!</h3>
              <p className="text-gray-600 text-lg">No major weaknesses detected in this timeframe. Keep up the good work!</p>
            </div>
          )}
        </div>

      </motion.div>
    </AnimatePresence>
  );
}


function WeaknessCard({ weakness }: { weakness: MainWeakness }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6 border-l-4 border-red-500">
        <h3 className="text-2xl font-bold text-red-600 flex items-center gap-2">
          <FaThumbsDown /> Focus Area: {weakness.topic}
        </h3>
        <p className="text-gray-700 text-lg mt-2">{weakness.description}</p>
      </div>
      
      <div className="p-6 bg-blue-50 border-t border-gray-100">
        <h4 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
          <FaLightbulb /> Next Learning Step
        </h4>
        <p className="text-gray-700 mt-2">{weakness.nextLearningStep.description}</p>
        <a 
          href={weakness.nextLearningStep.resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
        >
          {getResourceIcon(weakness.nextLearningStep.resource.type)}
          {weakness.nextLearningStep.resource.title}
        </a>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FaBook /> Daily Review Exercise
        </h4>
        {weakness.dailyExercise.content && (
           <p className="text-gray-700 bg-gray-100 p-3 rounded-md mt-3 italic">
             {weakness.dailyExercise.content}
           </p>
        )}
        <p className="text-gray-700 mt-3">{weakness.dailyExercise.question}</p>
        <button className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
          Start Practice
        </button>
      </div>
    </motion.div>
  );
}
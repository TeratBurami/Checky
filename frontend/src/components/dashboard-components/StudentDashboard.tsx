"use client";

import { useState, useEffect } from "react";
import {
  FaChartLine,
  FaThumbsUp,
  FaThumbsDown,
  FaStar,
  FaStopwatch,
  FaBook,
  FaLightbulb,
  FaLink,
  FaVideo,
  FaPenRuler,
  FaCheck,
} from "react-icons/fa6";
import { DashboardData } from "@/lib/types";
import DynamicChart from "@/components/DynamicChart";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { ChartData, ChartOptions } from "chart.js";

const getResourceIcon = (type: string) => {
  switch (type) {
    case "video":
      return <FaVideo className="text-red-500" />;
    case "article":
      return <FaBook className="text-blue-500" />;
    case "exercise":
      return <FaPenRuler className="text-green-500" />;
    default:
      return <FaLink className="text-gray-500" />;
  }
};

const TOPIC_COLORS: { [key: string]: string } = {
  "Overall Score": "#F97316",
  Grammar: "#3B82F6",
  Structure: "#EF4444",
  Clarity: "#10B981",
  Vocabulary: "#8B5CF6",
  Citation: "#EAB308",
};

const getTopicColor = (topic: string) => {
  return TOPIC_COLORS[topic] || "#6B7280";
};

export default function StudentDashboard({ data }: { data: DashboardData }) {
  const [toggledTopics, setToggledTopics] = useState<string[]>([
    "Overall Score",
  ]);
  const [graphData, setGraphData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  });
  const [graphOptions, setGraphOptions] = useState<ChartOptions<"line">>({});

  useEffect(() => {
    if (!data) return;

    const activeDatasets = data.improvementTrackingData.datasets
      .filter((dataset) => toggledTopics.includes(dataset.label))
      .map((dataset) => ({
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
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          title: { display: true, text: "Score (0-100)" },
        },
      },
    });
  }, [data, toggledTopics]);

  const handleTopicToggle = (topic: string) => {
    setToggledTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((t) => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  const firstWeakness =
    data.mainWeaknesses.length > 0 ? data.mainWeaknesses[0] : null;

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
            <p
              className={`text-3xl font-bold mt-2 ${
                data.overallStatus.level === "Improving"
                  ? "text-green-600"
                  : "text-gray-800"
              }`}
            >
              {data.overallStatus.level}
            </p>
            <p className="text-gray-600 mt-1 text-lg">
              {data.overallStatus.summary}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaChartLine /> Improvement Tracking
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {data.improvementTrackingData.datasets.map((dataset) => (
                <button
                  key={dataset.label}
                  onClick={() => handleTopicToggle(dataset.label)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    toggledTopics.includes(dataset.label)
                      ? "text-white"
                      : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                  }`}
                  style={{
                    backgroundColor: toggledTopics.includes(dataset.label)
                      ? getTopicColor(dataset.label)
                      : undefined,
                  }}
                >
                  <FaCheck
                    className={
                      toggledTopics.includes(dataset.label)
                        ? "opacity-100"
                        : "opacity-0"
                    }
                  />
                  {dataset.label}
                </button>
              ))}
            </div>
            <div className="mt-4 h-96">
              <DynamicChart
                type="line"
                data={graphData}
                options={graphOptions}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaBook /> Daily Review Exercise
            </h2>
            {firstWeakness ? (
              <div className="mt-3">
                {firstWeakness.dailyExercise.content && (
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-md mt-3 italic">
                    {firstWeakness.dailyExercise.content}
                  </p>
                )}
                <p className="text-gray-700 mt-3 text-lg">
                  {firstWeakness.dailyExercise.question}
                </p>
                <Link
                  href={{
                    pathname: "/exercise",
                    query: {
                      topic: firstWeakness.topic,
                      content: firstWeakness.dailyExercise.content || "",
                      question: firstWeakness.dailyExercise.question,
                    },
                  }}
                  className="mt-4 inline-block px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Start Practice
                </Link>
              </div>
            ) : (
              <div className="text-center mt-4 text-gray-500">
                <FaCheck className="text-3xl text-green-500 mx-auto" />
                <p className="mt-2 font-semibold">Great job!</p>
                <p className="text-sm">No daily exercise needed right now.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600">
            <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2">
              <FaThumbsUp /> Top Strengths
            </h2>
            <ul className="mt-4 space-y-4">
              {data.topStrengths.slice(0, 3).map((item) => (
                <li
                  key={item.topic}
                  className="pb-4 border-b border-gray-100 last:border-b-0"
                >
                  <strong className="text-gray-800">{item.topic}</strong>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-600">
            <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
              <FaThumbsDown /> Top Weaknesses
            </h2>
            {data.mainWeaknesses.length > 0 ? (
              <ul className="mt-4 space-y-5">
                {data.mainWeaknesses.slice(0, 2).map((weakness) => (
                  <li
                    key={weakness.topic}
                    className="pb-4 border-b border-gray-100 last:border-b-0"
                  >
                    <strong className="text-gray-800">{weakness.topic}</strong>
                    <p className="text-gray-600 text-sm mt-1">
                      {weakness.description}
                    </p>
                    <a
                      href={weakness.nextLearningStep.resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-all text-sm"
                    >
                      <FaLightbulb />
                      Next Learning Step
                    </a>
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

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaStopwatch /> Recent Scores
            </h2>
            <ul className="divide-y divide-gray-100 mt-3">
              {data.recentScores.map((score) => (
                <li
                  key={score.assignmentId}
                  className="flex justify-between items-center py-3"
                >
                  <Link
                    href={score.link}
                    className="font-semibold text-blue-600 hover:underline truncate"
                    title={score.title}
                  >
                    {score.title}
                  </Link>
                  <span className="text-lg font-bold text-gray-800 ml-4">
                    {score.score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

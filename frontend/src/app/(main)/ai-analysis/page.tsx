"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  FaPen,
  FaFileArrowUp,
  FaSpinner,
  FaLightbulb,
  FaThumbsUp,
  FaThumbsDown,
  FaVideo,
  FaBookOpen,
  FaPenRuler,
  FaLink,
} from "react-icons/fa6";
import {FaCheckCircle} from 'react-icons/fa'
import { motion, AnimatePresence } from "framer-motion";
import { AIAnalysis, AIResource, AIResourceResponse } from "@/lib/types"; 
import { mockFetchAnalysis, mockFetchResources } from "./mockAiData";

const mockApiDelay = () => new Promise((res) => setTimeout(res, Math.random() * 1500 + 500));

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'video': return <FaVideo className="text-red-500" />;
    case 'article': return <FaBookOpen className="text-blue-500" />;
    case 'exercise': return <FaPenRuler className="text-green-500" />;
    default: return <FaLink className="text-gray-500" />;
  }
};

export default function AiAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [resources, setResources] = useState<AIResourceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const API_BASE_URL = "http://localhost:3000/api/v1";



  const handleSubmit = async () => {
    const hasTextInput = activeTab === 'text' && textContent.trim() !== "";
    const hasFileInput = activeTab === 'file' && selectedFile !== null;

    if (!hasTextInput && !hasFileInput) {
      setError("Please input text or upload a file to analyze.");
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    setResources(null);
    setError(null);

    try {
      const formData = new FormData();
      if (hasTextInput) {
        formData.append("content", textContent);
      } else if (hasFileInput) {
        formData.append("file", selectedFile!);
      }

      const analysisResult = await mockFetchAnalysis(formData);
      setAnalysis(analysisResult);

      if (analysisResult.primaryTopic) {
        const resourceResult = await mockFetchResources(analysisResult.primaryTopic);
        setResources(resourceResult);
      }

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-4 md:p-8"
    >
      {/* --- Header --- */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">AI Analysis Tool</h1>
        <p className="text-lg text-gray-500 mt-2">
          Get instant feedback on your writing.
        </p>
      </div>

      {/* --- Input Card --- */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {/* --- Tabs --- */}
        <div className="flex bg-gray-50 border-b">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 p-4 font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'text' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'
            }`}
          >
            <FaPen /> Text Input
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 p-4 font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'file' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'
            }`}
          >
            <FaFileArrowUp /> File Upload
          </button>
        </div>

        {/* --- Tab Content --- */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* --- Text Input Tab --- */}
            {activeTab === 'text' && (
              <motion.div
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={12}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Paste your text here..."
                />
              </motion.div>
            )}

            {/* --- File Upload Tab --- */}
            {activeTab === 'file' && (
              <motion.div
                key="file"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer
                    ${isDragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'}
                    ${selectedFile ? 'border-green-500 bg-green-50' : ''}`}
                >
                  {selectedFile ? (
                    <>
                      <FaCheckCircle className="text-4xl text-green-600 mb-2" />
                      <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-sm text-red-600 hover:underline mt-2"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <FaFileArrowUp className="text-4xl text-gray-400 mb-2" />
                      <p className="font-semibold text-gray-800">Drop file or click to browse</p>
                      <p className="text-sm text-gray-500">(.pdf, .docx, .txt)</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Submit Button --- */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full md:w-auto px-12 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-lg hover:bg-orange-600 transition-all disabled:bg-gray-400 disabled:cursor-wait"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2" /> Analyzing...
            </span>
          ) : (
            "Analyze My Work"
          )}
        </button>
        {error && (
          <p className="text-red-600 mt-4 font-semibold">{error}</p>
        )}
      </div>

      {/* --- Results Section --- */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-10"
          >
            {/* --- Analysis Card --- */}
            <div className="bg-white shadow-xl rounded-lg p-6 border-t-4 border-blue-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaLightbulb className="text-yellow-500" /> AI Analysis Report
              </h2>
              <p className="text-lg text-gray-700 p-4 bg-gray-50 rounded-lg border">
                <strong>Summary:</strong> {analysis.summary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Good Points */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2 mb-2">
                    <FaThumbsUp /> What Went Well
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.feedback.goodPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
                {/* Areas for Improvement */}
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2 mb-2">
                    <FaThumbsDown /> Areas for Improvement
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.feedback.areasForImprovement.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* --- Resources Card --- */}
            {resources && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.3 } }}
                className="bg-white shadow-xl rounded-lg p-6 mt-8 border-t-4 border-green-500"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Suggested Resources (Topic: <span className="text-orange-600 capitalize">{resources.topic}</span>)
                </h2>
                <ul className="space-y-4">
                  {resources.suggestedResources.map((res) => (
                    <li key={res.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="text-2xl mt-1">
                        {getResourceIcon(res.type)}
                      </div>
                      <div>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                          {res.title}
                        </a>
                        <p className="text-sm text-gray-600">{res.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
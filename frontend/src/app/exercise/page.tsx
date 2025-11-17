"use client";

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { FaBook, FaArrowLeft } from 'react-icons/fa6';
import { FaCheckCircle } from 'react-icons/fa';

function ExercisePageContent() {
  const searchParams = useSearchParams();
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const topic = searchParams.get('topic');
  const content = searchParams.get('content');
  const question = searchParams.get('question');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) return;

    setSubmitted(true);
    console.log("Submitted Exercise:", { topic, question, answer });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 bg-white rounded-xl shadow-2xl mt-10 border-t-4 border-blue-600">
      <Link href="/performance" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6 text-sm font-medium">
        <FaArrowLeft />
        Back to Performance
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-4">
        <FaBook className="text-blue-500" />
        Daily Exercise: {topic || 'Review'}
      </h1>

      {content && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Review This Concept:</h3>
          <p className="text-gray-700 italic">{content}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="answer" className="block text-xl font-semibold text-gray-700">
          Your Task:
        </label>
        <p className="text-gray-600 text-lg mt-2 mb-4">{question || 'No question provided.'}</p>
        
        <textarea
          id="answer"
          rows={10}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-gray-100"
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
        />

        {submitted ? (
          <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3">
            <FaCheckCircle className="text-2xl" />
            <div>
              <h4 className="font-bold">Submitted Successfully!</h4>
              <p>Great job on completing your daily exercise.</p>
            </div>
          </div>
        ) : (
          <button 
            type="submit" 
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400"
            disabled={!answer}
          >
            Submit Exercise
          </button>
        )}
      </form>
    </div>
  );
}

export default function DailyExercisePage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading exercise...</div>}>
      <ExercisePageContent />
    </Suspense>
  );
}
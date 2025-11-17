"use client";

import { useSearchParams } from 'next/navigation';
import { useState, Suspense, ChangeEvent } from 'react';
import Link from 'next/link';
import { FaPenRuler, FaArrowLeft, FaRegSquare } from 'react-icons/fa6';
import { FaCheckCircle, FaCheckSquare } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const mockQuizData: { [key: string]: any } = {
  'Grammar': {
    shortAnswers: [
      { id: 'sa1', question: "Rewrite the following sentence using the past perfect tense: 'He goes to the store.'" },
      { id: 'sa2', question: "Explain the difference between 'its' and 'it's' in one sentence." }
    ],
    multipleSelection: [
      { id: 'mc1', question: "Which sentence uses 'affect' correctly?", options: ["The rain will affect the game.", "The rain had a positive affect.", "What is the affect?"] },
      { id: 'mc2', question: "Select all the prepositions in the list:", options: ["On", "Run", "Quickly", "During"] },
      { id: 'mc3', question: "Which of these are conjunctions?", options: ["And", "But", "Or", "Because", "Tree"] },
      { id: 'mc4', question: "Identify the adverbs:", options: ["Happily", "Fast", "Beautiful", "Very"] },
      { id: 'mc5', question: "Which sentences are grammatically correct?", options: ["He don't like it.", "She and I went home.", "They was very happy."] }
    ]
  },
  'Structure': {
    shortAnswers: [
      { id: 'sa1', question: "What is the purpose of a thesis statement?" },
      { id: 'sa2', question: "Write a topic sentence for a paragraph about 'the benefits of exercise'." }
    ],
    multipleSelection: [
      { id: 'mc1', question: "What are the parts of a standard essay?", options: ["Introduction", "Body Paragraphs", "Conclusion", "Appendix"] },
      { id: 'mc2', question: "Select all the transitional words:", options: ["However", "Also", "In conclusion", "Therefore", "Banana"] },
      { id: 'mc3', question: "A good body paragraph should have:", options: ["A topic sentence", "Supporting details", "A concluding sentence", "A joke"] },
      { id: 'mc4', question: "Which are types of essay structures?", options: ["Compare/Contrast", "Argumentative", "Narrative", "A list"] },
      { id: 'mc5', question: "What should an introduction include?", options: ["A hook", "Background information", "A thesis statement", "The main argument"] }
    ]
  },
  'Default': {
    shortAnswers: [
      { id: 'sa1', question: "Default short answer question 1." },
      { id: 'sa2', question: "Default short answer question 2." }
    ],
    multipleSelection: [
      { id: 'mc1', question: "Default multiple choice 1", options: ["Option A", "Option B"] },
      { id: 'mc2', question: "Default multiple choice 2", options: ["Option C", "Option D"] },
      { id: 'mc3', question: "Default multiple choice 3", options: ["Option E", "Option F"] },
      { id: 'mc4', question: "Default multiple choice 4", options: ["Option G", "Option H"] },
      { id: 'mc5', question: "Default multiple choice 5", options: ["Option I", "Option J"] }
    ]
  }
};


function PracticePageContent() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const topic = searchParams.get('topic') || 'Default';
  const quiz = mockQuizData[topic] || mockQuizData.Default;
  const [shortAnswers, setShortAnswers] = useState<{ [key: string]: string }>({});
  const [multipleSelections, setMultipleSelections] = useState<{ [key: string]: string[] }>({});

  const handleShortAnswerChange = (id: string, value: string) => {
    setShortAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleMultiSelectChange = (qId: string, option: string) => {
    setMultipleSelections(prev => {
      const currentSelections = prev[qId] || [];
      const newSelections = currentSelections.includes(option)
        ? currentSelections.filter(item => item !== option) 
        : [...currentSelections, option];
      return { ...prev, [qId]: newSelections };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    console.log("Submitted Practice Quiz:", { topic, shortAnswers, multipleSelections });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 bg-white rounded-xl shadow-2xl mt-10 border-t-4 border-green-500">
      <Link href="/performance" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6 text-sm font-medium">
        <FaArrowLeft />
        Back to Performance
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-4">
        <FaPenRuler className="text-green-500" />
        Practice Quiz: {topic}
      </h1>

      <form onSubmit={handleSubmit}>
        {!submitted ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <section>
                <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">
                  Short Answer (2)
                </h2>
                <div className="space-y-6">
                  {quiz.shortAnswers.map((item: any, index: number) => (
                    <div key={item.id}>
                      <label htmlFor={item.id} className="block text-lg font-medium text-gray-800">
                        {index + 1}. {item.question}
                      </label>
                      <textarea
                        id={item.id}
                        rows={4}
                        className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Type your answer..."
                        value={shortAnswers[item.id] || ''}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => 
                          handleShortAnswerChange(item.id, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">
                  Multiple Selection (5)
                </h2>
                <div className="space-y-6">
                  {quiz.multipleSelection.map((item: any, index: number) => (
                    <div key={item.id}>
                      <p className="block text-lg font-medium text-gray-800">
                        {index + 1}. {item.question}
                      </p>
                      <div className="mt-2 space-y-2">
                        {item.options.map((option: string) => (
                          <label key={option} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={(multipleSelections[item.id] || []).includes(option)}
                              onChange={() => handleMultiSelectChange(item.id, option)}
                            />
                            {(multipleSelections[item.id] || []).includes(option) ? (
                              <FaCheckSquare className="text-xl text-blue-600 mr-3" />
                            ) : (
                              <FaRegSquare className="text-xl text-gray-400 mr-3" />
                            )}
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
              <button 
                type="submit" 
                className="mt-8 w-full px-6 py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-all"
              >
                Submit Practice Quiz
              </button>

            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8"
          >
            <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
            <h2 className="mt-4 text-2xl font-bold">Practice Submitted!</h2>
            <p className="text-gray-600 mt-2">Great job on completing your practice quiz.</p>
            <Link href="/performance" className="mt-6 inline-block px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
              Back to Performance
            </Link>
          </motion.div>
        )}
      </form>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading practice quiz...</div>}>
      <PracticePageContent />
    </Suspense>
  );
}
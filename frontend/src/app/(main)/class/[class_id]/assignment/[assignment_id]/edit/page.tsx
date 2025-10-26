"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { RubricBrief } from "@/lib/types"; 
import {
  FaPen,
  FaCalendarAlt,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import { FaFileLines, FaListCheck } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";

export default function AssignmentEdit() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [rubricId, setRubricId] = useState("");
  const [rubrics, setRubrics] = useState<RubricBrief[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadingRubrics, setLoadingRubrics] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const params = useParams();
  const router = useRouter();
  const classId = params.class_id as string;
  const assignmentId = params.assignment_id as string;
  const API_BASE_URL = "http://localhost:3000/api/v1";

  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (!classId || !assignmentId) return;
      setIsLoadingData(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/class/${classId}/assignment/${assignmentId}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          throw new Error("Failed to load assignment data");
        }
        const data = await response.json();

        setTitle(data.title);
        setDescription(data.description);
        setDeadline(new Date(data.deadline));
        setRubricId(data.rubricId.toString());
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    const fetchRubrics = async () => {
      setLoadingRubrics(true);
      try {
        const response = await fetch(`${API_BASE_URL}/rubric`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch rubrics");
        }
        const data: RubricBrief[] = await response.json();
        setRubrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingRubrics(false);
      }
    };

    fetchAssignmentData();
    fetchRubrics();
  }, [classId, assignmentId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title || !description || !deadline || !rubricId) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/class/${classId}/assignment/${assignmentId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title,
            description: description,
            deadline: deadline!.toISOString(),
            rubricId: Number(rubricId),
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update assignment");
      }

      const data = await response.json();
      console.log("Assignment updated:", data);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/class/${classId}/`); 
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, 
      },
    },
  };

  const fieldVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  if (isLoadingData) {
     return (
       <div className="flex justify-center items-center h-screen">
          <FaSpinner className="animate-spin text-orange-500 text-4xl" />
          <span className="ml-4 text-lg text-gray-700">Loading assignment data...</span>
       </div>
     )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-4 md:p-8"
    >
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-6"
      >
        <FaArrowLeft />
        Back
      </button>

      <div className="bg-white shadow-2xl rounded-xl p-8 md:p-12 border-t-4 border-orange-500">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Edit Assignment
        </h1>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fieldVariant}>
            <label
              htmlFor="title"
              className="flex items-center text-lg font-semibold text-gray-700 mb-2"
            >
              <FaPen className="mr-2 text-orange-500" />
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              placeholder="e.g., Final Project Proposal"
            />
          </motion.div>
          <motion.div variants={fieldVariant}>
            <label
              htmlFor="description"
              className="flex items-center text-lg font-semibold text-gray-700 mb-2"
            >
              <FaFileLines className="mr-2 text-orange-500" />
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              placeholder="Instructions for the students..."
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fieldVariant}>
              <label
                htmlFor="deadline"
                className="flex items-center text-lg font-semibold text-gray-700 mb-2"
              >
                <FaCalendarAlt className="mr-2 text-orange-500" />
                Deadline
              </label>
              <DatePicker
                selected={deadline}
                onChange={(date: Date | null) => setDeadline(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              />
            </motion.div>

            <motion.div variants={fieldVariant}>
              <label
                htmlFor="rubric"
                className="flex items-center text-lg font-semibold text-gray-700 mb-2"
              >
                <FaListCheck className="mr-2 text-orange-500" />
                Grading Rubric
              </label>
              <select
                id="rubric"
                value={rubricId}
                onChange={(e) => setRubricId(e.target.value)}
                disabled={loadingRubrics || isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              >
                <option value="" disabled>
                  {loadingRubrics ? "Loading rubrics..." : "Select a rubric..."}
                </option>
                {rubrics.map((rubric) => (
                  <option key={rubric.rubricId} value={rubric.rubricId}>
                    {rubric.name}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>

          <motion.div variants={fieldVariant} className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || success}
              className={`w-full font-bold rounded-lg p-4 text-white text-lg transition-all duration-300
                          ${success ? "bg-green-500" : ""}
                          ${isSubmitting ? "bg-orange-300 cursor-wait" : ""}
                          ${
                            !isSubmitting && !success
                              ? "bg-orange-500 hover:bg-orange-600"
                              : ""
                          }
                          disabled:opacity-70`}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isSubmitting ? "loading" : success ? "success" : "ready"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FaSpinner className="animate-spin" /> : null}
                  {success ? <FaCheckCircle /> : null}
                  {isSubmitting
                    ? "Updating..."
                    : success
                    ? "Assignment Updated!"
                    : "Update Assignment"}
                </motion.span>
              </AnimatePresence>
            </button>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-600 text-center font-semibold"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </motion.div>
  );
}
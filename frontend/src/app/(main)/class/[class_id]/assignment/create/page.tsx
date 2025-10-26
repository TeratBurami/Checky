"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { RubricBrief } from "@/lib/types"; // (ใหม่)

// Icons
import {
  FaPen,
  FaCalendarAlt,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

import { FaFileLines, FaListCheck } from "react-icons/fa6";

// Date Picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import CSS

// Animation
import { motion, AnimatePresence } from "framer-motion";

// --- Type สำหรับ Rubric ที่ดึงมา ---
// (หากคุณไม่ได้เพิ่มใน lib/types.ts ก็ใช้อันนี้แทนได้)
// interface RubricBrief {
//   rubric_id: number;
//   name: string;
// }

export default function AssignmentCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(new Date());
  const [rubricId, setRubricId] = useState(""); // ใช้ string สำหรับ <select>
  const [rubrics, setRubrics] = useState<RubricBrief[]>([]);

  // UI State
  const [loadingRubrics, setLoadingRubrics] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const params = useParams();
  const router = useRouter();
  const classId = params.class_id as string; // ดึง classId จาก URL

  const API_BASE_URL = "http://localhost:3000/api/v1";

  // --- 1. Fetch Rubrics สำหรับ Dropdown ---
  useEffect(() => {
    const fetchRubrics = async () => {
      setLoadingRubrics(true);
      try {
        const response = await fetch(`${API_BASE_URL}/rubric`, {
          credentials: "include", // สำคัญมากสำหรับ authenticateJWT
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

    fetchRubrics();
  }, []); // Run on mount

  // --- 2. Handle Form Submission ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title || !description || !deadline || !rubricId) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    console.log(rubricId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/class/${classId}/assignment`, // API สร้างงาน
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title,
            description: description,
            deadline: deadline!.toISOString(), // ส่งเป็น ISO String
            rubricId: Number(rubricId), // แปลงกลับเป็น Number
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create assignment");
      }

      const data = await response.json();
      console.log("Assignment created:", data);

      setSuccess(true);
      // กลับไปหน้าหลักของ Class (หรือหน้า Assignments)
      setTimeout(() => {
        router.push(`/class/${classId}`); // (หรือ /class/${classId}/assignments)
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Animation Variants ---
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // ทำให้แต่ละช่องทยอยโผล่
      },
    },
  };

  const fieldVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-4 md:p-8"
    >
      {/* --- Back Button --- */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-6"
      >
        <FaArrowLeft />
        Back
      </button>

      {/* --- Form Card --- */}
      <div className="bg-white shadow-2xl rounded-xl p-8 md:p-12 border-t-4 border-orange-500">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Create New Assignment
        </h1>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          {/* --- Title --- */}
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
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Final Project Proposal"
            />
          </motion.div>

          {/* --- Description --- */}
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
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Instructions for the students..."
            />
          </motion.div>

          {/* --- Deadline & Rubric (Grid) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- Deadline --- */}
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
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </motion.div>

            {/* --- Rubric --- */}
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
                disabled={loadingRubrics}
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

          {/* --- Submit Button --- */}
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
                    ? "Creating..."
                    : success
                    ? "Assignment Created!"
                    : "Create Assignment"}
                </motion.span>
              </AnimatePresence>
            </button>
          </motion.div>

          {/* --- Error Message --- */}
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

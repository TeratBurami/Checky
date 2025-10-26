"use client";

import {
  FaArrowLeft,
  FaDownload,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt,
  FaSpinner, // (ใหม่)
  FaCheckCircle, // (ใหม่)
} from "react-icons/fa";

import {FaFileLines} from 'react-icons/fa6'

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubmissionDetail } from "@/lib/types"; // (ใหม่)
import { motion, AnimatePresence } from "framer-motion"; // (ใหม่)

// Helper (จากไฟล์เดิม)
const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FaFilePdf className="text-red-500 text-3xl" />;
  if (ext === "docx") return <FaFileWord className="text-blue-500 text-3xl" />;
  if (ext === "png" || ext === "jpg" || ext === "jpeg")
    return <FaFileImage className="text-purple-500 text-3xl" />;
  if (ext === "txt") return <FaFileAlt className="text-gray-500 text-3xl" />;
  return <FaFileLines className="text-gray-400 text-3xl" />;
};

// --- Component หลัก ---
export default function GradeSubmissionPage() {
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State สำหรับฟอร์มตรวจงาน
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const params = useParams();
  const router = useRouter();
  const classId = params.class_id as string;
  const assignmentId = params.assignment_id as string;
  const studentId = params.student_id as string;


  // (สำคัญ) API Base URL (ควรย้ายไป .env)
  // สังเกตว่าผมใช้ /api/v1 (ไม่มี /class) สำหรับ endpoint ที่เป็น root
  const API_BASE_URL = "http://localhost:3000/api/v1/class";

  // --- 1. Fetch ข้อมูล Submission ---
  useEffect(() => {
    if (!studentId) return;

    const fetchSubmissionDetail = async () => {
      setLoading(true);
      try {
        // (สำคัญ) เราจะเรียก API ใหม่ที่เราสมมติว่าได้สร้างขึ้น
        // ถ้าคุณตั้ง prefix ของ submission.js เป็น /class
        // ให้เปลี่ยน URL นี้เป็น `${API_BASE_URL}/class/submission/${submissionId}`
        const response = await fetch(
          `${API_BASE_URL}/${assignmentId}/student/${studentId}`, // <== (Endpoint ที่สมมติขึ้น)
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: SubmissionDetail = await response.json();
        setSubmission(data);

        // ตั้งค่าเริ่มต้นให้ฟอร์ม
        setScore(data.score?.toString() || "");
        setComment(data.teacher_comment || "");
      } catch (e: any) {
        console.error("Failed to fetch submission detail:", e);
        setError("Failed to load submission. (Did you create the new API endpoint? " + e.message + ")");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetail();
  }, [studentId]);

  // --- 2. ฟังก์ชันส่งคะแนน (Grade) ---
  const handleGradeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    try {
      // (ถูกต้อง) ใช้ API 'grading' ที่คุณให้มา
      // PUT /api/v1/class/:submission_id/grade
      const response = await fetch(
        `${API_BASE_URL}/class/${submission?.submission_id}/grade`, // <== (ใช้ Path ที่คุณระบุ)
        {
          method: "PUT",
          credentials: "include", // สำหรับ authenticateJWT
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: score === "" ? null : Number(score), // แปลงกลับเป็น number (หรือ null)
            teacher_comment: comment,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit grade");
      }

      setSubmitSuccess(true);

      // กลับไปหน้า Assignment หลังตรวจเสร็จ
      setTimeout(() => {
        router.push(`/class/${classId}/assignment/${assignmentId}`);
      }, 1500); // หน่วงเวลาเล็กน้อยให้เห็นติ๊กถูก
    } catch (err: any) {
      console.error("Grade submission error:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. Render Loading/Error ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <FaSpinner className="text-4xl text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="p-12 text-center text-lg text-red-600">
        <p>Error: {error || "Submission not found."}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- 4. Render หน้าหลัก (Main) ---
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto p-4 md:p-8"
      >
        {/* --- Back Button --- */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-6"
        >
          <FaArrowLeft />
          Back to Assignment
        </button>

        {/* --- Header (ใช้ข้อมูลที่ Join มา) --- */}
        <motion.div
          layout
          className="bg-white shadow-lg rounded-xl p-6 mb-8 border-l-4 border-orange-400"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            {submission.assignmentInfo.title}
          </h1>
          <p className="text-xl text-gray-600 mt-1">
            Student:{" "}
            <span className="font-semibold text-gray-900">
              {submission.studentInfo.firstName}{" "}
              {submission.studentInfo.lastName}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Submitted: {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </motion.div>

        {/* --- Main Grid (Work + Grade Form) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Column 1: Student's Work (Span 2) --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* --- Files Card --- */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
                Submitted Files
              </h2>
              {submission.files && submission.files.length > 0 ? (
                <motion.ul
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } },
                  }}
                >
                  {submission.files.map((file) => (
                    <motion.li
                      key={file.file_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all hover:shadow-md"
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1 },
                      }}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {getFileIcon(file.filename)}
                        <span
                          className="text-base text-gray-900 truncate"
                          title={file.filename}
                        >
                          {file.filename}
                        </span>
                      </div>

                      {/* (ถูกต้อง) Download Button (ใช้ <a href>) */}
                      {/* API นี้จะ force download (res.download()) */}
                      <a
                        href={`${API_BASE_URL}/class/download/${file.file_id}`}
                        target="_blank" // เปิดในแท็บใหม่ (จำเป็นสำหรับการดาวน์โหลด)
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-full bg-blue-100/60 hover:bg-blue-100 transition-all"
                      >
                        <FaDownload /> Download
                      </a>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <p className="text-gray-500 italic">No files were submitted.</p>
              )}
            </div>

            {/* --- Content Card (ถ้ามี) --- */}
            {submission.content && (
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
                  Submitted Text
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {submission.content}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* --- Column 2: Grading Form (Span 1) --- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <form
              onSubmit={handleGradeSubmit}
              className="bg-white shadow-lg rounded-xl p-6 sticky top-24" // Sticky!
            >
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">
                Grade Submission
              </h2>

              {/* --- Score Input --- */}
              <div className="mb-4">
                <label
                  htmlFor="score"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Score
                </label>
                <input
                  type="number"
                  id="score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter score..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* --- Comment Textarea --- */}
              <div className="mb-6">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Teacher's Comment
                </label>
                <textarea
                  id="comment"
                  rows={8}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide feedback to the student..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* --- Submit Button --- */}
              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className={`w-full font-bold rounded-lg p-3 text-white transition-all duration-300
                            ${submitSuccess ? "bg-green-500" : ""}
                            ${isSubmitting ? "bg-orange-300 cursor-wait" : ""}
                            ${
                              !isSubmitting && !submitSuccess
                                ? "bg-orange-500 hover:bg-orange-600"
                                : ""
                            }
                            disabled:opacity-70`}
              >
                {isSubmitting ? (
                  <FaSpinner className="animate-spin inline mr-2" />
                ) : submitSuccess ? (
                  <FaCheckCircle className="inline mr-2" />
                ) : null}
                {isSubmitting
                  ? "Submitting..."
                  : submitSuccess
                  ? "Grade Saved!"
                  : "Submit Grade"}
              </button>

              {/* --- Error Message --- */}
              {error && (
                <p className="text-red-600 text-center mt-4 text-sm">
                  {error}
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
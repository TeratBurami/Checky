"use client";

import { FaCloudArrowUp, FaFileLines } from "react-icons/fa6";
import { useEffect, useRef, useState, DragEvent, MouseEvent } from "react";
import { useParams } from "next/navigation";
import { Assignment, JwtPayload, Submission } from "@/lib/types";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default function AssignmentDetail() {
  const [assignment, setAssignment] = useState<Assignment | null>();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  const params = useParams();
  const classId = params.class_id as string;
  const assignmentId = params.assignment_id as string;

  useEffect(() => {
    if (!classId || !assignmentId) return;

    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/api/v1/class/${classId}/assignment/`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched assignment:", data);
        setAssignment(data.assignments[0]);
      } catch (e) {
        console.error("Failed to fetch assignment:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [classId, assignmentId]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decodedPayload = jwtDecode<JwtPayload>(token);
        setRole(decodedPayload.role);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  if (loading) {
    return (
      <p className="p-12 text-center text-lg">Loading assignment details...</p>
    );
  }

  if (!assignment) {
    return <p className="p-12 text-center text-lg">Assignment not found.</p>;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const handleFileSelected = (file: File | undefined) => {
    setFileError("");

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File is too large (Max 20MB).");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setFileError(
        "Invalid file type (Only .jpeg, .png, .pdf, .docx, .txt allowed)."
      );
      return;
    }

    setSelectedFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelected(e.target.files?.[0]);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelected(e.dataTransfer.files?.[0]);
  };
  const onDropzoneDoubleClick = () => {
    fileInputRef.current?.click();
  };

  const onBrowseClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setFileError("Please select a file first.");
      return;
    }
    console.log("Submitting file:", selectedFile.name);
  };

  const handleGradeClick = (submissionId: string) => {
    window.location.href = `/class/${classId}/assignment/${assignmentId}/submission/${submissionId}`;
  };

  return (
    <div>
      <div className="py-4 px-12">
        <h1 className="text-xl text-gray-400 font-bold">
          Course: Academic Writing
        </h1>
        <h1 className="text-3xl font-bold my-4">{assignment.title}</h1>
      </div>
      <div className="bg-[#D9D9D9] rounded shadow-md shadow-black/20 w-full p-12 text-lg">
        <p>Opened: {new Date(assignment.createdAt).toLocaleString()}</p>
        <p>Due: {new Date(assignment.deadline).toLocaleString()}</p>
      </div>
      <p className="p-12 text-lg">{assignment.description}</p>

      {role === "student" && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold">Submit assignment</h3>
          <p className="text-gray-400 text-sm mt-2">
            Maximum file size: 20 MB, maximum number of files: 1
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept=".jpeg,.png,.pdf,.docx,.txt"
          />

          <div
            onDoubleClick={onDropzoneDoubleClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`bg-[#FFD297]/25 w-full h-54 mt-12 rounded-xl border border-[#FFD297] border-dashed transition-all duration-300
            ${isDragOver ? "ring-4 ring-orange-400 ring-offset-2" : ""}
            ${fileError ? "border-red-500 bg-red-50" : ""}
          `}
          >
            {!selectedFile ? (
              <div className="flex flex-col justify-between items-center h-full pt-14 pb-4 cursor-pointer">
                <FaCloudArrowUp className="text-4xl text-gray-500"></FaCloudArrowUp>
                <div className="mb-2 text-center">
                  <p className="text-lg">Drop file or browse</p>
                  <p className="text-gray-500">
                    Format: .jpeg, .png & Max file size: 20 MB
                  </p>
                </div>
                <button
                  onClick={onBrowseClick}
                  className="cursor-pointer text-white font-semibold bg-orange-400 rounded-lg py-1 px-2 z-10" // (เพิ่ม z-10)
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                <FaFileLines className="text-4xl text-orange-600" />
                <p className="text-lg font-semibold mt-4">File Selected:</p>
                <p className="text-gray-700">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="mt-4 text-sm text-red-600 hover:underline"
                >
                  Remove file
                </button>
              </div>
            )}
          </div>

          {fileError && (
            <p className="text-red-600 text-center mt-2">{fileError}</p>
          )}

          <div className="flex gap-8 mt-8">
            <button className="font-bold rounded-lg cursor-pointer hover:bg-gray-100 bg-white border border-gray-200 w-full p-2">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile}
              className="font-bold rounded-lg cursor-pointer hover:bg-orange-500 bg-orange-400 w-full p-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {role === "teacher" && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-800">
            Student Submissions
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Review and grade the submissions for this assignment.
          </p>

          {/* ตรวจสอบว่ามี submission ส่งมาใน 'assignment' state หรือไม่ */}
          {!assignment.submissions || assignment.submissions.length === 0 ? (
            // --- ถ้าไม่มีใครส่งงาน ---
            <div className="text-center p-12 text-gray-500">
              <FaFileLines className="text-4xl mx-auto mb-4" />
              <p>No submissions have been made yet.</p>
            </div>
          ) : (
            // --- ถ้ามีคนส่งงานแล้ว ---
            <ul className="mt-6 space-y-4">
              {assignment.submissions.map((sub) => (
                <li
                  key={sub.submissionId}
                  className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    {/* ข้อมูลนักเรียน */}
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full font-bold">
                        {sub.studentInfo.firstName[0]}
                        {sub.studentInfo.lastName[0]}
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {sub.studentInfo.firstName} {sub.studentInfo.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted:{" "}
                          {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* สถานะ และ ปุ่ม */}
                    <div className="flex items-center gap-6">
                      {/* สถานะ (ตรวจแล้ว/ยังไม่ตรวจ) */}
                      {sub.score !== null ? (
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Graded</p>
                          <span className="text-xl font-bold text-green-600">
                            {sub.score}
                          </span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Status</p>
                          <span className="text-base font-semibold text-blue-600">
                            Pending
                          </span>
                        </div>
                      )}

                      {/* ปุ่มตรวจงาน */}
                      <button
                        onClick={() => handleGradeClick(sub.submissionId)}
                        className="bg-orange-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors"
                      >
                        {sub.score !== null ? "View/Edit Grade" : "Grade"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

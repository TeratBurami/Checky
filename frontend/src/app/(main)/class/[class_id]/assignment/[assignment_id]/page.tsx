"use client";

import {
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt,
  FaDownload,
  FaTrash,
} from "react-icons/fa";

import {FaCloudArrowUp,
  FaFileLines,} from 'react-icons/fa6'

import {
  Assignment,
  JwtPayload,
} from "@/lib/types"; // (types.ts ที่อัปเดตแล้ว)
import { useEffect, useRef, useState, DragEvent, MouseEvent } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default function AssignmentDetail() {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | undefined>();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  const params = useParams();
  const classId = params.class_id as string;
  const assignmentId = params.assignment_id as string;

  const API_BASE_URL = "http://localhost:3000/api/v1";

  const fetchAssignment = async () => {
    if (!classId || !assignmentId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/class/${classId}/assignment/${assignmentId}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Fetched assignment:", data);
      setAssignment(data);
    } catch (e) {
      console.error("Failed to fetch assignment:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const allowedTypes = [
    "image/jpeg", "image/png", "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const handleFileSelected = (files: FileList | null | undefined) => {
    setFileError("");
    if (!files || files.length === 0) return;

    const newFiles: File[] = Array.from(files);
    let error = "";

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        error = `File "${file.name}" is too large (Max 20MB).`;
        break;
      }
      if (!allowedTypes.includes(file.type)) {
        error = `File "${file.name}" has invalid type (Only .jpeg, .png, .pdf, .docx, .txt allowed).`;
        break;
      }
    }

    if (error) {
      setFileError(error);
      return;
    }

    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    setIsEditingSubmission(true);
  };

  const handleRemoveSelectedFile = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelected(e.target.files);
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelected(e.dataTransfer.files);
  };
  const onDropzoneDoubleClick = () => { fileInputRef.current?.click(); };
  const onBrowseClick = (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setSelectedFiles([]); 
    setFileError("");
    setIsEditingSubmission(false); 
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  // (อัปเดต - แก้ไข URL)
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      setIsSubmitting(true);
      // (อัปเดต) แก้ไข URL จาก /class/ เป็น /submission/
      const response = await fetch(
        `${API_BASE_URL}/submission/${assignmentId}/file/${fileId}`,
        {
          method: "DELETE",
          credentials: "include", 
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete file");
      }

      console.log("File deleted successfully");
      await fetchAssignment(); // โหลดข้อมูลใหม่
    } catch (err: any) {
      console.error("Delete file error:", err);
      setFileError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setFileError("Please select at least one file.");
      return;
    }

    setIsSubmitting(true);
    setFileError("");

    const formData = new FormData();
    
    for (const file of selectedFiles) {
      formData.append("files", file);
    }

    formData.append("content", assignment?.mySubmission?.content || "");

    try {
      const response = await fetch(
        `${API_BASE_URL}/class/${assignmentId}/submission`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit");
      }

      console.log("Submission successful");
      setSelectedFiles([]); 
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
      setIsEditingSubmission(false); 
      await fetchAssignment(); 

    } catch (err: any) {
      console.error("Submit error:", err);
      setFileError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGradeClick = (index: number) => {
    if (!assignment?.submissions) return;
    window.location.href = `/class/${classId}/assignment/${assignmentId}/submission/${assignment.submissions[index].studentInfo.studentId}`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FaFilePdf className="text-red-600 text-3xl" />; 
    if (ext === "docx") return <FaFileWord className="text-blue-600 text-3xl" />; 
    if (ext === "png" || ext === "jpg" || ext === "jpeg")
      return <FaFileImage className="text-purple-600 text-3xl" />; 
    if (ext === "txt") return <FaFileAlt className="text-gray-600 text-3xl" />; 
    return <FaFileLines className="text-gray-500 text-3xl" />; 
  };

  if (loading && !assignment) { 
    return <p className="p-12 text-center text-lg">Loading assignment details...</p>;
  }
  if (!assignment) {
    return <p className="p-12 text-center text-lg">Assignment not found.</p>;
  }

  const hasSubmittedFiles =
    assignment.mySubmission && 
    assignment.mySubmission.attachment && 
    assignment.mySubmission.attachment.length > 0;

  return (
    <div>
      {/* --- (ส่วนหัว, รายละเอียด, Rubric ไม่เปลี่ยนแปลง) --- */}
      <div className="py-4 px-12">
        <h1 className="text-xl text-gray-400 font-bold">Course: Academic Writing</h1>
        <h1 className="text-3xl font-bold my-4">{assignment.title}</h1>
      </div>
      <div className="bg-[#D9D9D9] rounded shadow-md shadow-black/20 w-full p-12 text-lg">
        <p>Opened: {new Date(assignment.createdAt).toLocaleString()}</p>
        <p>Due: {new Date(assignment.deadline).toLocaleString()}</p>
      </div>
      <p className="p-12 text-lg">{assignment.description}</p>
      
      {assignment.rubric && (
         <div className="bg-white rounded-lg shadow-md p-8 my-8">
          <h3 className="text-2xl font-bold text-gray-800">Grading Rubric: {assignment.rubric.name}</h3>
          <p className="text-gray-500 text-sm mt-1">This is how your submission will be graded.</p>
          <div className="mt-6 space-y-4">
            {assignment.rubric.criteria.map((criterion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4"><h4 className="text-lg font-semibold text-gray-900">{criterion.title}</h4></div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {criterion.levels.sort((a, b) => b.score - a.score).map((level) => (
                        <tr key={level.level}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{level.level}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{level.score}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{level.description}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --- (จบส่วนที่ไม่เปลี่ยนแปลง) --- */}


      {/* ========================================
        (อัปเดต) ส่วนของนักเรียน (STUDENT)
        ========================================
      */}
      {role === "student" && (
        <div className="bg-white rounded-lg shadow-md p-8">
          {/*
           * (อัปเดตเงื่อนไข)
           * แสดง uploader ถ้า:
           * 1. ยังไม่เคยส่งไฟล์เลย (!hasSubmittedFiles)
           * 2. หรือ ผู้ใช้กำลัง "เพิ่ม" หรือ "เปลี่ยน" ไฟล์ (isEditingSubmission)
           */}
          {!hasSubmittedFiles || isEditingSubmission ? (
            // --- 1. หน้าสำหรับอัปโหลดไฟล์ ---
            <div>
              <h3 className="text-xl font-semibold">
                {hasSubmittedFiles ? "Add More Files" : "Submit Assignment"}
              </h3>
              <p className="text-gray-400 text-sm mt-2">
                Maximum file size: 20 MB. (You can add multiple files)
              </p>

              <input
                type="file" ref={fileInputRef} onChange={onFileChange}
                className="hidden" accept=".jpeg,.png,.pdf,.docx,.txt"
                multiple 
              />

              <div
                onDoubleClick={onDropzoneDoubleClick} onDragOver={onDragOver}
                onDragLeave={onDragLeave} onDrop={onDrop}
                className={`border-2 border-dashed rounded-lg h-64 flex justify-center items-center transition-colors ${
                  isDragOver ? "border-orange-500 bg-orange-50" : "border-gray-300"
                } ${selectedFiles.length > 0 ? "bg-gray-50" : ""}`} 
              >
                {selectedFiles.length === 0 ? (
                  <div className="flex flex-col justify-between items-center h-full pt-14 pb-4 cursor-pointer">
                    <FaCloudArrowUp className="text-4xl text-gray-500" />
                    <div className="mb-2 text-center">
                      <p className="text-lg">Drop files or browse</p> 
                      <p className="text-gray-500">Format: .jpeg, .png & Max file size: 20 MB</p>
                    </div>
                    <button
                      onClick={onBrowseClick}
                      className="cursor-pointer text-white font-semibold bg-orange-400 rounded-lg py-1 px-2 z-10"
                    >
                      Browse Files 
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col justify-start items-center h-full p-4 text-center w-full">
                    <p className="text-lg font-semibold mt-4 flex-shrink-0">Selected Files:</p>
                    <div className="w-full mt-2 space-y-2 overflow-y-auto max-h-40 px-4"> 
                      {selectedFiles.map((file, index) => (
                        <li 
                          key={index} 
                          className="flex items-center justify-between p-2 bg-gray-100 rounded-md w-full list-none border border-gray-200"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {getFileIcon(file.name)}
                            <div className="text-left">
                              <span className="text-sm text-gray-800 truncate block" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({ (file.size / 1024 / 1024).toFixed(2) } MB)
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveSelectedFile(index)}
                            className="ml-2 text-red-600 hover:text-red-800 flex-shrink-0 p-1 rounded-full hover:bg-red-100"
                            title="Remove file"
                          >
                            <FaTrash />
                          </button>
                        </li>
                      ))}
                    </div>
                      <a
                      onClick={onBrowseClick}
                      className="mt-4 text-sm text-blue-600 hover:underline flex-shrink-0 cursor-pointer"
                    >
                      + Add more files...
                    </a>
                  </div>
                )}
              </div>

              {fileError && (
                <p className="text-red-600 text-center mt-2">{fileError}</p>
              )}

              <div className="flex gap-8 mt-8">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="font-bold rounded-lg cursor-pointer hover:bg-gray-100 bg-white border border-gray-200 w-full p-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={selectedFiles.length === 0 || isSubmitting} 
                  className="font-bold rounded-lg cursor-pointer hover:bg-orange-500 bg-orange-400 w-full p-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : (hasSubmittedFiles ? "Add Files" : "Submit")}
                </button>
              </div>
            </div>
          ) : (
            // --- 2. หน้าแสดงไฟล์ที่ส่งแล้ว (อัปเดต) ---
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Your Submission(s)</h3>
                {assignment.mySubmission?.score !== null ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Graded</p>
                      <span className="text-2xl font-bold text-green-600">
                        {assignment.mySubmission?.score}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Status</p>
                      <span className="text-lg font-semibold text-blue-600">
                        Pending Grade
                      </span>
                    </div>
                  )}
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Submitted:{" "}
                {new Date(assignment.mySubmission!.submittedAt).toLocaleString()} 
              </p>

              <ul className="mt-6 space-y-3">
                {assignment.mySubmission!.attachment
                  .filter(file => file && file.file_id) // (เพิ่ม) ป้องกัน error
                  .map((file) => (
                  <li 
                    key={file.file_id} // (อัปเดต) ใช้ file_id เป็น key
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {getFileIcon(file.filename)}
                      <p className="text-lg font-medium text-gray-800">
                        {file.filename}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <a
                        href={`${API_BASE_URL}/submission/download/${file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <FaDownload /> Download
                      </a>
                      
                      <button
                        onClick={() => handleDeleteFile(file.file_id.toString())}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end mt-12">
                <button
                  onClick={() => setIsEditingSubmission(true)} 
                  className="flex items-center gap-2 font-bold rounded-lg cursor-pointer hover:bg-orange-500 bg-orange-400 p-2 px-4 text-white"
                >
                  <FaCloudArrowUp />
                  Add More Files 
                </button>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Teacher's Feedback</h4>
                {/* (อัปเดต) ใช้ ternary operator ( ... ? ... : ... ) */}
                {assignment.mySubmission?.teacherComment ? (
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
                    {assignment.mySubmission.teacherComment}
                  </p>
                ) : (
                  <p className="text-gray-500 italic px-4 py-2">No feedback provided yet.</p>
                )}
              </div>

              {/* === (อัปเดต) ส่วนแสดง Peer Reviews (แสดงเสมอ) === */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Peer Reviews</h4>
                {/* (อัปเดต) ใช้ ternary operator ( ... ? ... : ... ) */}
                {assignment.mySubmission?.peerReviewsReceived && assignment.mySubmission.peerReviewsReceived.length > 0 ? (
                  <ul className="space-y-4">
                    {assignment.mySubmission.peerReviewsReceived.map((review, index) => (
                      <li key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="font-semibold text-gray-700">Reviewed by: {review.reviewerName || 'Anonymous'}</p>
                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">{review.comment}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic px-4 py-2">No peer reviews received yet.</p>
                )}
              </div>


            </div>
          )}
        </div>
      )}

      {/* ========================================
        ส่วนของครู (TEACHER) - (ไม่เปลี่ยนแปลง)
        ========================================
      */}
      {role === "teacher" && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-800">
            Student Submissions
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Review and grade the submissions for this assignment.
          </p>

          {!assignment.submissions || assignment.submissions.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <FaFileLines className="text-4xl mx-auto mb-4" />
              <p>No submissions have been made yet.</p>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {assignment.submissions.map((sub,index) => (
                <li
                  key={sub.submissionId}
                  className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
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

                    <div className="flex items-center gap-6">
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

                      <button
                        onClick={() =>
                          handleGradeClick(index) 
                        }
                        className="bg-orange-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors"
                      >
                        View/Grade
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
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaChalkboardTeacher,
  FaBookOpen,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";

interface CourseData {
  name: string;
  description: string;
}

export default function ClassEdit() {
  const [formData, setFormData] = useState<CourseData>({ name: "", description: "" });
  const [initialName, setInitialName] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const params = useParams();
  const router = useRouter();
  const classId = params.class_id;

  useEffect(() => {
    if (!classId) return;

    const fetchCourseData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/class/${classId}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch class data.");
        }
        const data: CourseData = await response.json();
        setFormData({ name: data.name, description: data.description });
        setInitialName(data.name);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [classId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/class/${classId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update class.");
      }
      setSuccess("Class updated successfully!");
      setInitialName(formData.name);
      
      router.push(`/class/${classId}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/class/${classId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete class.");
      }
      
      router.push("/class");

    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading class data...</div>;
  }

  return (
    <>
      <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in-up">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Edit: {initialName}
            </h1>
            <p className="text-lg text-gray-500">
              Update your class details below.
            </p>
          </div>

          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Class Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaChalkboardTeacher className="w-5 h-5 text-gray-400" />
                </span>
                <input
                  id="name"
                  type="text"
                  className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitting || deleting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <span className="absolute top-3.5 left-0 flex items-center pl-3">
                  <FaBookOpen className="w-5 h-5 text-gray-400" />
                </span>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  disabled={submitting || deleting}
                />
              </div>
            </div>

            <div className="h-5 text-center">
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                disabled={submitting || deleting}
              >
                {submitting ? "Updating..." : "Confirm Edit"}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto px-6 py-3 font-bold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-4 focus:ring-red-300/50 transition-all disabled:opacity-50"
                disabled={submitting || deleting}
              >
                <FaTrash className="inline mr-2" />
                Delete Class
              </button>
            </div>
          </form>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full animate-fade-in-up">
            <div className="text-center">
              <span className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <FaExclamationTriangle className="w-8 h-8 text-red-600" />
              </span>
              <h2 className="text-2xl font-bold text-gray-800">
                Delete Class
              </h2>
              <p className="text-gray-600 mt-2">
                Are you absolutely sure? This action cannot be undone. All data
                associated with this class will be permanently lost.
              </p>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
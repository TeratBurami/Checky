"use client";

import React, { useState } from "react";
import { FaChalkboardTeacher, FaBookOpen } from "react-icons/fa";
import '@/app/globals.css'

export default function ClassCreate() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/v1/class/", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({ name, description }),
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to create class.");
      }

      setSuccess("Class created successfully!");
      setName("");
      setDescription("");

      window.location.href = "/class";

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Create Your New Class
          </h1>
          <p className="text-lg text-gray-500">
            Fill in the details to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Class Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaChalkboardTeacher className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="name"
                type="text"
                placeholder="e.g., Introduction to Programming"
                className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <div className="relative">
              <span className="absolute top-3.5 left-0 flex items-center pl-3">
                <FaBookOpen className="w-5 h-5 text-gray-400" />
              </span>
              <textarea
                id="description"
                placeholder="A brief description of what this class is about."
                rows={4}
                className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="h-5 text-center">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
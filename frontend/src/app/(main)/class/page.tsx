"use client";

import React, { useState, useEffect } from "react";
import { Course, JwtPayload } from "@/lib/types";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default function Class() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [role, setRole] = useState<string | undefined>();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/v1/class", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Course[] = await response.json();
        console.log("Fetched courses:", data);
        setCourses(data);
      } catch (e) {
        console.error("Failed to fetch courses:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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

  const handleJoinCourse = async () => {
    if (!joinCode || joinLoading) return;

    setJoinLoading(true);
    setJoinError("");

    try {
      const response = await fetch("http://localhost:3000/api/v1/class/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classCode: joinCode }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to join class. Invalid code?"
        );
      }
      setJoinCode("");
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to join course:", err);
      setJoinError(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreateClassClick = () => {
    window.location.href = "/class/create";
  };

  const handleClassDetailClick = (classId: number) => {
    window.location.href = `/class/${classId}`;
  };

  function getColorFromName(name: string) {
    let hash = 0;
    if (name.length === 0) return "rgb(128, 128, 128)";
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;

    return `rgba(${Math.abs(r)},${Math.abs(g)},${Math.abs(b)}, 0.5)`;
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-left">
          <p className="text-3xl font-bold text-gray-800">My Courses</p>
          <p className="text-lg text-gray-500">Course overview</p>
        </div>
        <div>
          {role === "student" && (
            <div className="flex flex-col items-end">
              <div className="shadow-md shadow-slate-300 bg-white rounded-full h-fit p-2 px-4 flex items-center w-full sm:w-auto">
                <input
                  className="focus:outline-none pl-4 pr-16 w-full sm:w-auto disabled:opacity-50"
                  placeholder="Join course by code"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  disabled={joinLoading}
                />
                <button
                  onClick={handleJoinCourse}
                  className="bg-orange-500 text-white px-5 py-2 rounded-full font-bold cursor-pointer hover:bg-orange-600 transition-colors disabled:opacity-50"
                  disabled={joinLoading}
                >
                  {joinLoading ? "Joining..." : "Join"}{" "}
                </button>
              </div>

              {joinError && (
                <p className="text-sm text-red-500 mt-2 mr-4">{joinError}</p>
              )}
            </div>
          )}

          {role === "teacher" && (
            <button
              onClick={handleCreateClassClick}
              className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold cursor-pointer hover:bg-orange-600 transition-colors shadow-md shadow-slate-300"
            >
              + Create Class
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center text-xl text-gray-500 mt-16">
          Loading courses...
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              onClick={() => handleClassDetailClick(course.classId)}
              key={course.classId}
              className="bg-white shadow-lg rounded-xl p-6 m-4 hover:shadow-xl hover:shadow-black/15 border-2 border-white hover:border-orange-400 transition-all duration-300 cursor-pointer"
            >
              <div>
                <p
                  className={`border border-slate-300 text-xl font-bold w-15 h-15 rounded-full text-center content-center`}
                  style={{ backgroundColor: getColorFromName(course.name) }}
                >
                  {course.name.charAt(0).toUpperCase()}
                </p>
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-gray-800 truncate">
                    {course.name}
                  </h3>
                  <p className="text-gray-600 truncate">{course.description}</p>
                </div>
                <div className="flex">
                  <div></div>
                </div>
                <div className="flex justify-between items-center mt-8">
                  <p className="text-sm text-gray-400">
                    Teacher:{" "}
                    <span className="font-medium text-gray-700">
                      {course.teacher}
                    </span>
                  </p>
                  <p className="text-sm text-white bg-orange-400 rounded-full px-2">
                    Members:{" "}
                    <span className="font-bold text-white">
                      {course.memberCount}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center text-xl text-gray-500 mt-16">
          You are not enrolled in any courses yet.
        </div>
      )}
    </div>
  );
}

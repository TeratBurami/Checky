"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { JwtPayload } from "@/lib/types";
import { jwtDecode } from "jwt-decode";
import RecentQuizzesChart from "@/components/dashboard-components/RecentQuizChart";
import PerformanceGrade from "@/components/dashboard-components/PerformanceGrade";
import ToDoList from "@/components/dashboard-components/ToDoList";
import RecentClasses from "@/components/dashboard-components/RecentClasses";
import PeerReview from "@/components/dashboard-components/PeerReview";



export default function Dashboard() {
  const [role, setRole] = useState<string>();
  const [name, setName] = useState<string>();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decodedPayload = jwtDecode<JwtPayload>(token);
        setRole(decodedPayload.role);
        setName(decodedPayload.firstName);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  function getColorFromName(name?: string) {
    let hash = 0;
    if (!name || name.length === 0) return "rgb(128, 128, 128)";
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
    <div>
      <div className="flex justify-center items-center py-8 px-54 gap-8">
        <div
          className="w-24 h-24 rounded-full text-center content-center text-4xl text-white font-bold"
          style={{ backgroundColor: getColorFromName(name) }}
        >
          {name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-3xl mb-2">Welcome Back, {name}!</p>
          <p className="text-lg">Here's an overview of your course</p>
        </div>
      </div>
      <div className="flex gap-8">
        <div className="flex flex-col justify-between gap-2 shadow bg-white rounded-xl w-[40%] p-4">
          <p className="font-bold text-lg">Recent Quizzes</p>
          <div className="border border-gray-200 rounded-lg w-full p-2">
            <RecentQuizzesChart></RecentQuizzesChart>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-2 shadow bg-white rounded-xl w-[30%] p-4">
          <p className="font-bold text-lg">Recent Quizzes</p>
          <div className="flex items-center border border-gray-200 rounded-lg w-full p-2 h-full">
            <PerformanceGrade></PerformanceGrade>
          </div>
        </div>
       <div className="flex flex-col justify-between gap-2 shadow bg-white rounded-xl w-[30%] p-4">
          <p className="font-bold text-lg">To do List</p>
          <div className="border border-gray-200 rounded-lg w-full p-2 h-full">
            <ToDoList></ToDoList>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="shadow bg-white rounded-xl w-[60%] p-4">
          <p className="font-bold text-lg mt-2 mb-6">Recent Classes</p>
          <RecentClasses></RecentClasses>
        </div>
        <div className="shadow bg-white rounded-xl w-[40%] p-4">
          <p className="font-bold text-lg mt-2 mb-6">Peer Reviews</p>
          <PeerReview></PeerReview>
        </div>
      </div>
    </div>
  );
}

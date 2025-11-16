"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Member } from "@/lib/types";
import { ChartData, ChartOptions } from "chart.js";
import DynamicChart from "@/components/DynamicChart";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa6";

export default function MemberPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const params = useParams();
  const classId = params.class_id;

  const [emailToInvite, setEmailToInvite] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => {
    if (!classId) return;

    const fetchMember = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/class/${classId}/members`,
          { credentials: "include" }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched members:", data);
        
        setMembers(data.members || data);

      } catch (e) {
        console.error("Failed to fetch members:", e);
      }
    };

    fetchMember();
  }, [classId]);

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailToInvite) return;

    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/class/${classId}/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentEmail: emailToInvite }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to send invitation");
      }
      
      window.location.reload();

      setInviteSuccess("Invitation sent successfully!");
      setEmailToInvite("");
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  // --- (Chart Logic) ---
  const scoreData: ChartData<"bar"> = {
    labels: members.map((member) => `${member.firstName} ${member.lastName}`),
    datasets: [
      {
        label: "Grammar",
        data: Array.from(
          { length: members.length },
          () => Math.floor(Math.random() * (10 - 0 + 1)) + 0
        ),
        backgroundColor: "rgba(249, 115, 22, 0.7)",
        borderColor: "rgba(249, 115, 22, 1)",
        borderWidth: 1,
      },
      {
        label: "Vocabulary",
        data: Array.from(
          { length: members.length },
          () => Math.floor(Math.random() * (10 - 0 + 1)) + 0
        ),
        backgroundColor: "rgba(255, 187, 139, 0.7)",
        borderColor: "rgba(255, 187, 139, 1)",
        borderWidth: 1,
      },
    ],
  };

  const scoreOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { 
        display: true,
        text: 'Class Score Distribution',
        font: { size: 18, weight: "bold" } 
      },
    },
    scales: {
      y: { beginAtZero: true, max: 10, title: { display: true, text: 'Mock Score' } },
      x: { title: { display: true, text: 'Students' } },
    },
  };

  return (
    <div className="w-2/3 mx-auto">
      <h1 className="text-3xl font-bold mb-12">Members</h1>
      <div className="bg-white shadow-lg rounded-2xl p-6 mx-auto">
        
        {/* --- Invite Form --- */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Invite Students</h2>
          <form onSubmit={handleInviteSubmit} className="flex gap-2">
            <input
              className="flex-grow placeholder:text-gray-400 border-2 border-orange-200 px-4 py-2 focus:outline-orange-600 rounded-xl text-lg"
              type="email"
              placeholder="Enter student's email to invite"
              value={emailToInvite}
              onChange={(e) => setEmailToInvite(e.target.value)}
              disabled={inviteLoading}
              required
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={inviteLoading}
            >
              {inviteLoading ? "Sending..." : "Invite"}
            </button>
          </form>
          <div className="h-5 text-left mt-1 px-2">
            {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
            {inviteSuccess && (
              <p className="text-sm text-green-600">{inviteSuccess}</p>
            )}
          </div>
        </div>

        {/* --- Chart --- */}
        <div className="mb-8">
           <h2 className="text-xl font-semibold mb-3">Student Score Distribution</h2>
          <DynamicChart
            type="bar"
            data={scoreData}
            options={scoreOptions}
            className="w-full"
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">
            Student List ({members.length})
          </h2>
          
          <ul className="space-y-3">
            {members.map((member) => (
              <li key={member.userId}>
                <Link
                  href={`/class/${classId}/member/${member.userId}/`}
                  className="flex justify-between items-center border border-slate-200 p-4 rounded-lg transition-all hover:shadow-md hover:bg-orange-50 cursor-pointer"
                >
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <p className="font-semibold text-base text-gray-800">
                      {member.firstName} {member.lastName}
                    </p>
                    
                    <p className="text-gray-600 text-base">
                      {member.email}
                    </p>
                    
                  </div>
                  <div className="flex items-center gap-2 text-orange-600">
                    <span className="text-sm font-semibold">View Dashboard</span>
                    <FaAngleRight className="text-lg" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
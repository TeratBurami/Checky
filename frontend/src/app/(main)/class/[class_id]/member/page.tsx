"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Member } from "@/lib/types";

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-12">Members</h1>
      <div className="w-2/3 bg-white shadow-lg rounded-2xl p-4 mx-auto">
        
        <div className="flex justify-between items-center mb-2">
          <p className="text-xl">
            Total Members:{" "}
            <span className="font-bold text-orange-600">{members.length}</span>
          </p>
          
          <form onSubmit={handleInviteSubmit} className="flex gap-2">
            <input
              className="w-80 placeholder:text-center border-2 border-orange-200 px-4 py-1 focus:outline-orange-600 rounded-xl text-lg"
              type="email"
              placeholder="Enter student's email to invite"
              value={emailToInvite}
              onChange={(e) => setEmailToInvite(e.target.value)}
              disabled={inviteLoading}
              required
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-1 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={inviteLoading}
            >
              {inviteLoading ? "Sending..." : "Invite"}
            </button>
          </form>
        </div>
        
        <div className="h-5 text-right mb-2 px-2">
          {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
          {inviteSuccess && (
            <p className="text-sm text-green-600">{inviteSuccess}</p>
          )}
        </div>

        <ul className="py-4 px-8 pl-16 rounded-xl shadow text-sm space-y-4 list-decimal marker:text-orange-600 marker:font-bold marker:text-lg">
          {members.map((member) => (
            <li className="border-b border-slate-200 pb-4" key={member.userId}>
              {member.firstName} {member.lastName}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
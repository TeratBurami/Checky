"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ReviewAssignment } from "@/lib/types";
import {
  ClockSVG,
  CheckCircleSVG,
  BookOpenSVG,
  FolderSVG,
  LayoutGridSVG,
} from "@/components/peer-review/PeerReviewComponents";
import Link from "next/link";

type GroupedByClass = Record<string, ReviewAssignment[]>;
type GroupedReviews = Record<"todo" | "completed", GroupedByClass>;

const groupAndSortReviews = (reviews: ReviewAssignment[]): GroupedReviews => {
  const grouped: GroupedReviews = { todo: {}, completed: {} };

  reviews.forEach((review) => {
    const groupKey = review.status === "COMPLETED" ? "completed" : "todo";
    const className = review.className || "General";

    if (!grouped[groupKey][className]) {
      grouped[groupKey][className] = [];
    }
    grouped[groupKey][className].push(review);
  });

  (Object.keys(grouped) as Array<"todo" | "completed">).forEach((statusKey) => {
    const classGroups = grouped[statusKey];
    Object.keys(classGroups).forEach((className) => {
      classGroups[className].sort((a, b) =>
        (a.assignmentTitle || "").localeCompare(b.assignmentTitle || "")
      );
    });
  });

  return grouped;
};

// ---- Assignment Card ----
const AssignmentCard: React.FC<{ assignment: ReviewAssignment }> = ({
  assignment,
}) => {
  const isCompleted = assignment.status === "COMPLETED";

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getStatusBadge = () => {
    return isCompleted ? (
      <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Done
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-orange-600 rounded-full">
        Pending
      </span>
    );
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-semibold text-gray-800 leading-tight">
            {assignment.assignmentTitle || "Untitled Review"}
          </h4>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-gray-500 mb-4 flex items-center">
          <ClockSVG className="w-4 h-4 mr-1 text-gray-400" />
          Due: {formatDeadline(assignment.reviewDeadline)}
        </p>
      </div>
      <Link
        href={
          isCompleted
            ? `/peer-review/${assignment.reviewId}`
            : `/peer-review/review/${assignment.reviewId}`
        }
        className={`block w-full mt-4 text-center text-white font-bold py-2 px-4 rounded-lg transition duration-200 ${
          isCompleted
            ? "bg-indigo-500 hover:bg-indigo-600"
            : "bg-red-500 hover:bg-red-600"
        } shadow-md`}
      >
        {isCompleted ? "View Review" : "Start Review"}
      </Link>
    </div>
  );
};

// ---- Main Dashboard ----
const PeerReviewDashboard: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<"todo" | "completed">("todo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Fetch Data from API ---
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/peer-review", {
          credentials: "include",
        });
        console.log(res);
        if (!res.ok) throw new Error("Failed to fetch peer reviews");
        const data = await res.json();

        // Transform API -> frontend structure
        const formatted: ReviewAssignment[] = data.map((r: any) => ({
          reviewId: r.review_id,
          submissionId: r.submission_id,
          reviewerId: r.reviewer_id,
          comments: r.comments,
          status: r.status,
          reviewDeadline: r.review_deadline,
          createdAt: r.created_at,
          assignmentTitle: `Submission #${r.submission_id}`,
          className: "Peer Review Tasks",
        }));

        setReviews(formatted);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const groupedReviews = useMemo(() => groupAndSortReviews(reviews), [reviews]);
  const currentGroupedData = groupedReviews[activeTab];

  const totalToDo = Object.values(groupedReviews.todo).flat().length;
  const totalCompleted = Object.values(groupedReviews.completed).flat().length;

  const sortedClassNames = useMemo(
    () => Object.keys(currentGroupedData).sort(),
    [currentGroupedData]
  );

  if (loading)
    return <p className="text-center mt-12 text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center mt-12 text-red-500">Error: {error}</p>;

  return (
    <div className="mx-auto w-9/12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-4xl font-bold">Peer Reviews</h1>
        <p className="text-sm font-medium text-neutral-500">
          Complete reviews for your peers to help them improve their writing.
        </p>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("todo")}
              className={`py-3 px-1 text-sm font-semibold transition ${
                activeTab === "todo"
                  ? "border-b-4 border-orange-500 text-orange-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              To-do ({totalToDo})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-3 px-1 text-sm font-semibold transition ${
                activeTab === "completed"
                  ? "border-b-4 border-[#EA583E] text-[#EA583E]"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Completed ({totalCompleted})
            </button>
          </nav>
        </div>

        {/* Review cards grouped by class */}
        {sortedClassNames.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
            <LayoutGridSVG className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-xl font-medium text-gray-900">
              No {activeTab === "todo" ? "Pending" : "Completed"} Reviews
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "todo"
                ? "You are all caught up on your peer reviews."
                : "Start completing assignments to see them here!"}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedClassNames.map((className) => (
              <section
                key={className}
                className="border-l-4 border-[#EA583E] pl-4 sm:pl-6 pt-1"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <FolderSVG className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    {className}
                    <span className="ml-2 text-base font-medium text-gray-500">
                      ({currentGroupedData[className].length}{" "}
                      {currentGroupedData[className].length === 1
                        ? "assignment"
                        : "assignments"}
                      )
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentGroupedData[className].map((assignment) => (
                    <AssignmentCard
                      key={assignment.reviewId}
                      assignment={assignment}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PeerReviewDashboard;

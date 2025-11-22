"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ReviewData {
  reviewId: number;
  comments: string | null;
  status: string;
  reviewDeadline: string;
  createdAt: string;
  reviewer: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  student: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  class: {
    classId: number;
    name: string;
    description: string;
    classCode: string;
    teacher: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  assignment: {
    assignmentId: number;
    title: string;
    description: string;
    deadline: string;
    createdAt: string;
    rubricId: number;
    rubric: {
      rubricId: number;
      name: string;
      criteria: Array<{
        criterionId: number;
        title: string;
        levels: Array<{
          levelId: number;
          levelName: string;
          score: number;
          description: string;
        }>;
      }>;
    };
  };
  submission: {
    submissionId: number;
    content: string;
    submittedAt: string;
    score: number | null;
    teacherComment: string | null;
    files: Array<{
      filename: string;
      url: string;
    }>;
  };
}

export default function ReviewPeerReviews(){
    const params = useParams();
    const router = useRouter();
    const reviewId = params.reviewId as string;

    const [reviewData, setReviewData] = useState<ReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLevels, setSelectedLevels] = useState<Record<number, string>>({});
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch review data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:3000/api/v1/peer-review/${reviewId}`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch review");
                const data: ReviewData = await res.json();
                setReviewData(data);
                console.log("Review data:", data);
            } catch (err: any) {
                setError(err.message);
                console.error("Error fetching review:", err);
            } finally {
                setLoading(false);
            }
        };

        if (reviewId) fetchData();
    }, [reviewId]);

    // Handle level selection
    const handleLevelSelect = (criterionId: number, levelName: string) => {
        setSelectedLevels((prev) => ({
            ...prev,
            [criterionId]: levelName,
        }));
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!reviewData) return;

        // Validate all criteria are selected
        const allSelected = reviewData.assignment.rubric.criteria.every(
            (c) => selectedLevels[c.criterionId]
        );

        if (!allSelected) {
            alert("Please select a level for all criteria");
            return;
        }

        if (!comment.trim()) {
            alert("Please add a comment");
            return;
        }

        try {
            setIsSubmitting(true);

            // Format comment with selected levels
            const levelNames = reviewData.assignment.rubric.criteria.map(
                (c) => selectedLevels[c.criterionId]
            );
            const formattedComment = `[${levelNames.join(", ")}] ${comment.trim()}`;

            const res = await fetch(`http://localhost:3000/api/v1/peer-review/${reviewId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ comments: formattedComment }),
            });

            if (!res.ok) throw new Error("Failed to submit review");

            alert("Review submitted successfully!");
            router.push("/peer-review");
        } catch (err: any) {
            alert(err.message || "Submission failed");
            console.error("Error submitting review:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto w-9/12 mt-20">
                <p className="text-center text-lg">Loading review data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto w-9/12 mt-20">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p className="font-medium">Error: {error}</p>
                    <Link href="/peer-review" className="text-red-600 hover:underline mt-2 inline-block">
                        Back to Peer Reviews
                    </Link>
                </div>
            </div>
        );
    }

    const calculateMaxPoints = () => {
        if (!reviewData) return 0;
        return reviewData.assignment.rubric.criteria.reduce((total, criterion) => {
            const maxScore = criterion.levels.reduce((max, level) => Math.max(max, level.score), 0);
            return total + maxScore;
        }, 0);
    };

    const calculateCurrentPoints = () => {
        if (!reviewData) return 0;
        return reviewData.assignment.rubric.criteria.reduce((total, criterion) => {
            const selectedLevelName = selectedLevels[criterion.criterionId];
            if (!selectedLevelName) return total;

            const selectedLevel = criterion.levels.find(level => level.levelName === selectedLevelName);
            return total + (selectedLevel?.score || 0);
        }, 0);
    };

    return(
        <div>
            <div className="mx-auto w-9/12 mb-32">
                <div>
                    <p className="text-sm font-medium text-neutral-500 mb-2">
                        <Link href="/peer-review">My Peer Review </Link> &gt; Reviewing Submission
                    </p>
                    <h1 className="text-4xl font-bold">Review for {reviewData?.assignment.title}</h1>
                    <p className="text-sm font-medium text-neutral-500">
                        {reviewData?.class.name}
                    </p>
                </div>

                <div className="p-6 mt-6 bg-[#FDFBEF] rounded-t-2xl shadow">
                    <h2 className="text-lg font-semibold">Peer's Submission</h2>
                    <p className="text-md font-lg text-gray-500">Submitted on: {reviewData?.submission.submittedAt ? new Date(reviewData.submission.submittedAt).toLocaleString() : "N/A"}</p>
                    <p className="text-md font-lg text-gray-500">Due date: {reviewData?.assignment.deadline ? new Date(reviewData.assignment.deadline).toLocaleString() : "N/A"}</p>
                </div>
                <div className="p-6 bg-[#FDFBEF] rounded-b-2xl shadow border-t border-t-gray-200 overflow break-words whitespace-pre-wrap">
                    <p>{reviewData?.submission.content}</p>
                </div>

                <div className="p-6 mt-6 bg-[#FDFBEF] rounded-t-2xl shadow">
                    <h2 className="text-lg font-semibold">Your Review</h2>
                    <p className="text-md font-lg text-gray-500">Fill out the rubric and provide comments for your peer.</p>
                </div>
                <div className="px-8 pb-8 bg-[#FDFBEF] rounded-b-2xl shadow border-t border-t-gray-200 overflow break-words whitespace-pre-wrap">
                    {reviewData?.assignment.rubric.criteria.map((criterion, index) => (
                        <div key={criterion.criterionId} className="pt-6">
                            <h2 className="text-lg font-semibold">{index + 1}. {criterion.title}</h2>
                            <p className="text-md font-lg">{criterion.title}</p>

                            {criterion.levels.map((level) => (
                                <div key={level.levelId} className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                                    <div className="flex flex-row gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedLevels[criterion.criterionId] === level.levelName}
                                            onChange={() => handleLevelSelect(criterion.criterionId, level.levelName)}
                                        />
                                        <div>
                                            <p className="text-md font-bold">{level.levelName} ({level.score} score)</p>
                                            <p className="text-md font-lg">{level.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                    <div className="pt-12">
                        <h2 className="text-xl font-semibold">Comment</h2>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full min-h-56 border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Add your comment here..."
                        ></textarea>
                    </div>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBEF] border-t border-gray-200 shadow-2xl z-20 p-2">
                <div className="mx-auto w-11/12 md:w-9/12 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <p className="text-lg font-medium text-gray-700">Max Points:</p>
                        <span className="text-2xl font-bold text-[#EA583E] bg-[#FBF9F2] px-3 py-1 rounded-lg border border-[#EA583E]/30 shadow-inner">
                            {calculateCurrentPoints()}/{calculateMaxPoints()}
                        </span>
                    </div>
                    <div className="flex space-x-3">
                        <Link href="/peer-review" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold text-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                            Cancel
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-[#EA583E] text-white rounded-xl shadow-md hover:bg-orange-600 disabled:bg-gray-400 transition font-semibold text-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
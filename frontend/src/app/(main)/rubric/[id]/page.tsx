"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Rubric } from "@/lib/types";

function calculateMaxPoints(rubric: Rubric | null): number {
  if (!rubric) return 0;
  return rubric.criteria.reduce((sum, c) => {
    const maxLevel = Math.max(...c.levels.map((l) => l.score || 0), 0);
    return sum + maxLevel;
  }, 0);
}

export default function RubricDetail() {
  const { id } = useParams(); // Get rubric ID from URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rubric, setRubric] = useState<Rubric | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRubric = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/v1/rubric/${id}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Rubric = await response.json();
        setRubric(data);
        setError(null);
        console.log("Fetched rubric:", data);
      } catch (e: any) {
        console.error("Failed to fetch rubric:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRubric();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading rubric...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;
  if (!rubric) return <p className="text-center mt-10">Rubric not found</p>;

  return (
    <div className="mx-auto w-9/12 ">
      <div>
        <p className="text-sm font-medium text-neutral-500 mb-2">
          <Link href="/rubric">Rubrics </Link>
          &gt; {rubric.name}
        </p>
        <h1 className="text-4xl font-bold">Rubric Detail</h1>
        <p className="text-sm font-medium text-neutral-500">
          Review detailed grading structure for this rubric.
        </p>
      </div>

      {/* Rubric Info */}
      <div className="w-full p-8 mt-6 bg-[#FDFBEF] shadow rounded-2xl">
        <h2 className="font-semibold text-xl">Rubric Name</h2>
        <input
          type="text"
          value={rubric.name}
          readOnly
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Rubric name"
        />
      </div>

      {/* Criteria */}
      <div className="mb-48">
        {rubric.criteria.map((criterion, index) => (
          <div key={criterion.criterionId} className="flex flex-row">
            <div className="w-full p-8 mt-6 bg-[#FDFBEF] shadow rounded-2xl ">
              <div className="flex flex-row justify-between ">
                <h2 className="font-semibold text-xl">
                  Criterion {index + 1}
                </h2>
              </div>
              <input
                type="text"
                value={criterion.title}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <div className="flex flex-row justify-between gap-6 mt-6">
                {criterion.levels.map((level) => (
                  <div key={level.levelId} className="w-full">
                    <div className="w-full p-4 bg-[#F4F2E7] rounded-xl">
                      <p className="flex justify-center font-[600]">
                        {level.level}
                      </p>
                      <textarea
                        value={level.description}
                        readOnly
                        className="pt-4 w-full min-h-64 border border-gray-300 rounded-md px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <p className="pt-4">Points</p>
                      <input
                        type="number"
                        value={level.score}
                        readOnly
                        className="w-4/5 border border-gray-300 rounded-lg px-3 py-1 mt-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBEF] border-t border-gray-200 shadow-2xl z-20 p-2">
        <div className="mx-auto w-11/12 md:w-9/12 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <p className="text-lg font-medium text-gray-700">Max Points:</p>
            <span className="text-2xl font-bold text-[#EA583E] bg-[#FBF9F2] px-3 py-1 rounded-lg border border-[#EA583E]/30 shadow-inner">
              {calculateMaxPoints(rubric)}
            </span>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/rubric"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold text-md"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

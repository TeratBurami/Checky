"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Rubric } from "@/lib/types";

export default function RubricPage(){
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rubrics, setRubrics] = useState<Rubric[]>([]);

    useEffect(() => {
        const fetchRubrics = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:3000/api/v1/rubric", {
                    credentials: "include",
                });
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Rubric[] = await response.json();
                setRubrics(data);
                setError(null);
                console.log("Fetched rubrics:", data);
            }
            catch (e: any) {
                console.error("Failed to fetch rubrics:", e);
            }
            finally {
                setLoading(false);
            }
        }

        

        fetchRubrics();
    }, []);

    const handleDeleteRubric = async (rubricId: number) => {
        if (!confirm("Are you sure you want to delete this rubric?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/v1/rubric/${rubricId}`, {
            method: "DELETE",
            credentials: "include",
            });

            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }

            setRubrics((prevRubrics) => prevRubrics.filter((r) => r.rubricId !== rubricId));
        } catch (e: any) {
            console.error("Failed to delete rubric:", e);
            alert("Failed to delete rubric. Please try again.");
        }
    };

    const calculateMaxPoints = (rubric: Rubric): number => {
        return rubric.criteria.reduce((total, criterion) => {
            const maxScore = criterion.levels.reduce((max, level) => Math.max(max, level.score), 0);
            return total + maxScore;
        }, 0);
    };

    return(
        <div className="mx-auto w-9/12">
            <div className="flex flex-row justify-between items-center pt-[24px]">
                <div>
                    <h1 className="text-4xl font-bold">My Rubrics</h1>
                    <p className="text-sm font-medium text-neutral-500">Manage your grading schemas. Create, edit, and reuse them across your classes.</p>
                </div>
                <Link href="/rubric/create" className="flex w-[180px] h-[52px] rounded-2xl text-white justify-center items-center bg-[#EA583E] shadow">
                    <p className="text-lg font-medium ">Create Rubric</p>
                </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {error && (
                    <div className="col-span-full bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                        <p className="font-medium">Error loading rubrics</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="col-span-full text-center py-8">
                        <p className="text-gray-500">Loading rubrics...</p>
                    </div>
                ) : rubrics.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        <p className="text-gray-500">No rubrics found. Create one to get started!</p>
                    </div>
                ) : (
                    rubrics.map((rubric) => (
                        <div key={rubric.rubricId} className="bg-[#FDFBEF] rounded-xl p-5 shadow-sm border border-gray-200">
                            <Link href = {`/rubric/${rubric.rubricId}`} className="text-xl font-semibold text-gray-800">{rubric.name}</Link>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 text-sm bg-[#F4F2E7] rounded-full text-gray-700 border border-black/15">
                                    {rubric.criteria.length} Criteria
                                </span>
                                <span className="px-3 py-1 text-sm bg-[#F4F2E7] rounded-full text-gray-700 border border-black/15">
                                    {calculateMaxPoints(rubric)} Total Points
                                </span>
                            </div>
                            <div className="flex gap-4 mt-3">
                                <Link href={`/rubric/edit/${rubric.rubricId}`} className="text-indigo-600 hover:underline">Edit</Link>
                                <button
                                    onClick={() => handleDeleteRubric(rubric.rubricId)}
                                    className="text-red-500 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {/* Create New Rubric Placeholder */}
                {/* <div className="min-h-[170px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition cursor-pointer">
                    <span className="text-3xl font-light">+</span>
                    <p className="mt-2 text-lg font-medium">Create New Rubric</p>
                </div> */}
            </div>

        </div>
    )
}
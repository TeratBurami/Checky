"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Rubric {
    rubricId: number;
    name: string;
    created_at: string;
    criteria: Array<{
        criterionId: number;
        title: string;
        levels: Array<{
            levelId: number;
            level: string;
            score: number;
            description: string;
        }>;
    }>;
}

export default function Rubric(){
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

            // const handleOnClickNewRubric = () => {
            //     window.location.href = "/rubric/create";
            // };
        }

        fetchRubrics();
    }, []);

    const calculateTotalPoints = (rubric: Rubric): number => {
        return rubric.criteria.reduce((total, criterion) => {
            const criterionTotal = criterion.levels.reduce((sum, level) => sum + level.score, 0);
            return total + criterionTotal;
        }, 0);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Updated today";
        if (diffDays === 1) return "Updated yesterday";
        if (diffDays < 7) return `Updated ${diffDays} days ago`;
        if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
        return `Updated ${Math.floor(diffDays / 30)} months ago`;
    };

    return(
        <div className="mx-auto w-9/12">
            <div className="flex flex-row justify-between items-center pt-[24px]">
                <div>
                    <h1 className="text-4xl font-bold">My Rubrics</h1>
                    <p className="text-sm font-medium text-neutral-500">Manage your grading schemas. Create, edit, and reuse them across your classes.</p>
                </div>
                <Link href="/rubric/create" className="flex w-[180px] h-[52px] rounded-2xl text-white justify-center items-center bg-[#EA583E]">
                    <p className="text-lg font-medium">Create Rubric</p>
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
                            <h2 className="text-xl font-semibold text-gray-800">{rubric.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 text-sm bg-[#F4F2E7] rounded-full text-gray-700 border border-black/15">
                                    {rubric.criteria.length} Criteria
                                </span>
                                <span className="px-3 py-1 text-sm bg-[#F4F2E7] rounded-full text-gray-700 border border-black/15">
                                    {calculateTotalPoints(rubric)} Total Points
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-3">{formatDate(rubric.created_at)}</p>
                            <div className="flex gap-4 mt-3">
                                <button className="text-indigo-600 hover:underline">Edit</button>
                                <button className="text-red-500 hover:underline">Delete</button>
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
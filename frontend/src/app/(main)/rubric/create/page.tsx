"use client";
import { useState } from "react";
import Link from "next/link";

interface Criterion {
    id: string;
    title: string;
    levels: Array<{
        name: string;
        description: string;
        points: number;
    }>;
}

export default function CreateRubric(){
    const [rubricName, setRubricName] = useState("");
    const [criteria, setCriteria] = useState<Criterion[]>([
        {
            id: "1",
            title: "",
            levels: [
                { name: "Low", description: "", points: 0 },
                { name: "Medium", description: "", points: 0 },
                { name: "High", description: "", points: 0 },
            ],
        },
    ]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const addCriterion = () => {
        const newId = String(criteria.length + 1);
        setCriteria([
            ...criteria,
            {
                id: newId,
                title: "",
                levels: [
                    { name: "Low", description: "", points: 0 },
                    { name: "Medium", description: "", points: 0 },
                    { name: "High", description: "", points: 0 },
                ],
            },
        ]);
    };

    const removeCriterion = (id: string) => {
        const updatedCriteria = criteria.filter((c) => c.id !== id);
        // Renumber the remaining criteria
        const renumberedCriteria = updatedCriteria.map((c, index) => ({
            ...c,
            id: String(index + 1),
        }));
        setCriteria(renumberedCriteria);
    };

    const updateCriterionTitle = (id: string, title: string) => {
        setCriteria(
            criteria.map((c) => (c.id === id ? { ...c, title } : c))
        );
    };

    const updateCriterionLevel = (
        id: string,
        levelIndex: number,
        field: "description" | "points",
        value: string | number
    ) => {
        setCriteria(
            criteria.map((c) => {
                if (c.id === id) {
                    const updatedLevels = [...c.levels];
                    updatedLevels[levelIndex] = {
                        ...updatedLevels[levelIndex],
                        [field]: value,
                    };
                    return { ...c, levels: updatedLevels };
                }
                return c;
            })
        );
    };

    const calculateMaxPoints = (): number => {
        return criteria.reduce((total, criterion) => {
            const maxScore = criterion.levels.reduce((max, level) => Math.max(max, level.points), 0);
            return total + maxScore;
        }, 0);
    };

    const validateForm = (): boolean => {
        if (!rubricName.trim()) {
            setErrorMessage("Rubric name is required");
            return false;
        }

        for (const criterion of criteria) {
            if (!criterion.title.trim()) {
                setErrorMessage("All criterion titles are required");
                return false;
            }

            for (const level of criterion.levels) {
                if (!level.description.trim()) {
                    setErrorMessage("All level descriptions are required");
                    return false;
                }
                if (level.points < 0) {
                    setErrorMessage("All level points must be greater than or equal to 0");
                    return false;
                }
            }
        }

        setErrorMessage("");
        return true;
    };

    const handleSaveRubric = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const rubricData = {
                rubric: {
                    name: rubricName,
                    criteria: criteria.map((c) => ({
                        title: c.title,
                        levels: c.levels.map((level) => ({
                            level: level.name,
                            score: level.points,
                            description: level.description,
                        })),
                    })),
                },
            };

            const response = await fetch("http://localhost:3000/api/v1/rubric", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(rubricData),
                credentials: "include",
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to create rubric");
            }

            const data = await response.json();
            setSuccessMessage("Rubric created successfully!");
            setErrorMessage("");
            console.log("Created rubric:", data);

            setTimeout(() => {
                window.location.href = "/rubric";
            }, 2000);
        } catch (e: any) {
            const errorMsg = e instanceof Error ? e.message : "Failed to create rubric";
            setErrorMessage(errorMsg);
            setSuccessMessage("");
            console.error("Failed to create rubric:", e);
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div>
            {successMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 shadow-lg z-50">
                    <p className="font-medium">✓ {successMessage}</p>
                </div>
            )}

            {errorMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 shadow-lg z-50">
                    <p className="font-medium">✕ {errorMessage}</p>
                </div>
            )}

            <div className="mx-auto w-9/12 ">
                <div>
                    <p className="text-sm font-medium text-neutral-500 mb-2">
                        <Link href="/rubric">Rubrics </Link>
                        &gt; Create New
                    </p>
                    <h1 className="text-4xl font-bold">My Rubrics</h1>
                    <p className="text-sm font-medium text-neutral-500">Build a structured grading schema to provide clear and consistent feedback.</p>
                </div>

                <div className="w-full p-8 mt-6 bg-[#FDFBEF] shadow rounded-2xl">
                    <h2 className="font-semibold text-xl">Rubric Name</h2>
                    <input
                        type="text"
                        value={rubricName}
                        onChange={(e) => setRubricName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g. Senior Project Rubric"
                    />
                </div>
                <div>
                    {criteria.map((criterion, index) => (
                        <div key={criterion.id} className="flex flex-row">
                            <div className="w-full p-8 mt-6 bg-[#FDFBEF] shadow rounded-2xl">
                                <div className="flex flex-row justify-between">
                                    <h2 className="font-semibold text-xl">Criterion {index + 1}</h2>
                                    <button
                                        onClick={() => removeCriterion(criterion.id)}
                                        className="text-sm font-medium text-neutral-500 hover:text-red-500 transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={criterion.title}
                                    onChange={(e) => updateCriterionTitle(criterion.id, e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="e.g., Senior Project Document Proposal"
                                />

                                <div className="flex flex-row justify-between gap-6 mt-6">
                                    {criterion.levels.map((level, levelIndex) => (
                                        <div key={levelIndex} className="w-full">
                                            <div className="w-full p-4 bg-[#F4F2E7] rounded-xl">
                                                <p className="flex justify-center font-[600]">{level.name}</p>
                                                <textarea
                                                    value={level.description}
                                                    onChange={(e) => updateCriterionLevel(criterion.id, levelIndex, "description", e.target.value)}
                                                    className="pt-4 w-full min-h-64 border border-gray-300 rounded-md px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    placeholder="e.g., The document is well-organized and has a clear introduction, body, and conclusion."
                                                />
                                            </div>
                                            <div className="flex flex-row items-center justify-between">
                                                <p className="pt-4">Points</p>
                                                <input
                                                    type="number"
                                                    value={level.points}
                                                    onChange={(e) => updateCriterionLevel(criterion.id, levelIndex, "points", parseInt(e.target.value) || 0)}
                                                    className="w-4/5 border border-gray-300 rounded-lg px-3 py-1 mt-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    placeholder="Score"
                                                    min={0}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={addCriterion}
                        className="mt-12 mb-32 px-6 py-3 bg-[#EA583E] text-white rounded-xl shadow-md hover:bg-orange-600 transition font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        Add Criterion
                    </button>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBEF] border-t border-gray-200 shadow-2xl z-20 p-2">
                <div className="mx-auto w-11/12 md:w-9/12 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <p className="text-lg font-medium text-gray-700">Max Points:</p>
                        <span className="text-2xl font-bold text-[#EA583E] bg-[#FBF9F2] px-3 py-1 rounded-lg border border-[#EA583E]/30 shadow-inner">
                            {calculateMaxPoints()}
                        </span>
                    </div>
                    <div className="flex space-x-3">
                        <Link href="/rubric" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold text-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                            Cancel
                        </Link>
                        <button
                            onClick={handleSaveRubric}
                            disabled={isLoading}
                            className="px-6 py-3 bg-[#EA583E] text-white rounded-xl shadow-md hover:bg-orange-600 disabled:bg-gray-400 transition font-semibold text-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            {isLoading ? "Saving..." : "Save Rubric"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
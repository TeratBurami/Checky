"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Rubric } from "@/lib/types";

export default function EditRubric() {
    const { id } = useParams();
    const [rubricName, setRubricName] = useState("");
    const [criteria, setCriteria] = useState<Rubric["criteria"]>([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchRubric = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/api/v1/rubric/${id}`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to load rubric");
                const data: Rubric = await res.json();

                const sortedCriteria = data.criteria.map((criterion) => ({
                    ...criterion,
                    levels: [...criterion.levels].sort((a, b) => a.score - b.score),
                }));

                setRubricName(data.name);
                setCriteria(sortedCriteria);
            } catch (e: any) {
                setErrorMessage(e.message || "Error fetching rubric");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchRubric();
    }, [id]);

    const updateCriterionTitle = (criterionId: number, title: string) => {
        setCriteria(criteria.map((c) => 
            c.criterionId === criterionId ? { ...c, title } : c
        ));
    };

    const updateCriterionLevel = (
        criterionId: number,
        levelIndex: number,
        field: "description" | "score",
        value: string | number
    ) => {
        setCriteria(criteria.map((c) => {
            if (c.criterionId === criterionId) {
                const updatedLevels = [...c.levels];
                updatedLevels[levelIndex] = {
                    ...updatedLevels[levelIndex],
                    [field]: value,
                };
                return { ...c, levels: updatedLevels };
            }
            return c;
        }));
    };

    const calculateMaxPoints = (): number => {
        return criteria.reduce((total, criterion) => {
            const maxScore = Math.max(...criterion.levels.map((l) => l.score), 0);
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
                if (level.score < 0) {
                    setErrorMessage("All level points must be >= 0");
                    return false;
                }
            }
        }
        setErrorMessage("");
        return true;
    };

    const handleUpdateRubric = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            const rubricData = {
                rubric: {
                    name: rubricName,
                    criteria: criteria.map((c) => ({
                        criterionId: c.criterionId,
                        title: c.title,
                        levels: c.levels.map((level) => ({
                            levelId: level.levelId,
                            level: level.level,
                            score: level.score,
                            description: level.description,
                        })),
                    })),
                },
            };

            const response = await fetch(`http://localhost:3000/api/v1/rubric/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rubricData),
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to update rubric");
            setSuccessMessage("Rubric updated successfully!");
            setTimeout(() => (window.location.href = "/rubric"), 2000);
        } catch (e: any) {
            setErrorMessage(e.message || "Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCriterion = () => {
        const newCriterionId = Date.now();
        const newCriterion = {
            criterionId: newCriterionId,
            title: "",
            levels: [
                { levelId: newCriterionId + 1, level: "Low", score: 0, description: "" },
                { levelId: newCriterionId + 2, level: "Medium", score: 0, description: "" },
                { levelId: newCriterionId + 3, level: "High", score: 0, description: "" },
            ],
        };
        setCriteria([...criteria, newCriterion]);
    };


    if (isLoading) {
        return <p className="text-center mt-12 text-gray-600">Loading rubric...</p>;
    }

    return (
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

            <div className="mx-auto w-9/12">
                <div>
                    <p className="text-sm font-medium text-neutral-500 mb-2">
                        <Link href="/rubric">Rubrics</Link> &gt; Edit
                    </p>
                    <h1 className="text-4xl font-bold">Edit Rubric</h1>
                    <p className="text-sm font-medium text-neutral-500">
                        Update your grading schema below.
                    </p>
                </div>

                <div className="w-full p-8 mt-6 bg-[#FDFBEF] shadow rounded-2xl">
                    <h2 className="font-semibold text-xl">Rubric Name</h2>
                    <input
                        type="text"
                        value={rubricName}
                        onChange={(e) => setRubricName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                {criteria.map((criterion, index) => (
                    <div key={criterion.criterionId} className="flex flex-row">
                        <div className="w-full p-8 mt-6 bg-[#FDFBEF] shadow rounded-2xl">
                            <div className="flex flex-row justify-between">
                                <h2 className="font-semibold text-xl">Criterion {index + 1}</h2>
                            </div>
                            <input
                                type="text"
                                value={criterion.title}
                                onChange={(e) => updateCriterionTitle(criterion.criterionId, e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., Project Presentation"
                            />

                            <div className="flex flex-row justify-between gap-6 mt-6">
                                {criterion.levels.map((level, levelIndex) => (
                                    <div key={level.levelId} className="w-full">
                                        <div className="w-full p-4 bg-[#F4F2E7] rounded-xl">
                                            <p className="flex justify-center font-[600]">{level.level}</p>
                                            <textarea
                                                value={level.description}
                                                onChange={(e) =>
                                                    updateCriterionLevel(
                                                        criterion.criterionId,
                                                        levelIndex,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                className="pt-4 w-full min-h-64 border border-gray-300 rounded-md px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div className="flex flex-row items-center justify-between">
                                            <p className="pt-4">Points</p>
                                            <input
                                                type="number"
                                                value={level.score}
                                                onChange={(e) =>
                                                    updateCriterionLevel(
                                                        criterion.criterionId,
                                                        levelIndex,
                                                        "score",
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                className="w-4/5 border border-gray-300 rounded-lg px-3 py-1 mt-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                min={0}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBEF] border-t border-gray-200 shadow-2xl z-20 p-2">
                    <div className="mx-auto w-11/12 md:w-9/12 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <p className="text-lg font-medium text-gray-700">Max Points:</p>
                            <span className="text-2xl font-bold text-[#EA583E] bg-[#FBF9F2] px-3 py-1 rounded-lg border border-[#EA583E]/30 shadow-inner">
                                {calculateMaxPoints()}
                            </span>
                        </div>
                        <div className="flex space-x-3">
                            <Link
                                href="/rubric"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold text-md"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={handleUpdateRubric}
                                disabled={isSaving}
                                className="px-6 py-3 bg-[#EA583E] text-white rounded-xl shadow-md hover:bg-orange-600 disabled:bg-gray-400 transition font-semibold text-md"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mt-8 mb-36">
                    <button
                        onClick={handleAddCriterion}
                        className="px-6 py-3 bg-[#EA583E] text-white rounded-xl shadow hover:bg-orange-600 transition font-semibold"
                    >
                        + Add Criterion
                    </button>
                </div>
            </div>
        </div>
    );
}

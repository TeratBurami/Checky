"use client";

import { useEffect, useState, MouseEvent } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import {
  FaCircleCheck,
  FaUserCheck,
  FaStar,
  FaRegClock,
  FaPencil,
  FaTrash,
  FaTriangleExclamation,
  FaChartArea,
} from "react-icons/fa6";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@/lib/types";
import { ChartData, ChartOptions } from "chart.js";
import DynamicChart from "@/components/DynamicChart";

interface CourseDetail {
  classId: number;
  name: string;
  description: string;
  classCode: string;
  teacher: {
    userId: number;
    firstName: string;
    lastName: string;
  };
  assignments: any[];
  completeness: number;
  avgScore: number;
  membersCount: number;
}

export default function ClassDetail() {
  const [course, setCourse] = useState<CourseDetail>();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | undefined>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const params = useParams();
  const classId = params.class_id;

  useEffect(() => {
    if (!classId) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/api/v1/class/${classId}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CourseDetail = await response.json();
        console.log("Fetched course:", data);
        setCourse(data);
      } catch (e) {
        console.error("Failed to fetch course:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [classId]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decodedPayload = jwtDecode<JwtPayload>(token);
        console.log("Decoded role:", decodedPayload.role);
        setRole(decodedPayload.role);
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, []);

  const handleAssignmentClick = (assignmentId: number) => {
    window.location.href = `/class/${classId}/assignment/${assignmentId}`;
  };

  const handleClassEditClick = () => {
    window.location.href = `/class/${classId}/edit`;
  };

  const handleAssignmentCreateClick = () => {
    window.location.href = `/class/${classId}/assignment/create`;
  };

  const handleAssignmentEditClick = (e: MouseEvent, assignmentId: number) => {
    e.stopPropagation();
    window.location.href = `/class/${classId}/assignment/${assignmentId}/edit`;
  };

  const handleAssignmentDeleteClick = (e: MouseEvent, assignmentId: number) => {
    e.stopPropagation();
    setSelectedAssignmentId(assignmentId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAssignmentId) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/class/${classId}/assignment/${selectedAssignmentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete assignment");
      }

      setCourse((prevCourse) => {
        if (!prevCourse) return undefined;
        return {
          ...prevCourse,
          assignments: prevCourse.assignments.filter(
            (a) => a.assignmentId !== selectedAssignmentId
          ),
        };
      });

      setShowDeleteModal(false);
      setSelectedAssignmentId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const teacherCard = [
    {
      title: "Members",
      icon: <FaUserCheck className="text-3xl"></FaUserCheck>,
      value: course?.membersCount,
      href: `/class/${classId}/member`,
    },
  ];

  const studentCard = [
    {
      title: "Completed",
      icon: <FaCircleCheck className="text-3xl"></FaCircleCheck>,
      value: course?.completeness,
    },
    {
      title: "Average Score",
      icon: <FaStar className="text-3xl"></FaStar>,
      value: course?.avgScore,
    },
  ];

  const calculateAverage = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
};

const getRandomScore = () => Math.floor(Math.random() * (10 - 0 + 1)) + 0;

const memberCount = course?.membersCount ?? 0;
const grammarScores = Array.from({ length: memberCount }, () => getRandomScore());
const vocabScores = Array.from({ length: memberCount }, () => getRandomScore());
const avgGrammar = calculateAverage(grammarScores);
const avgVocab = calculateAverage(vocabScores);


const scoreData: ChartData<"bar"> = {
  labels: ["Average Class Score"], 
  
  datasets: [
    {
      label: "Grammar",
      data: [avgGrammar], 
      backgroundColor: "rgba(249, 115, 22, 0.7)",
      borderColor: "rgba(249, 115, 22, 1)",
      borderWidth: 1,
    },
    {
      label: "Vocabulary",
      data: [avgVocab],
      backgroundColor: "rgba(255, 187, 139, 0.7)",
      borderColor: "rgba(255, 187, 139, 1)",
      borderWidth: 1,
    },
  ],
};

  const scoreOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        font: {
          size: 18,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y} scores`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
        },
      },
      x: {
        title: {
          display: true,
        },
      },
    },
  };

  if (loading) {
    return <p>Loading class details...</p>;
  }

  if (!course) {
    return <p>Course not found.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-3xl font-bold">{course.name}</h1>

            {role === "teacher" && (
              <button
                onClick={handleClassEditClick}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors duration-200"
                title="Edit Class Details"
              >
                <FaPencil className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-lg text-gray-500">{course.description}</p>
        </div>
        <div className="bg-orange-600 text-lg font-bold text-white rounded-lg p-4 shadow-lg shadow-black/30">
          <p>
            Teacher: {course.teacher.firstName} {course.teacher.lastName}
          </p>
          <p className="text-sm mt-4 text-gray-300">
            Class code:
            <span className="bg-orange-200 text-orange-600 rounded p-1">
              {course.classCode}
            </span>
          </p>
        </div>
      </div>

      <div className="flex justify-start gap-20">
        {role === "student" &&
          studentCard.map((card, index) => (
            <div
              key={index}
              className="w-1/3 h-38 shadow-lg bg-white rounded-2xl px-8 py-6 flex flex-col justify-between border-2 border-white hover:border-orange-400 transition-colors"
            >
              <div className="flex justify-between items-center">
                <p className="text-xl">{card.title}</p>
                {card.icon}
              </div>
              <p className="text-lg text-gray-500">{card.value}</p>
            </div>
          ))}

        {role === "teacher" && (
          <div className="flex gap-20 w-full items-end">
            {teacherCard.map((card, index) => (
              <div
                onClick={() => (window.location.href = card.href)}
                key={index}
                className="w-1/3 h-38 shadow-lg bg-white rounded-2xl px-8 py-6 flex flex-col justify-between border-2 border-white hover:border-orange-400 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <p className="text-xl">{card.title}</p>
                  {card.icon}
                </div>
                <p className="text-lg text-gray-500">{card.value}</p>
              </div>
            ))}
            <div className="w-2/3 h-fit pr-12 shadow-lg bg-white rounded-2xl flex flex-col justify-between border-2 border-white hover:border-orange-400 transition-colors">
              <DynamicChart
                type="bar"
                data={scoreData}
                options={scoreOptions}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
      <div className="w-full rounded-2xl bg-slate-50 shadow mt-8 py-8 px-14">
        <div className="flex justify-between">
          <h1 className="text-lg text-gray-700 mb-4">Assignment</h1>
          {role === "teacher" && (
            <button
              onClick={handleAssignmentCreateClick}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-4 cursor-pointer"
            >
              Create Assignment
            </button>
          )}
        </div>

        {course.assignments.map((assignment) => {
          const statusColorMap = {
            GRADED: "text-green-500",
            SUBMITTED: "text-blue-500",
            OVERDUE: "text-red-500",
            MISSING: "text-gray-500",
          };

          type AssignmentStatus = keyof typeof statusColorMap;

          const colorClass =
            statusColorMap[assignment.status as AssignmentStatus] ||
            "text-gray-400";

          const statusText = assignment.status
            ? assignment.status.charAt(0) +
              assignment.status.slice(1).toLowerCase()
            : "Pending";

          return (
            <div
              key={assignment.assignmentId}
              className="flex justify-between items-center bg-white p-4 rounded shadow my-4"
            >
              <div
                className="flex-grow cursor-pointer"
                onClick={() => handleAssignmentClick(assignment.assignmentId)}
              >
                <div className="flex items-center gap-8">
                  <FaCircleCheck className={`text-2xl ${colorClass}`} />
                  <h1 className={`text-lg ${colorClass}`}>
                    {assignment.title}
                  </h1>
                </div>
                <div className="flex gap-8 mt-4 items-center border-t border-gray-200 pt-2 w-2/3">
                  <div className="flex items-center">
                    <FaRegClock className="text-gray-500"></FaRegClock>
                    <p className="ml-2 text-gray-500">
                      Opened: {new Date(assignment.openDate).toLocaleString()}
                    </p>
                  </div>
                  <p className="ml-2 text-red-500">
                    Due: {new Date(assignment.deadline).toLocaleString()}
                  </p>
                </div>
              </div>

              {role === "student" && assignment.status && (
                <p className={`text-xl font-bold ${colorClass}`}>
                  {statusText}
                </p>
              )}

              {role === "teacher" && (
                <div className="flex gap-4 pl-4">
                  {" "}
                  <button
                    onClick={(e) =>
                      handleAssignmentEditClick(e, assignment.assignmentId)
                    }
                    className="cursor-pointer p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                    title="Edit Assignment"
                  >
                    <FaPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) =>
                      handleAssignmentDeleteClick(e, assignment.assignmentId)
                    }
                    className="cursor-pointer p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete Assignment"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full animate-fadeInUp">
            <div className="text-center">
              <span className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <FaTriangleExclamation className="w-8 h-8 text-red-600" />
              </span>
              <h2 className="text-2xl font-bold text-gray-800">
                Delete Assignment
              </h2>
              <p className="text-gray-600 mt-2">
                Are you sure? This action cannot be undone. All submissions
                related to this assignment will also be lost.
              </p>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

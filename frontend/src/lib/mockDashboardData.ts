import { DashboardData } from "./types";

// Helper to simulate network delay
const mockApiDelay = () => new Promise((res) => setTimeout(res, 600));

// --- Database of Learning Modules ---
// (We define these once)
const WEAKNESS_STRUCTURE: DashboardData["mainWeaknesses"][0] = {
  topic: "Structure",
  description: "Your essays often lack a clear thesis statement and paragraph flow.",
  nextLearningStep: {
    title: "Focus on Thesis Statements",
    description: "Master the thesis statement. It's the foundation of every strong essay.",
    resource: {
      id: "res_s1",
      type: "article",
      title: "Writing a Strong Thesis Statement",
      url: "https://owl.purdue.edu/owl/general_writing/academic_writing/establishing_arguments/index.html"
    }
  },
  dailyExercise: {
    topic: "Structure",
    question: "Read the following paragraph and identify its main topic sentence. Does it connect to a clear thesis?",
    content: "The industry has seen rapid growth. New companies are emerging. However, many fail within the first year. This is due to a lack of market research..."
  }
};

const WEAKNESS_GRAMMAR: DashboardData["mainWeaknesses"][0] = {
  topic: "Grammar",
  description: "Subject-verb agreement and run-on sentences are common issues.",
  nextLearningStep: {
    title: "Master Subject-Verb Agreement",
    description: "This is a core skill. Let's fix it.",
    resource: {
      id: "res_g1",
      type: "video",
      title: "Subject-Verb Agreement Rules",
      url: "https://www.youtube.com/watch?v=zD2nE6-3-Yk"
    }
  },
  dailyExercise: {
    topic: "Grammar",
    question: "Identify the error: 'The list of items are on the desk.'",
  }
};

// --- Mock Data for different timeframes ---

const MOCK_DATA_7_DAYS: DashboardData = {
  metadata: { timeframe: '7d' },
  overallStatus: { level: "Excellent", summary: "Great work this week! You aced your last assignment." },
  topStrengths: [{ topic: "Clarity", description: "Your writing is direct." }],
  mainWeaknesses: [], // No weaknesses this week
  recentScores: [{ assignmentId: 5, title: "Final Essay", score: 95, link: "#" }],
  improvementTrackingData: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      { label: "Overall Score", data: [80, 85, 88, 90, 95] },
    ]
  }
};

const MOCK_DATA_30_DAYS: DashboardData = {
  metadata: { timeframe: '30d' },
  overallStatus: { level: "Improving", summary: "You are showing consistent improvement in 'Grammar', but 'Structure' remains your main challenge." },
  topStrengths: [
    { topic: "Clarity", description: "Your writing is direct and easy to understand." },
    { topic: "Citation", description: "You consistently use APA formatting correctly." },
  ],
  mainWeaknesses: [WEAKNESS_STRUCTURE],
  recentScores: [
    { assignmentId: 5, title: "Final Essay", score: 95, link: "#" },
    { assignmentId: 4, title: "Midterm Essay", score: 85, link: "#" },
    { assignmentId: 3, title: "Weekly Report 5", score: 70, link: "#" }
  ],
  improvementTrackingData: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      { label: "Overall Score", data: [65, 70, 72, 85] },
      { label: "Grammar", data: [70, 75, 85, 90] },
      { label: "Structure", data: [60, 62, 60, 70] },
      { label: "Clarity", data: [80, 80, 85, 85] },
    ]
  }
};

const MOCK_DATA_ALL_TIME: DashboardData = {
  metadata: { timeframe: 'all' },
  overallStatus: { level: "Steady", summary: "You have a solid foundation but have struggled with 'Grammar' and 'Structure'." },
  topStrengths: [
    { topic: "Clarity", description: "Your writing is direct and easy to understand." },
    { topic: "Citation", description: "You consistently use APA formatting correctly." },
    { topic: "Vocabulary", description: "Good use of varied language." }
  ],
  mainWeaknesses: [WEAKNESS_STRUCTURE, WEAKNESS_GRAMMAR],
  recentScores: [
    { assignmentId: 5, title: "Final Essay", score: 95, link: "#" },
    { assignmentId: 4, title: "Midterm Essay", score: 85, link: "#" },
    { assignmentId: 3, title: "Weekly Report 5", score: 70, link: "#" },
    { assignmentId: 2, title: "Initial Proposal", score: 60, link: "#" },
  ],
  improvementTrackingData: {
    labels: ["Sept", "Oct", "Nov", "Dec"],
    datasets: [
      { label: "Overall Score", data: [62, 68, 75, 85] },
      { label: "Grammar", data: [50, 60, 70, 80] },
      { label: "Structure", data: [55, 60, 65, 70] },
      { label: "Clarity", data: [80, 80, 85, 85] },
      { label: "Vocabulary", data: [70, 75, 75, 80] },
    ]
  }
};


// --- Main Function to Export ---
export const mockFetchDashboardData = async (
  timeframe: '7d' | '30d' | 'all'
): Promise<DashboardData> => {
  await mockApiDelay();
  
  if (timeframe === '7d') {
    return MOCK_DATA_7_DAYS;
  }
  if (timeframe === '30d') {
    return MOCK_DATA_30_DAYS;
  }
  return MOCK_DATA_ALL_TIME;
};
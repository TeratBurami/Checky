import { AIAnalysis, AIResourceResponse } from "@/lib/types";

const mockApiDelay = () => new Promise((res) => setTimeout(res, Math.random() * 1000 + 400));


const allAnalyses: AIAnalysis[] = [
  {
    analysisId: "mock_abc123",
    primaryTopic: "grammar",
    summary: "Overall structure is good, but there are several key grammatical errors.",
    feedback: {
      goodPoints: [
        "Your sources are well-cited and credible.",
        "The narrative sequence is logical and easy to follow."
      ],
      areasForImprovement: [
        "Subject-Verb Agreement errors were found (e.g., 'The data show...' vs 'The data shows...').",
        "Several run-on sentences were detected; try breaking them up."
      ],
    },
  },
  {
    analysisId: "mock_def456",
    primaryTopic: "structure",
    summary: "Excellent grammar, but the paper's overall structure is weak.",
    feedback: {
      goodPoints: [
        "Vocabulary is varied and used accurately.",
        "Grammar and punctuation are nearly perfect."
      ],
      areasForImprovement: [
        "The introduction lacks a clear thesis statement.",
        "Transitions between paragraphs are abrupt and could be smoother.",
        "The conclusion merely repeats the introduction rather than synthesizing key points."
      ],
    },
  },
  {
    analysisId: "mock_ghi789",
    primaryTopic: "clarity",
    summary: "Strong arguments, but the message is lost due to unclear language.",
    feedback: {
      goodPoints: [
        "The core argument is original and well-researched.",
        "Good use of data to support claims."
      ],
      areasForImprovement: [
        "Overuse of passive voice makes sentences hard to read.",
        "Frequent use of jargon obscures the meaning.",
        "Some sentences are overly complex and should be simplified."
      ],
    },
  },
  {
    analysisId: "mock_jkl012",
    primaryTopic: "citation",
    summary: "The content is well-written, but major citation errors weaken its credibility.",
    feedback: {
      goodPoints: [
        "Clear writing style and good flow.",
        "Strong individual paragraphs."
      ],
      areasForImprovement: [
        "In-text citations do not match the works-cited list.",
        "Bibliography formatting is inconsistent (e.g., mixed APA and MLA).",
        "Some claims lack citations entirely."
      ],
    },
  }
];


const allResources = new Map<string, AIResourceResponse>([
  ["grammar", {
    topic: "grammar",
    suggestedResources: [
      { id: "res_g1", type: "video", title: "Subject-Verb Agreement | Grammar Rules", description: "A clear, concise video explaining the rules.", url: "https://www.youtube.com/watch?v=zD2nE6-3-Yk" },
      { id: "res_g2", type: "article", title: "Run-on Sentences and Sentence Fragments", description: "From the Purdue University Online Writing Lab (OWL).", url: "https://owl.purdue.edu/owl/general_writing/punctuation/run_ons/index.html" },
      { id: "res_g3", type: "exercise", title: "Quiz: Identifying Run-on Sentences", description: "A practical quiz from Khan Academy.", url: "https://www.khanacademy.org/humanities/grammar/syntax-conventions-of-standard-english/fragments-and-run-ons/e/fragments-and-run-ons" },
    ],
  }],
  ["structure", {
    topic: "structure",
    suggestedResources: [
      { id: "res_s1", type: "article", title: "Writing a Strong Thesis Statement", description: "Learn what makes a thesis statement effective (Purdue OWL).", url: "https://owl.purdue.edu/owl/general_writing/academic_writing/establishing_arguments/index.html" },
      { id: "res_s2", type: "video", title: "How to Write Perfect Paragraph Transitions", description: "A short video from Scribbr on using transition words.", url: "https://www.youtube.com/watch?v=Q-Fv-2-E8k4" },
      { id: "res_s3", type: "article", title: "Writing Effective Conclusions", description: "How to synthesize, not just summarize (UNC-Chapel Hill).", url: "https://writingcenter.unc.edu/tips-and-tools/conclusions/" },
    ],
  }],
  ["clarity", {
    topic: "clarity",
    suggestedResources: [
      { id: "res_c1", type: "article", title: "Active vs. Passive Voice", description: "Learn when and how to use active voice (Purdue OWL).", url: "https://owl.purdue.edu/owl/general_writing/academic_writing/active_and_passive_voice/index.html" },
      { id: "res_c2", type: "video", title: "How to Write Clearly (6 Simple Tips)", description: "A short video on improving writing clarity.", url: "https://www.youtube.com/watch?v=sQX-sFLctEI" },
      { id: "res_c3", type: "article", title: "Avoiding Jargon", description: "Tips on making your writing more accessible.", url: "https://www.nngroup.com/articles/plain-language-jargon/" },
    ],
  }],
  ["citation", {
    topic: "citation",
    suggestedResources: [
      { id: "res_ci1", type: "article", title: "APA 7th Edition Guide", description: "The official guide from Purdue OWL for APA formatting.", url: "https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/general_format.html" },
      { id: "res_ci2", type: "article", title: "MLA 9th Edition Guide", description: "The official guide from Purdue OWL for MLA formatting.", url: "https://owl.purdue.edu/owl/research_and_citation/mla_style/mla_formatting_and_style_guide/mla_general_format.html" },
      { id: "res_ci3", type: "video", title: "How to Avoid Plagiarism", description: "A quick guide on understanding and preventing plagiarism.", url: "https://www.youtube.com/watch?v=2q0NlWcTq1p" },
    ],
  }],
]);

export const mockFetchAnalysis = async (formData: FormData): Promise<AIAnalysis> => {
  await mockApiDelay();
  
  const randomIndex = Math.floor(Math.random() * allAnalyses.length);
  return allAnalyses[randomIndex];
};

export const mockFetchResources = async (topic: string): Promise<AIResourceResponse> => {
  await mockApiDelay();
  
  if (allResources.has(topic)) {
    return allResources.get(topic)!;
  }
  
  return {
    topic: "general",
    suggestedResources: [
      { id: "res_gen1", type: "article", title: "General Writing Tips", description: "Basic tips for academic writing.", url: "https://writingcenter.unc.edu/tips-and-tools/" }
    ]
  };
};
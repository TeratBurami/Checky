export interface JwtPayload {
  userid: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher";
  iat: number;
  exp: number;
}

export interface Course {
  classId: number;
  name: string;
  description: string;
  teacher: string;
  memberCount: number;
}

export interface Member {
  userId: number;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Rubric {
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

export interface SubmissionFile {
  file_id: number;
  filename: string;
  url: string;
}

export interface TeacherAttachmentFile {
  file_id: number;
  filename: string;
  url: string;
}

export interface MySubmission {
  submissionId: number;
  submittedAt: string;
  score: number | null;
  content: string | null;
  attachment: TeacherAttachmentFile[];
  teacherComment: string | null;
  peerReviewsReceived: any[];
}

export interface Assignment {
  assignmentId: number;
  title: string;
  description: string;
  createdAt: string;
  deadline: string;
  rubric: Rubric;
  mySubmission: MySubmission | null;
  submissions?: Submission[];
}

type ReviewStatus = "PENDING" | "COMPLETED";

export interface ReviewAssignment {
  reviewId: number;
  submissionId: number;
  reviewerId: number;
  comments: string;
  status: "PENDING" | "COMPLETED";
  reviewDeadline: string;
  createdAt: string;
  assignmentTitle?: string;
  className?: string;
}

export interface Submission {
  submissionId: number;
  studentInfo: {
    studentId: number;
    firstName: string;
    lastName: string;
  };
  content: string | null;
  attachment: TeacherAttachmentFile[];
  submittedAt: string;
  score: number | null;
  teacherComment: string | null;
}

export interface GradeSubmissionFile {
  file_id: number;
  filename: string;
  url: string;
}

export interface SubmissionDetail {
  submission_id: number;
  assignment_id: number;
  student_id: number;
  content: string | null;
  submitted_at: string;
  score: number | null;
  teacher_comment: string | null;
  files: GradeSubmissionFile[];
  studentInfo: {
    firstName: string;
    lastName: string;
  };
  assignmentInfo: {
    title: string;
  };
}

export interface RubricBrief {
  rubricId: number;
  name: string;
}

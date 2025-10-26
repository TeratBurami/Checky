export interface JwtPayload {
  userid: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher';
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

export interface Member{
    userId:number;
    firstName:string;
    lastName:string;
    role:string;
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

// export interface RubricCriterionLevel {
//   levelId: number;
//   levelName: string;
//   score: number;
//   description: string;
// }
// export interface RubricCriterion {
//   criterionId: number;
//   title: string;
//   levels: RubricCriterionLevel[];
// }
// export interface Rubric {
//   rubricId: number;
//   name: string;
//   criteria: RubricCriterion[];
// }

export interface SubmissionFile {
  file_id: string;
  filename: string;
  url: string;
}

export interface MySubmission {
  submission_id: string;
  submitted_at: string;
  score: number | null;
  content: string | null;
  files: SubmissionFile[];
}

export interface Assignment {
  assignmentId: number;
  title: string;
  description: string;
  createdAt: string;
  deadline: string;
  rubricId: number;
  rubric: Rubric;
  mySubmission: MySubmission | null;
  submissions?: Submission[];
}

export interface TeacherAttachmentFile {
  filename: string;
  url: string;
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
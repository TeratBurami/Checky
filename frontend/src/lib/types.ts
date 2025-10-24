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

export interface RubricCriterionLevel {
  levelId: number;
  levelName: string;
  score: number;
  description: string;
}
export interface RubricCriterion {
  criterionId: number;
  title: string;
  levels: RubricCriterionLevel[];
}
export interface Rubric {
  rubricId: number;
  name: string;
  criteria: RubricCriterion[];
}

export interface Assignment {
  assignmentId: number;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
  rubric: Rubric;
  submissions: Submission[];
}

export interface Submission {
  submissionId: string;
  studentInfo: {
    studentId: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  attachment: string[];
  submittedAt: string;
  score: number | null;
  teacherComment: string | null;
}
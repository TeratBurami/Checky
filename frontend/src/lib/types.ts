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


// (ปรับปรุง) ใช้ TeacherAttachmentFile ด้านล่างแทน
export interface SubmissionFile {
  file_id: number; // ID สำหรับลบ
  filename: string;
  url: string; // URL สำหรับดาวน์โหลด
}

// (ใหม่) Interface นี้ตรงกับ JSON ที่คุณได้สำหรับ 'attachment'
export interface TeacherAttachmentFile {
  file_id: number;
  filename: string;
  url: string; // ใน API response ของคุณ นี่คือ ID ของไฟล์
}

// (ปรับปรุง) แก้ไขให้ตรงกับ JSON response ที่คุณได้รับ
export interface MySubmission {
  submissionId: number; // แก้ไข: submission_id -> submissionId (number)
  submittedAt: string; // แก้ไข: submitted_at -> submittedAt
  score: number | null;
  content: string | null;
  attachment: TeacherAttachmentFile[]; // แก้ไข: files -> attachment
  teacherComment: string | null; // (เพิ่ม)
  peerReviewsReceived: any[]; // (เพิ่ม)
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

type ReviewStatus = 'PENDING' | 'COMPLETED';


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
  attachment: TeacherAttachmentFile[]; // (ใช้ซ้ำ)
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
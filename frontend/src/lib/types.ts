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
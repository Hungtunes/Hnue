// API Response Types

export interface LoginResponse {
  Id: string;
  FullName: string;
  Token: string;
  Role: string;
  Expire: string;
  Message: string | null;
}

export interface StudyProgram {
  StudentID: string;
  StudyProgramID: string;
  StudyProgramName: string;
  Type: number;
  CourseName: string;
}

export interface MarkSubject {
  StudyUnitID: string;
  CurriculumID: string;
  CurriculumName: string;
  Credits: string; 
  DiemTK_10: string;
  DiemTK_4: string;
  DiemTK_Chu: string;
  NamHoc: string; 
  HocKy: string; 
  NotComputeAverageScore: boolean; 
  IsPass: string | null; 
}

export interface SemesterMarks {
  HocKy: string; 
  DanhSachDiemHK: MarkSubject[];
}

export interface YearMarks {
  NamHoc: string; 
  DanhSachDiem: SemesterMarks[];
}

export type TranscriptResponse = YearMarks[];

// App Internal Types

export enum GradeLetter {
  F = 'F',
  D = 'D',
  D_PLUS = 'D+',
  C = 'C',
  C_PLUS = 'C+',
  B = 'B',
  B_PLUS = 'B+',
  A = 'A'
}

export interface GradeOption {
  label: string;
  value: number;
}

export const GRADE_OPTIONS: GradeOption[] = [
  { label: 'F', value: 0 },
  { label: 'D', value: 1.0 },
  { label: 'D+', value: 1.5 },
  { label: 'C', value: 2.0 },
  { label: 'C+', value: 2.5 },
  { label: 'B', value: 3.0 },
  { label: 'B+', value: 3.5 },
  { label: 'A', value: 4.0 },
];

export interface UserSession {
  username: string;
  fullName: string;
  token: string;
}
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
  Credits: string; // API returns string number
  DiemTK_10: string | null;
  DiemTK_4: string | null;
  DiemTK_Chu: string | null;
  NamHoc: string; // "1", "2" etc represents year index within course
  HocKy: string; // "1", "2"
  NotComputeAverageScore: boolean; // Important for CPA
  IsPass: string | null; // "1" is pass
}

export interface SemesterMarks {
  HocKy: string; // e.g., "HK01"
  DanhSachDiemHK: MarkSubject[];
}

export interface YearMarks {
  NamHoc: string; // e.g., "2024-2025"
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
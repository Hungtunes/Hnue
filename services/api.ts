import { LoginResponse, StudyProgram, TranscriptResponse } from '../types';

const BASE_URL = 'https://uisapi.hnue.edu.vn/api';

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/authenticate/authpsc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
  }

  return response.json();
};

export const getStudyProgram = async (token: string): Promise<StudyProgram[]> => {
  const response = await fetch(`${BASE_URL}/student/getstudyprogram`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể lấy thông tin chương trình đào tạo.');
  }

  return response.json();
};

export const getMarks = async (token: string, programId: string): Promise<TranscriptResponse> => {
  const response = await fetch(`${BASE_URL}/student/marks?ctdt=${programId}&loai=SV`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể lấy bảng điểm.');
  }

  return response.json();
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  email: string;
}
export interface Note {
  id: string;
  content: string;
  createdAt: string;
}
export interface Case {
  id: string;
  userId: string;
  courtName: string;
  parties: string;
  fileNumber: string;
  caseStatus: string;
  tarafAdi: string;
  notes: Note[];
}
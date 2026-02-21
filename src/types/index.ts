// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 페이지네이션
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

// 예약 상태
export type ReservationStatus = "pending" | "confirmed" | "cancelled";

// 일정 상태
export type ScheduleStatus = "upcoming" | "open" | "closed" | "completed";

// 관리자 역할
export type AdminRole = "admin" | "superadmin";

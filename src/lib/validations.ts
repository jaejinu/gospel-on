import { z } from "zod";

// 예약 신청 - 폼용 스키마 (클라이언트 검증, 개인 단위)
export const reservationSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
  affiliation: z.string().optional(),
  scheduleId: z.string().min(1, "일정을 선택해주세요"),
  participants: z.string().min(1, "참가 인원을 입력해주세요"),
  requestMessage: z.string().optional(),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

// 예약 신청 - API용 스키마 (서버 검증 + 변환)
export const reservationApiSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  affiliation: z.string().optional(),
  scheduleId: z.string().min(1),
  participants: z.coerce.number().int().positive("참가 인원을 입력해주세요"),
  requestMessage: z.string().optional(),
});

// 교회 스키마 (관리자용)
export const churchSchema = z.object({
  name: z.string().min(1, "교회명을 입력해주세요"),
  denomination: z.string().optional(),
  pastorName: z.string().optional(),
  contactName: z.string().min(1, "담당자 이름을 입력해주세요"),
  contactPhone: z.string().min(1, "연락처를 입력해주세요"),
  contactEmail: z.string().email("올바른 이메일을 입력해주세요").optional().or(z.literal("")),
  address: z.string().optional(),
  memberCount: z.string().optional(),
  notes: z.string().optional(),
});

export type ChurchFormData = z.infer<typeof churchSchema>;

// 일정 스키마 (관리자용)
export const scheduleSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  location: z.string().min(1, "장소를 입력해주세요"),
  startDate: z.string().min(1, "시작일을 선택해주세요"),
  endDate: z.string().min(1, "종료일을 선택해주세요"),
  capacity: z.string().min(1, "정원을 입력해주세요"),
  description: z.string().optional(),
  status: z.enum(["upcoming", "open", "closed", "completed"]),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

// 후원 스키마 (관리자용)
export const donationSchema = z.object({
  donor: z.string().min(1, "후원자명을 입력해주세요"),
  amount: z.string().min(1, "금액을 입력해주세요"),
  method: z.string().min(1, "후원 방법을 선택해주세요"),
  purpose: z.string().optional(),
  memo: z.string().optional(),
  donatedAt: z.string().min(1, "후원일을 선택해주세요"),
});

export type DonationFormData = z.infer<typeof donationSchema>;

// 갤러리 카테고리 스키마 (관리자용)
export const galleryCategorySchema = z.object({
  year: z.string().min(1, "년도를 선택해주세요"),
  half: z.enum(["FIRST", "SECOND"], { message: "반기를 선택해주세요" }),
});

export type GalleryCategoryFormData = z.infer<typeof galleryCategorySchema>;

// 프로그램(시간표) 스키마
export const programSchema = z.object({
  date: z.string().min(1, "날짜를 선택해주세요"),
  startTime: z.string().min(1, "시작 시간을 입력해주세요"),
  endTime: z.string().min(1, "종료 시간을 입력해주세요"),
  title: z.string().min(1, "프로그램명을 입력해주세요"),
  description: z.string().optional(),
  speaker: z.string().optional(),
  materials: z.string().optional(),
  sortOrder: z.string().optional(),
});

export type ProgramFormData = z.infer<typeof programSchema>;

export const programApiSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  speaker: z.string().optional(),
  materials: z.string().optional(),
  sortOrder: z.coerce.number().int().optional().default(0),
});

// 참가자 스키마
export const participantSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  age: z.string().optional(),
  grade: z.string().optional(),
  gender: z.string().optional(),
  church: z.string().optional(),
  phone: z.string().optional(),
  parentPhone: z.string().optional(),
  notes: z.string().optional(),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

export const participantApiSchema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().positive().optional().nullable(),
  grade: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  church: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  parentPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// 조 편성 스키마
export const teamSchema = z.object({
  name: z.string().min(1, "조 이름을 입력해주세요"),
  leaderId: z.string().optional().nullable(),
});

export type TeamFormData = z.infer<typeof teamSchema>;

// 피드백 스키마
export const feedbackSchema = z.object({
  participantName: z.string().min(1, "작성자명을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  rating: z.string().min(1, "평점을 선택해주세요"),
  isPublic: z.boolean().optional(),
  type: z.enum(["admin", "participant"]).optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

export const feedbackApiSchema = z.object({
  participantName: z.string().min(1),
  content: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  isPublic: z.boolean().optional().default(false),
  type: z.enum(["admin", "participant"]).optional().default("admin"),
});

// 관리자 로그인 스키마
export const loginSchema = z.object({
  loginId: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// 공지사항 스키마
export const noticeSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  isPinned: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type NoticeFormData = z.infer<typeof noticeSchema>;

// 사이트 설정 스키마
export const siteSettingsSchema = z.object({
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  account_info: z.string().optional(),
  site_description: z.string().optional(),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

// 공개 후기 작성 스키마 (비회원)
export const publicFeedbackSchema = z.object({
  participantName: z.string().min(1, "이름을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  rating: z.string().min(1, "평점을 선택해주세요"),
  password: z.string().min(4, "비밀번호를 4자 이상 입력해주세요"),
});

export type PublicFeedbackFormData = z.infer<typeof publicFeedbackSchema>;

// 예약 조회 스키마 (비회원)
export const reservationLookupSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
});

export type ReservationLookupFormData = z.infer<typeof reservationLookupSchema>;

// 일정 안전 정보 스키마 (관리자용)
export const scheduleInfoSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  location: z.string().min(1, "장소를 입력해주세요"),
  startDate: z.string().min(1, "시작일을 선택해주세요"),
  endDate: z.string().min(1, "종료일을 선택해주세요"),
  capacity: z.string().min(1, "정원을 입력해주세요"),
  description: z.string().optional(),
  status: z.enum(["upcoming", "open", "closed", "completed"]),
  emergencyContact: z.string().optional(),
  insuranceInfo: z.string().optional(),
  preparationList: z.string().optional(),
});

export type ScheduleInfoFormData = z.infer<typeof scheduleInfoSchema>;

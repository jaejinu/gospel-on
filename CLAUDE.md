# 복음온 (Gospel-On) 프로젝트

## 기술 스택
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + Framer Motion
- Prisma 7 + Neon PostgreSQL (`@prisma/adapter-pg`)
- NextAuth.js v5 (Credentials Provider, JWT 전략)
- Zod v4 + React Hook Form
- Recharts (관리자 대시보드 차트)

## 프로젝트 구조
```
src/
├── app/
│   ├── (public)/              # 사용자용 페이지 (Header/Footer/ScrollToTop 레이아웃)
│   │   ├── page.tsx               # 홈
│   │   ├── about/                 # 복음온이란
│   │   ├── gallery/               # 갤러리 (GalleryGrid 클라이언트 컴포넌트)
│   │   ├── archive/               # 수련회 아카이브 (히어로 배너 + FadeInView)
│   │   ├── notice/                # 공지사항 목록 + [id] 상세 (Breadcrumb)
│   │   ├── schedule/[id]/         # 일정 상세 (Breadcrumb + ScheduleDetail)
│   │   └── reservation/           # 예약 신청 + lookup/ 예약 조회
│   ├── admin/                 # 관리자 페이지 (Sidebar 레이아웃 + 인증 필수)
│   │   ├── page.tsx               # 대시보드 (통계 + 차트 + Skeleton 로딩)
│   │   ├── schedules/             # 일정 관리 (WAI-ARIA 탭 기반 상세)
│   │   ├── churches/              # 교회 관리 (수정 + 참가 이력)
│   │   ├── reservations/          # 예약 관리 (SkeletonTable 로딩)
│   │   ├── donations/             # 후원 관리 + report/ 연간 리포트
│   │   ├── gallery/               # 갤러리 관리
│   │   ├── notices/               # 공지사항 관리
│   │   ├── audit-logs/            # 활동 로그
│   │   ├── settings/              # 사이트 설정
│   │   └── login/                 # 로그인
│   ├── teacher/[token]/       # 교사용 페이지 (토큰 인증, 모바일 카드뷰)
│   ├── api/                   # API 라우트
│   ├── not-found.tsx          # 커스텀 404 페이지
│   ├── layout.tsx             # 루트 레이아웃 (메타데이터 + 폰트)
│   ├── globals.css            # Tailwind 테마 + 인쇄 스타일
│   └── icon.svg               # Favicon (십자가+G 심볼)
├── components/
│   ├── ui/                    # 공통 UI 컴포넌트
│   │   ├── Button.tsx, Input.tsx, Textarea.tsx, Select.tsx
│   │   ├── Modal.tsx              # 포커스 트랩 + ESC 닫기
│   │   ├── Toast.tsx              # 토스트 알림
│   │   ├── EmptyState.tsx         # 빈 상태 표시 (icon, title, description, action)
│   │   ├── Skeleton.tsx           # Skeleton, SkeletonCard, SkeletonTable
│   │   ├── ScrollToTop.tsx        # 스크롤 300px 이상 시 맨위 버튼
│   │   ├── Breadcrumb.tsx         # 시맨틱 breadcrumb 네비게이션
│   │   └── FadeInView.tsx         # whileInView 스크롤 진입 애니메이션
│   ├── layout/                # 레이아웃
│   │   ├── Header.tsx             # 수련회 드롭다운 메뉴 포함
│   │   ├── Footer.tsx
│   │   └── AdminSidebar.tsx       # 활성 인디케이터 (border-l-3)
│   ├── gallery/               # 갤러리 (GalleryGrid + 슬라이드쇼)
│   ├── schedule/              # 일정 상세 (ScheduleDetail)
│   └── admin/schedule/        # 일정 탭 컴포넌트 5개
├── lib/                       # 유틸리티 및 설정
│   ├── prisma.ts                  # Prisma 클라이언트 (PrismaPg 어댑터)
│   ├── auth.ts, auth.config.ts   # NextAuth 설정
│   ├── validations.ts            # Zod 스키마
│   ├── utils.ts                  # cn(), formatDate(), formatRelativeTime(), API 헬퍼
│   ├── gallery.ts                # 갤러리 유틸
│   ├── csv.ts                    # CSV 내보내기
│   ├── email.ts                  # 이메일 발송
│   └── audit.ts                  # 감사 로그
└── generated/prisma/          # Prisma 생성 클라이언트 (gitignore)
```

## DB 모델 (Prisma)
- **Admin** - 관리자 계정
- **Church** - 교회 정보
- **Schedule** - 수련회 일정 (programs, participants, teams, feedbacks 관계)
- **Reservation** - 예약 (Schedule 1:N)
- **Donation** - 후원
- **GalleryCategory / GalleryImage / GalleryLike** - 갤러리 + 좋아요
- **ScheduleProgram** - 수련회 프로그램 시간표
- **Participant** - 참가자 (Team 배정 가능)
- **Team** - 조 편성 (leader 1:1, members 1:N)
- **Feedback** - 피드백/후기 (rating 1-5, type: admin/participant)
- **SiteSetting** - 사이트 설정 (key-value)
- **Notice** - 공지사항 (isPinned, isPublic)
- **AuditLog** - 활동 로그
- **StatusHistory** - 상태 변경 이력 타임라인
- **TeacherToken** - 교사 접근 토큰 (만료일 기반)
- **Notification** - 알림 로그

## 개발 명령어
- `npm run dev` - 개발 서버 (Turbopack)
- `npm run build` - 프로덕션 빌드
- `npm run db:generate` - Prisma 클라이언트 생성
- `npm run db:migrate` - DB 마이그레이션
- `npm run db:push` - 스키마 DB에 직접 반영
- `npm run db:seed` - 시드 데이터 생성

## 주요 규칙

### Prisma 7
- `prisma.config.ts`에서 datasource URL 관리
- import: `import { PrismaClient } from "@/generated/prisma/client"`
- `@prisma/adapter-pg` 어댑터 사용 → `groupBy` 대신 JS 그룹핑 필수
- 스키마 변경 후 반드시: `rm -rf .next && npm run db:push && npm run db:generate`
- `.next` 캐시가 구 Prisma 클라이언트를 유지할 수 있으므로 캐시 삭제 필수

### API 패턴
- 응답: `{ success: boolean, data?: T, error?: string }` 형태 통일
- 관리자 인증: `auth()` 함수로 세션 체크 (모든 관리자 API에 적용)
- 에러 핸들링: try/catch + console.error + 적절한 HTTP 상태 코드
- API 헬퍼: `apiResponse(data, status)`, `apiError(message, status)` 사용

### Zod + React Hook Form
- 폼 스키마: 모든 필드 string (zodResolver 호환)
- API 스키마: `z.coerce.number()` 등 변환 처리
- 타입: `z.input<typeof schema>` 사용 시 입력 타입 기준

### 공개 사이트 디자인 시스템
- Primary: `#1e3a5f` (진한 파랑), Accent: `#d4a843` (골드)
- 배경: `bg-warm-bg` (#faf8f5), 텍스트: `text-foreground` (#1a1a1a)
- 카드: hover:-translate-y-1 떠오름 + active:scale-[0.98] 터치 피드백
- 스크롤 진입: FadeInView 컴포넌트 사용
- 빈 상태: EmptyState 컴포넌트 통일 사용
- 히어로 배너: bg-gradient-to-r from-primary to-primary-light 패턴

### 관리자 UI 디자인 시스템
아이보리 기반 골드 악센트 테마 (`globals.css` @theme inline):
- 배경: `bg-admin-bg` (#faf7f2), `bg-admin-bg-light` (#fdf9f4)
- 사이드바: `bg-admin-sidebar` (#2d2a26), 차콜 브라운, 활성 메뉴 `border-l-3 border-admin-accent`
- 카드: `bg-admin-card` (#fff), `border-admin-card-border` (#e8e4de)
- 악센트: `bg-admin-accent` (#c9a84c), 골드 계열
- 텍스트: `text-admin-text` (#2d2a26), `text-admin-text-muted` (#8b8578)
- 테이블 헤더: `bg-admin-table-header` (#f5f1eb)
- 로딩: Skeleton, SkeletonCard, SkeletonTable 사용 (텍스트 로딩 금지)
- 빈 상태: EmptyState 컴포넌트 (className에 admin 스타일 전달)

### 접근성 (a11y)
- 탭 UI: `role="tablist"`, `role="tab"` + `aria-selected`, `role="tabpanel"` + `aria-labelledby`
- Modal: 포커스 트랩 (Tab/Shift+Tab 순환), ESC 닫기, 이전 포커스 복원
- 좋아요 버튼: `aria-label` 동적 (좋아요/좋아요 취소)
- 별점 버튼: `aria-label={`${n}점`}`
- 색상 대비: text-white/90 이상 사용 (text-white/70 이하 금지)

### 일정 상세 페이지
`/admin/schedules/[id]` — 5개 탭 구성 (WAI-ARIA 패턴):
1. 기본 정보 (ScheduleInfoTab)
2. 프로그램 시간표 (ScheduleProgramsTab)
3. 참가자 관리 (ScheduleParticipantsTab)
4. 조 편성 (ScheduleTeamsTab)
5. 피드백 (ScheduleFeedbackTab)

### Header 네비게이션
- 데스크톱: 6개 메뉴 (홈, 복음온이란, 갤러리, 아카이브, 공지사항, 수련회▾)
- "수련회" 드롭다운 하위: 수련회 예약, 예약 조회
- 모바일: 클릭 시 확장형 메뉴

### SEO / 메타데이터
- 루트 레이아웃: `metadataBase`, `siteName: "복음온"`, `locale: "ko_KR"`
- 하위 페이지 openGraph 정의 시 `siteName`/`locale` 반드시 포함 (Next.js가 상위를 대체함)
- 동적 메타데이터: `generateMetadata` 사용 (notice/[id], schedule/[id])
- 정적 메타데이터: `export const metadata` (archive, gallery, reservation/lookup)

### 인쇄 스타일
- `globals.css`의 `@media print` 규칙으로 header/footer/nav 숨김
- Tailwind의 `print:hidden` 사용 불가 (Tailwind v4 CSS 파싱 에러)
- 대신 `data-print-hidden` 속성 + CSS `[data-print-hidden]` 셀렉터 사용

### 반응형
- Teacher 참가자: 모바일 카드형 (`md:hidden`) / 데스크톱 테이블 (`hidden md:block`)
- 관리자 사이드바: `lg:` 브레이크포인트 기준 슬라이드
- 그리드: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` 등 점진적 확대

### 환경변수
- `.env.local` - 로컬 환경변수
- `.env` - 공통 환경변수
- `.env.example` - 템플릿
- 필수: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

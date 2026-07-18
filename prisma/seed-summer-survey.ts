import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 여름수련회 설문만 생성/갱신하는 스크립트.
// 운영 DB에서는 전체 시드(seed.ts) 대신 반드시 이 스크립트를 사용할 것
// (seed.ts는 관리자 비밀번호/사이트 설정을 초기값으로 덮어씀).
// 실행: npx tsx prisma/seed-summer-survey.ts

const FEEDBACK_PARTS = [
  "저희 조를 소개합니다",
  "아브라함의 생애",
  "열매 ON",
  "믿음 ON",
  "찬양",
  "말씀",
  "식사",
  "숙소",
  "기타",
];

export async function seedSummerSurvey(prisma: PrismaClient) {
  const survey = await prisma.survey.upsert({
    where: { id: "summer-camp-survey-2026" },
    update: {},
    create: {
      id: "summer-camp-survey-2026",
      title: "2026 여름수련회(복음온) 설문조사",
      description:
        "여름수련회에 참여해주셔서 감사합니다! 더 나은 수련회를 위해 의견을 들려주세요.",
      status: "active",
      isPublic: true,
    },
  });

  const surveyQuestions = [
    { label: "이름", type: "text", isRequired: true, sortOrder: 0 },
    { label: "연락처", type: "text", isRequired: true, sortOrder: 1 },
    { label: "교회명", type: "text", isRequired: true, sortOrder: 2 },
    { label: "여름수련회(복음온)에 참여하게 된 계기는 무엇인가요?", type: "textarea", isRequired: true, sortOrder: 3 },
    { label: "수련회 중 좋았던 부분들은? (중복선택 가능)", type: "checkbox", isRequired: true, sortOrder: 4, options: JSON.stringify(FEEDBACK_PARTS) },
    { label: "좋았던 이유는?", type: "textarea", isRequired: true, sortOrder: 5 },
    { label: "수련회 중 아쉬웠던 부분들은? (중복선택 가능)", type: "checkbox", isRequired: true, sortOrder: 6, options: JSON.stringify(FEEDBACK_PARTS) },
    { label: "아쉬웠던 이유는?", type: "textarea", isRequired: true, sortOrder: 7 },
    { label: "27년도 겨울캠프를 참석하길 희망하시나요?", type: "radio", isRequired: true, sortOrder: 8, options: JSON.stringify(["예", "아니오"]) },
    { label: "선택한 이유는 무엇인가요?", type: "textarea", isRequired: true, sortOrder: 9 },
    { label: "겨울캠프를 하면 좋을 것 같은 날짜는 언제인가요? (시작 날짜)", type: "date", isRequired: true, sortOrder: 10 },
    { label: "하고 싶은 말", type: "textarea", isRequired: false, sortOrder: 11 },
  ];

  for (const q of surveyQuestions) {
    const questionId = `summer-camp-q-${q.sortOrder}`;
    await prisma.surveyQuestion.upsert({
      where: { id: questionId },
      update: {
        label: q.label,
        type: q.type,
        isRequired: q.isRequired,
        sortOrder: q.sortOrder,
        options: (q as { options?: string }).options || null,
      },
      create: {
        id: questionId,
        surveyId: survey.id,
        label: q.label,
        type: q.type,
        isRequired: q.isRequired,
        sortOrder: q.sortOrder,
        options: (q as { options?: string }).options || null,
      },
    });
  }

  console.log("여름수련회 설문조사가 생성되었습니다.");
  console.log(`설문 링크: /survey/${survey.id}`);
}

// 직접 실행 시에만 동작 (seed.ts에서 import할 때는 실행 안 됨)
if (process.argv[1]?.includes("seed-summer-survey")) {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  seedSummerSurvey(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

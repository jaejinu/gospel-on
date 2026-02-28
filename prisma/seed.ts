import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // 초기 관리자 계정 생성
  const hashedPassword = await bcrypt.hash("gospel123", 12);

  await prisma.admin.upsert({
    where: { loginId: "admin" },
    update: { password: hashedPassword },
    create: {
      loginId: "admin",
      email: "admin@gospelon.org",
      password: hashedPassword,
      name: "관리자",
      role: "superadmin",
    },
  });

  console.log("초기 관리자 계정이 생성되었습니다.");
  console.log("아이디: admin");
  console.log("비밀번호: gospel123");

  // 사이트 기본 설정
  const defaultSettings = [
    { key: "hero_title", value: "복음온", type: "text" },
    { key: "hero_subtitle", value: "엘림교회에서 진행하는 복음으로 하나 되는 수련회", type: "text" },
    { key: "contact_phone", value: "010-0000-0000", type: "text" },
    { key: "contact_email", value: "info@gospelon.org", type: "text" },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // 샘플 일정 데이터
  const schedule = await prisma.schedule.upsert({
    where: { id: "sample-schedule-1" },
    update: {},
    create: {
      id: "sample-schedule-1",
      title: "2026 여름 수련회",
      location: "강원도 속초",
      startDate: new Date("2026-07-20"),
      endDate: new Date("2026-07-23"),
      capacity: 100,
      description: "2026년 여름 수련회입니다. 많은 참여 부탁드립니다.",
      status: "open",
    },
  });

  await prisma.schedule.upsert({
    where: { id: "sample-schedule-2" },
    update: {},
    create: {
      id: "sample-schedule-2",
      title: "2026 가을 수련회",
      location: "경기도 양평",
      startDate: new Date("2026-10-10"),
      endDate: new Date("2026-10-12"),
      capacity: 80,
      description: "2026년 가을 수련회입니다.",
      status: "upcoming",
    },
  });

  // 샘플 교회 + 예약 데이터
  await prisma.church.upsert({
    where: { id: "sample-church-1" },
    update: {},
    create: {
      id: "sample-church-1",
      name: "서울중앙교회",
      denomination: "대한예수교장로회",
      pastorName: "김목사",
      contactName: "이집사",
      contactPhone: "010-1234-5678",
      contactEmail: "test@church.org",
      memberCount: 200,
    },
  });

  await prisma.reservation.upsert({
    where: { id: "sample-reservation-1" },
    update: {},
    create: {
      id: "sample-reservation-1",
      scheduleId: schedule.id,
      name: "이집사",
      phone: "010-1234-5678",
      affiliation: "서울중앙교회",
      participants: 3,
      requestMessage: "청소년부에서 참가합니다.",
      status: "pending",
    },
  });

  // 갤러리 카테고리 + 더미 이미지
  const galleryCategories = [
    { year: 2026, half: "SECOND", thumbnailUrl: "https://picsum.photos/id/10/800/600" },
    { year: 2026, half: "FIRST", thumbnailUrl: "https://picsum.photos/id/16/800/600" },
    { year: 2025, half: "SECOND", thumbnailUrl: "https://picsum.photos/id/21/800/600" },
    { year: 2025, half: "FIRST", thumbnailUrl: "https://picsum.photos/id/28/800/600" },
  ];

  // 자연/캠프 분위기 picsum ID
  const picsumIds = [
    [10, 11, 13, 14, 15],
    [16, 17, 18, 19, 20],
    [21, 22, 24, 25, 27],
    [28, 29, 36, 37, 39],
  ];

  for (let i = 0; i < galleryCategories.length; i++) {
    const catData = galleryCategories[i];
    const cat = await prisma.galleryCategory.upsert({
      where: { year_half: { year: catData.year, half: catData.half } },
      update: { thumbnailUrl: catData.thumbnailUrl },
      create: { year: catData.year, half: catData.half, thumbnailUrl: catData.thumbnailUrl },
    });

    for (let j = 0; j < picsumIds[i].length; j++) {
      const imgId = picsumIds[i][j];
      const imageId = `gallery-${catData.year}-${catData.half}-${j}`;
      await prisma.galleryImage.upsert({
        where: { id: imageId },
        update: {},
        create: {
          id: imageId,
          categoryId: cat.id,
          url: `https://picsum.photos/id/${imgId}/800/600`,
          caption: `수련회 활동 사진 ${j + 1}`,
          sortOrder: j,
        },
      });
    }
  }

  // 겨울캠프 설문조사
  const survey = await prisma.survey.upsert({
    where: { id: "winter-camp-survey-2026" },
    update: {},
    create: {
      id: "winter-camp-survey-2026",
      title: "2026 겨울캠프(복음온) 설문조사",
      description: "겨울캠프에 참여해주셔서 감사합니다! 더 나은 캠프를 위해 의견을 들려주세요.",
      status: "active",
      isPublic: true,
    },
  });

  const surveyQuestions = [
    { label: "이름", type: "text", isRequired: true, sortOrder: 0 },
    { label: "연락처", type: "text", isRequired: true, sortOrder: 1 },
    { label: "교회명", type: "text", isRequired: true, sortOrder: 2 },
    { label: "겨울캠프(복음온)에 참여하게 된 계기는 무엇인가요?", type: "textarea", isRequired: true, sortOrder: 3 },
    { label: "수련회 중 제일 좋았던 프로그램은?", type: "radio", isRequired: true, sortOrder: 4, options: JSON.stringify(["아이스브레이크(금 오전)", "코너학습(금 오후)", "레크레이션(토 오전)", "카드만들기(토 오후)"]) },
    { label: "좋았던 이유는?", type: "textarea", isRequired: true, sortOrder: 5 },
    { label: "수련회 중 아쉬웠던 프로그램은?", type: "radio", isRequired: true, sortOrder: 6, options: JSON.stringify(["아이스브레이크(금 오전)", "코너학습(금 오후)", "레크레이션(토 오전)", "카드만들기(토 오후)"]) },
    { label: "아쉬웠던 이유는?", type: "textarea", isRequired: true, sortOrder: 7 },
    { label: "26년도 여름 캠프를 참석하길 희망하시나요?", type: "radio", isRequired: true, sortOrder: 8, options: JSON.stringify(["예", "아니오"]) },
    { label: "선택한 이유는 무엇인가요?", type: "textarea", isRequired: true, sortOrder: 9 },
    { label: "하고 싶은 말", type: "textarea", isRequired: false, sortOrder: 10 },
  ];

  for (const q of surveyQuestions) {
    const questionId = `winter-camp-q-${q.sortOrder}`;
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

  console.log("겨울캠프 설문조사가 생성되었습니다.");
  console.log(`설문 링크: /survey/${survey.id}`);

  console.log("샘플 데이터가 생성되었습니다.");
  console.log("갤러리 카테고리 4개 + 더미 이미지 20개가 생성되었습니다.");
  console.log("사이트 기본 설정이 완료되었습니다.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

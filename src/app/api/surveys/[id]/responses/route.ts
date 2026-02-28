import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

// 설문 응답 제출
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { answers } = body as { answers: Record<string, string> };

    if (!answers || typeof answers !== "object") {
      return apiError("응답 데이터가 올바르지 않습니다.", 400);
    }

    // 설문 존재 + 활성 상태 확인
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!survey) {
      return apiError("설문을 찾을 수 없습니다.", 404);
    }

    if (survey.status !== "active") {
      return apiError("현재 진행 중인 설문이 아닙니다.", 403);
    }

    // 필수 질문 검증
    const requiredQuestions = survey.questions.filter((q) => q.isRequired);
    for (const q of requiredQuestions) {
      if (!answers[q.id] || answers[q.id].trim() === "") {
        return apiError(`"${q.label}" 항목을 입력해주세요.`, 400);
      }
    }

    // 응답 + 답변 생성
    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: id,
        answers: {
          create: Object.entries(answers)
            .filter(([, value]) => value.trim() !== "")
            .map(([questionId, value]) => ({
              questionId,
              value,
            })),
        },
      },
      include: { answers: true },
    });

    return apiResponse(response, 201);
  } catch (error) {
    console.error("설문 응답 제출 오류:", error);
    return apiError("응답 제출에 실패했습니다.", 500);
  }
}

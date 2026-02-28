import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

// 공개 설문 조회 (활성 상태만)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!survey) {
      return apiError("설문을 찾을 수 없습니다.", 404);
    }

    if (survey.status !== "active") {
      return apiError("현재 진행 중인 설문이 아닙니다.", 403);
    }

    return apiResponse(survey);
  } catch (error) {
    console.error("설문 조회 오류:", error);
    return apiError("설문 조회에 실패했습니다.", 500);
  }
}

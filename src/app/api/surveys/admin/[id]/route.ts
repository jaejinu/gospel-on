import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { generateCSV, csvResponse } from "@/lib/csv";

// 관리자 설문 상세 + CSV 내보내기
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return apiError("인증 필요", 401);
  }

  try {
    const { id } = await params;
    const url = new URL(request.url);
    const isExport = url.searchParams.get("export") === "csv";

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { sortOrder: "asc" } },
        responses: {
          orderBy: { createdAt: "desc" },
          include: {
            answers: {
              include: { question: true },
            },
          },
        },
      },
    });

    if (!survey) {
      return apiError("설문을 찾을 수 없습니다.", 404);
    }

    // CSV 내보내기
    if (isExport) {
      const headers = ["응답번호", "제출일시", ...survey.questions.map((q) => q.label)];
      const rows = survey.responses.map((res, idx) => {
        const answerMap = new Map(res.answers.map((a) => [a.questionId, a.value]));
        return [
          String(idx + 1),
          new Date(res.createdAt).toLocaleString("ko-KR"),
          ...survey.questions.map((q) => answerMap.get(q.id) || ""),
        ];
      });

      const filename = `survey-${survey.title}-${new Date().toISOString().slice(0, 10)}.csv`;
      return csvResponse(generateCSV(headers, rows), filename);
    }

    return apiResponse(survey);
  } catch (error) {
    console.error("설문 상세 조회 오류:", error);
    return apiError("설문 상세 조회에 실패했습니다.", 500);
  }
}

// 설문 상태 변경
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return apiError("인증 필요", 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status: string };

    if (!["draft", "active", "closed"].includes(status)) {
      return apiError("올바르지 않은 상태값입니다.", 400);
    }

    const survey = await prisma.survey.update({
      where: { id },
      data: { status },
    });

    return apiResponse(survey);
  } catch (error) {
    console.error("설문 상태 변경 오류:", error);
    return apiError("설문 상태 변경에 실패했습니다.", 500);
  }
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

// 관리자 설문 목록 조회
export async function GET() {
  const session = await auth();
  if (!session) {
    return apiError("인증 필요", 401);
  }

  try {
    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { responses: true, questions: true },
        },
      },
    });

    return apiResponse(surveys);
  } catch (error) {
    console.error("설문 목록 조회 오류:", error);
    return apiError("설문 목록 조회에 실패했습니다.", 500);
  }
}

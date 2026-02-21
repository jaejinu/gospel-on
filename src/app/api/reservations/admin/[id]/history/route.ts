import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 관리자 — 예약 상태 변경 이력 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const history = await prisma.statusHistory.findMany({
      where: { targetType: "reservation", targetId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("예약 이력 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "이력 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

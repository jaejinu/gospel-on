import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 공개 — 일정 상세 (프로그램 + 공개 후기 + 예약 수)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        programs: {
          orderBy: [{ date: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
        },
        feedbacks: {
          where: { isPublic: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "일정을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 예약 수 집계
    const reservationCount = await prisma.reservation.count({
      where: { scheduleId: id, status: "confirmed" },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...schedule,
        reservationCount,
      },
    });
  } catch (error) {
    console.error("일정 상세 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "일정을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

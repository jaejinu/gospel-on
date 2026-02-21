import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 공개 - 접수중인 일정 목록 조회
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { status: "open" },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        title: true,
        location: true,
        startDate: true,
        endDate: true,
        capacity: true,
        description: true,
        status: true,
        _count: {
          select: {
            reservations: {
              where: { status: { not: "cancelled" } },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    console.error("일정 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "일정을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 공개 — 수련회 아카이브 (완료된 일정, 연도별)
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { status: "completed" },
      orderBy: { startDate: "desc" },
      include: {
        _count: {
          select: {
            participants: true,
            feedbacks: true,
            reservations: true,
          },
        },
        feedbacks: {
          where: { isPublic: true },
          select: { rating: true },
        },
      },
    });

    // 연도별 그룹핑 + 평균 평점 계산
    const archiveByYear: Record<string, unknown[]> = {};
    for (const s of schedules) {
      const year = new Date(s.startDate).getFullYear().toString();
      if (!archiveByYear[year]) archiveByYear[year] = [];

      const ratings = s.feedbacks.map((f) => f.rating);
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

      archiveByYear[year].push({
        id: s.id,
        title: s.title,
        location: s.location,
        startDate: s.startDate,
        endDate: s.endDate,
        description: s.description,
        participantCount: s._count.participants,
        feedbackCount: s._count.feedbacks,
        reservationCount: s._count.reservations,
        avgRating,
      });
    }

    return NextResponse.json({
      success: true,
      data: archiveByYear,
    });
  } catch (error) {
    console.error("아카이브 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "아카이브를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

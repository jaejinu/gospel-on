import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 관리자 — 교회별 참가 이력
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

    const church = await prisma.church.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!church) {
      return NextResponse.json(
        { success: false, error: "교회를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 교회명으로 예약 이력 검색 (affiliation 매칭)
    const reservations = await prisma.reservation.findMany({
      where: {
        affiliation: { contains: church.name, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      include: {
        schedule: {
          select: { id: true, title: true, startDate: true, endDate: true, status: true },
        },
      },
    });

    // 참가자 이력 (church 필드 매칭)
    const participants = await prisma.participant.findMany({
      where: {
        church: { contains: church.name, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      include: {
        schedule: {
          select: { id: true, title: true, startDate: true },
        },
      },
    });

    // 일정별 통계
    const scheduleStats: Record<string, { title: string; startDate: Date; reservationCount: number; participantCount: number; totalParticipants: number }> = {};

    for (const r of reservations) {
      const sid = r.schedule.id;
      if (!scheduleStats[sid]) {
        scheduleStats[sid] = {
          title: r.schedule.title,
          startDate: r.schedule.startDate,
          reservationCount: 0,
          participantCount: 0,
          totalParticipants: 0,
        };
      }
      scheduleStats[sid].reservationCount += 1;
      scheduleStats[sid].totalParticipants += r.participants;
    }

    for (const p of participants) {
      const sid = p.schedule.id;
      if (!scheduleStats[sid]) {
        scheduleStats[sid] = {
          title: p.schedule.title,
          startDate: p.schedule.startDate,
          reservationCount: 0,
          participantCount: 0,
          totalParticipants: 0,
        };
      }
      scheduleStats[sid].participantCount += 1;
    }

    const history = Object.entries(scheduleStats)
      .map(([scheduleId, stats]) => ({ scheduleId, ...stats }))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return NextResponse.json({
      success: true,
      data: {
        church,
        history,
        summary: {
          totalSchedules: history.length,
          totalReservations: reservations.length,
          totalParticipants: participants.length,
        },
      },
    });
  } catch (error) {
    console.error("교회 참가 이력 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "이력 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 교사 토큰으로 일정/참가자 정보 조회 (인증 불필요)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const teacherToken = await prisma.teacherToken.findUnique({
      where: { token },
    });

    if (!teacherToken) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 링크입니다." },
        { status: 404 }
      );
    }

    if (new Date() > teacherToken.expiresAt) {
      return NextResponse.json(
        { success: false, error: "만료된 링크입니다." },
        { status: 410 }
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: teacherToken.scheduleId },
      select: {
        id: true,
        title: true,
        location: true,
        startDate: true,
        endDate: true,
        status: true,
        emergencyContact: true,
        programs: {
          orderBy: [{ date: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "일정을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 특정 조 또는 전체 참가자
    const participantWhere: Record<string, unknown> = {
      scheduleId: teacherToken.scheduleId,
    };
    if (teacherToken.teamId) {
      participantWhere.teamId = teacherToken.teamId;
    }

    const participants = await prisma.participant.findMany({
      where: participantWhere,
      orderBy: { name: "asc" },
      include: { team: { select: { id: true, name: true } } },
    });

    const teams = await prisma.team.findMany({
      where: { scheduleId: teacherToken.scheduleId },
      include: {
        leader: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        schedule,
        participants,
        teams,
        tokenLabel: teacherToken.label,
      },
    });
  } catch (error) {
    console.error("교사 페이지 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

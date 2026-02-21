import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCSV, csvResponse } from "@/lib/csv";

// 관리자용 - 전체 예약 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // CSV 내보내기
    if (searchParams.get("export") === "csv") {
      const status = searchParams.get("status");
      const scheduleId = searchParams.get("scheduleId");
      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (scheduleId) where.scheduleId = scheduleId;

      const reservations = await prisma.reservation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          schedule: { select: { title: true } },
        },
      });

      const headers = ["신청자", "연락처", "소속", "인원", "일정", "상태", "참가자생성", "신청일"];
      const statusLabel: Record<string, string> = { pending: "대기", confirmed: "확정", cancelled: "취소" };
      const rows = reservations.map((r) => [
        r.name,
        r.phone,
        r.affiliation || "",
        r.participants.toString(),
        r.schedule.title,
        statusLabel[r.status] || r.status,
        r.participantCreated ? "O" : "X",
        new Date(r.createdAt).toLocaleDateString("ko-KR"),
      ]);

      return csvResponse(generateCSV(headers, rows), "reservations.csv");
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const scheduleId = searchParams.get("scheduleId");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (scheduleId) where.scheduleId = scheduleId;

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          schedule: {
            select: {
              id: true,
              title: true,
              location: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
      }),
      prisma.reservation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reservations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("관리자 예약 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "예약 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

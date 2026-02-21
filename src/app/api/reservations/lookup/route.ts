import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 비회원 예약 조회 (이름 + 연락처)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "이름과 연락처를 입력해주세요." },
        { status: 400 }
      );
    }

    const reservations = await prisma.reservation.findMany({
      where: { name, phone },
      orderBy: { createdAt: "desc" },
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
    });

    return NextResponse.json({ success: true, data: reservations });
  } catch (error) {
    console.error("예약 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "예약 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

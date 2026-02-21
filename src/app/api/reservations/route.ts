import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservationApiSchema } from "@/lib/validations";

// 공개 - 예약 신청 (개인 단위)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = reservationApiSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "입력값을 확인해주세요.", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // 일정 존재 여부 및 상태 확인
    const schedule = await prisma.schedule.findUnique({
      where: { id: data.scheduleId },
    });

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "존재하지 않는 일정입니다." },
        { status: 404 }
      );
    }

    if (schedule.status !== "open") {
      return NextResponse.json(
        { success: false, error: "현재 접수 중인 일정이 아닙니다." },
        { status: 400 }
      );
    }

    // 예약 생성
    const reservation = await prisma.reservation.create({
      data: {
        scheduleId: data.scheduleId,
        name: data.name,
        phone: data.phone,
        affiliation: data.affiliation || null,
        participants: data.participants,
        requestMessage: data.requestMessage || null,
      },
    });

    return NextResponse.json(
      { success: true, data: { reservationId: reservation.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("예약 신청 오류:", error);
    return NextResponse.json(
      { success: false, error: "예약 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendNotification,
  getReservationConfirmedEmail,
  getReservationCancelledEmail,
} from "@/lib/email";
import { logAction, logStatusChange } from "@/lib/audit";

// 예약 상태 변경 (대기 → 확정/취소) + 참가자 자동 생성 + 이메일 발송
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 상태입니다." },
        { status: 400 }
      );
    }

    // 변경 전 상태 조회
    const prev = await prisma.reservation.findUnique({
      where: { id },
      select: { status: true },
    });

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status },
      include: {
        schedule: { select: { id: true, title: true } },
      },
    });

    // 활동 로그 + 상태 이력 기록
    const statusLabel: Record<string, string> = { pending: "대기", confirmed: "확정", cancelled: "취소" };
    await logAction({
      adminId: session.user?.id,
      adminName: session.user?.name || undefined,
      action: "status_change",
      target: "reservation",
      targetId: id,
      detail: `예약 상태 변경: ${statusLabel[prev?.status || ""]} → ${statusLabel[status]} (${reservation.name})`,
    });
    await logStatusChange({
      targetType: "reservation",
      targetId: id,
      fromStatus: prev?.status || undefined,
      toStatus: status,
      changedBy: session.user?.name || undefined,
    });

    // 확정 시: 참가자 자동 생성 (아직 생성되지 않은 경우)
    if (status === "confirmed" && !reservation.participantCreated) {
      await prisma.participant.create({
        data: {
          scheduleId: reservation.scheduleId,
          name: reservation.name,
          phone: reservation.phone,
          church: reservation.affiliation || null,
        },
      });

      await prisma.reservation.update({
        where: { id },
        data: { participantCreated: true },
      });
    }

    // 이메일 발송 (이메일이 있는 경우만)
    if (reservation.email) {
      const scheduleTitle = reservation.schedule.title;
      if (status === "confirmed") {
        await sendNotification({
          type: "reservation_confirmed",
          recipientEmail: reservation.email,
          subject: `[복음온] ${scheduleTitle} 예약이 확정되었습니다`,
          content: getReservationConfirmedEmail(reservation.name, scheduleTitle),
        });
      } else if (status === "cancelled") {
        await sendNotification({
          type: "reservation_cancelled",
          recipientEmail: reservation.email,
          subject: `[복음온] ${scheduleTitle} 예약이 취소되었습니다`,
          content: getReservationCancelledEmail(reservation.name, scheduleTitle),
        });
      }
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    console.error("예약 상태 변경 오류:", error);
    return NextResponse.json(
      { success: false, error: "예약 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 예약 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("예약 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "예약 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

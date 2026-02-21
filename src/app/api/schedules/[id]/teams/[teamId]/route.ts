import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 조 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { teamId } = await params;
    const body = await request.json();

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: body.name,
        leaderId: body.leaderId || null,
      },
    });

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("조 수정 오류:", error);
    return NextResponse.json({ success: false, error: "조 수정에 실패했습니다." }, { status: 500 });
  }
}

// 조 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { teamId } = await params;

    // 멤버들의 teamId를 null로 설정한 후 삭제
    await prisma.participant.updateMany({
      where: { teamId },
      data: { teamId: null },
    });

    await prisma.team.update({
      where: { id: teamId },
      data: { leaderId: null },
    });

    await prisma.team.delete({ where: { id: teamId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("조 삭제 오류:", error);
    return NextResponse.json({ success: false, error: "조 삭제에 실패했습니다." }, { status: 500 });
  }
}

// 멤버 배정 (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { teamId } = await params;
    const body = await request.json();
    const { participantIds } = body as { participantIds: string[] };

    if (!Array.isArray(participantIds)) {
      return NextResponse.json({ success: false, error: "참가자 ID 목록이 필요합니다." }, { status: 400 });
    }

    // 기존 멤버 해제
    await prisma.participant.updateMany({
      where: { teamId },
      data: { teamId: null },
    });

    // 새 멤버 배정
    if (participantIds.length > 0) {
      await prisma.participant.updateMany({
        where: { id: { in: participantIds } },
        data: { teamId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("멤버 배정 오류:", error);
    return NextResponse.json({ success: false, error: "멤버 배정에 실패했습니다." }, { status: 500 });
  }
}

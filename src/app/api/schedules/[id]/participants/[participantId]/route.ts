import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { participantApiSchema } from "@/lib/validations";

// 참가자 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { participantId } = await params;
    const body = await request.json();
    const parsed = participantApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "입력값을 확인해주세요." }, { status: 400 });
    }

    const participant = await prisma.participant.update({
      where: { id: participantId },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: participant });
  } catch (error) {
    console.error("참가자 수정 오류:", error);
    return NextResponse.json({ success: false, error: "참가자 수정에 실패했습니다." }, { status: 500 });
  }
}

// 참가자 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { participantId } = await params;
    await prisma.participant.delete({ where: { id: participantId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("참가자 삭제 오류:", error);
    return NextResponse.json({ success: false, error: "참가자 삭제에 실패했습니다." }, { status: 500 });
  }
}

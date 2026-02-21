import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackApiSchema } from "@/lib/validations";

// 피드백 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { feedbackId } = await params;
    const body = await request.json();
    const parsed = feedbackApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "입력값을 확인해주세요." }, { status: 400 });
    }

    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    console.error("피드백 수정 오류:", error);
    return NextResponse.json({ success: false, error: "피드백 수정에 실패했습니다." }, { status: 500 });
  }
}

// 피드백 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { feedbackId } = await params;
    await prisma.feedback.delete({ where: { id: feedbackId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("피드백 삭제 오류:", error);
    return NextResponse.json({ success: false, error: "피드백 삭제에 실패했습니다." }, { status: 500 });
  }
}

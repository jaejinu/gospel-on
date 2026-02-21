import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackApiSchema } from "@/lib/validations";

// 피드백 목록 조회 (타입 필터)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where = {
      scheduleId: id,
      ...(type ? { type } : {}),
    };

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: feedbacks });
  } catch (error) {
    console.error("피드백 조회 오류:", error);
    return NextResponse.json({ success: false, error: "피드백을 불러오는데 실패했습니다." }, { status: 500 });
  }
}

// 피드백 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = feedbackApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "입력값을 확인해주세요." }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        scheduleId: id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error("피드백 작성 오류:", error);
    return NextResponse.json({ success: false, error: "피드백 작성에 실패했습니다." }, { status: 500 });
  }
}

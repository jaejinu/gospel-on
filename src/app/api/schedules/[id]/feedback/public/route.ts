import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 공개 후기 작성 (비회원 — 비밀번호 해시 저장)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleId } = await params;
    const body = await request.json();
    const { participantName, content, rating, password } = body;

    if (!participantName || !content || !rating || !password) {
      return NextResponse.json(
        { success: false, error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, error: "비밀번호를 4자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, error: "평점은 1-5 사이로 선택해주세요." },
        { status: 400 }
      );
    }

    // 일정 존재 확인
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: { id: true },
    });

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "일정을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const feedback = await prisma.feedback.create({
      data: {
        scheduleId,
        participantName,
        content,
        rating: ratingNum,
        isPublic: true,
        type: "participant",
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error("공개 후기 작성 오류:", error);
    return NextResponse.json(
      { success: false, error: "후기 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}

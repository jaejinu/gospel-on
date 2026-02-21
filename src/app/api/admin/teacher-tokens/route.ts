import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// 관리자 — 교사 토큰 목록 조회
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const scheduleId = request.nextUrl.searchParams.get("scheduleId");
  const where = scheduleId ? { scheduleId } : {};

  try {
    const tokens = await prisma.teacherToken.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: tokens });
  } catch (error) {
    console.error("교사 토큰 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "토큰 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 관리자 — 교사 토큰 생성
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { scheduleId, teamId, label, expiresInDays } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: "일정을 선택해주세요." },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

    const teacherToken = await prisma.teacherToken.create({
      data: {
        token,
        scheduleId,
        teamId: teamId || null,
        label: label || null,
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, data: teacherToken }, { status: 201 });
  } catch (error) {
    console.error("교사 토큰 생성 오류:", error);
    return NextResponse.json(
      { success: false, error: "토큰 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

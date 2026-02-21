import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 관리자 — 사이트 설정 일괄 업데이트
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { settings } = body as { settings: { key: string; value: string }[] };

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, error: "올바른 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 각 설정을 upsert
    for (const { key, value } of settings) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("사이트 설정 업데이트 오류:", error);
    return NextResponse.json(
      { success: false, error: "설정 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}

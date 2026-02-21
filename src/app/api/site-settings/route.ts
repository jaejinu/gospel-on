import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 공개 — 전체 사이트 설정 조회 (key-value 객체)
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const data: Record<string, string> = {};
    for (const s of settings) {
      data[s.key] = s.value;
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("사이트 설정 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "설정을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

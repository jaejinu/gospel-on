import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 관리자 — 활동 로그 조회
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const target = searchParams.get("target");
  const action = searchParams.get("action");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (target) where.target = target;
  if (action) where.action = action;

  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("활동 로그 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "활동 로그를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

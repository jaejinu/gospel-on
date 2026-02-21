import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 공개 — 공지사항 목록 (isPublic만, 페이지네이션)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = { isPublic: true };

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.notice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("공지사항 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "공지사항을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 관리자 — 공지사항 생성
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, isPinned, isPublic } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "제목과 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        isPinned: isPinned ?? false,
        isPublic: isPublic ?? true,
      },
    });

    return NextResponse.json({ success: true, data: notice }, { status: 201 });
  } catch (error) {
    console.error("공지사항 생성 오류:", error);
    return NextResponse.json(
      { success: false, error: "공지사항 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

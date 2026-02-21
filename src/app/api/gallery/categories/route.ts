import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 카테고리 목록 조회 (공개) - 년도 내림차순, 하반기 먼저
export async function GET() {
  try {
    const categories = await prisma.galleryCategory.findMany({
      orderBy: [{ year: "desc" }, { half: "desc" }],
      include: {
        _count: { select: { images: true } },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("갤러리 카테고리 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "카테고리를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 카테고리 수정 (관리자) - 썸네일 등
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, thumbnailUrl } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "카테고리 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const category = await prisma.galleryCategory.update({
      where: { id },
      data: { thumbnailUrl: thumbnailUrl || null },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("카테고리 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "카테고리 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 카테고리 생성 (관리자) - year + half
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const year = parseInt(body.year);
    const half = body.half;

    if (!year || !["FIRST", "SECOND"].includes(half)) {
      return NextResponse.json(
        { success: false, error: "년도와 반기를 올바르게 입력해주세요." },
        { status: 400 }
      );
    }

    const thumbnailUrl = body.thumbnailUrl || null;

    const category = await prisma.galleryCategory.create({
      data: { year, half, thumbnailUrl },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("카테고리 생성 오류:", error);
    const message = (error as Error).message?.includes("Unique")
      ? "이미 존재하는 카테고리입니다."
      : "카테고리 생성에 실패했습니다.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

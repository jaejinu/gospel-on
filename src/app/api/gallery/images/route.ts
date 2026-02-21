import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 이미지 목록 조회 (공개, 카테고리별 필터)
export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get("categoryId");
    const where = categoryId ? { categoryId } : {};

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        category: { select: { id: true, year: true, half: true } },
      },
    });

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    console.error("갤러리 이미지 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "이미지를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 이미지 등록 (관리자)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const image = await prisma.galleryImage.create({
      data: {
        categoryId: body.categoryId,
        url: body.url,
        caption: body.caption || null,
        sortOrder: body.sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error) {
    console.error("이미지 등록 오류:", error);
    return NextResponse.json(
      { success: false, error: "이미지 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 이미지 삭제 (관리자)
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await prisma.galleryImage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("이미지 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "이미지 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

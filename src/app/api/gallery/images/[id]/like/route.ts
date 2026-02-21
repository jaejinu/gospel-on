import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 갤러리 이미지 좋아요 토글 (비회원)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: imageId } = await params;
    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "visitorId가 필요합니다." },
        { status: 400 }
      );
    }

    // 이미 좋아요한 경우 → 취소
    const existing = await prisma.galleryLike.findUnique({
      where: { imageId_visitorId: { imageId, visitorId } },
    });

    if (existing) {
      await prisma.galleryLike.delete({
        where: { id: existing.id },
      });
      await prisma.galleryImage.update({
        where: { id: imageId },
        data: { likeCount: { decrement: 1 } },
      });
      return NextResponse.json({ success: true, data: { liked: false } });
    }

    // 좋아요 추가
    await prisma.galleryLike.create({
      data: { imageId, visitorId },
    });
    await prisma.galleryImage.update({
      where: { id: imageId },
      data: { likeCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: { liked: true } });
  } catch (error) {
    console.error("좋아요 처리 오류:", error);
    return NextResponse.json(
      { success: false, error: "좋아요 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}

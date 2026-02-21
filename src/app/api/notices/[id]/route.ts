import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 공개 — 공지사항 상세
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notice = await prisma.notice.findUnique({ where: { id } });

    if (!notice) {
      return NextResponse.json(
        { success: false, error: "공지사항을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error("공지사항 상세 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "공지사항을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 관리자 — 공지사항 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, content, isPinned, isPublic } = body;

    const notice = await prisma.notice.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error("공지사항 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "공지사항 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 관리자 — 공지사항 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.notice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("공지사항 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "공지사항 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 교회 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const { id } = await params;
  const church = await prisma.church.findUnique({
    where: { id },
  });

  if (!church) {
    return NextResponse.json({ success: false, error: "교회를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: church });
}

// 교회 수정
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

    const church = await prisma.church.update({
      where: { id },
      data: {
        name: body.name,
        denomination: body.denomination || null,
        pastorName: body.pastorName || null,
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail || null,
        address: body.address || null,
        memberCount: body.memberCount ? Number(body.memberCount) : null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: church });
  } catch (error) {
    console.error("교회 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "교회 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 교회 삭제
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
    await prisma.church.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("교회 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "교회 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

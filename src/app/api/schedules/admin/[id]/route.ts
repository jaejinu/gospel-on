import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 일정 수정
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

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        title: body.title,
        location: body.location,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        capacity: Number(body.capacity),
        description: body.description || null,
        status: body.status,
        emergencyContact: body.emergencyContact || null,
        insuranceInfo: body.insuranceInfo || null,
        preparationList: body.preparationList || null,
      },
    });

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error("일정 수정 오류:", error);
    return NextResponse.json(
      { success: false, error: "일정 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 일정 삭제
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
    await prisma.schedule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("일정 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "일정 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

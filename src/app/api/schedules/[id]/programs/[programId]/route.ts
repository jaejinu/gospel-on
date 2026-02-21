import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { programApiSchema } from "@/lib/validations";

// 프로그램 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { programId } = await params;
    const body = await request.json();
    const parsed = programApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "입력값을 확인해주세요." }, { status: 400 });
    }

    const { date, ...rest } = parsed.data;
    const program = await prisma.scheduleProgram.update({
      where: { id: programId },
      data: {
        date: new Date(date),
        ...rest,
      },
    });

    return NextResponse.json({ success: true, data: program });
  } catch (error) {
    console.error("프로그램 수정 오류:", error);
    return NextResponse.json({ success: false, error: "프로그램 수정에 실패했습니다." }, { status: 500 });
  }
}

// 프로그램 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { programId } = await params;
    await prisma.scheduleProgram.delete({ where: { id: programId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("프로그램 삭제 오류:", error);
    return NextResponse.json({ success: false, error: "프로그램 삭제에 실패했습니다." }, { status: 500 });
  }
}

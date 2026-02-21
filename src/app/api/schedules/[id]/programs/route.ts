import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { programApiSchema } from "@/lib/validations";

// 프로그램 목록 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;

    const programs = await prisma.scheduleProgram.findMany({
      where: { scheduleId: id },
      orderBy: [{ date: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    console.error("프로그램 조회 오류:", error);
    return NextResponse.json({ success: false, error: "프로그램을 불러오는데 실패했습니다." }, { status: 500 });
  }
}

// 프로그램 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = programApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "입력값을 확인해주세요." }, { status: 400 });
    }

    const { date, ...rest } = parsed.data;
    const program = await prisma.scheduleProgram.create({
      data: {
        scheduleId: id,
        date: new Date(date),
        ...rest,
      },
    });

    return NextResponse.json({ success: true, data: program }, { status: 201 });
  } catch (error) {
    console.error("프로그램 생성 오류:", error);
    return NextResponse.json({ success: false, error: "프로그램 생성에 실패했습니다." }, { status: 500 });
  }
}

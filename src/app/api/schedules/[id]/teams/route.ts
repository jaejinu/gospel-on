import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teamSchema } from "@/lib/validations";

// 조 목록 조회 (멤버 포함)
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

    const teams = await prisma.team.findMany({
      where: { scheduleId: id },
      orderBy: { createdAt: "asc" },
      include: {
        leader: { select: { id: true, name: true } },
        members: { select: { id: true, name: true, church: true, gender: true } },
      },
    });

    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    console.error("조 조회 오류:", error);
    return NextResponse.json({ success: false, error: "조를 불러오는데 실패했습니다." }, { status: 500 });
  }
}

// 조 생성
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
    const parsed = teamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "조 이름을 입력해주세요." }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        scheduleId: id,
        name: parsed.data.name,
        leaderId: parsed.data.leaderId || null,
      },
    });

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    console.error("조 생성 오류:", error);
    return NextResponse.json({ success: false, error: "조 생성에 실패했습니다." }, { status: 500 });
  }
}

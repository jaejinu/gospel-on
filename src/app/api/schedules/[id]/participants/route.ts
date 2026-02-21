import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { participantApiSchema } from "@/lib/validations";
import { generateCSV, csvResponse } from "@/lib/csv";

// 참가자 목록 조회 (검색 + 페이지네이션)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // CSV 내보내기
    if (searchParams.get("export") === "csv") {
      const participants = await prisma.participant.findMany({
        where: { scheduleId: id },
        orderBy: { createdAt: "desc" },
        include: { team: { select: { name: true } } },
      });

      const headers = ["이름", "나이", "성별", "학년", "교회", "연락처", "보호자연락처", "조", "비고"];
      const rows = participants.map((p) => [
        p.name,
        p.age?.toString() || "",
        p.gender || "",
        p.grade || "",
        p.church || "",
        p.phone || "",
        p.parentPhone || "",
        p.team?.name || "",
        p.notes || "",
      ]);

      return csvResponse(generateCSV(headers, rows), "participants.csv");
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = {
      scheduleId: id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { church: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [participants, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { team: { select: { id: true, name: true } } },
      }),
      prisma.participant.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        participants,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("참가자 조회 오류:", error);
    return NextResponse.json({ success: false, error: "참가자를 불러오는데 실패했습니다." }, { status: 500 });
  }
}

// 참가자 등록
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
    const parsed = participantApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "입력값을 확인해주세요." }, { status: 400 });
    }

    const participant = await prisma.participant.create({
      data: {
        scheduleId: id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ success: true, data: participant }, { status: 201 });
  } catch (error) {
    console.error("참가자 등록 오류:", error);
    return NextResponse.json({ success: false, error: "참가자 등록에 실패했습니다." }, { status: 500 });
  }
}

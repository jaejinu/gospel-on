import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 관리자용 - 전체 일정 목록 조회 (페이지네이션, status 필터)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    // status 필터 조건 구성
    const where = status ? { status } : {};

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        orderBy: { startDate: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              reservations: {
                where: { status: { not: "cancelled" } },
              },
            },
          },
        },
      }),
      prisma.schedule.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        schedules,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("관리자 일정 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "일정을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 관리자용 - 새 일정 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, location, startDate, endDate, capacity, description, status } = body;

    // 필수 필드 검증
    if (!title || !location || !startDate || !endDate || !capacity) {
      return NextResponse.json(
        { success: false, error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 날짜 유효성 검증 - 종료일이 시작일보다 이후여야 함
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "종료일은 시작일보다 이후여야 합니다." },
        { status: 400 }
      );
    }

    // 정원 유효성 검증
    if (typeof capacity !== "number" || capacity < 1) {
      return NextResponse.json(
        { success: false, error: "정원은 1 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        title,
        location,
        startDate: start,
        endDate: end,
        capacity,
        description: description || null,
        status: status || "upcoming",
      },
    });

    return NextResponse.json(
      { success: true, data: schedule },
      { status: 201 }
    );
  } catch (error) {
    console.error("일정 생성 오류:", error);
    return NextResponse.json(
      { success: false, error: "일정 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

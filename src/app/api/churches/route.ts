import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 교회 목록 조회
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { contactName: { contains: search, mode: "insensitive" as const } },
          { contactPhone: { contains: search } },
        ],
      }
    : {};

  const [churches, total] = await Promise.all([
    prisma.church.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.church.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      items: churches,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// 교회 등록
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const church = await prisma.church.create({
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

    return NextResponse.json({ success: true, data: church }, { status: 201 });
  } catch (error) {
    console.error("교회 등록 오류:", error);
    return NextResponse.json(
      { success: false, error: "교회 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}

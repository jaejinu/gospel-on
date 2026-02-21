import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCSV, csvResponse } from "@/lib/csv";

// 후원 목록 조회
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;

  // CSV 내보내기
  if (searchParams.get("export") === "csv") {
    const method = searchParams.get("method");
    const where = method ? { method } : {};

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { donatedAt: "desc" },
    });

    const headers = ["후원자", "금액", "방법", "용도", "메모", "후원일"];
    const rows = donations.map((d) => [
      d.donor,
      d.amount.toString(),
      d.method,
      d.purpose || "",
      d.memo || "",
      new Date(d.donatedAt).toLocaleDateString("ko-KR"),
    ]);

    return csvResponse(generateCSV(headers, rows), "donations.csv");
  }

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const method = searchParams.get("method");

  const where = method ? { method } : {};

  const [donations, total, summary] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { donatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.donation.count({ where }),
    prisma.donation.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      items: donations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalCount: summary._count,
      },
    },
  });
}

// 후원 등록
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const donation = await prisma.donation.create({
      data: {
        donor: body.donor,
        amount: Number(body.amount),
        method: body.method,
        purpose: body.purpose || null,
        memo: body.memo || null,
        donatedAt: body.donatedAt ? new Date(body.donatedAt) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: donation }, { status: 201 });
  } catch (error) {
    console.error("후원 등록 오류:", error);
    return NextResponse.json(
      { success: false, error: "후원 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 관리자 — 후원 연간 리포트
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  const year = parseInt(request.nextUrl.searchParams.get("year") || new Date().getFullYear().toString());

  try {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const donations = await prisma.donation.findMany({
      where: {
        donatedAt: { gte: startOfYear, lt: endOfYear },
      },
      orderBy: { donatedAt: "asc" },
    });

    // 월별 집계
    const monthly: { month: number; count: number; amount: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const monthDonations = donations.filter(
        (d) => new Date(d.donatedAt).getMonth() === m
      );
      monthly.push({
        month: m + 1,
        count: monthDonations.length,
        amount: monthDonations.reduce((sum, d) => sum + d.amount, 0),
      });
    }

    // 방법별 집계
    const byMethod: Record<string, { count: number; amount: number }> = {};
    for (const d of donations) {
      if (!byMethod[d.method]) byMethod[d.method] = { count: 0, amount: 0 };
      byMethod[d.method].count += 1;
      byMethod[d.method].amount += d.amount;
    }

    // 후원자 랭킹 (금액 기준)
    const byDonor: Record<string, { count: number; amount: number }> = {};
    for (const d of donations) {
      if (!byDonor[d.donor]) byDonor[d.donor] = { count: 0, amount: 0 };
      byDonor[d.donor].count += 1;
      byDonor[d.donor].amount += d.amount;
    }
    const donorRanking = Object.entries(byDonor)
      .map(([donor, stats]) => ({ donor, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // 전년도 비교
    const prevYearStart = new Date(year - 1, 0, 1);
    const prevYearEnd = new Date(year, 0, 1);
    const prevDonations = await prisma.donation.aggregate({
      where: { donatedAt: { gte: prevYearStart, lt: prevYearEnd } },
      _sum: { amount: true },
      _count: true,
    });

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const prevTotalAmount = prevDonations._sum.amount || 0;

    return NextResponse.json({
      success: true,
      data: {
        year,
        summary: {
          totalAmount,
          totalCount: donations.length,
          prevYearAmount: prevTotalAmount,
          prevYearCount: prevDonations._count,
          changeRate: prevTotalAmount > 0
            ? Math.round(((totalAmount - prevTotalAmount) / prevTotalAmount) * 100)
            : null,
        },
        monthly,
        byMethod: Object.entries(byMethod).map(([method, stats]) => ({ method, ...stats })),
        donorRanking,
      },
    });
  } catch (error) {
    console.error("후원 리포트 오류:", error);
    return NextResponse.json(
      { success: false, error: "리포트 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    // 기본 통계
    const [churchCount, reservationCount, scheduleCount, donationSum, participantCount] =
      await Promise.all([
        prisma.church.count(),
        prisma.reservation.count(),
        prisma.schedule.count({ where: { status: "open" } }),
        prisma.donation.aggregate({ _sum: { amount: true } }),
        prisma.participant.count(),
      ]);

    // 월별 예약 추이 (최근 6개월) - JS 그룹핑
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentReservations = await prisma.reservation.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const monthlyReservations: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyReservations[key] = 0;
    }
    recentReservations.forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyReservations) {
        monthlyReservations[key]++;
      }
    });

    const monthlyChart = Object.entries(monthlyReservations).map(([month, count]) => ({
      month: month.slice(5) + "월",
      count,
    }));

    // 교회별 참가 현황 (상위 10) - groupBy 대신 JS 그룹핑
    let churchChart: { church: string; count: number }[] = [];
    try {
      const allParticipants = await prisma.participant.findMany({
        where: { church: { not: null } },
        select: { church: true },
      });
      const churchMap: Record<string, number> = {};
      allParticipants.forEach((p) => {
        const ch = p.church || "미지정";
        churchMap[ch] = (churchMap[ch] || 0) + 1;
      });
      churchChart = Object.entries(churchMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([church, count]) => ({ church, count }));
    } catch (e) {
      console.error("교회별 참가 현황 조회 실패:", e);
    }

    // 다가오는 일정 (3개)
    const upcomingSchedules = await prisma.schedule.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 3,
      include: {
        _count: { select: { reservations: { where: { status: { not: "cancelled" } } } } },
      },
    });

    // 최근 예약 (5건)
    const latestReservations = await prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { schedule: { select: { title: true } } },
    });

    // 전년 동기 대비 통계
    const now = new Date();
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const prevYearSameDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const [thisYearReservations, prevYearReservations, thisYearDonations, prevYearDonations, thisYearParticipants, prevYearParticipants] =
      await Promise.all([
        prisma.reservation.count({ where: { createdAt: { gte: thisYearStart } } }),
        prisma.reservation.count({ where: { createdAt: { gte: prevYearStart, lt: prevYearSameDate } } }),
        prisma.donation.aggregate({ where: { donatedAt: { gte: thisYearStart } }, _sum: { amount: true } }),
        prisma.donation.aggregate({ where: { donatedAt: { gte: prevYearStart, lt: prevYearSameDate } }, _sum: { amount: true } }),
        prisma.participant.count({ where: { createdAt: { gte: thisYearStart } } }),
        prisma.participant.count({ where: { createdAt: { gte: prevYearStart, lt: prevYearSameDate } } }),
      ]);

    const comparison = {
      reservations: {
        current: thisYearReservations,
        previous: prevYearReservations,
        changeRate: prevYearReservations > 0
          ? Math.round(((thisYearReservations - prevYearReservations) / prevYearReservations) * 100)
          : null,
      },
      donations: {
        current: thisYearDonations._sum.amount || 0,
        previous: prevYearDonations._sum.amount || 0,
        changeRate: (prevYearDonations._sum.amount || 0) > 0
          ? Math.round((((thisYearDonations._sum.amount || 0) - (prevYearDonations._sum.amount || 0)) / (prevYearDonations._sum.amount || 1)) * 100)
          : null,
      },
      participants: {
        current: thisYearParticipants,
        previous: prevYearParticipants,
        changeRate: prevYearParticipants > 0
          ? Math.round(((thisYearParticipants - prevYearParticipants) / prevYearParticipants) * 100)
          : null,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          churchCount,
          reservationCount,
          scheduleCount,
          totalDonation: donationSum._sum.amount || 0,
          participantCount,
        },
        monthlyChart,
        churchChart,
        upcomingSchedules,
        latestReservations,
        comparison,
      },
    });
  } catch (error) {
    console.error("대시보드 데이터 조회 오류:", error);
    const message = error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

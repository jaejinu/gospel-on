import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import FadeInView from "@/components/ui/FadeInView";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "아카이브 | 복음온",
  description: "복음온 수련회의 지난 기록을 만나보세요. 참가 후기와 사진을 확인할 수 있습니다.",
  openGraph: {
    title: "아카이브 | 복음온",
    description: "지난 수련회의 기록을 만나보세요.",
    siteName: "복음온",
    locale: "ko_KR",
  },
};

export default async function ArchivePage() {
  const schedules = await prisma.schedule.findMany({
    where: { status: "completed" },
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: { participants: true, feedbacks: true },
      },
      feedbacks: {
        where: { isPublic: true },
        select: { rating: true },
      },
    },
  });

  // 연도별 그룹핑
  const byYear: Record<string, typeof schedules> = {};
  for (const s of schedules) {
    const year = new Date(s.startDate).getFullYear().toString();
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(s);
  }

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });

  return (
    <>
      {/* 히어로 배너 */}
      <section className="relative h-48 sm:h-56 flex items-center justify-center overflow-hidden bg-gradient-to-r from-primary to-primary-light">
        <div className="relative text-center text-white z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">수련회 아카이브</h1>
          <p className="text-white/90">지난 수련회의 기록을 만나보세요.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        {Object.keys(byYear).length > 0 ? (
          <div className="space-y-10">
            {Object.entries(byYear)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, items]) => (
                <section key={year}>
                  <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                    {year}년
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((s, i) => {
                      const ratings = s.feedbacks.map((f) => f.rating);
                      const avgRating = ratings.length > 0
                        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                        : null;

                      return (
                        <FadeInView key={s.id} delay={i * 0.05}>
                          <Link
                            href={`/schedule/${s.id}`}
                            className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-border/50 active:scale-[0.98]"
                          >
                            <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                            <div className="text-sm text-muted space-y-1">
                              <p>{s.location}</p>
                              <p>{formatDate(s.startDate)} ~ {formatDate(s.endDate)}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                              <span className="text-xs text-muted">
                                참가자 {s._count.participants}명
                              </span>
                              <span className="text-xs text-muted">
                                후기 {s._count.feedbacks}개
                              </span>
                              {avgRating && (
                                <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {avgRating}
                                </span>
                              )}
                            </div>
                          </Link>
                        </FadeInView>
                      );
                    })}
                  </div>
                </section>
              ))}
          </div>
        ) : (
          <EmptyState
            title="아직 완료된 수련회가 없습니다"
            description="수련회가 완료되면 아카이브에 기록됩니다."
          />
        )}
      </section>
    </>
  );
}

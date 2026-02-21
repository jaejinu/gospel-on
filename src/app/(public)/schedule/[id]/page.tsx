import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ScheduleDetail from "@/components/schedule/ScheduleDetail";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    select: { title: true, description: true, location: true },
  });

  if (!schedule) return { title: "일정 | 복음온" };

  const desc = schedule.description || `${schedule.location}에서 진행되는 수련회`;

  return {
    title: `${schedule.title} | 복음온`,
    description: desc.slice(0, 160),
    openGraph: {
      title: schedule.title,
      description: desc.slice(0, 160),
      siteName: "복음온",
      locale: "ko_KR",
    },
  };
}

export default async function ScheduleDetailPage({ params }: Props) {
  const { id } = await params;

  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      programs: {
        orderBy: [{ date: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
      },
      feedbacks: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!schedule) {
    notFound();
  }

  const reservationCount = await prisma.reservation.count({
    where: { scheduleId: id, status: "confirmed" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8">
      <Breadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: "아카이브", href: "/archive" },
          { label: schedule.title },
        ]}
      />
      <ScheduleDetail schedule={schedule} reservationCount={reservationCount} />
    </div>
  );
}

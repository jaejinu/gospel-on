import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const notice = await prisma.notice.findUnique({
    where: { id },
    select: { title: true, content: true },
  });

  if (!notice) return { title: "공지사항 | 복음온" };

  return {
    title: `${notice.title} | 복음온`,
    description: notice.content.slice(0, 160),
    openGraph: {
      title: notice.title,
      description: notice.content.slice(0, 160),
      siteName: "복음온",
      locale: "ko_KR",
    },
  };
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;

  const notice = await prisma.notice.findUnique({
    where: { id },
  });

  if (!notice || !notice.isPublic) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Breadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: "공지사항", href: "/notice" },
          { label: notice.title },
        ]}
      />

      <article className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            {notice.isPinned && (
              <span className="inline-block px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-medium">
                고정
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{notice.title}</h1>
          <p className="text-sm text-muted">
            {new Date(notice.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
          {notice.content}
        </div>
      </article>
    </div>
  );
}

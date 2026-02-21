import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";
import FadeInView from "@/components/ui/FadeInView";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function NoticePage() {
  const notices = await prisma.notice.findMany({
    where: { isPublic: true },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">공지사항</h1>

      {notices.length > 0 ? (
        <div className="space-y-4">
          {notices.map((notice, i) => (
            <FadeInView key={notice.id} delay={i * 0.03}>
              <Link
                href={`/notice/${notice.id}`}
                className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-border/50 active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  {notice.isPinned && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-medium mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      고정
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-foreground mb-1 truncate">
                      {notice.title}
                    </h2>
                    <p className="text-sm text-muted line-clamp-2">
                      {notice.content}
                    </p>
                    <p className="text-xs text-muted mt-2">
                      {new Date(notice.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {" · "}
                      {formatRelativeTime(notice.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            </FadeInView>
          ))}
        </div>
      ) : (
        <EmptyState
          title="등록된 공지사항이 없습니다"
          description="새로운 공지사항이 등록되면 여기에 표시됩니다."
        />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface AuditLog {
  id: string;
  adminName: string | null;
  action: string;
  target: string;
  targetId: string | null;
  detail: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  create: "생성",
  update: "수정",
  delete: "삭제",
  status_change: "상태변경",
};

const TARGET_LABELS: Record<string, string> = {
  reservation: "예약",
  schedule: "일정",
  participant: "참가자",
  church: "교회",
  donation: "후원",
  notice: "공지사항",
  feedback: "피드백",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [targetFilter, setTargetFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (targetFilter) params.set("target", targetFilter);

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const result = await res.json();
      if (result.success) {
        setLogs(result.data.logs);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch {
      toast("활동 로그를 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, targetFilter, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-admin-text mb-6">활동 로그</h1>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: "", label: "전체" },
          { value: "reservation", label: "예약" },
          { value: "schedule", label: "일정" },
          { value: "participant", label: "참가자" },
          { value: "church", label: "교회" },
          { value: "donation", label: "후원" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setTargetFilter(opt.value); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              targetFilter === opt.value
                ? "bg-admin-accent text-white"
                : "bg-admin-bg-light text-admin-text-muted hover:bg-admin-card-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-table-header">
              <tr>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">시간</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">관리자</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">행동</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">대상</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-admin-text-muted text-sm">로딩 중...</td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-admin-bg-light">
                    <td className="px-6 py-3 text-xs text-admin-text-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("ko-KR")}
                    </td>
                    <td className="px-6 py-3 text-sm text-admin-text">
                      {log.adminName || "시스템"}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="inline-block px-2 py-0.5 rounded bg-admin-accent/10 text-admin-accent text-xs">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-admin-text">
                      {TARGET_LABELS[log.target] || log.target}
                    </td>
                    <td className="px-6 py-3 text-sm text-admin-text-muted max-w-md truncate">
                      {log.detail || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-admin-text-muted text-sm">활동 로그가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-admin-card-border">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>이전</Button>
            <span className="text-sm text-admin-text-muted">{page} / {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>다음</Button>
          </div>
        )}
      </div>
    </div>
  );
}

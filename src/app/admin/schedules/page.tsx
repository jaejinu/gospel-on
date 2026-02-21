"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Schedule {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: string;
  _count: { reservations: number };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  upcoming: { label: "예정", color: "bg-blue-100 text-blue-800" },
  open: { label: "접수중", color: "bg-green-100 text-green-800" },
  closed: { label: "마감", color: "bg-gray-100 text-gray-800" },
  completed: { label: "완료", color: "bg-purple-100 text-purple-800" },
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/schedules/admin?${params}`);
      const result = await res.json();
      if (result.success) {
        setSchedules(result.data.schedules);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch {
      toast("일정 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, toast]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' 일정을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/schedules/admin/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast("일정이 삭제되었습니다.", "success");
        fetchSchedules();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("삭제에 실패했습니다.", "error");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-admin-text">일정 관리</h1>
        <Link href="/admin/schedules/new">
          <Button>일정 등록</Button>
        </Link>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        {[
          { value: "", label: "전체" },
          { value: "upcoming", label: "예정" },
          { value: "open", label: "접수중" },
          { value: "closed", label: "마감" },
          { value: "completed", label: "완료" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              statusFilter === opt.value
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
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">제목</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">장소</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">기간</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">예약/정원</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">상태</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-admin-text-muted text-sm">로딩 중...</td>
                </tr>
              ) : schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-admin-bg-light">
                    <td className="px-6 py-4 text-sm font-medium text-admin-text">{schedule.title}</td>
                    <td className="px-6 py-4 text-sm text-admin-text-muted">{schedule.location}</td>
                    <td className="px-6 py-4 text-sm text-admin-text">
                      {formatDate(schedule.startDate)} ~ {formatDate(schedule.endDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-admin-text">
                      {schedule._count.reservations} / {schedule.capacity}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusLabels[schedule.status]?.color || ""}`}>
                        {statusLabels[schedule.status]?.label || schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/schedules/${schedule.id}`}>
                          <Button variant="ghost" size="sm">상세</Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(schedule.id, schedule.title)}>
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-admin-text-muted text-sm">등록된 일정이 없습니다.</td>
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

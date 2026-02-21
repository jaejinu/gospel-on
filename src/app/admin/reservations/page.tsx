"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { SkeletonTable } from "@/components/ui/Skeleton";

interface Reservation {
  id: string;
  name: string;
  phone: string;
  affiliation: string | null;
  participants: number;
  requestMessage: string | null;
  status: string;
  participantCreated: boolean;
  createdAt: string;
  schedule: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
}

interface HistoryEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  note: string | null;
  changedAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "확정", color: "bg-green-100 text-green-800" },
  cancelled: { label: "취소", color: "bg-red-100 text-red-800" },
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [historyModal, setHistoryModal] = useState<{ open: boolean; name: string; entries: HistoryEntry[] }>({ open: false, name: "", entries: [] });
  const { toast } = useToast();

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/reservations/admin?${params}`);
      const result = await res.json();
      if (result.success) {
        setReservations(result.data.reservations);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch {
      toast("예약 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, toast]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const actionLabel = newStatus === "confirmed" ? "확정" : "취소";
    if (!confirm(`이 예약을 ${actionLabel}하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/reservations/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        toast(`예약이 ${actionLabel}되었습니다.`, "success");
        fetchReservations();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("상태 변경에 실패했습니다.", "error");
    }
  };

  const fetchHistory = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/reservations/admin/${id}/history`);
      const result = await res.json();
      if (result.success) {
        setHistoryModal({ open: true, name, entries: result.data });
      } else {
        toast("히스토리를 불러올 수 없습니다.", "error");
      }
    } catch {
      toast("히스토리 조회에 실패했습니다.", "error");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-admin-text">예약 관리</h1>
        <Button
          variant="secondary"
          onClick={() => {
            const params = new URLSearchParams({ export: "csv" });
            if (statusFilter) params.set("status", statusFilter);
            window.location.href = `/api/reservations/admin?${params}`;
          }}
        >
          CSV 내보내기
        </Button>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        {[
          { value: "", label: "전체" },
          { value: "pending", label: "대기" },
          { value: "confirmed", label: "확정" },
          { value: "cancelled", label: "취소" },
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
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">신청자</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">일정</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">연락처</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">인원</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">상태</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">신청일</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <SkeletonTable rows={5} cols={7} className="border-0 shadow-none rounded-none" />
                  </td>
                </tr>
              ) : reservations.length > 0 ? (
                reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-admin-bg-light">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-admin-text">{r.name}</div>
                      {r.affiliation && <div className="text-xs text-admin-text-muted">{r.affiliation}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-admin-text">{r.schedule.title}</div>
                      <div className="text-xs text-admin-text-muted">
                        {formatDate(r.schedule.startDate)} ~ {formatDate(r.schedule.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-admin-text">{r.phone}</td>
                    <td className="px-6 py-4 text-sm text-admin-text">{r.participants}명</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusMap[r.status]?.color || ""}`}>
                        {statusMap[r.status]?.label || r.status}
                      </span>
                      {r.participantCreated && (
                        <span className="inline-block ml-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">
                          참가자
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-admin-text-muted">
                      {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {r.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => handleStatusChange(r.id, "confirmed")}>
                              확정
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleStatusChange(r.id, "cancelled")}>
                              취소
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => fetchHistory(r.id, r.name)}>
                          이력
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-admin-text-muted text-sm">예약이 없습니다.</td>
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

      {/* 히스토리 모달 */}
      <Modal
        isOpen={historyModal.open}
        onClose={() => setHistoryModal({ open: false, name: "", entries: [] })}
        title={`${historyModal.name} 예약 히스토리`}
      >
        {historyModal.entries.length > 0 ? (
          <div className="space-y-3">
            {historyModal.entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 border-l-2 border-admin-accent/30 pl-4 py-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${statusMap[entry.fromStatus]?.color || "bg-gray-100"}`}>
                      {statusMap[entry.fromStatus]?.label || entry.fromStatus}
                    </span>
                    <span className="text-admin-text-muted">&rarr;</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${statusMap[entry.toStatus]?.color || "bg-gray-100"}`}>
                      {statusMap[entry.toStatus]?.label || entry.toStatus}
                    </span>
                  </div>
                  <p className="text-xs text-admin-text-muted mt-1">
                    {entry.changedBy} | {formatDateTime(entry.changedAt)}
                  </p>
                  {entry.note && <p className="text-xs text-admin-text mt-1">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-admin-text-muted text-sm py-4">상태 변경 이력이 없습니다.</p>
        )}
      </Modal>
    </div>
  );
}

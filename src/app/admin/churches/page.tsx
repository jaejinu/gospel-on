"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Church {
  id: string;
  name: string;
  denomination: string | null;
  pastorName: string | null;
  contactName: string;
  contactPhone: string;
  memberCount: number | null;
  createdAt: string;
}

export default function ChurchesPage() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchChurches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/churches?page=${page}&limit=10&search=${search}`);
      const result = await res.json();
      if (result.success) {
        setChurches(result.data.items);
        setTotal(result.data.total);
      }
    } catch {
      toast("교회 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`'${name}' 교회를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/churches/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast("교회가 삭제되었습니다.", "success");
        fetchChurches();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("삭제에 실패했습니다.", "error");
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-admin-text">교회 관리</h1>
        <Link href="/admin/churches/new">
          <Button>교회 등록</Button>
        </Link>
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="교회명, 담당자, 연락처로 검색..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-admin-card-border rounded-lg text-sm bg-admin-card focus:outline-none focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent"
        />
      </div>

      {/* 테이블 */}
      <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-table-header">
              <tr>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">교회명</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">교단</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">담당자</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">연락처</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">교인 수</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">등록일</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-admin-text-muted text-sm">
                    로딩 중...
                  </td>
                </tr>
              ) : churches.length > 0 ? (
                churches.map((church) => (
                  <tr key={church.id} className="hover:bg-admin-bg-light">
                    <td className="px-6 py-4 text-sm font-medium text-admin-text">{church.name}</td>
                    <td className="px-6 py-4 text-sm text-admin-text-muted">{church.denomination || "-"}</td>
                    <td className="px-6 py-4 text-sm text-admin-text">{church.contactName}</td>
                    <td className="px-6 py-4 text-sm text-admin-text">{church.contactPhone}</td>
                    <td className="px-6 py-4 text-sm text-admin-text">{church.memberCount || "-"}</td>
                    <td className="px-6 py-4 text-sm text-admin-text-muted">
                      {new Date(church.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/churches/${church.id}`}>
                          <Button variant="ghost" size="sm">수정</Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(church.id, church.name)}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-admin-text-muted text-sm">
                    등록된 교회가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
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

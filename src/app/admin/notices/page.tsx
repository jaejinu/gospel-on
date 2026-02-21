"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { noticeSchema, type NoticeFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface Notice {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isPublic: boolean;
  createdAt: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: { isPinned: false, isPublic: true },
  });

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    try {
      // 관리자용: 전체 조회 (isPublic 필터 없이, 관리자 세션으로 접근)
      const res = await fetch(`/api/notices?page=${page}&limit=10`);
      const result = await res.json();
      if (result.success) {
        setNotices(result.data.notices);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch {
      toast("공지사항 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const openCreateModal = () => {
    setEditingNotice(null);
    reset({ title: "", content: "", isPinned: false, isPublic: true });
    setIsModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    reset({
      title: notice.title,
      content: notice.content,
      isPinned: notice.isPinned,
      isPublic: notice.isPublic,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: NoticeFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingNotice ? `/api/notices/${editingNotice.id}` : "/api/notices";
      const method = editingNotice ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast(editingNotice ? "공지사항이 수정되었습니다." : "공지사항이 등록되었습니다.", "success");
        setIsModalOpen(false);
        fetchNotices();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("저장에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' 공지사항을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast("공지사항이 삭제되었습니다.", "success");
        fetchNotices();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("삭제에 실패했습니다.", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-admin-text">공지사항 관리</h1>
        <Button onClick={openCreateModal}>공지사항 작성</Button>
      </div>

      <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-table-header">
              <tr>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">제목</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">공개</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">고정</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">작성일</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-admin-text-muted text-sm">로딩 중...</td>
                </tr>
              ) : notices.length > 0 ? (
                notices.map((n) => (
                  <tr key={n.id} className="hover:bg-admin-bg-light">
                    <td className="px-6 py-4 text-sm font-medium text-admin-text">
                      {n.isPinned && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-admin-accent/10 text-admin-accent text-xs mr-2">고정</span>
                      )}
                      {n.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        n.isPublic ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {n.isPublic ? "공개" : "비공개"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-admin-text-muted">
                      {n.isPinned ? "O" : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-admin-text-muted">
                      {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(n)}>수정</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(n.id, n.title)}>삭제</Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-admin-text-muted text-sm">공지사항이 없습니다.</td>
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

      {/* 작성/수정 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNotice ? "공지사항 수정" : "공지사항 작성"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="제목 *" id="notice-title" error={errors.title?.message} {...register("title")} />
          <Textarea label="내용 *" id="notice-content" rows={8} error={errors.content?.message} {...register("content")} />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-admin-text cursor-pointer">
              <input
                type="checkbox"
                checked={watch("isPublic") ?? true}
                onChange={(e) => setValue("isPublic", e.target.checked)}
                className="rounded border-admin-card-border"
              />
              공개
            </label>
            <label className="flex items-center gap-2 text-sm text-admin-text cursor-pointer">
              <input
                type="checkbox"
                checked={watch("isPinned") ?? false}
                onChange={(e) => setValue("isPinned", e.target.checked)}
                className="rounded border-admin-card-border"
              />
              상단 고정
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

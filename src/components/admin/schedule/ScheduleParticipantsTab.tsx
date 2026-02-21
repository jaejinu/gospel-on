"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { participantSchema, type ParticipantFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface Participant {
  id: string;
  name: string;
  age: number | null;
  grade: string | null;
  gender: string | null;
  church: string | null;
  phone: string | null;
  parentPhone: string | null;
  notes: string | null;
  team: { id: string; name: string } | null;
}

interface Props {
  scheduleId: string;
}

export default function ScheduleParticipantsTab({ scheduleId }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
  });

  const fetchParticipants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/schedules/${scheduleId}/participants?${params}`);
      const result = await res.json();
      if (result.success) {
        setParticipants(result.data.participants);
        setTotalPages(result.data.pagination.totalPages);
        setTotal(result.data.pagination.total);
      }
    } catch {
      toast("참가자 로딩 실패", "error");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, page, search, toast]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const openCreateModal = () => {
    setEditingParticipant(null);
    reset({ name: "", age: "", grade: "", gender: "", church: "", phone: "", parentPhone: "", notes: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Participant) => {
    setEditingParticipant(p);
    reset({
      name: p.name,
      age: p.age?.toString() || "",
      grade: p.grade || "",
      gender: p.gender || "",
      church: p.church || "",
      phone: p.phone || "",
      parentPhone: p.parentPhone || "",
      notes: p.notes || "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ParticipantFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        age: data.age ? Number(data.age) : null,
        gender: data.gender || null,
        grade: data.grade || null,
        church: data.church || null,
        phone: data.phone || null,
        parentPhone: data.parentPhone || null,
        notes: data.notes || null,
      };

      const url = editingParticipant
        ? `/api/schedules/${scheduleId}/participants/${editingParticipant.id}`
        : `/api/schedules/${scheduleId}/participants`;
      const method = editingParticipant ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        toast(editingParticipant ? "참가자가 수정되었습니다." : "참가자가 등록되었습니다.", "success");
        setIsModalOpen(false);
        fetchParticipants();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("저장에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`'${name}' 참가자를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/participants/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast("참가자가 삭제되었습니다.", "success");
        fetchParticipants();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("삭제에 실패했습니다.", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-admin-text">
          참가자 <span className="text-admin-text-muted font-normal text-sm">({total}명)</span>
        </h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => window.location.href = `/api/schedules/${scheduleId}/participants?export=csv`}
          >
            CSV 내보내기
          </Button>
          <Button onClick={openCreateModal}>참가자 등록</Button>
        </div>
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="이름, 교회, 연락처로 검색..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md px-4 py-2 border border-admin-card-border rounded-lg text-sm bg-admin-card focus:outline-none focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent"
        />
      </div>

      {/* 테이블 */}
      <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-table-header">
              <tr>
                <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">이름</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">나이</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">성별</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">교회</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">연락처</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">조</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-admin-text-muted text-sm">로딩 중...</td>
                </tr>
              ) : participants.length > 0 ? (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-admin-bg-light">
                    <td className="px-5 py-3 text-sm font-medium text-admin-text">{p.name}</td>
                    <td className="px-5 py-3 text-sm text-admin-text-muted">{p.age || "-"}</td>
                    <td className="px-5 py-3 text-sm text-admin-text-muted">{p.gender || "-"}</td>
                    <td className="px-5 py-3 text-sm text-admin-text-muted">{p.church || "-"}</td>
                    <td className="px-5 py-3 text-sm text-admin-text-muted">{p.phone || "-"}</td>
                    <td className="px-5 py-3 text-sm">
                      {p.team ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-admin-accent/10 text-admin-accent text-xs">
                          {p.team.name}
                        </span>
                      ) : (
                        <span className="text-admin-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(p)}>수정</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(p.id, p.name)}>삭제</Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-admin-text-muted text-sm">
                    등록된 참가자가 없습니다.
                  </td>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingParticipant ? "참가자 수정" : "참가자 등록"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="이름 *" id="part-name" error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="나이" id="age" type="number" {...register("age")} />
            <Select
              label="성별"
              id="gender"
              options={[
                { value: "", label: "선택" },
                { value: "남", label: "남" },
                { value: "여", label: "여" },
              ]}
              {...register("gender")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="학년" id="grade" {...register("grade")} />
            <Input label="교회" id="church" {...register("church")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="연락처" id="phone" {...register("phone")} />
            <Input label="보호자 연락처" id="parentPhone" {...register("parentPhone")} />
          </div>
          <Textarea label="비고" id="part-notes" {...register("notes")} />
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

"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programSchema, type ProgramFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface Program {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string | null;
  speaker: string | null;
  materials: string | null;
  sortOrder: number;
}

interface Props {
  scheduleId: string;
  schedule: { startDate: string; endDate: string };
}

export default function ScheduleProgramsTab({ scheduleId, schedule }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
  });

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/programs`);
      const result = await res.json();
      if (result.success) setPrograms(result.data);
    } catch {
      toast("프로그램 목록 로딩 실패", "error");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, toast]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const openCreateModal = () => {
    setEditingProgram(null);
    reset({
      date: new Date(schedule.startDate).toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      title: "",
      description: "",
      speaker: "",
      materials: "",
      sortOrder: "0",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    reset({
      date: new Date(program.date).toISOString().split("T")[0],
      startTime: program.startTime,
      endTime: program.endTime,
      title: program.title,
      description: program.description || "",
      speaker: program.speaker || "",
      materials: program.materials || "",
      sortOrder: program.sortOrder.toString(),
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingProgram
        ? `/api/schedules/${scheduleId}/programs/${editingProgram.id}`
        : `/api/schedules/${scheduleId}/programs`;
      const method = editingProgram ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast(editingProgram ? "프로그램이 수정되었습니다." : "프로그램이 추가되었습니다.", "success");
        setIsModalOpen(false);
        fetchPrograms();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("저장에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 프로그램을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/programs/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast("프로그램이 삭제되었습니다.", "success");
        fetchPrograms();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("삭제에 실패했습니다.", "error");
    }
  };

  // 날짜별 그룹핑
  const grouped = programs.reduce<Record<string, Program[]>>((acc, p) => {
    const dateKey = new Date(p.date).toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-admin-text">시간표</h2>
        <Button onClick={openCreateModal}>프로그램 추가</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-admin-text-muted">로딩 중...</div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-admin-accent mb-3">
                  {new Date(date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}
                </h3>
                <div className="space-y-2">
                  {items.map((p) => (
                    <div
                      key={p.id}
                      className="bg-admin-card rounded-lg border border-admin-card-border p-4 flex items-start justify-between gap-4"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="text-sm font-mono text-admin-accent whitespace-nowrap pt-0.5">
                          {p.startTime} - {p.endTime}
                        </div>
                        <div>
                          <div className="font-medium text-admin-text">{p.title}</div>
                          {p.speaker && (
                            <div className="text-xs text-admin-text-muted mt-0.5">강사: {p.speaker}</div>
                          )}
                          {p.description && (
                            <div className="text-sm text-admin-text-muted mt-1">{p.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(p)}>수정</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>삭제</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-admin-card rounded-xl border border-admin-card-border p-12 text-center text-admin-text-muted">
          등록된 프로그램이 없습니다.
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProgram ? "프로그램 수정" : "프로그램 추가"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="날짜 *" id="prog-date" type="date" error={errors.date?.message} {...register("date")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="시작 시간 *" id="startTime" type="time" error={errors.startTime?.message} {...register("startTime")} />
            <Input label="종료 시간 *" id="endTime" type="time" error={errors.endTime?.message} {...register("endTime")} />
          </div>
          <Input label="프로그램명 *" id="prog-title" error={errors.title?.message} {...register("title")} />
          <Input label="강사/인도자" id="speaker" {...register("speaker")} />
          <Textarea label="설명" id="prog-description" {...register("description")} />
          <Input label="준비물" id="materials" {...register("materials")} />
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

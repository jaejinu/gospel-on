"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleSchema, type ScheduleFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";

export default function NewSchedulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { status: "upcoming" },
  });

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/schedules/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          capacity: Number(data.capacity),
        }),
      });
      const result = await res.json();

      if (result.success) {
        toast("일정이 등록되었습니다.", "success");
        router.push("/admin/schedules");
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("등록에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-admin-text mb-6">일정 등록</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-6 max-w-2xl space-y-4"
      >
        <Input label="제목 *" id="title" error={errors.title?.message} {...register("title")} />
        <Input label="장소 *" id="location" error={errors.location?.message} {...register("location")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="시작일 *" id="startDate" type="date" error={errors.startDate?.message} {...register("startDate")} />
          <Input label="종료일 *" id="endDate" type="date" error={errors.endDate?.message} {...register("endDate")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="정원 *" id="capacity" type="number" error={errors.capacity?.message} {...register("capacity")} />
          <Select
            label="상태"
            id="status"
            error={errors.status?.message}
            options={[
              { value: "upcoming", label: "예정" },
              { value: "open", label: "접수중" },
              { value: "closed", label: "마감" },
              { value: "completed", label: "완료" },
            ]}
            {...register("status")}
          />
        </div>
        <Textarea label="설명" id="description" error={errors.description?.message} {...register("description")} />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>취소</Button>
        </div>
      </form>
    </div>
  );
}

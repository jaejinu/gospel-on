"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleInfoSchema, type ScheduleInfoFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";

interface Props {
  schedule: {
    id: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    capacity: number;
    description: string | null;
    status: string;
    emergencyContact?: string | null;
    insuranceInfo?: string | null;
    preparationList?: string | null;
  };
}

export default function ScheduleInfoTab({ schedule }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleInfoFormData>({
    resolver: zodResolver(scheduleInfoSchema),
    defaultValues: {
      title: schedule.title,
      location: schedule.location,
      startDate: new Date(schedule.startDate).toISOString().split("T")[0],
      endDate: new Date(schedule.endDate).toISOString().split("T")[0],
      capacity: schedule.capacity.toString(),
      description: schedule.description || "",
      status: schedule.status as ScheduleInfoFormData["status"],
      emergencyContact: schedule.emergencyContact || "",
      insuranceInfo: schedule.insuranceInfo || "",
      preparationList: schedule.preparationList || "",
    },
  });

  const onSubmit = async (data: ScheduleInfoFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/schedules/admin/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, capacity: Number(data.capacity) }),
      });
      const result = await res.json();
      if (result.success) {
        toast("일정이 수정되었습니다.", "success");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("수정에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

      <hr className="border-admin-card-border my-2" />
      <h3 className="text-sm font-semibold text-admin-text">안전 / 안내 정보</h3>
      <Input label="비상 연락처" id="emergencyContact" placeholder="예) 119, 담당자 010-0000-0000" {...register("emergencyContact")} />
      <Input label="보험 정보" id="insuranceInfo" placeholder="예) 여행자보험 가입 완료" {...register("insuranceInfo")} />
      <Textarea label="준비물 체크리스트" id="preparationList" rows={4} placeholder="세면도구&#10;성경책&#10;편한 옷&#10;필기도구" {...register("preparationList")} />

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "수정 중..." : "수정"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/schedules")}>
          목록으로
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { churchSchema, type ChurchFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";

export default function NewChurchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
  });

  const onSubmit = async (data: ChurchFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/churches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast("교회가 등록되었습니다.", "success");
        router.push("/admin/churches");
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
      <h1 className="text-2xl font-bold text-admin-text mb-6">교회 등록</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-6 max-w-2xl space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="교회명 *" id="name" error={errors.name?.message} {...register("name")} />
          <Input label="교단" id="denomination" error={errors.denomination?.message} {...register("denomination")} />
        </div>
        <Input label="담임목사" id="pastorName" error={errors.pastorName?.message} {...register("pastorName")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="담당자 이름 *" id="contactName" error={errors.contactName?.message} {...register("contactName")} />
          <Input label="연락처 *" id="contactPhone" error={errors.contactPhone?.message} {...register("contactPhone")} />
        </div>
        <Input label="이메일" id="contactEmail" type="email" error={errors.contactEmail?.message} {...register("contactEmail")} />
        <Input label="주소" id="address" error={errors.address?.message} {...register("address")} />
        <Input label="교인 수" id="memberCount" type="number" error={errors.memberCount?.message} {...register("memberCount")} />
        <Textarea label="비고" id="notes" error={errors.notes?.message} {...register("notes")} />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}

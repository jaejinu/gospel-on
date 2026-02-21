"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema, type ReservationFormData } from "@/lib/validations";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface Schedule {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  description: string | null;
}

export default function ReservationForm() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { participants: "1" },
  });

  useEffect(() => {
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSchedules(data.data);
      })
      .catch(console.error);
  }, []);

  const onSubmit = async (data: ReservationFormData) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setSubmitResult({
          success: true,
          message: "예약 신청이 완료되었습니다! 확인 후 연락드리겠습니다.",
        });
      } else {
        setSubmitResult({
          success: false,
          message: result.error || "예약 신청에 실패했습니다.",
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 예약 완료 화면
  if (submitResult?.success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          예약 신청 완료
        </h2>
        <p className="text-muted mb-6">{submitResult.message}</p>
        <Button
          variant="primary"
          onClick={() => setSubmitResult(null)}
        >
          새 예약 신청하기
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-6"
    >
      {submitResult && !submitResult.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitResult.message}
        </div>
      )}

      {/* 일정 선택 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          수련회 일정 선택 <span className="text-red-500">*</span>
        </label>
        {schedules.length > 0 ? (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <label
                key={schedule.id}
                className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  value={schedule.id}
                  {...register("scheduleId")}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-foreground">
                    <Link href={`/schedule/${schedule.id}`} className="hover:text-accent transition-colors underline decoration-accent/30">
                      {schedule.title}
                    </Link>
                  </p>
                  <p className="text-sm text-muted">
                    {schedule.location} | {formatDate(schedule.startDate)} ~ {formatDate(schedule.endDate)}
                  </p>
                  {schedule.description && (
                    <p className="text-sm text-muted mt-1">{schedule.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm p-4 bg-gray-50 rounded-lg">
            현재 접수 중인 일정이 없습니다.
          </p>
        )}
        {errors.scheduleId && (
          <p className="mt-1 text-sm text-red-500">{errors.scheduleId.message}</p>
        )}
      </div>

      <hr className="border-border" />

      {/* 신청자 정보 */}
      <h3 className="text-lg font-semibold text-foreground">신청자 정보</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="이름 *"
          id="name"
          placeholder="홍길동"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="연락처 *"
          id="phone"
          type="tel"
          placeholder="010-0000-0000"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <Input
        label="소속 (교회/단체명)"
        id="affiliation"
        placeholder="예) 서울중앙교회"
        error={errors.affiliation?.message}
        {...register("affiliation")}
      />

      <Input
        label="참가 인원 (본인 포함) *"
        id="participants"
        type="number"
        min="1"
        placeholder="1"
        error={errors.participants?.message}
        {...register("participants")}
      />

      <Textarea
        label="요청사항"
        id="requestMessage"
        placeholder="특별한 요청사항이 있으시면 적어주세요."
        error={errors.requestMessage?.message}
        {...register("requestMessage")}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "처리 중..." : "예약 신청하기"}
      </Button>
    </form>
  );
}

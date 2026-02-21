"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationLookupSchema, type ReservationLookupFormData } from "@/lib/validations";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface ReservationResult {
  id: string;
  name: string;
  phone: string;
  participants: number;
  status: string;
  createdAt: string;
  schedule: {
    id: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "접수 대기", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "확정", color: "bg-green-100 text-green-800" },
  cancelled: { label: "취소", color: "bg-red-100 text-red-800" },
};

export default function ReservationLookupPage() {
  const [results, setResults] = useState<ReservationResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationLookupFormData>({
    resolver: zodResolver(reservationLookupSchema),
  });

  const onSubmit = async (data: ReservationLookupFormData) => {
    setIsLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/reservations/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        setResults(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError("조회에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2 text-center">예약 조회</h1>
      <p className="text-muted mb-8 text-center">신청 시 입력한 이름과 연락처로 예약 상태를 확인하세요.</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-4 mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="이름"
            id="lookup-name"
            placeholder="홍길동"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="연락처"
            id="lookup-phone"
            type="tel"
            placeholder="010-0000-0000"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "조회 중..." : "예약 조회"}
        </Button>
      </form>

      {results !== null && (
        <div>
          {results.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                조회 결과 ({results.length}건)
              </h2>
              {results.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-xl shadow-sm p-6 border border-border/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link
                      href={`/schedule/${r.schedule.id}`}
                      className="text-lg font-semibold text-foreground hover:text-accent transition-colors"
                    >
                      {r.schedule.title}
                    </Link>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[r.status]?.color || "bg-gray-100"}`}>
                      {statusMap[r.status]?.label || r.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted space-y-1">
                    <p>{r.schedule.location}</p>
                    <p>{formatDate(r.schedule.startDate)} ~ {formatDate(r.schedule.endDate)}</p>
                    <p>참가 인원: {r.participants}명</p>
                    <p>신청일: {formatDate(r.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-muted">조회 결과가 없습니다.</p>
              <p className="text-sm text-muted mt-1">이름과 연락처를 다시 확인해주세요.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/reservation" className="text-sm text-accent hover:underline">
          새 예약 신청하기 →
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { churchSchema, type ChurchFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useState, useEffect } from "react";
import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

interface HistoryItem {
  scheduleId: string;
  scheduleTitle: string;
  startDate: string;
  endDate: string;
  reservationCount: number;
  participantCount: number;
  status: string;
}

const statusMap: Record<string, string> = {
  upcoming: "예정",
  open: "접수중",
  closed: "마감",
  completed: "완료",
};

export default function EditChurchPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
  });

  useEffect(() => {
    const fetchChurch = async () => {
      try {
        const res = await fetch(`/api/churches/${params.id}`);
        const result = await res.json();
        if (result.success) {
          const church = result.data;
          reset({
            name: church.name,
            denomination: church.denomination || "",
            pastorName: church.pastorName || "",
            contactName: church.contactName,
            contactPhone: church.contactPhone,
            contactEmail: church.contactEmail || "",
            address: church.address || "",
            memberCount: church.memberCount?.toString() || "",
            notes: church.notes || "",
          });
        } else {
          toast("교회 정보를 불러올 수 없습니다.", "error");
          router.push("/admin/churches");
        }
      } catch {
        toast("데이터 로딩에 실패했습니다.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChurch();
  }, [params.id, reset, router, toast]);

  // 참가 이력 조회
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/churches/${params.id}/history`);
        const result = await res.json();
        if (result.success) {
          setHistory(result.data);
        }
      } catch {
        // 이력 조회 실패 시 무시
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [params.id]);

  const onSubmit = async (data: ChurchFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/churches/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast("교회 정보가 수정되었습니다.", "success");
        router.push("/admin/churches");
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("수정에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-6 max-w-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="mt-8 max-w-2xl">
          <Skeleton className="h-6 w-40 mb-4" />
          <SkeletonTable rows={3} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-admin-text mb-6">교회 수정</h1>

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
            {isSubmitting ? "수정 중..." : "수정"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            취소
          </Button>
        </div>
      </form>

      {/* 참가 이력 */}
      <div className="mt-8 max-w-2xl">
        <h2 className="text-lg font-bold text-admin-text mb-4">수련회 참가 이력</h2>
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border overflow-hidden">
          {historyLoading ? (
            <SkeletonTable rows={3} cols={5} className="border-0 shadow-none rounded-none" />
          ) : history.length > 0 ? (
            <table className="w-full">
              <thead className="bg-admin-table-header">
                <tr>
                  <th className="text-left text-xs font-medium text-admin-text-muted px-4 py-3">수련회</th>
                  <th className="text-left text-xs font-medium text-admin-text-muted px-4 py-3">기간</th>
                  <th className="text-left text-xs font-medium text-admin-text-muted px-4 py-3">예약</th>
                  <th className="text-left text-xs font-medium text-admin-text-muted px-4 py-3">참가자</th>
                  <th className="text-left text-xs font-medium text-admin-text-muted px-4 py-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-card-border">
                {history.map((h) => (
                  <tr key={h.scheduleId} className="hover:bg-admin-bg-light">
                    <td className="px-4 py-3 text-sm font-medium text-admin-text">{h.scheduleTitle}</td>
                    <td className="px-4 py-3 text-sm text-admin-text-muted">
                      {formatDate(h.startDate)} ~ {formatDate(h.endDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-admin-text">{h.reservationCount}건</td>
                    <td className="px-4 py-3 text-sm text-admin-text">{h.participantCount}명</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded bg-admin-bg-light text-admin-text-muted">
                        {statusMap[h.status] || h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-admin-text-muted text-sm">참가 이력이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

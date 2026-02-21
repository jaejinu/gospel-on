"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationSchema, type DonationFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface Donation {
  id: string;
  donor: string;
  amount: number;
  method: string;
  purpose: string | null;
  memo: string | null;
  donatedAt: string;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ totalAmount: 0, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donatedAt: new Date().toISOString().split("T")[0],
    },
  });

  const fetchDonations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/donations?page=${page}&limit=10`);
      const result = await res.json();
      if (result.success) {
        setDonations(result.data.items);
        setTotalPages(result.data.totalPages);
        setSummary(result.data.summary);
      }
    } catch {
      toast("후원 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const onSubmit = async (data: DonationFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast("후원이 등록되었습니다.", "success");
        setIsModalOpen(false);
        reset({ donatedAt: new Date().toISOString().split("T")[0] });
        fetchDonations();
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-admin-text">후원 관리</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => window.location.href = "/api/donations?export=csv"}
          >
            CSV 내보내기
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>후원 등록</Button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-admin-card rounded-xl p-6 shadow-sm border border-admin-card-border">
          <p className="text-sm text-admin-text-muted mb-1">총 후원금</p>
          <p className="text-3xl font-bold text-admin-text">
            {summary.totalAmount.toLocaleString()}
            <span className="text-sm font-normal text-admin-text-muted ml-1">원</span>
          </p>
        </div>
        <div className="bg-admin-card rounded-xl p-6 shadow-sm border border-admin-card-border">
          <p className="text-sm text-admin-text-muted mb-1">총 후원 건수</p>
          <p className="text-3xl font-bold text-admin-text">
            {summary.totalCount}
            <span className="text-sm font-normal text-admin-text-muted ml-1">건</span>
          </p>
        </div>
      </div>

      {/* 목록 */}
      <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-table-header">
              <tr>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">후원자</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">금액</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">방법</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">용도</th>
                <th className="text-left text-xs font-medium text-admin-text-muted px-6 py-3">후원일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-admin-text-muted text-sm">로딩 중...</td>
                </tr>
              ) : donations.length > 0 ? (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-admin-bg-light">
                    <td className="px-6 py-4 text-sm font-medium text-admin-text">{d.donor}</td>
                    <td className="px-6 py-4 text-sm text-admin-text">{d.amount.toLocaleString()}원</td>
                    <td className="px-6 py-4 text-sm text-admin-text">{d.method}</td>
                    <td className="px-6 py-4 text-sm text-admin-text-muted">{d.purpose || "-"}</td>
                    <td className="px-6 py-4 text-sm text-admin-text-muted">
                      {new Date(d.donatedAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-admin-text-muted text-sm">후원 내역이 없습니다.</td>
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

      {/* 등록 모달 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="후원 등록">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="후원자명 *" id="donor" error={errors.donor?.message} {...register("donor")} />
          <Input label="금액 *" id="amount" type="number" error={errors.amount?.message} {...register("amount")} />
          <Select
            label="후원 방법 *"
            id="method"
            placeholder="선택해주세요"
            options={[
              { value: "계좌이체", label: "계좌이체" },
              { value: "현금", label: "현금" },
              { value: "기타", label: "기타" },
            ]}
            error={errors.method?.message}
            {...register("method")}
          />
          <Input label="후원일 *" id="donatedAt" type="date" error={errors.donatedAt?.message} {...register("donatedAt")} />
          <Input label="용도" id="purpose" error={errors.purpose?.message} {...register("purpose")} />
          <Textarea label="메모" id="memo" error={errors.memo?.message} {...register("memo")} />

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "등록"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

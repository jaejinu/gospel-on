"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

interface ReportData {
  year: number;
  summary: {
    totalAmount: number;
    totalCount: number;
    prevYearAmount: number;
    prevYearCount: number;
    changeRate: number | null;
  };
  monthly: { month: number; count: number; amount: number }[];
  byMethod: { method: string; count: number; amount: number }[];
  donorRanking: { donor: string; count: number; amount: number }[];
}

export default function DonationReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/donations/report?year=${year}`);
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch {
      toast("리포트를 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [year, toast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (isLoading || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-admin-text mb-6">후원 연간 리포트</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="bg-admin-card rounded-xl p-6 shadow-sm border border-admin-card-border">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const monthlyChart = data.monthly.map((m) => ({
    name: `${m.month}월`,
    금액: m.amount,
    건수: m.count,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-admin-text">후원 연간 리포트</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setYear(year - 1)}>◀</Button>
          <span className="text-lg font-semibold text-admin-text">{year}년</span>
          <Button variant="ghost" size="sm" onClick={() => setYear(year + 1)} disabled={year >= new Date().getFullYear()}>▶</Button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-admin-card rounded-xl p-6 shadow-sm border border-admin-card-border">
          <p className="text-sm text-admin-text-muted mb-1">총 후원금</p>
          <p className="text-2xl font-bold text-admin-text">{data.summary.totalAmount.toLocaleString()}원</p>
          {data.summary.changeRate !== null && (
            <p className={`text-xs mt-1 ${data.summary.changeRate >= 0 ? "text-green-600" : "text-red-600"}`}>
              전년 대비 {data.summary.changeRate > 0 ? "+" : ""}{data.summary.changeRate}%
            </p>
          )}
        </div>
        <div className="bg-admin-card rounded-xl p-6 shadow-sm border border-admin-card-border">
          <p className="text-sm text-admin-text-muted mb-1">총 건수</p>
          <p className="text-2xl font-bold text-admin-text">{data.summary.totalCount}건</p>
          <p className="text-xs text-admin-text-muted mt-1">전년 {data.summary.prevYearCount}건</p>
        </div>
        <div className="bg-admin-card rounded-xl p-6 shadow-sm border border-admin-card-border">
          <p className="text-sm text-admin-text-muted mb-1">전년도 총액</p>
          <p className="text-2xl font-bold text-admin-text">{data.summary.prevYearAmount.toLocaleString()}원</p>
        </div>
      </div>

      {/* 월별 차트 */}
      <div className="bg-admin-card rounded-xl p-6 shadow-sm border border-admin-card-border mb-6">
        <h2 className="text-lg font-semibold text-admin-text mb-4">월별 후원 추이</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => (typeof value === "number" ? value.toLocaleString() : value)} />
              <Bar dataKey="금액" fill="#c9a84c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 방법별 */}
        <div className="bg-admin-card rounded-xl p-6 shadow-sm border border-admin-card-border">
          <h2 className="text-lg font-semibold text-admin-text mb-4">후원 방법별</h2>
          <div className="space-y-3">
            {data.byMethod.map((m) => (
              <div key={m.method} className="flex items-center justify-between">
                <span className="text-sm text-admin-text">{m.method}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-admin-text">{m.amount.toLocaleString()}원</span>
                  <span className="text-xs text-admin-text-muted ml-2">({m.count}건)</span>
                </div>
              </div>
            ))}
            {data.byMethod.length === 0 && (
              <p className="text-sm text-admin-text-muted">데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 후원자 랭킹 */}
        <div className="bg-admin-card rounded-xl p-6 shadow-sm border border-admin-card-border">
          <h2 className="text-lg font-semibold text-admin-text mb-4">후원자 랭킹 (상위 10)</h2>
          <div className="space-y-3">
            {data.donorRanking.map((d, i) => (
              <div key={d.donor} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                    i < 3 ? "bg-admin-accent text-white" : "bg-admin-bg-light text-admin-text-muted"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-admin-text">{d.donor}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-admin-text">{d.amount.toLocaleString()}원</span>
                  <span className="text-xs text-admin-text-muted ml-2">({d.count}회)</span>
                </div>
              </div>
            ))}
            {data.donorRanking.length === 0 && (
              <p className="text-sm text-admin-text-muted">데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

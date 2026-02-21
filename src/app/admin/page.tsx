"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

interface ComparisonItem {
  current: number;
  previous: number;
  changeRate: number | null;
}

interface DashboardData {
  stats: {
    churchCount: number;
    reservationCount: number;
    scheduleCount: number;
    totalDonation: number;
    participantCount: number;
  };
  monthlyChart: { month: string; count: number }[];
  churchChart: { church: string; count: number }[];
  upcomingSchedules: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    capacity: number;
    _count: { reservations: number };
  }[];
  latestReservations: {
    id: string;
    name: string;
    participants: number;
    status: string;
    createdAt: string;
    schedule: { title: string };
  }[];
  comparison?: {
    reservations: ComparisonItem;
    donations: ComparisonItem;
    participants: ComparisonItem;
  };
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "확정", color: "bg-green-100 text-green-800" },
  cancelled: { label: "취소", color: "bg-red-100 text-red-800" },
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard", {
          credentials: "include",
        });
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          console.error("대시보드 API 에러:", result.error, "status:", res.status);
          setError(`${result.error} (HTTP ${res.status})`);
        }
      } catch (err) {
        console.error("대시보드 fetch 에러:", err);
        setError("네트워크 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-5">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-5">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-admin-text-muted">데이터를 불러올 수 없습니다.</div>
          {error && <div className="text-red-500 text-sm mt-2">오류: {error}</div>}
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const statCards = [
    {
      label: "등록 교회",
      value: data.stats.churchCount,
      unit: "개",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: "총 예약",
      value: data.stats.reservationCount,
      unit: "건",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: "접수중 일정",
      value: data.stats.scheduleCount,
      unit: "개",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "총 후원금",
      value: data.stats.totalDonation.toLocaleString(),
      unit: "원",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "총 참가자",
      value: data.stats.participantCount,
      unit: "명",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* 환영 메시지 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-admin-text">대시보드</h1>
        <p className="text-admin-text-muted mt-1">{today}</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-admin-card rounded-xl p-5 shadow-sm border border-admin-card-border"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-admin-text-muted">{card.label}</p>
              <div className="text-admin-accent">{card.icon}</div>
            </div>
            <p className="text-2xl font-bold text-admin-text">
              {card.value}
              <span className="text-sm font-normal text-admin-text-muted ml-1">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 전년 대비 */}
      {data.comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "올해 예약", data: data.comparison.reservations, unit: "건" },
            { label: "올해 후원", data: data.comparison.donations, unit: "원", format: true },
            { label: "올해 참가자", data: data.comparison.participants, unit: "명" },
          ].map((item) => (
            <div key={item.label} className="bg-admin-card rounded-xl p-5 shadow-sm border border-admin-card-border">
              <p className="text-sm text-admin-text-muted mb-1">{item.label}</p>
              <p className="text-xl font-bold text-admin-text">
                {item.format ? item.data.current.toLocaleString() : item.data.current}
                <span className="text-sm font-normal text-admin-text-muted ml-1">{item.unit}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-admin-text-muted">
                  전년 동기 {item.format ? item.data.previous.toLocaleString() : item.data.previous}{item.unit}
                </span>
                {item.data.changeRate !== null && (
                  <span className={`text-xs font-medium ${item.data.changeRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {item.data.changeRate > 0 ? "↑" : "↓"}{Math.abs(item.data.changeRate)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2열: 최근 예약 + 다가오는 일정 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 최근 예약 */}
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border">
          <div className="p-5 border-b border-admin-card-border">
            <h2 className="text-lg font-semibold text-admin-text">최근 예약</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-admin-table-header">
                <tr>
                  <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">신청자</th>
                  <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">일정</th>
                  <th className="text-left text-xs font-medium text-admin-text-muted px-5 py-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-card-border">
                {data.latestReservations.length > 0 ? (
                  data.latestReservations.map((r) => (
                    <tr key={r.id} className="hover:bg-admin-bg-light">
                      <td className="px-5 py-3 text-sm text-admin-text">{r.name}</td>
                      <td className="px-5 py-3 text-sm text-admin-text-muted">{r.schedule.title}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[r.status]?.color || ""}`}>
                          {statusMap[r.status]?.label || r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-admin-text-muted text-sm">
                      아직 예약이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 다가오는 일정 */}
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border">
          <div className="p-5 border-b border-admin-card-border">
            <h2 className="text-lg font-semibold text-admin-text">다가오는 일정</h2>
          </div>
          <div className="p-5 space-y-4">
            {data.upcomingSchedules.length > 0 ? (
              data.upcomingSchedules.map((s) => {
                const progress = s.capacity > 0
                  ? Math.min((s._count.reservations / s.capacity) * 100, 100)
                  : 0;
                return (
                  <div key={s.id} className="p-4 rounded-lg bg-admin-bg-light border border-admin-card-border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm text-admin-text">{s.title}</h3>
                      <span className="text-xs text-admin-text-muted">
                        {new Date(s.startDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-admin-card-border rounded-full h-2">
                        <div
                          className="bg-admin-accent rounded-full h-2 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-admin-text-muted whitespace-nowrap">
                        {s._count.reservations}/{s.capacity}명
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-admin-text-muted text-sm py-4">
                예정된 일정이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2열 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 월별 예약 추이 */}
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-5">
          <h2 className="text-lg font-semibold text-admin-text mb-4">월별 예약 추이</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8b8578" }} />
                <YAxis tick={{ fontSize: 12, fill: "#8b8578" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e8e4de",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="count" name="예약 수" fill="#c9a84c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 교회별 참가 현황 */}
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-5">
          <h2 className="text-lg font-semibold text-admin-text mb-4">교회별 참가 현황</h2>
          <div className="h-64">
            {data.churchChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.churchChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#8b8578" }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="church"
                    width={100}
                    tick={{ fontSize: 11, fill: "#8b8578" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e8e4de",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="count" name="참가자 수" fill="#d4b85a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-admin-text-muted text-sm">
                참가자 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

interface Program {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string | null;
  speaker: string | null;
  materials: string | null;
}

interface Participant {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  church: string | null;
  phone: string | null;
  parentPhone: string | null;
  notes: string | null;
  team: { id: string; name: string } | null;
}

interface TeacherData {
  schedule: {
    id: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    emergencyContact: string | null;
    programs: Program[];
  };
  participants: Participant[];
  teams: {
    id: string;
    name: string;
    leader: { id: string; name: string } | null;
    _count: { members: number };
  }[];
  tokenLabel: string | null;
}

export default function TeacherPage() {
  const params = useParams();
  const [data, setData] = useState<TeacherData | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"schedule" | "participants" | "teams">("schedule");

  useEffect(() => {
    fetch(`/api/teacher/${params.token}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setData(result.data);
        else setError(result.error);
      })
      .catch(() => setError("정보를 불러오는데 실패했습니다."));
  }, [params.token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">접근 불가</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 flex gap-4 py-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  // 프로그램을 날짜별 그룹핑
  const programsByDate: Record<string, Program[]> = {};
  for (const p of data.schedule.programs) {
    const key = new Date(p.date).toISOString().split("T")[0];
    if (!programsByDate[key]) programsByDate[key] = [];
    programsByDate[key].push(p);
  }

  const tabs = [
    { key: "schedule" as const, label: "프로그램" },
    { key: "participants" as const, label: `참가자 (${data.participants.length})` },
    { key: "teams" as const, label: `조 편성 (${data.teams.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">교사용</span>
            {data.tokenLabel && <span className="text-sm text-gray-500">{data.tokenLabel}</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{data.schedule.title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data.schedule.location} | {formatDate(data.schedule.startDate)} ~ {formatDate(data.schedule.endDate)}
          </p>
          {data.schedule.emergencyContact && (
            <p className="text-red-600 text-sm mt-2 font-medium">
              비상연락처: {data.schedule.emergencyContact}
            </p>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b sticky top-0 z-10" data-print-hidden>
        <div className="max-w-4xl mx-auto px-4 flex gap-4" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`panel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "schedule" && (
          <div className="space-y-6">
            {Object.entries(programsByDate).map(([date, programs]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                  {formatDate(date)}
                </h3>
                <div className="space-y-2">
                  {programs.map((p) => (
                    <div key={p.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-medium text-blue-600 whitespace-nowrap">
                          {p.startTime}-{p.endTime}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{p.title}</p>
                          {p.speaker && <p className="text-sm text-gray-500">강사: {p.speaker}</p>}
                          {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
                          {p.materials && (
                            <a href={p.materials} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              자료 다운로드
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {data.schedule.programs.length === 0 && (
              <EmptyState
                title="프로그램이 아직 없습니다"
                description="수련회 프로그램이 등록되면 여기에 표시됩니다."
                className="bg-white rounded-xl shadow-sm p-12 text-center"
              />
            )}
          </div>
        )}

        {activeTab === "participants" && (
          <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
            {/* 모바일 카드형 */}
            <div className="md:hidden space-y-3">
              {data.participants.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{p.name}</span>
                    {p.team && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{p.team.name}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-sm text-gray-500">
                    <span>나이: {p.age || "-"}</span>
                    <span>성별: {p.gender || "-"}</span>
                    <span>교회: {p.church || "-"}</span>
                    <span>연락처: {p.phone || "-"}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* 데스크톱 테이블 */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">이름</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">나이</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">성별</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">교회</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">연락처</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">조</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.participants.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.age || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.gender || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.church || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.phone || "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        {p.team ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{p.team.name}</span>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.participants.length === 0 && (
              <EmptyState
                title="참가자가 아직 없습니다"
                description="참가자가 등록되면 여기에 표시됩니다."
                className="bg-white rounded-xl shadow-sm p-12 text-center"
              />
            )}
          </div>
        )}

        {activeTab === "teams" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.teams.map((team) => (
              <div key={team.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  <span className="text-sm text-gray-500">{team._count.members}명</span>
                </div>
                {team.leader && (
                  <p className="text-sm text-blue-600 mb-2">조장: {team.leader.name}</p>
                )}
                <div className="space-y-1">
                  {data.participants
                    .filter((p) => p.team?.id === team.id)
                    .map((p) => (
                      <p key={p.id} className="text-sm text-gray-600">
                        {p.name} {p.church ? `(${p.church})` : ""}
                      </p>
                    ))}
                </div>
              </div>
            ))}
            {data.teams.length === 0 && (
              <div className="col-span-2">
                <EmptyState
                  title="조 편성이 아직 없습니다"
                  description="조가 편성되면 여기에 표시됩니다."
                  className="bg-white rounded-xl shadow-sm p-12 text-center"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

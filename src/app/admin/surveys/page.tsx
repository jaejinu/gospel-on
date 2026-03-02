"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  _count: {
    responses: number;
    questions: number;
  };
}

interface SurveyQuestion {
  id: string;
  label: string;
  type: string;
  options: string | null;
  isRequired: boolean;
  sortOrder: number;
}

interface SurveyAnswer {
  id: string;
  questionId: string;
  value: string;
  question: SurveyQuestion;
}

interface SurveyResponse {
  id: string;
  createdAt: string;
  answers: SurveyAnswer[];
}

interface SurveyDetail extends Survey {
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
}

type StatusFilter = "all" | "draft" | "active" | "closed";

const statusLabels: Record<string, string> = {
  draft: "작성중",
  active: "활성",
  closed: "마감",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
};

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSurveys = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/surveys/admin");
      const result = await res.json();
      if (result.success) {
        setSurveys(result.data);
      }
    } catch {
      toast("설문 목록을 불러오는 데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const filteredSurveys =
    filter === "all" ? surveys : surveys.filter((s) => s.status === filter);

  const handleViewDetail = async (surveyId: string) => {
    // 같은 설문 클릭 시 닫기
    if (selectedSurvey?.id === surveyId) {
      setSelectedSurvey(null);
      return;
    }

    setIsDetailLoading(true);
    setExpandedResponseId(null);
    try {
      const res = await fetch(`/api/surveys/admin/${surveyId}`);
      const result = await res.json();
      if (result.success) {
        setSelectedSurvey(result.data);
      }
    } catch {
      toast("설문 상세를 불러오는 데 실패했습니다.", "error");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleStatusChange = async (surveyId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/surveys/admin/${surveyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        toast(`설문 상태가 "${statusLabels[newStatus]}"(으)로 변경되었습니다.`, "success");
        fetchSurveys();
        if (selectedSurvey?.id === surveyId) {
          setSelectedSurvey((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch {
      toast("상태 변경에 실패했습니다.", "error");
    }
  };

  const handleExportCSV = async (surveyId: string) => {
    try {
      const res = await fetch(`/api/surveys/admin/${surveyId}?export=csv`, {
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        let errorMsg = "CSV 내보내기에 실패했습니다.";
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || errorMsg;
        } catch {
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        toast(errorMsg, "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition");
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || "survey.csv";
      a.download = decodeURIComponent(filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast("CSV 파일이 다운로드되었습니다.", "success");
    } catch (err) {
      console.error("CSV 내보내기 오류:", err);
      toast("CSV 내보내기에 실패했습니다.", "error");
    }
  };

  const handleCopyLink = (surveyId: string) => {
    const url = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(url);
    toast("설문 링크가 복사되었습니다.", "success");
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">설문 관리</h1>
          <p className="text-sm text-admin-text-muted mt-1">
            설문조사를 관리하고 응답 결과를 확인하세요
          </p>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-6">
        {(["all", "draft", "active", "closed"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              filter === f
                ? "bg-admin-accent text-white"
                : "bg-admin-card border border-admin-card-border text-admin-text-muted hover:bg-admin-table-header"
            }`}
          >
            {f === "all" ? "전체" : statusLabels[f]}
            {f !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({surveys.filter((s) => s.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {isLoading ? (
        <SkeletonTable rows={3} cols={5} />
      ) : filteredSurveys.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          title="설문이 없습니다"
          description="등록된 설문이 없습니다."
          className="text-admin-text-muted"
        />
      ) : (
        <div className="bg-admin-card border border-admin-card-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-admin-table-header">
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-muted uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-muted uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-muted uppercase tracking-wider">
                  질문
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-muted uppercase tracking-wider">
                  응답
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-muted uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-admin-text-muted uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-card-border">
              {filteredSurveys.map((survey) => (
                <tr
                  key={survey.id}
                  className={`hover:bg-admin-bg-light transition-colors cursor-pointer ${
                    selectedSurvey?.id === survey.id ? "bg-admin-bg-light" : ""
                  }`}
                  onClick={() => handleViewDetail(survey.id)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-admin-text">
                      {survey.title}
                    </div>
                    {survey.description && (
                      <div className="text-xs text-admin-text-muted mt-0.5 truncate max-w-[300px]">
                        {survey.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[survey.status]}`}>
                      {statusLabels[survey.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-admin-text-muted">
                    {survey._count.questions}개
                  </td>
                  <td className="px-6 py-4 text-sm text-admin-text">
                    <span className="font-medium">{survey._count.responses}</span>
                    <span className="text-admin-text-muted">건</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-admin-text-muted">
                    {formatDate(survey.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {/* 링크 복사 */}
                      <button
                        onClick={() => handleCopyLink(survey.id)}
                        className="p-1.5 text-admin-text-muted hover:text-admin-accent transition-colors"
                        title="설문 링크 복사"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>

                      {/* CSV */}
                      {survey._count.responses > 0 && (
                        <button
                          onClick={() => handleExportCSV(survey.id)}
                          className="p-1.5 text-admin-text-muted hover:text-admin-accent transition-colors"
                          title="CSV 내보내기"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      )}

                      {/* 상태 변경 */}
                      <select
                        value={survey.status}
                        onChange={(e) => handleStatusChange(survey.id, e.target.value)}
                        className="text-xs border border-admin-card-border rounded px-2 py-1 bg-admin-card text-admin-text focus:outline-none focus:border-admin-accent"
                      >
                        <option value="draft">작성중</option>
                        <option value="active">활성</option>
                        <option value="closed">마감</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 상세 패널 */}
      {isDetailLoading && (
        <div className="mt-6">
          <SkeletonTable rows={5} cols={3} />
        </div>
      )}

      {selectedSurvey && !isDetailLoading && (
        <div className="mt-6 bg-admin-card border border-admin-card-border rounded-xl overflow-hidden">
          {/* 상세 헤더 */}
          <div className="px-6 py-4 border-b border-admin-card-border bg-admin-table-header flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-admin-text">
                {selectedSurvey.title} — 응답 결과
              </h2>
              <p className="text-sm text-admin-text-muted mt-0.5">
                총 {selectedSurvey.responses.length}건의 응답
              </p>
            </div>
            <div className="flex gap-2">
              {selectedSurvey.responses.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExportCSV(selectedSurvey.id)}
                >
                  CSV 내보내기
                </Button>
              )}
              <button
                onClick={() => setSelectedSurvey(null)}
                className="p-1.5 text-admin-text-muted hover:text-admin-text transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 응답 목록 */}
          {selectedSurvey.responses.length === 0 ? (
            <div className="px-6 py-12 text-center text-admin-text-muted">
              아직 응답이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-admin-card-border">
              {selectedSurvey.responses.map((response, idx) => (
                <div key={response.id}>
                  {/* 응답 헤더 (클릭 시 확장) */}
                  <button
                    onClick={() =>
                      setExpandedResponseId(
                        expandedResponseId === response.id ? null : response.id
                      )
                    }
                    className="w-full px-6 py-3 flex items-center justify-between hover:bg-admin-bg-light transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-admin-text-muted bg-admin-table-header px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      {/* 이름 표시 (첫 번째 답변) */}
                      <span className="text-sm text-admin-text font-medium">
                        {response.answers[0]?.value || "이름 없음"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-admin-text-muted">
                        {new Date(response.createdAt).toLocaleString("ko-KR")}
                      </span>
                      <svg
                        className={`w-4 h-4 text-admin-text-muted transition-transform ${
                          expandedResponseId === response.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* 확장 상세 */}
                  {expandedResponseId === response.id && (
                    <div className="px-6 pb-4 space-y-3 bg-admin-bg-light/50">
                      {selectedSurvey.questions.map((question) => {
                        const answer = response.answers.find(
                          (a) => a.questionId === question.id
                        );
                        return (
                          <div key={question.id} className="flex flex-col sm:flex-row sm:gap-4">
                            <div className="text-xs font-medium text-admin-text-muted sm:w-48 shrink-0 py-1">
                              {question.label}
                            </div>
                            <div className="text-sm text-admin-text py-1 whitespace-pre-wrap">
                              {answer?.value || (
                                <span className="text-admin-text-muted italic">미응답</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

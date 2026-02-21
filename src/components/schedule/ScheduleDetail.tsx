"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Program {
  id: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  title: string;
  description: string | null;
  speaker: string | null;
  materials: string | null;
}

interface Feedback {
  id: string;
  participantName: string;
  content: string;
  rating: number;
  createdAt: Date | string;
}

interface Schedule {
  id: string;
  title: string;
  location: string;
  startDate: Date | string;
  endDate: Date | string;
  capacity: number;
  description: string | null;
  status: string;
  emergencyContact?: string | null;
  insuranceInfo?: string | null;
  preparationList?: string | null;
  programs: Program[];
  feedbacks: Feedback[];
}

interface Props {
  schedule: Schedule;
  reservationCount: number;
}

export default function ScheduleDetail({ schedule, reservationCount }: Props) {
  const [feedbackForm, setFeedbackForm] = useState({ participantName: "", content: "", rating: "5", password: "" });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const formatShortDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  // D-Day 계산
  const now = new Date();
  const start = new Date(schedule.startDate);
  const diffMs = start.getTime() - now.getTime();
  const dDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // 프로그램을 날짜별 그룹핑
  const programsByDate = schedule.programs.reduce<Record<string, Program[]>>((acc, p) => {
    const dateKey = new Date(p.date).toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(p);
    return acc;
  }, {});

  const isOpen = schedule.status === "open";
  const isCompleted = schedule.status === "completed";
  const remaining = schedule.capacity - reservationCount;

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setFeedbackError("");

    try {
      const res = await fetch(`/api/schedules/${schedule.id}/feedback/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });
      const result = await res.json();
      if (result.success) {
        setFeedbackSuccess(true);
        setFeedbackForm({ participantName: "", content: "", rating: "5", password: "" });
      } else {
        setFeedbackError(result.error);
      }
    } catch {
      setFeedbackError("후기 작성에 실패했습니다.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* D-Day 배너 */}
      {dDay > 0 && schedule.status !== "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-accent to-accent-light text-white rounded-2xl p-6 mb-8 text-center"
        >
          <p className="text-sm opacity-80 mb-1">수련회까지</p>
          <p className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">D-{dDay}</p>
          <p className="text-sm opacity-70 mt-2">
            {new Date(schedule.startDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })} 시작
          </p>
        </motion.div>
      )}
      {dDay <= 0 && dDay >= -Math.ceil((new Date(schedule.endDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) && schedule.status !== "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-8 text-center"
        >
          <p className="text-2xl font-bold">진행 중</p>
        </motion.div>
      )}

      {/* 일정 정보 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8"
      >
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">{schedule.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isOpen ? "bg-green-100 text-green-800" : isCompleted ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-800"
          }`}>
            {isOpen ? "접수중" : isCompleted ? "완료" : schedule.status === "upcoming" ? "예정" : "마감"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {schedule.location}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(schedule.startDate)} ~ {formatDate(schedule.endDate)}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            정원 {schedule.capacity}명 (잔여 {remaining > 0 ? remaining : 0}명)
          </div>
        </div>

        {schedule.description && (
          <p className="text-muted leading-relaxed whitespace-pre-wrap">{schedule.description}</p>
        )}

        {isOpen && (
          <div className="mt-6">
            <Link href="/reservation" className="inline-block px-8 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-full transition-colors">
              예약 신청하기
            </Link>
          </div>
        )}
      </motion.div>

      {/* 안전/안내 정보 */}
      {(schedule.emergencyContact || schedule.insuranceInfo || schedule.preparationList) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">안내 사항</h2>
          <div className="space-y-4">
            {schedule.emergencyContact && (
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-1">비상 연락처</h3>
                <p className="text-sm text-muted">{schedule.emergencyContact}</p>
              </div>
            )}
            {schedule.insuranceInfo && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">보험 정보</h3>
                <p className="text-sm text-muted">{schedule.insuranceInfo}</p>
              </div>
            )}
            {schedule.preparationList && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">준비물 체크리스트</h3>
                <ul className="space-y-1">
                  {schedule.preparationList.split("\n").filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted">
                      <span className="w-4 h-4 border border-border rounded flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 프로그램 타임라인 */}
      {Object.keys(programsByDate).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-6">프로그램 일정</h2>
          <div className="space-y-8">
            {Object.entries(programsByDate).map(([date, programs]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">
                  {formatShortDate(date)}
                </h3>
                <div className="space-y-3">
                  {programs.map((p) => (
                    <div key={p.id} className="flex gap-4 pl-4 border-l-2 border-accent/30">
                      <div className="text-sm font-medium text-accent whitespace-nowrap pt-0.5">
                        {p.startTime} - {p.endTime}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{p.title}</p>
                        {p.speaker && <p className="text-sm text-muted">강사: {p.speaker}</p>}
                        {p.description && <p className="text-sm text-muted mt-1">{p.description}</p>}
                        {p.materials && (
                          <a href={p.materials} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            자료 다운로드
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 공개 후기 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8"
      >
        <h2 className="text-xl font-bold text-foreground mb-6">참가 후기</h2>
        {schedule.feedbacks.length > 0 ? (
          <div className="space-y-4 mb-8">
            {schedule.feedbacks.map((f) => (
              <div key={f.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-foreground">{f.participantName}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < f.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted">{f.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted mb-6">아직 후기가 없습니다.</p>
        )}

        {/* 후기 작성 폼 */}
        {isCompleted && !feedbackSuccess && (
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">후기 작성하기</h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="이름"
                  value={feedbackForm.participantName}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, participantName: e.target.value })}
                  required
                  className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <input
                  type="password"
                  placeholder="비밀번호 (4자 이상)"
                  value={feedbackForm.password}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, password: e.target.value })}
                  required
                  minLength={4}
                  className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">평점</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: n.toString() })}
                      className="p-1"
                      aria-label={`${n}점`}
                    >
                      <svg className={`w-6 h-6 ${n <= Number(feedbackForm.rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="수련회 후기를 남겨주세요"
                value={feedbackForm.content}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              {feedbackError && <p className="text-sm text-red-500">{feedbackError}</p>}
              <button
                type="submit"
                disabled={feedbackSubmitting}
                className="px-6 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {feedbackSubmitting ? "등록 중..." : "후기 등록"}
              </button>
            </form>
          </div>
        )}
        {feedbackSuccess && (
          <div className="border-t border-border pt-6 text-center">
            <p className="text-green-600 font-medium">후기가 등록되었습니다. 감사합니다!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

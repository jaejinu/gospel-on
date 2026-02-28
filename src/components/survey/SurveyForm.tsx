"use client";

import { useState, useMemo } from "react";

type SurveyQuestion = {
  id: string;
  label: string;
  type: string;
  options: string | null;
  isRequired: boolean;
  sortOrder: number;
  placeholder: string | null;
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  questions: SurveyQuestion[];
};

// 눈꽃 데이터 생성
function generateSnowflakes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 4 + Math.random() * 6,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 10,
    opacity: 0.3 + Math.random() * 0.5,
  }));
}

// 별 데이터 생성
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 2 + Math.random() * 4,
    delay: Math.random() * 5,
  }));
}

// 축하 별 데이터 생성
function generateCelebrationStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 10 + Math.random() * 80,
    size: 4 + Math.random() * 8,
    duration: 1.5 + Math.random() * 2,
    delay: Math.random() * 1.5,
    color: ["#ffd700", "#4fc3f7", "#e8f0fe", "#ff6b9d", "#c084fc"][i % 5],
  }));
}

export default function SurveyForm({ survey }: { survey: Survey }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const snowflakes = useMemo(() => generateSnowflakes(18), []);
  const stars = useMemo(() => generateStars(30), []);
  const celebrationStars = useMemo(() => generateCelebrationStars(20), []);

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const q of survey.questions) {
      if (q.isRequired && (!answers[q.id] || answers[q.id].trim() === "")) {
        newErrors[q.id] = "필수 항목입니다";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/surveys/${survey.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (data.success) {
        setIsComplete(true);
      } else {
        alert(data.error || "제출에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 완료 화면
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f4e] to-[#0d1235] flex items-center justify-center relative overflow-hidden">
        {/* 축하 별 */}
        {celebrationStars.map((star) => (
          <div
            key={star.id}
            className="fixed"
            style={{
              left: `${star.left}%`,
              top: "-20px",
              width: star.size,
              height: star.size,
              background: star.color,
              animation: `celebrate ${star.duration}s ease-out ${star.delay}s infinite`,
              zIndex: 10,
            }}
          />
        ))}

        <div className="text-center z-20 px-4">
          <div
            className="text-7xl mb-6"
            style={{ animation: "pixel-float 2s ease-in-out infinite" }}
          >
            ⭐
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#ffd700] mb-4"
            style={{ textShadow: "0 0 20px rgba(255, 215, 0, 0.5)" }}
          >
            감사합니다!
          </h1>
          <p className="text-[#e8f0fe]/80 text-lg mb-2">
            설문이 성공적으로 제출되었습니다
          </p>
          <p className="text-[#e8f0fe]/50 text-sm">
            복음온 겨울캠프에 함께 해주셔서 감사합니다 ❄️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f4e] to-[#0d1235] relative overflow-hidden">
      {/* 눈꽃 */}
      {snowflakes.map((snow) => (
        <div
          key={`snow-${snow.id}`}
          className="survey-snow"
          style={{
            left: `${snow.left}%`,
            width: snow.size,
            height: snow.size,
            animationDuration: `${snow.duration}s`,
            animationDelay: `${snow.delay}s`,
            opacity: snow.opacity,
          }}
        />
      ))}

      {/* 별 */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="survey-star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <div
            className="text-4xl mb-3"
            style={{ animation: "pixel-float 3s ease-in-out infinite" }}
          >
            ❄️
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#ffd700] mb-2"
            style={{ textShadow: "0 0 20px rgba(255, 215, 0, 0.3)" }}
          >
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-[#e8f0fe]/70 text-sm sm:text-base">
              {survey.description}
            </p>
          )}
        </div>

        {/* 설문 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {survey.questions.map((question, idx) => (
            <div
              key={question.id}
              className="bg-white/[0.07] backdrop-blur-sm border border-white/10 p-5 sm:p-6"
              style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.4)" }}
            >
              {/* 질문 라벨 */}
              <label className="block text-[#e8f0fe] text-sm sm:text-base font-medium mb-3">
                <span className="inline-block text-[#ffd700] text-xs mr-2 px-1.5 py-0.5 bg-[#ffd700]/10 border border-[#ffd700]/30">
                  Q{idx + 1}
                </span>
                {question.label}
                {question.isRequired && (
                  <span className="text-[#ff6b9d] ml-1">*</span>
                )}
              </label>

              {/* 입력 필드 */}
              {question.type === "text" && (
                <input
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder || ""}
                  className="w-full bg-white/[0.06] border border-white/15 text-[#e8f0fe] px-4 py-3 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#ffd700]/50 focus:bg-white/[0.08] transition-colors"
                />
              )}

              {question.type === "textarea" && (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder || ""}
                  rows={3}
                  className="w-full bg-white/[0.06] border border-white/15 text-[#e8f0fe] px-4 py-3 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#ffd700]/50 focus:bg-white/[0.08] transition-colors resize-none"
                />
              )}

              {question.type === "radio" && question.options && (
                <div className="space-y-2">
                  {(JSON.parse(question.options) as string[]).map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 cursor-pointer px-4 py-3 border transition-colors ${
                        answers[question.id] === option
                          ? "bg-[#ffd700]/10 border-[#ffd700]/40 text-[#ffd700]"
                          : "bg-white/[0.03] border-white/10 text-[#e8f0fe]/80 hover:bg-white/[0.06]"
                      }`}
                    >
                      {/* 픽셀 스타일 라디오 */}
                      <div
                        className={`w-4 h-4 border-2 flex items-center justify-center shrink-0 ${
                          answers[question.id] === option
                            ? "border-[#ffd700] bg-[#ffd700]"
                            : "border-white/30"
                        }`}
                      >
                        {answers[question.id] === option && (
                          <div className="w-2 h-2 bg-[#0a0e27]" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleChange(question.id, e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* 에러 메시지 */}
              {errors[question.id] && (
                <p className="mt-2 text-[#ff6b9d] text-xs">
                  ⚠ {errors[question.id]}
                </p>
              )}
            </div>
          ))}

          {/* 제출 버튼 */}
          <div className="pt-4 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ffd700] text-[#0a0e27] font-bold py-4 text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffe44d] active:translate-y-[2px]"
              style={{
                boxShadow: isSubmitting
                  ? "none"
                  : "4px 4px 0px rgba(0,0,0,0.5)",
              }}
            >
              {isSubmitting ? "제출 중..." : "제출하기 ⭐"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

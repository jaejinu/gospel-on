"use client";

import { useState, useMemo, useRef } from "react";
import { getSurveyTheme } from "./theme";

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

// 눈꽃 데이터 생성 (겨울)
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

// 별 데이터 생성 (겨울)
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

// 물방울 데이터 생성 (여름)
function generateBubbles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 6 + Math.random() * 12,
    duration: 7 + Math.random() * 10,
    delay: Math.random() * 10,
  }));
}

// 햇살 반짝임 데이터 생성 (여름)
function generateSparkles(count: number) {
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
function generateCelebrationStars(count: number, colors: string[]) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 10 + Math.random() * 80,
    size: 4 + Math.random() * 8,
    duration: 1.5 + Math.random() * 2,
    delay: Math.random() * 1.5,
    color: colors[i % colors.length],
  }));
}

export default function SurveyForm({ survey }: { survey: Survey }) {
  const theme = getSurveyTheme(survey);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isWinter = theme.name === "winter";
  const snowflakes = useMemo(() => (isWinter ? generateSnowflakes(18) : []), [isWinter]);
  const stars = useMemo(() => (isWinter ? generateStars(30) : []), [isWinter]);
  const bubbles = useMemo(() => (isWinter ? [] : generateBubbles(14)), [isWinter]);
  const sparkles = useMemo(() => (isWinter ? [] : generateSparkles(24)), [isWinter]);
  const celebrationStars = useMemo(
    () => generateCelebrationStars(20, theme.celebrationColors),
    [theme.celebrationColors]
  );

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
    let firstErrorId: string | null = null;
    for (const q of survey.questions) {
      if (q.isRequired && (!answers[q.id] || answers[q.id].trim() === "")) {
        newErrors[q.id] = "필수 항목입니다";
        if (!firstErrorId) firstErrorId = q.id;
      }
    }
    setErrors(newErrors);

    if (firstErrorId) {
      const errorCount = Object.keys(newErrors).length;
      const firstErrorQuestion = survey.questions.find((q) => q.id === firstErrorId);
      alert(`입력하지 않은 항목이 ${errorCount}개 있습니다.\n\n→ "${firstErrorQuestion?.label}"`);

      // 해당 질문으로 스크롤 + 포커스
      const el = questionRefs.current[firstErrorId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // 스크롤 완료 후 입력 필드에 포커스
        setTimeout(() => {
          const input = el.querySelector<HTMLElement>("input:not([type=radio]), textarea");
          if (input) {
            input.focus();
          }
        }, 500);
      }
    }

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
      <div className={`min-h-screen ${theme.pageBg} flex items-center justify-center relative overflow-hidden`}>
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
            {theme.completeEmoji}
          </div>
          <h1
            className={`text-3xl sm:text-4xl font-bold ${theme.titleText} mb-4`}
            style={{ textShadow: theme.completeTitleShadow }}
          >
            감사합니다!
          </h1>
          <p className={`${theme.completeText} text-lg mb-2`}>
            설문이 성공적으로 제출되었습니다
          </p>
          <p className={`${theme.completeSubText} text-sm`}>
            {theme.completeMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.pageBg} relative overflow-hidden`}>
      {/* 눈꽃 (겨울) */}
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

      {/* 별 (겨울) */}
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

      {/* 물방울 (여름) */}
      {bubbles.map((bubble) => (
        <div
          key={`bubble-${bubble.id}`}
          className="survey-bubble"
          style={{
            left: `${bubble.left}%`,
            width: bubble.size,
            height: bubble.size,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      {/* 햇살 반짝임 (여름) */}
      {sparkles.map((sparkle) => (
        <div
          key={`sparkle-${sparkle.id}`}
          className="survey-sparkle"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            width: sparkle.size,
            height: sparkle.size,
            animationDuration: `${sparkle.duration}s`,
            animationDelay: `${sparkle.delay}s`,
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
            {theme.headerEmoji}
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${theme.titleText} mb-2`}
            style={{ textShadow: theme.titleShadow }}
          >
            {survey.title}
          </h1>
          {survey.description && (
            <p className={`${theme.descText} text-sm sm:text-base`}>
              {survey.description}
            </p>
          )}
        </div>

        {/* 설문 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {survey.questions.map((question, idx) => (
            <div
              key={question.id}
              ref={(el) => { questionRefs.current[question.id] = el; }}
              className={`${theme.cardBase} p-5 sm:p-6 transition-colors ${
                errors[question.id] ? theme.cardErrorBorder : "border-white/10"
              }`}
              style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.4)" }}
            >
              {/* 질문 라벨 */}
              <label className={`block ${theme.labelText} text-sm sm:text-base font-medium mb-3`}>
                <span className={`inline-block ${theme.badge} text-xs mr-2 px-1.5 py-0.5`}>
                  Q{idx + 1}
                </span>
                {question.label}
                {question.isRequired && (
                  <span className={`${theme.requiredMark} ml-1`}>*</span>
                )}
              </label>

              {/* 입력 필드 */}
              {question.type === "text" && (
                <input
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder || ""}
                  className={`w-full ${theme.input} px-4 py-3 text-sm transition-colors`}
                />
              )}

              {question.type === "textarea" && (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder || ""}
                  rows={3}
                  className={`w-full ${theme.input} px-4 py-3 text-sm transition-colors resize-none`}
                />
              )}

              {question.type === "radio" && question.options && (
                <div className="space-y-2">
                  {(JSON.parse(question.options) as string[]).map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 cursor-pointer px-4 py-3 border transition-colors ${
                        answers[question.id] === option
                          ? theme.radioSelected
                          : theme.radioUnselected
                      }`}
                    >
                      {/* 픽셀 스타일 라디오 */}
                      <div
                        className={`w-4 h-4 border-2 flex items-center justify-center shrink-0 ${
                          answers[question.id] === option
                            ? theme.radioBoxSelected
                            : theme.radioBoxUnselected
                        }`}
                      >
                        {answers[question.id] === option && (
                          <div className={`w-2 h-2 ${theme.radioDot}`} />
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
                <p className={`mt-2 ${theme.errorText} text-xs`}>
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
              className={`w-full ${theme.submitBtn} font-bold py-4 text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                boxShadow: isSubmitting
                  ? "none"
                  : "4px 4px 0px rgba(0,0,0,0.5)",
              }}
            >
              {isSubmitting ? "제출 중..." : theme.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

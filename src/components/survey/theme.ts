// 설문 페이지 계절 테마. 설문 id/제목으로 테마를 결정한다.
// Tailwind JIT가 클래스를 인식하도록 모든 클래스는 리터럴 문자열로 유지할 것.

export type SurveyTheme = {
  name: "winter" | "summer";
  pageBg: string;
  headerEmoji: string;
  completeEmoji: string;
  titleText: string;
  titleShadow: string;
  descText: string;
  cardBase: string;
  cardBorder: string;
  cardErrorBorder: string;
  cardShadow: string;
  labelText: string;
  badge: string;
  requiredMark: string;
  input: string;
  radioSelected: string;
  radioUnselected: string;
  radioBoxSelected: string;
  radioBoxUnselected: string;
  radioDot: string;
  errorText: string;
  submitBtn: string;
  submitShadow: string;
  submitLabel: string;
  completeTitleShadow: string;
  completeText: string;
  completeSubText: string;
  completeMessage: string;
  celebrationColors: string[];
  closedText: string;
};

export const SURVEY_THEMES: Record<"winter" | "summer", SurveyTheme> = {
  winter: {
    name: "winter",
    pageBg: "bg-gradient-to-b from-[#0a0e27] via-[#1a1f4e] to-[#0d1235]",
    headerEmoji: "❄️",
    completeEmoji: "⭐",
    titleText: "text-[#ffd700]",
    titleShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
    descText: "text-[#e8f0fe]/70",
    cardBase: "bg-white/[0.07] backdrop-blur-sm border",
    cardBorder: "border-white/10",
    cardErrorBorder: "border-[#ff6b9d]/60",
    cardShadow: "4px 4px 0px rgba(0,0,0,0.4)",
    labelText: "text-[#e8f0fe]",
    badge: "text-[#ffd700] bg-[#ffd700]/10 border border-[#ffd700]/30",
    requiredMark: "text-[#ff6b9d]",
    input:
      "bg-white/[0.06] border border-white/15 text-[#e8f0fe] placeholder:text-white/25 focus:outline-none focus:border-[#ffd700]/50 focus:bg-white/[0.08]",
    radioSelected: "bg-[#ffd700]/10 border-[#ffd700]/40 text-[#ffd700]",
    radioUnselected:
      "bg-white/[0.03] border-white/10 text-[#e8f0fe]/80 hover:bg-white/[0.06]",
    radioBoxSelected: "border-[#ffd700] bg-[#ffd700]",
    radioBoxUnselected: "border-white/30",
    radioDot: "bg-[#0a0e27]",
    errorText: "text-[#ff6b9d]",
    submitBtn:
      "bg-[#ffd700] text-[#0a0e27] hover:bg-[#ffe44d] active:translate-y-[2px]",
    submitShadow: "4px 4px 0px rgba(0,0,0,0.5)",
    submitLabel: "제출하기 ⭐",
    completeTitleShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
    completeText: "text-[#e8f0fe]/80",
    completeSubText: "text-[#e8f0fe]/50",
    completeMessage: "복음온 겨울캠프에 함께 해주셔서 감사합니다 ❄️",
    celebrationColors: ["#ffd700", "#4fc3f7", "#e8f0fe", "#ff6b9d", "#c084fc"],
    closedText: "text-[#e8f0fe]",
  },
  summer: {
    name: "summer",
    pageBg: "bg-gradient-to-b from-[#7dd3fc] via-[#38bdf8] to-[#0284c7]",
    headerEmoji: "☀️",
    completeEmoji: "🌊",
    titleText: "text-[#0c4a6e]",
    titleShadow: "0 2px 16px rgba(255, 255, 255, 0.6)",
    descText: "text-[#0c4a6e]/75",
    cardBase: "bg-white/95 backdrop-blur-sm border rounded-2xl",
    cardBorder: "border-white/70",
    cardErrorBorder: "border-[#f43f5e]",
    cardShadow: "0 8px 24px rgba(2, 62, 105, 0.18)",
    labelText: "text-[#1e3a5f]",
    badge:
      "text-[#0369a1] bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-full",
    requiredMark: "text-[#f43f5e]",
    input:
      "bg-[#f0f9ff] border border-[#bae6fd] text-[#0c4a6e] rounded-xl placeholder:text-[#0c4a6e]/35 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 focus:bg-white",
    radioSelected:
      "bg-[#0ea5e9]/10 border-[#0ea5e9] text-[#0369a1] font-medium rounded-xl",
    radioUnselected:
      "bg-white border-[#e2e8f0] text-[#334155] hover:bg-[#f0f9ff] hover:border-[#bae6fd] rounded-xl",
    radioBoxSelected: "border-[#0ea5e9] bg-[#0ea5e9] rounded-full",
    radioBoxUnselected: "border-[#94a3b8] rounded-full",
    radioDot: "bg-white rounded-full",
    errorText: "text-[#e11d48]",
    submitBtn:
      "bg-gradient-to-r from-[#fde047] to-[#fbbf24] text-[#0c4a6e] rounded-2xl hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0",
    submitShadow: "0 10px 24px rgba(2, 62, 105, 0.3)",
    submitLabel: "제출하기 🌊",
    completeTitleShadow: "0 2px 12px rgba(255, 255, 255, 0.5)",
    completeText: "text-[#0c4a6e]/90",
    completeSubText: "text-[#0c4a6e]/70",
    completeMessage: "복음온 여름수련회에 함께 해주셔서 감사합니다 🌊",
    celebrationColors: ["#fde047", "#ffffff", "#34d399", "#fb923c", "#0c4a6e"],
    closedText: "text-[#0c4a6e]",
  },
};

export function getSurveyTheme(survey: { id: string; title: string }): SurveyTheme {
  return survey.id.includes("summer") || survey.title.includes("여름")
    ? SURVEY_THEMES.summer
    : SURVEY_THEMES.winter;
}

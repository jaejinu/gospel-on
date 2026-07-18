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
  cardErrorBorder: string;
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
    cardErrorBorder: "border-[#ff6b9d]/60",
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
    pageBg: "bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#075985]",
    headerEmoji: "☀️",
    completeEmoji: "🌊",
    titleText: "text-[#fde047]",
    titleShadow: "0 0 20px rgba(253, 224, 71, 0.4)",
    descText: "text-white/85",
    cardBase: "bg-white/[0.14] backdrop-blur-sm border",
    cardErrorBorder: "border-[#ff6b9d]/70",
    labelText: "text-white",
    badge: "text-[#fde047] bg-[#fde047]/15 border border-[#fde047]/40",
    requiredMark: "text-[#ff6b9d]",
    input:
      "bg-white/[0.12] border border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-[#fde047]/60 focus:bg-white/[0.16]",
    radioSelected: "bg-[#fde047]/20 border-[#fde047]/60 text-[#fde047]",
    radioUnselected:
      "bg-white/[0.08] border-white/25 text-white/90 hover:bg-white/[0.14]",
    radioBoxSelected: "border-[#fde047] bg-[#fde047]",
    radioBoxUnselected: "border-white/50",
    radioDot: "bg-[#075985]",
    errorText: "text-[#ffe4ef]",
    submitBtn:
      "bg-[#fde047] text-[#075985] hover:bg-[#fef08a] active:translate-y-[2px]",
    submitLabel: "제출하기 🌊",
    completeTitleShadow: "0 0 20px rgba(253, 224, 71, 0.5)",
    completeText: "text-white/90",
    completeSubText: "text-white/70",
    completeMessage: "복음온 여름수련회에 함께 해주셔서 감사합니다 🌊",
    celebrationColors: ["#fde047", "#ffffff", "#34d399", "#fb923c", "#4fc3f7"],
    closedText: "text-white",
  },
};

export function getSurveyTheme(survey: { id: string; title: string }): SurveyTheme {
  return survey.id.includes("summer") || survey.title.includes("여름")
    ? SURVEY_THEMES.summer
    : SURVEY_THEMES.winter;
}

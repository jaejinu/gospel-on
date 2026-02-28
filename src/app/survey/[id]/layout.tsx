import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "설문조사 | 복음온",
  description: "복음온 겨울캠프 설문조사",
};

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {children}
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "예약 조회 | 복음온",
  description: "수련회 예약 상태를 이름과 연락처로 조회할 수 있습니다.",
  openGraph: {
    title: "예약 조회 | 복음온",
    description: "수련회 예약 상태를 조회하세요.",
    siteName: "복음온",
    locale: "ko_KR",
  },
};

export default function ReservationLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

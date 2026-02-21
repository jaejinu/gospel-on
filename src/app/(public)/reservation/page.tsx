import { Metadata } from "next";
import ReservationForm from "@/components/reservation/ReservationForm";

export const metadata: Metadata = {
  title: "수련회 예약 | 복음온",
  description: "복음온 수련회 예약 신청 페이지입니다.",
};

export default function ReservationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            수련회 예약 신청
          </h1>
          <p className="text-muted">
            아래 양식을 작성하여 수련회를 신청해주세요.
          </p>
        </div>

        <ReservationForm />
      </div>
    </div>
  );
}

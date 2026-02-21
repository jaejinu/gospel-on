import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "복음온이란 | 복음온",
  description: "복음온은 엘림교회에서 진행하는 수련회 사역입니다.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* 히어로 - 사진 배경 + primary 반투명 오버레이 */}
      <section className="relative text-white py-24 overflow-hidden">
        <Image
          src="https://picsum.photos/id/15/1920/600"
          alt="소개 배경"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">복음온이란</h1>
          <p className="text-xl text-white/80">
            엘림교회에서 진행하는 수련회 사역
          </p>
        </div>
      </section>

      {/* 소개 */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-primary mb-6">우리의 비전</h2>
            <p className="text-muted leading-relaxed mb-8">
              복음온은 엘림교회에서 진행하는 수련회 사역입니다.
              말씀 중심의 프로그램과 체계적인 운영을 통해 복음으로 하나 되는 수련회를 만들어갑니다.
            </p>

            <h2 className="text-2xl font-bold text-primary mb-6">사역 내용</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-warm-bg rounded-xl">
                <h3 className="font-bold text-foreground mb-2">수련회 기획 및 운영</h3>
                <p className="text-muted text-sm">교회의 상황과 필요에 맞춘 맞춤형 수련회를 기획하고 운영합니다.</p>
              </div>
              <div className="p-6 bg-warm-bg rounded-xl">
                <h3 className="font-bold text-foreground mb-2">전문 운영 팀</h3>
                <p className="text-muted text-sm">경험 풍부한 강사진과 운영 팀이 체계적으로 수련회를 진행합니다.</p>
              </div>
              <div className="p-6 bg-warm-bg rounded-xl">
                <h3 className="font-bold text-foreground mb-2">프로그램 개발</h3>
                <p className="text-muted text-sm">말씀 중심의 다양한 수련회 프로그램을 지속적으로 개발합니다.</p>
              </div>
              <div className="p-6 bg-warm-bg rounded-xl">
                <h3 className="font-bold text-foreground mb-2">후속 관리</h3>
                <p className="text-muted text-sm">수련회 이후에도 지속적인 피드백과 후속 관리를 제공합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

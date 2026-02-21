"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface HeroBannerProps {
  heroTitle?: string;
  heroSubtitle?: string;
}

export default function HeroBanner({ heroTitle, heroSubtitle }: HeroBannerProps) {
  return (
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
      {/* 배경 사진 */}
      <Image
        src="https://picsum.photos/id/15/1920/1080"
        alt="자연 풍경"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* 어두운 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      {/* 콘텐츠 */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          {heroTitle || "복음온"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" as const }}
          className="text-xl md:text-2xl text-white/90 mb-4"
        >
          Gospel-On
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" as const }}
          className="text-lg md:text-xl text-white/80 mb-12 leading-relaxed"
        >
          {heroSubtitle || (
            <>
              엘림교회에서 진행하는
              <br />
              복음으로 하나 되는 수련회
            </>
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" as const }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/reservation"
            className="px-8 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-full transition-colors text-lg"
          >
            수련회 예약하기
          </Link>
          <Link
            href="/about"
            className="px-8 py-3 border-2 border-white/50 hover:border-white text-white font-semibold rounded-full transition-colors text-lg"
          >
            더 알아보기
          </Link>
        </motion.div>
      </div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/70 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

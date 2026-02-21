"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const purposes = [
  {
    number: "01",
    title: "말씀 중심",
    description:
      "성경 말씀을 중심으로 한 프로그램을 통해 참가자들이 하나님의 뜻을 깊이 묵상할 수 있도록 합니다.",
    image: "https://picsum.photos/id/24/600/400",
  },
  {
    number: "02",
    title: "전문 운영 팀",
    description:
      "경험 풍부한 강사진과 운영 팀이 체계적으로 수련회를 진행합니다.",
    image: "https://picsum.photos/id/28/600/400",
  },
  {
    number: "03",
    title: "맞춤형 프로그램",
    description:
      "교회의 상황과 필요에 맞춘 프로그램을 기획하여 최적의 수련회를 제공합니다.",
    image: "https://picsum.photos/id/36/600/400",
  },
];

export default function PurposeSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            복음온의 사역
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            복음온은 엘림교회에서 진행하는 수련회 사역으로,
            복음으로 하나 되는 시간을 만들어가고 있습니다.
          </p>
        </motion.div>

        {/* zigzag 레이아웃 */}
        <div className="space-y-24">
          {purposes.map((purpose, index) => {
            const isReversed = index % 2 === 1;
            return (
              <motion.div
                key={purpose.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col ${isReversed ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-10 md:gap-16`}
              >
                {/* 이미지 */}
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={purpose.image}
                      alt={purpose.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* 텍스트 */}
                <div className="w-full md:w-1/2">
                  <span className="text-4xl font-bold text-accent/40">
                    {purpose.number}
                  </span>
                  <h3 className="text-2xl font-bold text-foreground mt-2 mb-4">
                    {purpose.title}
                  </h3>
                  <p className="text-muted leading-relaxed text-lg">
                    {purpose.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

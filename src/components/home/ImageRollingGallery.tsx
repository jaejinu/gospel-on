"use client";

import Image from "next/image";

// picsum 더미 이미지 fallback
const fallbackImages = [
  { id: "f1", url: "https://picsum.photos/id/10/400/300", caption: "수련회 풍경" },
  { id: "f2", url: "https://picsum.photos/id/11/400/300", caption: "자연 속에서" },
  { id: "f3", url: "https://picsum.photos/id/13/400/300", caption: "함께하는 시간" },
  { id: "f4", url: "https://picsum.photos/id/16/400/300", caption: "아름다운 풍경" },
  { id: "f5", url: "https://picsum.photos/id/17/400/300", caption: "추억의 순간" },
  { id: "f6", url: "https://picsum.photos/id/19/400/300", caption: "감사의 시간" },
];

interface RollingImage {
  id: string;
  url: string;
  caption: string | null;
}

interface ImageRollingGalleryProps {
  images?: RollingImage[];
}

export default function ImageRollingGallery({ images }: ImageRollingGalleryProps) {
  const displayImages = images && images.length > 0 ? images : fallbackImages;
  // 무한 롤링: 원본 세트 2번 반복 (1세트 이동 후 자연스럽게 반복)
  const doubled = [...displayImages, ...displayImages];

  // 카드 너비(288px) + gap(24px) = 312px per item
  const oneSetWidth = displayImages.length * 312;

  return (
    <section className="py-20 bg-warm-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            수련회 갤러리
          </h2>
          <p className="text-muted text-lg">
            함께한 소중한 순간들
          </p>
        </div>
      </div>

      {/* CSS 무한 롤링 */}
      <div className="relative">
        <div
          className="flex gap-6 rolling-track"
          style={{
            "--rolling-distance": `-${oneSetWidth}px`,
            "--rolling-duration": `${displayImages.length * 4}s`,
          } as React.CSSProperties}
        >
          {doubled.map((image, index) => (
            <div
              key={`${image.id}-${index}`}
              className="flex-shrink-0 w-72 h-48 rounded-xl overflow-hidden shadow-md relative"
            >
              <Image
                src={image.url}
                alt={image.caption || "갤러리 이미지"}
                fill
                className="object-cover"
                sizes="288px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

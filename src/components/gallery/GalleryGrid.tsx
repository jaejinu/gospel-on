"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  likeCount?: number;
}

interface CategoryWithImages {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  images: GalleryImage[];
}

interface GalleryGridProps {
  categories: CategoryWithImages[];
}

export default function GalleryGrid({ categories }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithImages | null>(null);

  return (
    <>
      {/* 카테고리 썸네일 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const thumbnail = cat.thumbnailUrl || cat.images[0]?.url;
          if (!thumbnail) return null;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-gray-100 text-left active:scale-[0.98]"
            >
              <Image
                src={thumbnail}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-white text-xl font-bold">{cat.name}</h3>
                <p className="text-white/90 text-sm mt-1">
                  사진 {cat.images.length}장
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 빈 카테고리만 있을 경우 */}
      {categories.every((c) => !c.thumbnailUrl && c.images.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted text-lg">아직 등록된 사진이 없습니다.</p>
          <p className="text-muted text-sm mt-2">곧 수련회 사진이 업로드됩니다.</p>
        </div>
      )}

      {/* 슬라이드쇼 모달 */}
      {selectedCategory && (
        <SlideshowModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </>
  );
}

// 방문자 ID 생성/조회 (좋아요 중복 방지)
function getVisitorId(): string {
  const key = "gallery_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// 슬라이드쇼 모달 컴포넌트
function SlideshowModal({
  category,
  onClose,
}: {
  category: CategoryWithImages;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const images = category.images;

  // 초기 좋아요 수 세팅
  useEffect(() => {
    const initial: Record<string, number> = {};
    for (const img of images) {
      initial[img.id] = img.likeCount || 0;
    }
    setLikes(initial);
  }, [images]);

  const handleLike = async (imageId: string) => {
    try {
      const visitorId = getVisitorId();
      const res = await fetch(`/api/gallery/images/${imageId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });
      const result = await res.json();
      if (result.success) {
        setLikes((prev) => ({ ...prev, [imageId]: result.data.likeCount }));
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (result.data.liked) next.add(imageId);
          else next.delete(imageId);
          return next;
        });
      }
    } catch {
      // 무시
    }
  };

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // 자동 슬라이드 (3초 간격)
  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const timer = setInterval(goNext, 3000);
    return () => clearInterval(timer);
  }, [isPaused, goNext, images.length]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        goPrev();
        setIsPaused(true);
      }
      if (e.key === "ArrowRight") {
        goNext();
        setIsPaused(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goNext, goPrev]);

  if (images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
      {/* 상단 헤더 */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 z-10">
        <h2 className="text-white text-lg font-semibold">{category.name}</h2>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-2"
          aria-label="닫기"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 이미지 영역 */}
      <div
        className="relative w-full flex-1 flex items-center justify-center px-16"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative w-full max-w-5xl aspect-[4/3]">
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].caption || `${category.name} 사진 ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* 좌/우 화살표 */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => { goPrev(); setIsPaused(true); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
              aria-label="이전 사진"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => { goNext(); setIsPaused(true); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
              aria-label="다음 사진"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* 하단 인디케이터 + 캡션 + 좋아요 */}
      <div className="absolute bottom-0 inset-x-0 p-4 text-center">
        {images[currentIndex].caption && (
          <p className="text-white/80 text-sm mb-2">{images[currentIndex].caption}</p>
        )}
        <div className="flex items-center justify-center gap-4 mb-1">
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={() => handleLike(images[currentIndex].id)}
            className="flex items-center gap-1.5 text-white/80 hover:text-red-400 transition-colors"
            aria-label={likedIds.has(images[currentIndex].id) ? "좋아요 취소" : "좋아요"}
          >
            <svg
              className={`w-5 h-5 ${likedIds.has(images[currentIndex].id) ? "text-red-400 fill-red-400" : ""}`}
              fill={likedIds.has(images[currentIndex].id) ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm">{likes[images[currentIndex].id] || 0}</span>
          </motion.button>
        </div>
        <p className="text-white/80 text-sm">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}

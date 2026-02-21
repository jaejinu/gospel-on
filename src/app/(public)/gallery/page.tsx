import { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCategoryName } from "@/lib/gallery";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "갤러리 | 복음온",
  description: "복음온 수련회 활동 사진 갤러리입니다.",
};

async function getGalleryData() {
  const categories = await prisma.galleryCategory.findMany({
    orderBy: [{ year: "desc" }, { half: "desc" }],
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, caption: true, likeCount: true },
      },
    },
  });

  return categories;
}

export default async function GalleryPage() {
  const categories = await getGalleryData();

  const hasImages = categories.some((c) => c.images.length > 0);

  return (
    <div className="min-h-screen">
      {/* 히어로 - 사진 배경 + primary 반투명 오버레이 */}
      <section className="relative text-white py-24 overflow-hidden">
        <Image
          src="https://picsum.photos/id/36/1920/600"
          alt="갤러리 배경"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">갤러리</h1>
          <p className="text-xl text-white/80">
            함께한 소중한 순간들
          </p>
        </div>
      </section>

      {/* 갤러리 그리드 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {hasImages ? (
            <GalleryGrid
              categories={categories.map((c) => ({
                id: c.id,
                name: formatCategoryName(c.year, c.half),
                thumbnailUrl: c.thumbnailUrl,
                images: c.images,
              }))}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted text-lg">아직 등록된 사진이 없습니다.</p>
              <p className="text-muted text-sm mt-2">곧 수련회 사진이 업로드됩니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

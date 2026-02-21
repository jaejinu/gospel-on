import { prisma } from "@/lib/prisma";
import HeroBanner from "@/components/home/HeroBanner";
import ImageRollingGallery from "@/components/home/ImageRollingGallery";
import PurposeSection from "@/components/home/PurposeSection";
import LocationMap from "@/components/home/LocationMap";

export const dynamic = "force-dynamic";

async function getGalleryImages() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { id: true, url: true, caption: true },
  });
  return images;
}

async function getHeroSettings() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["hero_title", "hero_subtitle"] } },
  });
  const data: Record<string, string> = {};
  for (const s of settings) {
    data[s.key] = s.value;
  }
  return data;
}

export default async function HomePage() {
  const [galleryImages, heroSettings] = await Promise.all([
    getGalleryImages(),
    getHeroSettings(),
  ]);

  return (
    <>
      <HeroBanner
        heroTitle={heroSettings.hero_title}
        heroSubtitle={heroSettings.hero_subtitle}
      />
      <ImageRollingGallery
        images={galleryImages.length > 0 ? galleryImages : undefined}
      />
      <PurposeSection />
      <LocationMap />
    </>
  );
}

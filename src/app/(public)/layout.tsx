import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getSiteSettings() {
  const settings = await prisma.siteSetting.findMany();
  const data: Record<string, string> = {};
  for (const s of settings) {
    data[s.key] = s.value;
  }
  return data;
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer settings={settings} />
      <ScrollToTop />
    </>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://gospelon.org"),
  title: "복음온 | Gospel-On",
  description: "복음온 - 엘림교회 수련회 사역. 복음으로 하나 되는 수련회를 만들어갑니다.",
  keywords: ["복음온", "수련회", "엘림교회", "Gospel-On", "교회 수련회"],
  openGraph: {
    title: "복음온 | Gospel-On",
    description: "엘림교회 수련회 사역",
    type: "website",
    siteName: "복음온",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

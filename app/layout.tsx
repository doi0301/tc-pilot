import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./globals.css";
import { AdminAuthProvider } from "@/components/AdminAuthProvider";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TC Pilot — 기획 테스트 도구",
  description: "기획서 → TC 자동 생성 → 테스트 실행 → 이슈 등록(Notion) 하나의 흐름",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full dark">
      <body
        className={`${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}

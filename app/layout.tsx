import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from "@/components/AdminAuthProvider";

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
    <html lang="ko" className="h-full">
      <body className="antialiased min-h-screen flex flex-col">
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Abroad OS",
  description: "ค้นหาหลักสูตรปริญญาตรีต่างประเทศสำหรับนักเรียนไทย",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIL — Today I Learned",
  description:
    "A personal knowledge base of things learned, one entry at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full font-serif">{children}</body>
    </html>
  );
}

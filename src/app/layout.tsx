import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackgroundFlowers } from "@/components/shared/BackgroundFlowers";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bloom — Mental Health Companion",
  description: "A safe, private space to reflect, express, and grow with AI-powered mental health support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-[100dvh] flex flex-col relative overflow-x-hidden">
        <BackgroundFlowers />
        {children}
      </body>
    </html>
  );
}

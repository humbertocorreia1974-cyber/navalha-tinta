import { JgnextAssistant } from "@/components/jgnext-assistant";
import { A11yPolish } from '@/components/a11y-polish';
import { SiteFooter } from '@/components/site-footer';
import { PageBackdrop } from '@/components/page-backdrop';
import { AdminDataPill } from '@/components/admin-data-pill';
import { Suspense } from 'react';
import { NavProgress } from '@/components/nav-progress';
import CookieConsent from '@/components/cookie-consent';
import { AppNav } from "@/components/app-nav";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import GuidePill from '@/components/guide-pill';

const body = Inter({ subsets: ["latin"], weight: ["400","700"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], weight: ["400","700"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Navalha & Tinta",
  description: "Barbearia premium com agendamento online por barbeiro, planos de assinatura mensal e identidade clássica e ousada.",
};

export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 5 };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <A11yPolish />
        <PageBackdrop />
        <Suspense fallback={null}><NavProgress /></Suspense>
        <Providers><AppNav />{children}<SiteFooter /></Providers>
              <JgnextAssistant />
        <CookieConsent />
        <GuidePill />
        <AdminDataPill />
      </body>
    </html>
  );
}

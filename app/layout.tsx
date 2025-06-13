import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

// تحميل خط Cairo العربي الحديث والمناسب للنظام
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
  fallback: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
})

export const metadata: Metadata = {
  title: "تكلفة - نظام التسعير الذكي",
  description: "نظام ذكي لحساب التكاليف وتحديد الأسعار المثالية للمنتجات",
  keywords: ["تسعير", "تكاليف", "ربح", "منتجات", "تجارة"],
  authors: [{ name: "تكلفة" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={`${cairo.className} antialiased font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

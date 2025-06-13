"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useScreenInfo } from "@/hooks/use-mobile"
import { Calculator, Package, BarChart3, Home, PieChart, Tag, Percent, TrendingUp, ChevronLeft } from "lucide-react"
import { SettingsDialog } from "@/components/Settings"
import { UserNav } from "./user-nav"
import { motion } from "framer-motion"

interface NavigationItem {
  title: string
  href: string
  icon: React.ReactNode
  description?: string
  badge?: string
  badgeColor?: string
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet } = useScreenInfo()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // أثناء التغيير بين الصفحات، نغلق القائمة الجانبية
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const mainNavItems: NavigationItem[] = [
    {
      title: "الرئيسية",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "المنتجات",
      href: "/products",
      icon: <Package className="h-5 w-5" />,
      description: "إدارة وتسعير المنتجات",
    },
    {
      title: "التسعير الذكي",
      href: "/pricing/calculator", // تم تغيير الرابط مباشرة إلى الحاسبة
      icon: <Calculator className="h-5 w-5" />,
      description: "أدوات وتحليلات التسعير",
    },
    {
      title: "مستشارك الذكي",
      href: "/advisor",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "تحليلات ذكية وتوصيات مخصصة",
      badge: "تجريبي", // تم تغيير "قريباً" إلى "تجريبي"
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
  ]

  // Eliminar todos los quickActions
  const quickActions: NavigationItem[] = []

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/40" dir="rtl">
      {/* Header with navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo and System Name - Right side (First in RTL) */}
          <div className="flex items-center gap-2 me-auto">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full p-2 shadow-sm group-hover:shadow-md transition-all duration-300">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
                  تكلفة
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">إدارة الأسعار والربحية بذكاء</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Middle */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg relative group",
                    isActive ? "bg-indigo-50 text-indigo-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <span
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.title}</span>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full border",
                        item.badgeColor || "bg-indigo-100 text-indigo-800 border-indigo-200",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User controls - Left side (Last in RTL) */}
          <div className="flex items-center gap-2 md:gap-4 ms-auto">
            <UserNav />
            <SettingsDialog />
          </div>
        </div>
      </header>

      {/* Mobile navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <nav className="flex items-center justify-around">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 px-1 text-xs font-medium relative",
                  isActive ? "text-indigo-900" : "text-gray-500 hover:text-gray-900",
                )}
              >
                <span
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "text-indigo-600 scale-110" : "text-gray-400",
                  )}
                >
                  {item.icon}
                </span>
                <span className="mt-1 text-[10px] line-clamp-1">{item.title}</span>

                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator-mobile"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-indigo-500"
                  />
                )}

                {item.badge && (
                  <span
                    className={cn(
                      "absolute top-1 right-1/4 text-[8px] min-w-[14px] h-[14px] flex items-center justify-center px-1 rounded-full border",
                      item.badgeColor || "bg-indigo-100 text-indigo-800 border-indigo-200",
                    )}
                  >
                    •
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 pb-16 md:pb-0">
        {/* Page content */}
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6" dir="rtl">
          <div className="max-w-full overflow-x-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

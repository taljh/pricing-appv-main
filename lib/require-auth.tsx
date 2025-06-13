"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-context"

interface RequireAuthProps {
  children: React.ReactNode
}

// مكون للتحقق من المصادقة في مكونات العميل
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // حفظ المسار الحالي للعودة إليه بعد تسجيل الدخول
      const returnPath = encodeURIComponent(pathname)
      router.push(`/auth/login?returnTo=${returnPath}`)
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // عرض شاشة تحميل أثناء التحقق من المصادقة
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    )
  }

  // عرض المحتوى فقط إذا كان المستخدم مصادق
  return isAuthenticated ? <>{children}</> : null
}

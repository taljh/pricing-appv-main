import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const { pathname } = req.nextUrl

    // المسارات العامة التي لا تحتاج مصادقة
    const publicPaths = [
      "/auth/login",
      "/auth/signup",
      "/auth/reset",
      "/auth/callback",
      "/favicon.ico",
      "/_next",
      "/api",
    ]

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

    // السماح بالمسارات العامة دون فحص
    if (isPublicPath) {
      return res
    }

    // فحص الجلسة للمسارات المحمية
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    console.log("[Middleware] Path:", pathname, "Session:", !!session, "Error:", !!error)

    // إذا لم توجد جلسة، إعادة توجيه لتسجيل الدخول
    if (!session || error) {
      console.log("[Middleware] No session, redirecting to login")
      const loginUrl = new URL("/auth/login", req.url)
      return NextResponse.redirect(loginUrl)
    }

    // السماح بالوصول للمسارات المحمية
    return res
  } catch (error) {
    console.error("[Middleware] Error:", error)
    // في حالة الخطأ، السماح بالمرور لتجنب حلقة إعادة التوجيه
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

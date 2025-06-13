import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// معالج مسار لاستقبال عمليات إعادة التوجيه من Supabase Auth
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const returnTo = requestUrl.searchParams.get("returnTo") || "/"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // تبادل الرمز للحصول على جلسة
    await supabase.auth.exchangeCodeForSession(code)

    // إعادة التوجيه إلى الصفحة المطلوبة أو الصفحة الرئيسية
    return NextResponse.redirect(new URL(decodeURIComponent(returnTo), requestUrl.origin))
  }

  // إذا لم يكن هناك رمز، إعادة التوجيه إلى صفحة تسجيل الدخول
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LogIn } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // التحقق من الجلسة الحالية
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          console.log("[Login] User already logged in, redirecting...")
          router.replace("/")
        }
      } catch (error) {
        console.error("[Login] Session check error:", error)
      }
    }

    checkSession()
  }, [supabase.auth, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[Login] Attempting login for:", email)

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (loginError) {
        console.error("[Login] Error:", loginError.message)

        if (loginError.message.includes("Invalid login credentials")) {
          setError("بيانات تسجيل الدخول غير صحيحة")
        } else if (loginError.message.includes("Email not confirmed")) {
          setError("يرجى تأكيد البريد الإلكتروني أولاً")
        } else {
          setError("حدث خطأ أثناء تسجيل الدخول: " + loginError.message)
        }
        return
      }

      if (data?.user && data?.session) {
        console.log("[Login] Success! User:", data.user.id)
        toast.success("تم تسجيل الدخول بنجاح")

        // إعادة توجيه فورية
        window.location.href = "/"
      } else {
        setError("حدث خطأ غير متوقع")
      }
    } catch (err) {
      console.error("[Login] Exception:", err)
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">تسجيل الدخول</CardTitle>
            <CardDescription className="text-gray-600">أدخل بيانات حسابك للوصول إلى تكلفة</CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-right">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-right">
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  إنشاء حساب جديد
                </Link>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}

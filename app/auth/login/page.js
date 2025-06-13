"use client"

import { useState } from "react"
import { signInWithEmail } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PieChart, LogIn, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور")
      return
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await signInWithEmail(email, password)

      if (signInError) {
        console.error("Login error:", signInError)

        if (signInError.message.includes("Invalid login credentials")) {
          setError("بيانات الدخول غير صحيحة. تأكد من البريد الإلكتروني وكلمة المرور، أو قم بإنشاء حساب جديد.")
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("يرجى تأكيد بريدك الإلكتروني أولاً")
        } else {
          setError(signInError.message || "حدث خطأ أثناء تسجيل الدخول")
        }
        setLoading(false)
        return
      }

      if (!data?.user) {
        setError("لم يتم العثور على المستخدم")
        setLoading(false)
        return
      }

      console.log("Login successful, redirecting...")
      router.replace("/")
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-l from-indigo-50 via-purple-50 to-blue-50 px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="bg-indigo-100 rounded-full p-3 mb-4">
          <PieChart className="h-10 w-10 text-indigo-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">نظام التسعير المتقدم</h1>
        <p className="text-gray-600 mt-1">إدارة أسعار منتجاتك بكفاءة عالية</p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-indigo-100">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بيانات حسابك للوصول إلى النظام</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant={error.includes("بنجاح") ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4 ml-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="demo@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                dir="ltr"
                className="text-right"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <Link href="/auth/reset" className="text-xs text-indigo-600 hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                dir="ltr"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>تسجيل الدخول</span>
                </span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            ليس لديك حساب؟{" "}
            <Link href="/auth/signup" className="text-indigo-600 hover:underline">
              إنشاء حساب جديد
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUpWithEmail } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, UserPlus, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!email || !password || !confirmPassword || !fullName) {
      setError("جميع الحقول مطلوبة")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      setIsLoading(false)
      return
    }

    try {
      console.log("[Signup] Starting signup process for:", email)

      // إنشاء الحساب مع البيانات المطلوبة
      const { data, error } = await signUpWithEmail(email, password, {
        email: email.trim(),
        full_name: fullName.trim()
      })

      if (error) {
        console.error("[Signup] Error:", error)

        if (error.message.includes("User already registered")) {
          setError("البريد الإلكتروني مسجل بالفعل")
        } else if (error.message.includes("Invalid email")) {
          setError("البريد الإلكتروني غير صحيح")
        } else if (error.message.includes("Password")) {
          setError("كلمة المرور ضعيفة جداً")
        } else {
          setError(error.message)
        }
        setIsLoading(false)
        return
      }

      if (data) {
        console.log("[Signup] Success:", data)
        setSuccess(true)
        toast.success("تم إنشاء الحساب بنجاح!")

        if (!data.session) {
          toast.info("تم إرسال رابط التأكيد إلى بريدك الإلكتروني")
        } else {
          setTimeout(() => {
            router.push("/")
          }, 2000)
        }
      }
    } catch (err: any) {
      console.error("[Signup] Exception:", err)
      setError("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-4">
          <Card className="border-green-200 shadow-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">تم إنشاء حسابك بنجاح!</CardTitle>
              <CardDescription>
                يمكنك الآن استخدام حسابك للدخول إلى التطبيق
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-full mb-4">
              <UserPlus className="w-10 h-10 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl text-center">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-center">
              أدخل بياناتك لإنشاء حساب جديد
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSignup}>
              <div className="grid gap-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </Button>

                <div className="text-center text-sm">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

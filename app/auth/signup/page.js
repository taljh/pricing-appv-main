'use client'

import { useState } from 'react'
import { signUpWithEmail, upsertProfile } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PieChart, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    const { email, name, password, confirmPassword } = formData
    
    // التحقق من صحة المدخلات
    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }
    
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }
    
    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    const { data, error: signUpError } = await signUpWithEmail(email, password)

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // إنشاء ملف المستخدم الشخصي إذا تم التسجيل بنجاح
    const userId = data.user?.id
    if (userId) {
      const { error: profileError } = await upsertProfile(userId, {
        email,
        name,
        created_at: new Date().toISOString(),
      })

      if (profileError) {
        setError('تم إنشاء الحساب لكن حدث خطأ أثناء إعداد الملف الشخصي.')
      } else {
        setMessage('تم إنشاء الحساب بنجاح. تحقق من بريدك الإلكتروني لتفعيل الحساب.')
      }
    } else {
      setMessage('تم إنشاء الحساب بنجاح. تحقق من بريدك الإلكتروني لتفعيل الحساب.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-l from-indigo-50 via-purple-50 to-blue-50 px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="bg-indigo-100 rounded-full p-3 mb-4">
          <PieChart className="h-10 w-10 text-indigo-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">نظام التسعير المتقدم</h1>
        <p className="text-gray-600 mt-1">إنشاء حساب جديد للوصول إلى النظام</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-indigo-100">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            أدخل بياناتك لإنشاء حساب جديد
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 ml-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {message && (
            <Alert variant="success" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-4 w-4 ml-2" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                dir="ltr"
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">الاسم (اختياري)</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="اسمك بالكامل"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                dir="ltr"
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full"
              disabled={loading || message}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  جاري التسجيل...
                </span>
              ) : message ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تم التسجيل بنجاح</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>إنشاء حساب</span>
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-indigo-600 hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

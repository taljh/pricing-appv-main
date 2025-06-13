'use client'

import { useState } from 'react'
import { resetPassword } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PieChart, Key, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني')
      return
    }
    
    setLoading(true)
    setError(null)
    setMessage(null)

    // إنشاء عنوان URL للرجوع بعد إعادة تعيين كلمة المرور
    const redirectUrl = `${window.location.origin}/auth/login`
    
    const { error: resetError } = await resetPassword(email, redirectUrl)

    if (resetError) {
      setError(resetError.message)
    } else {
      setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.')
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
        <p className="text-gray-600 mt-1">إعادة تعيين كلمة المرور</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-indigo-100">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">استعادة كلمة المرور</CardTitle>
          <CardDescription>
            سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
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
          
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                dir="ltr"
                className="text-right"
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
                  جاري إرسال الرابط...
                </span>
              ) : message ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تم إرسال الرابط</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span>إرسال رابط إعادة التعيين</span>
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-indigo-600 hover:underline">
              العودة إلى صفحة تسجيل الدخول
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

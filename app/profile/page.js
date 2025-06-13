"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, upsertProfile, signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/ui/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, User, Shield, Key, Save, LogOut } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    company: "",
    bio: "",
  })
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadUserProfile() {
      setLoading(true)
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)

      // جلب معلومات الملف الشخصي من قاعدة البيانات الجديدة
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        if (profileData) {
          setProfile({
            name: profileData.name || profileData.full_name || "",
            phone: profileData.phone || "",
            company: profileData.company || "",
            bio: profileData.bio || "",
          })
        }
      } catch (err) {
        console.error("Error loading profile:", err)
      }

      setLoading(false)
    }

    loadUserProfile()
  }, [router, supabase])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    setError(null)
    setMessage(null)

    const { error } = await upsertProfile(user.id, profile)

    if (error) {
      setError("حدث خطأ أثناء حفظ الملف الشخصي: " + error.message)
    } else {
      setMessage("تم حفظ الملف الشخصي بنجاح")
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-r-indigo-600"></div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600">إدارة معلومات حسابك والإعدادات الشخصية</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>المعلومات الشخصية</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>الأمان</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>الحساب</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الشخصية</CardTitle>
                <CardDescription>تحديث معلوماتك الشخصية وبيانات التواصل</CardDescription>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="الاسم بالكامل"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" value={user.email} disabled className="bg-gray-50" dir="ltr" />
                    <p className="text-xs text-gray-500">البريد الإلكتروني لا يمكن تغييره</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">الشركة أو المؤسسة</Label>
                    <Input
                      id="company"
                      name="company"
                      value={profile.company}
                      onChange={handleChange}
                      placeholder="اسم الشركة أو المؤسسة"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">نبذة عنك</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="معلومات إضافية عنك أو عن عملك"
                    rows={4}
                  />
                </div>
              </CardContent>

              <CardFooter>
                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>الأمان</CardTitle>
                <CardDescription>إعدادات الأمان والخصوصية لحسابك</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>تغيير كلمة المرور</Label>
                  <p className="text-sm text-gray-600">
                    يمكنك تغيير كلمة المرور عن طريق تسجيل الخروج واستخدام خيار "نسيت كلمة المرور"
                  </p>
                  <Button variant="outline" className="gap-2 mt-2" onClick={() => router.push("/auth/reset")}>
                    <Key className="h-4 w-4" />
                    إعادة تعيين كلمة المرور
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الحساب</CardTitle>
                <CardDescription>إدارة حسابك وتسجيل الخروج</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>معلومات الحساب</Label>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>معرف المستخدم:</strong> {user.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>تاريخ الإنشاء:</strong> {new Date(user.created_at).toLocaleDateString("ar-SA")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>آخر تسجيل دخول:</strong>{" "}
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("ar-SA") : "غير متوفر"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>تسجيل الخروج</Label>
                  <p className="text-sm text-gray-600">تسجيل الخروج من جميع الأجهزة المتصلة بهذا الحساب</p>
                  <Button variant="destructive" className="gap-2 mt-2" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

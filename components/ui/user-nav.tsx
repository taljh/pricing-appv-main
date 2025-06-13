"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

export function UserNav() {
  const { user, signOut, isLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const supabase = createClient()
  const hasLoadedProfile = useRef(false)

  // تحميل بيانات الملف الشخصي مرة واحدة فقط
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || hasLoadedProfile.current) {
        setIsLoadingProfile(false)
        return
      }

      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error
        setProfile(data)
        hasLoadedProfile.current = true // تأكيد أن البيانات تم تحميلها
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [user?.id, supabase]) // فقط عند تغيير معرف المستخدم

  // عرض حالة التحميل
  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">جاري التحميل...</span>
      </div>
    )
  }

  // إذا لم يكن هناك مستخدم
  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="outline" size="sm">
          تسجيل الدخول
        </Button>
      </Link>
    )
  }

  // الاسم المعروض
  const displayName = profile?.full_name || user.email?.split("@")[0] || "المستخدم"

  // الحروف الأولى للاسم (للصورة الرمزية)
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="ml-2 h-4 w-4" />
              <span>الملف الشخصي</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="ml-2 h-4 w-4" />
              <span>الإعدادات</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
          <LogOut className="ml-2 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

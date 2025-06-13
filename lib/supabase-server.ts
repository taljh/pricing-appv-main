import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "@/types/supabase"

// إنشاء عميل Supabase للاستخدام في مكونات الخادم مع تخزين مؤقت
export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
})

// التحقق من المستخدم الحالي في مكونات الخادم
export async function getServerUser() {
  const supabase = createServerSupabaseClient()
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return null
    }
    return user
  } catch (error) {
    console.error("Error getting server user:", error)
    return null
  }
}

// الحصول على بيانات المستخدم مع الملف الشخصي
export async function getUserWithProfile() {
  const supabase = createServerSupabaseClient()
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return { user, profile: null }
    }

    return { user, profile }
  } catch (error) {
    console.error("Error getting user with profile:", error)
    return null
  }
}

// الحصول على إعدادات المشروع للمستخدم الحالي
export async function getUserProjectSettings() {
  const supabase = createServerSupabaseClient()
  const user = await getServerUser()

  if (!user) return null

  try {
    const { data, error } = await supabase.from("project_settings").select("*").eq("user_id", user.id).single()

    if (error) {
      console.error("Error fetching project settings:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error getting project settings:", error)
    return null
  }
}

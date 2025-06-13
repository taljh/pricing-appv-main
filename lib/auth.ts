import { createClient } from "./supabase"
import { toast } from "sonner"

// الحصول على الجلسة الحالية
export async function getCurrentSession() {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("[auth] getCurrentSession error:", error.message)
      return null
    }
    console.log("[auth] getCurrentSession success:", !!data.session)
    return data.session
  } catch (e: any) {
    console.error("[auth] getCurrentSession exception:", e.message)
    return null
  }
}

// الحصول على المستخدم الحالي
export async function getCurrentUser() {
  const supabase = createClient()
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) {
      console.error("[auth] getCurrentUser error:", error.message)
      return null
    }
    console.log("[auth] getCurrentUser success:", !!user)
    return user
  } catch (e: any) {
    console.error("[auth] getCurrentUser exception:", e.message)
    return null
  }
}

// تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      console.error("[auth] signInWithEmail error:", error.message)
      return { data, error }
    } else {
      console.log("[auth] signInWithEmail success:", data?.user?.id)
      return { data, error }
    }
  } catch (e: any) {
    console.error("[auth] signInWithEmail exception:", e.message)
    return { data: null, error: e }
  }
}

// إنشاء حساب جديد باستخدام البريد الإلكتروني وكلمة المرور
export async function signUpWithEmail(email: string, password: string, options: any = {}) {
  const supabase = createClient()
  try {
    console.log("[auth] signUpWithEmail starting for:", email)
    // إنشاء المستخدم في auth.users
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    })
    if (signUpError) {
      console.error("[auth] signUpWithEmail error:", signUpError.message)
      return { data: null, error: signUpError }
    }
    
    // الانتظار قليلاً للتأكد من اكتمال عملية إنشاء المستخدم
    if (data?.user) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // إنشاء الملف الشخصي
      console.log("[auth] Creating profile manually...")
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: email.trim(),
          full_name: options.full_name || email,
          account_type: "user",
        })
      if (insertError) {
        console.error("[auth] Error creating profile manually:", insertError.message)
        return { data: null, error: insertError }
      }

      // إضافة البيانات الافتراضية للمشروع
      const { data: projectSettings, error: settingsError } = await supabase
        .from("project_settings")
        .insert({
          user_id: data.user.id,
          currency: "SAR",
          vat_enabled: false,
          vat_percentage: 0,
          project_name: "متجري الإلكتروني",
          target_category: "medium",
          target_profit: 30,
          expected_monthly_sales: 30
        })
        .select()
        .single()
      
      if (settingsError) {
        console.error("[auth] Error creating project settings:", settingsError.message)
      }

      // جلب جميع طرق الدفع المتاحة
      const { data: availableMethods, error: methodsError } = await supabase
        .from("payment_methods")
        .select("code")
        .eq("is_active", true)

      if (methodsError) {
        console.error("[auth] Error fetching payment methods:", methodsError.message)
      } else if (availableMethods && projectSettings) {
        // إنشاء سجل لكل طريقة دفع متاحة
        const paymentMethodsRecords = availableMethods.map(method => ({
          project_settings_id: projectSettings.id,
          payment_method_code: method.code,
          is_enabled: false
        }))

        const { error: paymentMethodsError } = await supabase
          .from("project_payment_methods")
          .insert(paymentMethodsRecords)

        if (paymentMethodsError) {
          console.error("[auth] Error creating payment methods:", paymentMethodsError.message)
        }
      }

      // ملاحظة: تم إزالة إدراج التكاليف الثابتة من هنا لأنها تتم عبر المحفز (Trigger) في قاعدة البيانات
    }
    return { data, error: null }
  } catch (e: any) {
    console.error("[auth] signUpWithEmail exception:", e.message)
    return { data: null, error: e }
  }
}

// تحديث أو إنشاء ملف شخصي للمستخدم
export async function upsertProfile(userId: string, profileData: any) {
  const supabase = createClient()
  if (!userId) {
    console.error("[auth] upsertProfile error: No userId provided")
    return { data: null, error: new Error("No userId provided") }
  }

  try {
    console.log("[auth] Attempting to upsert profile for user:", userId)

    const profilePayload = {
      id: userId,
      email: profileData.email,
      full_name: profileData.full_name || profileData.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // محاولة إدراج الملف الشخصي
    const { data, error } = await supabase.from("profiles").upsert(profilePayload).select().single()

    if (error) {
      console.error("[auth] upsertProfile error:", error.message)
      return { data: null, error }
    }

    console.log("[auth] Profile created/updated successfully:", data)
    return { data, error: null }
  } catch (e: any) {
    console.error("[auth] upsertProfile exception:", e.message)
    return { data: null, error: e }
  }
}

// إعادة تعيين كلمة المرور
export async function resetPassword(email: string, redirectUrl?: string) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        redirectUrl || (typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined),
    })
    if (error) {
      console.error("[auth] resetPassword error:", error.message)
    } else {
      console.log("[auth] resetPassword success")
    }
    return { data, error }
  } catch (e: any) {
    console.error("[auth] resetPassword exception:", e.message)
    return { data: null, error: e }
  }
}

// تسجيل الخروج
export async function signOut() {
  const supabase = createClient()
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("[auth] signOut error:", error.message)
      toast.error("حدث خطأ أثناء تسجيل الخروج")
    } else {
      console.log("[auth] signOut success")
      toast.success("تم تسجيل الخروج بنجاح")
    }
    return { error }
  } catch (e: any) {
    console.error("[auth] signOut exception:", e.message)
    toast.error("حدث خطأ أثناء تسجيل الخروج")
    return { error: e }
  }
}

// التحقق من حالة المصادقة
export async function checkAuthStatus() {
  const session = await getCurrentSession()
  const user = session ? session.user : null
  return {
    isAuthenticated: !!user,
    user,
    session,
  }
}

// تحديث بيانات المستخدم
export async function updateUserData(userData: any) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.updateUser(userData)
    if (error) {
      console.error("[auth] updateUserData error:", error.message)
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم")
    } else {
      console.log("[auth] updateUserData success")
      toast.success("تم تحديث بيانات المستخدم بنجاح")
    }
    return { data, error }
  } catch (e: any) {
    console.error("[auth] updateUserData exception:", e.message)
    toast.error("حدث خطأ أثناء تحديث بيانات المستخدم")
    return { data: null, error: e }
  }
}

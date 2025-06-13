"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppShell } from "@/components/ui/app-shell"
import { Spinner } from "@/components/ui/spinner"
import { Calculator, Package, ArrowUpRight, Zap, TrendingUp, BarChart3 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Stats {
  totalProducts: number
  pricedProducts: number
  avgProfit: number
}

export default function HomePage() {
  const { user, session, loading: authLoading, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, pricedProducts: 0, avgProfit: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    console.log("[HomePage] Auth state:", {
      user: !!user,
      session: !!session,
      isAuthenticated,
      authLoading,
    })

    // انتظار انتهاء تحميل المصادقة
    if (authLoading) {
      return
    }

    // إذا لم يكن مصادق، إعادة توجيه
    if (!isAuthenticated || !user || !session) {
      console.log("[HomePage] Not authenticated, redirecting to login")
      window.location.href = "/auth/login"
      return
    }

    // جلب البيانات إذا كان مصادق
    fetchStats()
  }, [user, session, isAuthenticated, authLoading])

  const fetchStats = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      console.log("[HomePage] Fetching stats for user:", user.id)

      const { data: allProducts, error } = await supabase
        .from("products")
        .select("cost_price, selling_price, has_pricing")
        .eq("user_id", user.id)

      if (error) {
        console.error("[HomePage] Error fetching products:", error)
        throw error
      }

      const totalProducts = allProducts?.length || 0
      const pricedProducts = allProducts?.filter((p) => p.has_pricing)?.length || 0
      const avgProfit =
        totalProducts > 0
          ? allProducts.reduce((sum, p) => sum + ((p.selling_price || 0) - (p.cost_price || 0)), 0) / totalProducts
          : 0

      setStats({ totalProducts, pricedProducts, avgProfit })
      console.log("[HomePage] Stats loaded:", { totalProducts, pricedProducts })
    } catch (error) {
      console.error("[HomePage] Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    )
  }

  // إذا لم يكن مصادق، عرض رسالة التوجيه
  if (!isAuthenticated || !user || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">يتم توجيهك إلى صفحة تسجيل الدخول...</p>
          <Spinner className="h-6 w-6 mx-auto" />
        </div>
      </div>
    )
  }

  // عرض شاشة التحميل أثناء جلب البيانات
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-sm">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
              تكلفة
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">إدارة الأسعار والربحية بذكاء</p>
          <div className="bg-indigo-50 p-4 rounded-lg inline-flex items-center gap-2 text-indigo-700 border border-indigo-100">
            <Zap className="h-5 w-5 text-indigo-600" />
            <span>أداة ذكية لتحليل التكاليف وتحديد الأسعار المثالية</span>
          </div>
        </motion.div>

        {/* إحصائيات سريعة */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={cardVariants}>
            <Card className="text-center border-indigo-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                <p className="text-sm text-gray-600">منتج في النظام</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="text-center border-green-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calculator className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.pricedProducts}</div>
                <p className="text-sm text-gray-600">منتج مُسعر</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="text-center border-purple-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgProfit.toFixed(0)} ر.س</div>
                <p className="text-sm text-gray-600">متوسط الربح</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* الأدوات الرئيسية */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {/* حاسبة التسعير الذكية */}
          <motion.div variants={cardVariants}>
            <Card className="border border-indigo-100 shadow-sm overflow-hidden hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group h-full">
              <div className="h-2 bg-gradient-to-l from-indigo-500 to-purple-600"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                    حاسبة التسعير الذكية
                  </CardTitle>
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">
                    الأداة الأساسية
                  </Badge>
                </div>
                <CardDescription className="text-sm mt-2">
                  حدد السعر المثالي لمنتجاتك بناءً على تحليل دقيق للتكاليف والسوق
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 flex-grow">
                <div className="space-y-3">
                  <div className="bg-gradient-to-l from-slate-50 to-indigo-50 p-4 rounded-lg border border-indigo-100/50">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">ما يمكنك فعله:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• حساب التكاليف المباشرة وغير المباشرة</li>
                      <li>• تحديد هامش الربح المستهدف</li>
                      <li>• مقارنة أسعار المنافسين</li>
                      <li>• اقتراح الأسعار المثالية</li>
                    </ul>
                  </div>
                </div>
              </CardContent>

              <CardContent className="pt-0">
                <Link href="/pricing/calculator" className="w-full">
                  <Button className="gap-2 text-sm w-full py-4 bg-gradient-to-l from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <span>بدء التسعير الذكي</span>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* إدارة المنتجات */}
          <motion.div variants={cardVariants}>
            <Card className="border border-green-100 shadow-sm overflow-hidden hover:border-green-200 hover:shadow-lg transition-all duration-300 group h-full">
              <div className="h-2 bg-gradient-to-l from-green-500 to-emerald-600"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Package className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                    إدارة المنتجات
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">إدارة شاملة</Badge>
                </div>
                <CardDescription className="text-sm mt-2">
                  أضف وأدر منتجاتك بسهولة مع تتبع التكاليف والأسعار
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 flex-grow">
                <div className="space-y-3">
                  <div className="bg-gradient-to-l from-slate-50 to-green-50 p-4 rounded-lg border border-green-100/50">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">إمكانيات متقدمة:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• إضافة منتجات جديدة بتفاصيل شاملة</li>
                      <li>• تتبع تكاليف الإنتاج والمواد</li>
                      <li>• مراقبة الربحية لكل منتج</li>
                      <li>• تصنيف وتنظيم المنتجات</li>
                    </ul>
                  </div>
                </div>
              </CardContent>

              <CardContent className="pt-0">
                <Link href="/products" className="w-full">
                  <Button
                    variant="outline"
                    className="gap-2 text-sm w-full py-4 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition-all duration-300"
                  >
                    <span>إدارة المنتجات</span>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* رسالة ترحيبية */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-none shadow-sm bg-gradient-to-l from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-100 overflow-hidden">
            <CardContent className="py-6 px-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-gradient-to-br from-white to-indigo-50 p-3 border border-indigo-100 shadow-sm">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">مرحباً بك في تكلفة</h3>
                  <p className="text-gray-600 leading-relaxed">
                    ابدأ رحلتك في إدارة الأسعار والربحية بذكاء. استخدم حاسبة التسعير الذكية لتحديد الأسعار المثالية
                    لمنتجاتك، وأدر منتجاتك بكفاءة لتحقيق أقصى ربحية ممكنة.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  )
}

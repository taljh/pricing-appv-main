"use client"

import { AppShell } from "@/components/ui/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { BarChart3, RefreshCw, BrainCircuit, BadgePercent, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

// مكونات المستشار الذكي
import { SmartCAC } from "@/components/advisor/SmartCAC"
import { SafeDiscount } from "@/components/advisor/SafeDiscount"
import { ProductsReview } from "@/components/advisor/ProductsReview"
import { SeasonalDiscounts } from "@/components/advisor/SeasonalDiscounts"

// Hook للتحليلات
import { useProductsAnalytics } from "@/hooks/use-products-analytics"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AdvisorPage() {
  const { analytics, loading, error, refetch } = useProductsAnalytics()

  // Header component with animation
  const PageHeader = ({ showRefresh = false }) => (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-white via-indigo-50/30 to-indigo-100/30 p-6 rounded-2xl shadow-sm border border-indigo-100"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-600" />
            <span>مستشارك الذكي</span>
          </h1>
          <p className="text-gray-500 mt-1">
            تحليلات ذكية مستخرجة من {analytics ? analytics.totalProducts : ''} منتج لمساعدتك في اتخاذ قرارات تسعير أفضل
          </p>
        </div>
        {showRefresh && (
          <Button 
            onClick={refetch} 
            variant="outline" 
            size="sm"
            className="group hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 ml-2 group-hover:rotate-180 transition-transform duration-500" />
            تحديث التحليلات
          </Button>
        )}
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-8">
          <PageHeader />

          {/* حالة التحميل */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center py-16"
          >
            <div className="text-center space-y-4">
              <Spinner className="h-10 w-10 mx-auto text-indigo-600" />
              <p className="text-gray-500 animate-pulse">جاري تحليل بيانات منتجاتك...</p>
            </div>
          </motion.div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <div className="space-y-8">
          <PageHeader showRefresh={true} />

          {/* رسالة الخطأ */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <Alert variant="destructive" className="bg-red-50 border-red-200 shadow-sm">
              <AlertDescription className="flex items-center text-red-800 font-medium">
                <LineChart className="h-5 w-5 mr-2 text-red-600" />
                حدث خطأ في تحليل البيانات: {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </AppShell>
    )
  }

  if (!analytics) {
    return (
      <AppShell>
        <div className="space-y-8">
          <PageHeader />

          {/* رسالة عدم وجود بيانات */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-amber-100 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="h-10 w-10 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">لا توجد بيانات كافية للتحليل</h3>
                    <p className="text-gray-600 mb-6">أضف منتجات مع أسعار التكلفة والبيع لتفعيل المستشار الذكي</p>
                    <Button 
                      onClick={() => (window.location.href = "/products")} 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      إضافة منتجات
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader showRefresh={true} />

        {/* نظرة عامة */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-xl p-4 border border-blue-100">
              <BadgePercent className="w-5 h-5 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold text-blue-900">{analytics.averageProfitMargin.toFixed(1)}%</div>
              <div className="text-xs text-blue-700 mt-1">متوسط الربح</div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50/40 rounded-xl p-4 border border-emerald-100">
              <BarChart3 className="w-5 h-5 mx-auto mb-2 text-emerald-600" />
              <div className="text-xl font-bold text-emerald-900">{analytics.maxSafeDiscount.toFixed(1)}%</div>
              <div className="text-xs text-emerald-700 mt-1">خصم آمن</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50/40 rounded-xl p-4 border border-purple-100">
              <LineChart className="w-5 h-5 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold text-purple-900">{analytics.safeCAC}</div>
              <div className="text-xs text-purple-700 mt-1">تكلفة استحواذ آمنة</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-xl p-4 border border-amber-100">
              <RefreshCw className="w-5 h-5 mx-auto mb-2 text-amber-600" />
              <div className="text-xl font-bold text-amber-900">{analytics.lowProfitProducts.length}</div>
              <div className="text-xs text-amber-700 mt-1">منتجات تحتاج مراجعة</div>
            </div>
          </div>
        </motion.div>

        {/* الكروت الذكية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* كرت تكلفة الاستحواذ الذكية */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <SmartCAC maxCAC={analytics.maxCAC} safeCAC={analytics.safeCAC} totalProducts={analytics.totalProducts} />
          </motion.div>

          {/* كرت نسبة الخصم الآمن */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.5 }}
          >
            <SafeDiscount
              maxSafeDiscount={analytics.maxSafeDiscount}
              averageProfitMargin={analytics.averageProfitMargin}
              totalProducts={analytics.totalProducts}
            />
          </motion.div>

          {/* كرت منتجات تحتاج مراجعة */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.6 }}
          >
            <ProductsReview lowProfitProducts={analytics.lowProfitProducts} totalProducts={analytics.totalProducts} />
          </motion.div>

          {/* كرت اقتراح خصومات موسمية */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.7 }}
          >
            <SeasonalDiscounts
              season={analytics.seasonalRecommendation.season}
              recommendedDiscount={analytics.seasonalRecommendation.recommendedDiscount}
              averageProfitMargin={analytics.averageProfitMargin}
              minProfitMargin={analytics.seasonalRecommendation.minProfitMargin}
            />
          </motion.div>
        </div>

        {/* معلومات إضافية */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.8 }}
        >
          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
            <AlertDescription className="text-blue-800 flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
              <div>
                <strong>ملاحظة:</strong> جميع التحليلات محسوبة من بيانات منتجاتك الفعلية. يتم تحديث التحليلات تلقائياً عند
                إضافة أو تعديل المنتجات.
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </AppShell>
  )
}

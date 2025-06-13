"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Percent, TrendingDown, AlertTriangle, CheckCircle, BadgePercent } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SafeDiscountProps {
  maxSafeDiscount: number
  averageProfitMargin: number
  totalProducts: number
}

export function SafeDiscount({ maxSafeDiscount, averageProfitMargin, totalProducts }: SafeDiscountProps) {
  const suggestedDiscount = Math.max(0, maxSafeDiscount * 0.7) // 70% من الحد الأقصى
  const dangerZone = maxSafeDiscount + 5 // منطقة الخطر

  const getDiscountStatus = () => {
    if (maxSafeDiscount === 0) return "none"
    if (maxSafeDiscount >= 20) return "excellent"
    if (maxSafeDiscount >= 10) return "good"
    return "limited"
  }

  const status = getDiscountStatus()

  return (
    <Card className="shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-700 pb-6 border-b relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path fill="white" d="M0,100 L100,0 L100,100 Z" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Percent className="h-5 w-5 text-emerald-200" />
              <span>نسبة الخصم الآمن</span>
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                    <BadgePercent className="h-5 w-5 text-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-green-950 text-white border-green-800 max-w-xs">
                  <p className="text-xs">الخصم الآمن هو أقصى نسبة تخفيض يمكنك تقديمها للعملاء مع الحفاظ على تحقيق ربح</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-emerald-100 mt-1">
            محسوبة من {totalProducts} منتج • متوسط هامش الربح: {averageProfitMargin.toFixed(1)}%
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {maxSafeDiscount === 0 ? (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              لا توجد منتجات بهوامش ربح كافية لحساب خصومات آمنة
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* الخصم الآمن الأقصى */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>تقدر تعطي خصم حتى</span>
                </h3>
                <DiscountBadge value={maxSafeDiscount} status={maxSafeDiscount >= 20 ? "high" : maxSafeDiscount >= 10 ? "medium" : "low"} />
              </div>
              <div className="text-3xl font-bold text-emerald-900 mb-2 flex items-center">
                {maxSafeDiscount.toFixed(1)}%
              </div>
              <p className="text-sm text-emerald-700">وما زلت تربح في جميع المنتجات</p>
              
              {/* Progress indicator */}
              <div className="mt-4">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, (maxSafeDiscount / 30) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">ممتاز: 30%+</span>
                </div>
              </div>
            </motion.div>

            {/* الخصم المقترح */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-blue-900 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                  <span>الخصم المقترح</span>
                </h3>
                <DiscountBadge value={suggestedDiscount} status="optimal" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2 flex items-center">
                {suggestedDiscount.toFixed(1)}%
              </div>
              <p className="text-sm text-blue-700">خصم آمن مع هامش حماية إضافي</p>
              
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-grow h-1 bg-blue-100 rounded-full" />
                <div className="px-2 py-1 bg-blue-100 rounded-full text-xs font-medium text-blue-800">متوازن</div>
                <div className="flex-grow h-1 bg-blue-100 rounded-full" />
              </div>
            </motion.div>

            {/* منطقة الخطر */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-red-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>منطقة الخطر</span>
                </h3>
                <span className="text-xs py-1 px-2 rounded-full font-medium bg-red-100 text-red-700 border border-red-200">
                  {dangerZone.toFixed(1)}%+
                </span>
              </div>
              <div className="text-3xl font-bold text-red-900 mb-2 flex items-center">
                بعد {dangerZone.toFixed(1)}%
              </div>
              <p className="text-sm text-red-700">تبدأ تخسر في بعض المنتجات</p>
              
              <div className="mt-4 bg-red-100 p-3 rounded-lg flex items-center gap-3 border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-800">كل 5% خصم إضافي فوق منطقة الخطر = خسارة من {Math.ceil(totalProducts * 0.2)} إلى {Math.ceil(totalProducts * 0.3)} منتج</p>
              </div>
            </motion.div>

            {/* توصيات حسب الحالة */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {status === "excellent" && (
                <Alert className="bg-green-50 border-green-200 rounded-lg shadow-sm">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    🎉 ممتاز! هوامش ربحك عالية تسمح بخصومات جذابة للعملاء
                  </AlertDescription>
                </Alert>
              )}

              {status === "good" && (
                <Alert className="bg-blue-50 border-blue-200 rounded-lg shadow-sm">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-blue-800 font-medium">
                    👍 جيد! يمكنك تقديم خصومات معقولة مع الحفاظ على الربحية
                  </AlertDescription>
                </Alert>
              )}

              {status === "limited" && (
                <Alert className="bg-amber-50 border-amber-200 rounded-lg shadow-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800 font-medium">
                    ⚠️ هوامش الربح محدودة - كن حذراً مع الخصومات
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>

            {/* نصائح عملية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200 shadow-sm">
                <h3 className="text-sm font-medium text-purple-900 mb-3 flex items-center gap-2">
                  <BadgePercent className="h-4 w-4 text-purple-600" />
                  <span>نصائح للخصومات</span>
                </h3>
                <ul className="text-purple-800 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>ابدأ بخصم <span className="font-medium">{Math.max(5, suggestedDiscount).toFixed(0)}%</span> للمناسبات العادية</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>لا تتجاوز <span className="font-bold text-emerald-600">{maxSafeDiscount.toFixed(0)}%</span> في أقوى العروض</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>راجع كل منتج على حدة قبل تطبيق الخصم</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>استخدم خصومات متدرجة حسب الكمية</div>
                  </li>
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Badge component for discount values with status indicator
function DiscountBadge({ value, status }: { value: number; status: 'low' | 'medium' | 'high' | 'optimal' }) {
  const getColorClass = () => {
    switch (status) {
      case "high":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "low":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "optimal":
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <span className={`text-xs py-1 px-2 rounded-full font-medium border ${getColorClass()}`}>
      {value.toFixed(1)}%
    </span>
  )
}

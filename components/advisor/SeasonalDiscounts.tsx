"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Percent, TrendingDown, Sparkles, BadgePercent } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SeasonalDiscountsProps {
  season: string
  recommendedDiscount: {
    min: number
    max: number
  }
  averageProfitMargin: number
  minProfitMargin: number
}

export function SeasonalDiscounts({
  season,
  recommendedDiscount,
  averageProfitMargin,
  minProfitMargin,
}: SeasonalDiscountsProps) {
  const getSeasonColor = () => {
    switch (season) {
      case "الصيف":
        return "amber"
      case "الشتاء":
        return "blue"
      case "الربيع":
        return "emerald"
      case "الخريف":
        return "orange"
      default:
        return "indigo"
    }
  }

  const getSeasonIcon = () => {
    switch (season) {
      case "الصيف":
        return "☀️"
      case "الشتاء":
        return "❄️"
      case "الربيع":
        return "🌸"
      case "الخريف":
        return "🍂"
      default:
        return "📅"
    }
  }

  const getSeasonAdvice = () => {
    switch (season) {
      case "الصيف":
        return "موسم الخصومات الكبيرة والتصفيات الصيفية"
      case "الشتاء":
        return "موسم الهدايا والعروض الشتوية"
      case "الربيع":
        return "موسم التجديد والمجموعات الجديدة"
      case "الخريف":
        return "موسم العودة للمدارس والتحضير للشتاء"
      default:
        return "خصومات موسمية مدروسة"
    }
  }

  const seasonColor = getSeasonColor()
  const seasonIcon = getSeasonIcon()
  const seasonAdvice = getSeasonAdvice()

  // تحديد مستوى الأمان للخصم
  const getSafetyLevel = () => {
    if (averageProfitMargin > 25) return "high"
    if (averageProfitMargin > 15) return "medium"
    return "low"
  }

  const safetyLevel = getSafetyLevel()
  
  // Primary color classes based on season
  const getHeaderColorClass = () => {
    switch (seasonColor) {
      case "amber":
        return "from-amber-500 to-yellow-600"
      case "blue":
        return "from-blue-600 to-indigo-700"
      case "emerald":
        return "from-emerald-600 to-green-700"
      case "orange":
        return "from-orange-600 to-red-600"
      default:
        return "from-indigo-600 to-purple-700"
    }
  }
  
  // Icon color for season
  const getIconColorClass = () => {
    switch (seasonColor) {
      case "amber":
        return "text-amber-200"
      case "blue":
        return "text-blue-200"
      case "emerald":
        return "text-emerald-200"
      case "orange":
        return "text-orange-200"
      default:
        return "text-indigo-200"
    }
  }
  
  // Card colors based on safety level
  const getSafetyCardColors = () => {
    switch (safetyLevel) {
      case "high":
        return "from-green-50 to-emerald-50/70 border-green-200"
      case "medium":
        return "from-blue-50 to-indigo-50/70 border-blue-200"
      case "low":
        return "from-amber-50 to-orange-50/70 border-amber-200"
      default:
        return "from-indigo-50 to-purple-50/70 border-indigo-200"
    }
  }

  return (
    <Card className="shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${getHeaderColorClass()} pb-6 border-b relative`}>
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path fill="white" d="M0,100 L100,0 L100,100 Z" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className={`h-5 w-5 ${getIconColorClass()}`} />
              <span>اقتراح خصومات موسمية</span>
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className={`bg-${seasonColor === "amber" ? "yellow" : seasonColor}-950 text-white border-${seasonColor === "amber" ? "yellow" : seasonColor}-800 max-w-xs`}>
                  <p className="text-xs">خصومات مدروسة مناسبة للموسم الحالي تحافظ على هوامش الربح الصحية</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-white/80 mt-1">
            متوسط ربحك: {averageProfitMargin.toFixed(1)}% • {seasonAdvice}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* الموسم الحالي */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`bg-gradient-to-br ${
            seasonColor === "amber"
              ? "from-amber-50 to-yellow-50/70 border-amber-200"
              : seasonColor === "blue"
                ? "from-blue-50 to-indigo-50/70 border-blue-200"
                : seasonColor === "emerald"
                  ? "from-emerald-50 to-green-50/70 border-emerald-200"
                  : seasonColor === "orange"
                    ? "from-orange-50 to-red-50/70 border-orange-200"
                    : "from-indigo-50 to-purple-50/70 border-indigo-200"
          } rounded-xl p-5 border shadow-sm flex items-center`}
        >
          <div className="flex-grow">
            <div className="flex items-center mb-3">
              <h3 className={`text-base font-medium ${
                seasonColor === "amber"
                  ? "text-amber-900"
                  : seasonColor === "blue"
                    ? "text-blue-900"
                    : seasonColor === "emerald"
                      ? "text-emerald-900"
                      : seasonColor === "orange"
                        ? "text-orange-900"
                        : "text-indigo-900"
              } flex items-center gap-2`}>
                <Sparkles className={`h-4 w-4 ${
                  seasonColor === "amber"
                    ? "text-amber-600"
                    : seasonColor === "blue"
                      ? "text-blue-600"
                      : seasonColor === "emerald"
                        ? "text-emerald-600"
                        : seasonColor === "orange"
                          ? "text-orange-600"
                          : "text-indigo-600"
                }`} />
                <span>الموسم الحالي</span>
              </h3>
            </div>
            <div className={`text-3xl font-bold mb-2 ${
              seasonColor === "amber"
                ? "text-amber-900"
                : seasonColor === "blue"
                  ? "text-blue-900"
                  : seasonColor === "emerald"
                    ? "text-emerald-900"
                    : seasonColor === "orange"
                      ? "text-orange-900"
                      : "text-indigo-900"
            } flex items-center`}>
              {season}
            </div>
            <p className={`text-sm ${
              seasonColor === "amber"
                ? "text-amber-700"
                : seasonColor === "blue"
                  ? "text-blue-700"
                  : seasonColor === "emerald"
                    ? "text-emerald-700"
                    : seasonColor === "orange"
                      ? "text-orange-700"
                      : "text-indigo-700"
            }`}>
              {seasonAdvice}
            </p>
          </div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-${
            seasonColor === "amber"
              ? "amber"
              : seasonColor === "blue"
                ? "blue"
                : seasonColor === "emerald"
                  ? "emerald"
                  : seasonColor === "orange"
                    ? "orange"
                    : "indigo"
          }-100 border-4 border-white shadow-md`}>
            {seasonIcon}
          </div>
        </motion.div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          {/* الخصم المقترح */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50/70 rounded-xl p-5 border border-green-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-green-900 flex items-center gap-2">
                <BadgePercent className="h-4 w-4 text-green-600" />
                <span>ننصح بخصم موسمي</span>
              </h3>
            </div>
            <div className="text-3xl font-bold text-green-900 mb-2 flex items-center">
              {recommendedDiscount.min}% – {recommendedDiscount.max}%
            </div>
            <div className="flex items-center gap-1.5 text-sm text-green-700">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span>مناسب للموسم ومع الحفاظ على الربحية</span>
            </div>
            
            {/* Range indicator */}
            <div className="mt-4 relative h-2 bg-gray-200 rounded-full">
              <div className="absolute h-4 w-4 bg-green-500 rounded-full -top-1" 
                style={{ left: `${Math.min(100, recommendedDiscount.min * 2)}%` }}></div>
              <div className="absolute h-4 w-4 bg-green-500 rounded-full -top-1" 
                style={{ left: `${Math.min(100, recommendedDiscount.max * 2)}%` }}></div>
              <div className="absolute h-2 bg-green-500 rounded-full" 
                style={{ 
                  left: `${Math.min(100, recommendedDiscount.min * 2)}%`,
                  width: `${Math.min(100, (recommendedDiscount.max - recommendedDiscount.min) * 2)}%`
                }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
            </div>
          </motion.div>

          {/* الحد الأدنى للربح */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-red-50 to-pink-50/70 rounded-xl p-5 border border-red-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-red-900 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span>لا تقل عن</span>
              </h3>
            </div>
            <div className="text-3xl font-bold text-red-900 mb-2 flex items-center">
              {minProfitMargin}% <span className="text-lg ml-2">ربح</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-red-700">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span>لحماية الهامش وتغطية التكاليف الثابتة</span>
            </div>
            
            <div className="mt-4 bg-red-100 p-3 rounded-lg border border-red-200">
              <p className="text-xs text-red-800 flex items-center gap-1.5">
                <span className="text-lg">⚠️</span>
                <span>إذا انخفضت الأرباح عن {minProfitMargin}% قد تواجه صعوبة في تغطية التكاليف الثابتة</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* تحذيرات حسب مستوى الأمان */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {safetyLevel === "low" && (
            <Alert className="bg-red-50 border-red-200 rounded-lg shadow-sm">
              <AlertDescription className="text-red-800 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span className="font-medium">تحذير: هوامش ربحك منخفضة. كن حذراً جداً مع الخصومات الموسمية</span>
              </AlertDescription>
            </Alert>
          )}

          {safetyLevel === "medium" && (
            <Alert className="bg-amber-50 border-amber-200 rounded-lg shadow-sm">
              <AlertDescription className="text-amber-800 flex items-center gap-2">
                <span className="text-xl">💡</span>
                <span className="font-medium">نصيحة: هوامش ربحك معقولة. يمكنك تطبيق خصومات محدودة بحذر</span>
              </AlertDescription>
            </Alert>
          )}

          {safetyLevel === "high" && (
            <Alert className="bg-green-50 border-green-200 rounded-lg shadow-sm">
              <AlertDescription className="text-green-800 flex items-center gap-2">
                <span className="text-xl">🎉</span>
                <span className="font-medium">ممتاز! هوامش ربحك عالية تسمح بخصومات موسمية جذابة</span>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* نصائح موسمية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50/70 rounded-xl p-5 border border-purple-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-purple-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>استراتيجية {season}</span>
            </h3>
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${
                safetyLevel === "high"
                  ? "bg-green-100 text-green-800"
                  : safetyLevel === "medium"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
              }`}>
                {safetyLevel === "high" ? "مرونة عالية" : safetyLevel === "medium" ? "مرونة متوسطة" : "حذر"}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <ul className="text-purple-800 space-y-2 text-sm">
              {season === "الصيف" && (
                <div className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>خصومات تدريجية: ابدأ بـ{recommendedDiscount.min}% وارفع تدريجياً</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>تصفية المخزون القديم بخصومات أعلى</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>عروض "اشتري قطعتين واحصل على خصم"</div>
                  </li>
                </div>
              )}
              {season === "الشتاء" && (
                <div className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>عروض الهدايا والمجموعات</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>خصومات للعملاء الجدد في بداية الموسم</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>تجنب الخصومات الكبيرة في ذروة الموسم</div>
                  </li>
                </div>
              )}
              {season === "الربيع" && (
                <div className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>خصومات محدودة للمجموعات الجديدة</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>عروض "التجديد الربيعي"</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>ركز على الجودة أكثر من السعر</div>
                  </li>
                </div>
              )}
              {season === "الخريف" && (
                <div className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>عروض العودة للمدارس والعمل</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>خصومات للطلبات المتعددة</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>تحضير للموسم الشتوي القادم</div>
                  </li>
                </div>
              )}
            </ul>
            
            <div className="bg-indigo-100/50 rounded-lg p-3 border border-indigo-200 mt-2">
              <p className="text-xs text-indigo-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                <span>للحصول على أفضل النتائج، خطط لعروضك الموسمية مقدماً بـ 3-4 أسابيع قبل بداية الموسم</span>
              </p>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}

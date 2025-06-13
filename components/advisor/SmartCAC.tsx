"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, TrendingUp, AlertTriangle, DollarSign, BarChart4 } from "lucide-react"
import { ArabicNumber } from "@/components/ui/arabic-number"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SmartCACProps {
  maxCAC: number
  safeCAC: number
  totalProducts: number
}

export function SmartCAC({ maxCAC, safeCAC, totalProducts }: SmartCACProps) {
  const getStatusColor = () => {
    if (maxCAC === 0) return "gray"
    if (safeCAC > 20) return "green"
    if (safeCAC > 10) return "yellow"
    return "red"
  }

  const statusColor = getStatusColor()
  
  // Calculate utilization percentage for progress bars
  const utilizationPercent = maxCAC > 0 ? Math.min(Math.round((safeCAC / maxCAC) * 100), 100) : 0
  
  return (
    <Card className="shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 pb-6 border-b relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path fill="white" d="M0,100 L100,0 L100,100 Z" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-200" />
              <span>تكلفة الاستحواذ الذكية</span>
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                    <BarChart4 className="h-5 w-5 text-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-950 text-white border-blue-800 max-w-xs">
                  <p className="text-xs">تكلفة الاستحواذ هي المبلغ الذي تستطيع إنفاقه للحصول على عميل جديد مع الحفاظ على الربحية</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            محسوبة من {totalProducts} منتج • تحليل تلقائي لحدود الإعلانات المربحة
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {maxCAC === 0 ? (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              لا توجد منتجات بأسعار تكلفة وبيع صحيحة لحساب تكلفة الاستحواذ
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* أقصى تكلفة استحواذ */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-red-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>أقصى تكلفة استحواذ</span>
                </h3>
                <Badge maxValue={maxCAC} value={maxCAC} color="red" />
              </div>
              <div className="text-3xl font-bold text-red-900 mb-2 flex items-center">
                <ArabicNumber value={maxCAC} currency={true} />
              </div>
              <p className="text-sm text-red-700">أي إعلان يتجاوز هذا المبلغ = خسارة مؤكدة</p>
            </motion.div>

            {/* التكلفة الآمنة */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`bg-gradient-to-br ${
                statusColor === "green"
                  ? "from-green-50 to-emerald-50/70 border-green-200"
                  : statusColor === "yellow"
                    ? "from-yellow-50 to-amber-50/70 border-yellow-200"
                    : "from-red-50 to-pink-50/70 border-red-200"
              } rounded-xl p-5 border shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-base font-medium ${
                  statusColor === "green"
                    ? "text-green-900"
                    : statusColor === "yellow"
                      ? "text-yellow-900"
                      : "text-red-900"
                } flex items-center gap-2`}>
                  <TrendingUp className={`h-4 w-4 ${
                    statusColor === "green"
                      ? "text-green-600"
                      : statusColor === "yellow"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`} />
                  <span>آمنة حتى</span>
                </h3>
                <Badge maxValue={maxCAC} value={safeCAC} color={statusColor} />
              </div>
              <div className={`text-3xl font-bold mb-2 ${
                statusColor === "green"
                  ? "text-green-900"
                  : statusColor === "yellow"
                    ? "text-yellow-900"
                    : "text-red-900"
              } flex items-center`}>
                <ArabicNumber value={safeCAC} currency={true} />
              </div>
              <p className={`text-sm ${
                statusColor === "green"
                  ? "text-green-700"
                  : statusColor === "yellow"
                    ? "text-yellow-700"
                    : "text-red-700"
              }`}>
                مع هامش أمان 15 ريال لحماية الربحية
              </p>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      statusColor === "green"
                        ? "bg-green-500"
                        : statusColor === "yellow"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    } rounded-full`} 
                    style={{ width: `${utilizationPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{utilizationPercent}%</span>
                  <span>الحد الأقصى</span>
                </div>
              </div>
            </motion.div>

            {/* نصائح ذكية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200 shadow-sm">
                <h3 className="text-sm font-medium text-indigo-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-indigo-600" />
                  <span>نصائح للإعلانات المدفوعة</span>
                </h3>
                <ul className="text-indigo-800 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>ابدأ بميزانية يومية: <span className="font-medium">{safeCAC * 3} ريال</span> (3 عملاء)</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>لا تتجاوز <span className="text-red-600 font-bold">{maxCAC} ريال</span> لكل عميل أبداً</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>الهدف الآمن: <span className="font-medium">{safeCAC} ريال</span> أو أقل لكل عميل</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>راقب التكلفة يومياً وأوقف الإعلان عند التجاوز</div>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* مؤشرات سريعة */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-2 gap-4 text-center"
            >
              <div className="bg-blue-900/5 rounded-xl p-4 border border-blue-100 hover:bg-blue-900/10 transition-colors">
                <div className="text-2xl font-bold text-blue-900">{Math.round(safeCAC * 3)}</div>
                <div className="text-xs text-blue-700 mt-1">ميزانية يومية مقترحة</div>
              </div>
              <div className="bg-indigo-900/5 rounded-xl p-4 border border-indigo-100 hover:bg-indigo-900/10 transition-colors">
                <div className="text-2xl font-bold text-indigo-900">3-5</div>
                <div className="text-xs text-indigo-700 mt-1">عملاء يومياً مستهدف</div>
              </div>
            </motion.div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Badge component for visual representation of values
function Badge({ value, maxValue, color }: { value: number; maxValue: number; color: string }) {
  const getColorClass = () => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-700 border-green-200"
      case "yellow":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "red":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <span className={`text-xs py-1 px-2 rounded-full font-medium border ${getColorClass()}`}>
      {value} / {maxValue}
    </span>
  )
}

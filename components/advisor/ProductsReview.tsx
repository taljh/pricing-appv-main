"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, TrendingUp, Package, Search, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LowProfitProduct {
  name: string
  profitMargin: number
}

interface ProductsReviewProps {
  lowProfitProducts: LowProfitProduct[]
  totalProducts: number
}

export function ProductsReview({ lowProfitProducts, totalProducts }: ProductsReviewProps) {
  const hasLowProfitProducts = lowProfitProducts.length > 0
  
  // Calculate percentage for visualization
  const percentageAffected = totalProducts > 0 
    ? Math.round((lowProfitProducts.length / totalProducts) * 100) 
    : 0

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <Card className="shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 pb-6 border-b relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path fill="white" d="M0,100 L100,0 L100,100 Z" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-200" />
              <span>منتجات تحتاج مراجعة</span>
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-amber-950 text-white border-amber-800 max-w-xs">
                  <p className="text-xs">قائمة بالمنتجات التي تحقق هامش ربح أقل من 10%، مما قد يؤثر على ربحية عملك</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-amber-100 mt-1">
            فحص {totalProducts} منتج • البحث عن هوامش ربح أقل من 10%
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {!hasLowProfitProducts ? (
          <>
            {/* حالة ممتازة - لا توجد منتجات ضعيفة */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center shadow-sm"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-green-900 mb-3">🎉 ممتاز!</h3>
              <p className="text-base text-green-700 mb-4">جميع منتجاتك تحقق هوامش ربح صحية أعلى من 10%</p>
              
              <div className="w-full bg-green-200 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="mt-2 text-sm text-green-700">جميع المنتجات تحقق ربح جيد</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Alert className="bg-green-50 border-green-200 shadow-sm rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-medium flex items-center justify-between w-full">
                  <span>تسعيرك محسن بشكل جيد ولا يحتاج مراجعة عاجلة</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">100%</Badge>
                </AlertDescription>
              </Alert>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100"
            >
              <h3 className="text-base font-medium text-indigo-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <span>نصائح للمحافظة على الربحية</span>
              </h3>
              <ul className="text-indigo-800 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-1 min-w-5">•</div>
                  <div>راقب أسعار المنافسين بشكل دوري</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 min-w-5">•</div>
                  <div>اعمل على تحسين تجربة العملاء لتبرير سعرك المرتفع</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 min-w-5">•</div>
                  <div>استمر في البحث عن موردين بأسعار أفضل</div>
                </li>
              </ul>
            </motion.div>
          </>
        ) : (
          <>
            {/* عدد المنتجات المتأثرة */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>منتجات تحتاج مراجعة</span>
                </h3>
                <span className="text-xs py-1 px-2 rounded-full font-medium bg-amber-100 text-amber-700 border border-amber-200">
                  {lowProfitProducts.length} / {totalProducts}
                </span>
              </div>
              <div className="text-3xl font-bold text-amber-900 mb-2 flex items-center">
                {lowProfitProducts.length} <span className="text-base mr-2 font-medium">منتج</span>
              </div>
              <p className="text-sm text-amber-700">
                تمثل {percentageAffected}% من إجمالي المنتجات
              </p>
              
              {/* Progress indicator */}
              <div className="mt-4">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${percentageAffected}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>تحتاج مراجعة</span>
                  <span>سليمة</span>
                </div>
              </div>
            </motion.div>

            {/* قائمة المنتجات */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2 mb-4">
                <Package className="h-4 w-4 text-gray-700" />
                <span>هذه المنتجات ربحها أقل من 10%:</span>
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {lowProfitProducts.map((product, index) => (
                  <motion.div 
                    variants={item}
                    key={index} 
                    className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:border-amber-300 hover:shadow transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs py-1 min-w-12 flex justify-center ${
                            product.profitMargin < 5
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {product.profitMargin.toFixed(1)}% ربح
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* توصيات للتحسين */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200 shadow-sm">
                <h3 className="text-base font-medium text-indigo-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  <span>توصيات للتحسين</span>
                </h3>
                <ul className="text-indigo-800 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>راجع تسعير هذه المنتجات وارفع الأسعار <span className="font-medium">تدريجياً</span> إذا أمكن</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>ابحث عن موردين بأسعار أفضل لتقليل التكاليف</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>فكر في تحسين جودة المنتج لتبرير سعر أعلى</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 min-w-5">•</div>
                    <div>قلل التكاليف الإضافية (تغليف، توصيل...)</div>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* زر الانتقال للمنتجات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="pt-2"
            >
              <Button 
                onClick={() => (window.location.href = "/products")} 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all duration-300 group"
              >
                <Package className="h-4 w-4 ml-2" />
                مراجعة وتعديل المنتجات
                <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Button>
            </motion.div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Add to global CSS
// .custom-scrollbar::-webkit-scrollbar {
//   width: 8px;
// }
// .custom-scrollbar::-webkit-scrollbar-track {
//   background: #f1f1f1;
//   border-radius: 4px;
// }
// .custom-scrollbar::-webkit-scrollbar-thumb {
//   background: #cbd5e1;
//   border-radius: 4px;
// }
// .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//   background: #94a3b8;
// }

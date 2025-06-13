"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, ChartBar, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
import { formatCurrency } from "../utils/format-helpers"

interface CustomerAcquisitionAnalysisProps {
  profitAmount: number
  finalPrice: number
  totalCosts: number
  marketingCost: number
}

export default function CustomerAcquisitionAnalysis({
  profitAmount,
  finalPrice,
  totalCosts,
  marketingCost,
}: CustomerAcquisitionAnalysisProps) {
  // التحقق من وجود بيانات صالحة
  if (!finalPrice || finalPrice <= 0 || !profitAmount || profitAmount <= 0) {
    return null
  }

  // دالة آمنة للأرقام
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) return 0
    return Math.max(0, num)
  }

  const safeProfitAmount = safeNumber(profitAmount)
  const safeFinalPrice = safeNumber(finalPrice)
  const safeTotalCosts = safeNumber(totalCosts)
  const safeMarketingCost = safeNumber(marketingCost)

  // حساب الحد المثالي لتكلفة الاستحواذ (وفق خبراء التسويق ومعايير الصناعة)
  const idealCPC = Math.min(safeFinalPrice * 0.05, 5) // الحد المثالي لتكلفة النقرة: 5% من سعر المنتج بحد أقصى 5 ريال
  const averageConversionRate = 0.025 // معدل تحويل متوسط بنسبة 2.5% (استناداً للمعدلات في المتاجر الإلكترونية)
  const idealCAC = idealCPC / averageConversionRate // تكلفة الاستحواذ المثالية

  // تعديل تكلفة الاستحواذ بناءً على هامش الربح
  // للمنتجات ذات هامش الربح العالي، يمكن تحمل تكلفة استحواذ أعلى
  const maxCAC = Math.min(safeProfitAmount * 0.4, safeProfitAmount - 10) // الحد الأقصى 40% من الربح أو الربح ناقص 10 ريال
  const minCAC = Math.min(safeProfitAmount * 0.15, idealCAC * 0.7) // الحد الأدنى 15% من الربح أو 70% من التكلفة المثالية

  // تكلفة الاستحواذ المقترحة
  const suggestedCAC = Math.min(idealCAC, safeProfitAmount * 0.3) // تكلفة مقترحة مثالية بما لا يتجاوز 30% من الربح

  // حساب معدل العائد على الاستثمار (ROI)
  const calculatedROI = suggestedCAC > 0 ? ((safeProfitAmount - suggestedCAC) / suggestedCAC) * 100 : 0

  // حساب عدد المبيعات اللازمة للتعادل
  const breakEvenSales = Math.ceil(totalCosts / safeProfitAmount)

  // تحليل تكلفة الاستحواذ الحالية مقارنة بالمقترحة
  const getCurrentCACStatus = () => {
    if (safeMarketingCost === 0) {
      return { status: "غير محدد", color: "text-gray-600", bgColor: "bg-gray-50" }
    }

    if (safeMarketingCost <= minCAC) {
      return { status: "منخفض", color: "text-blue-600", bgColor: "bg-blue-50" }
    } else if (safeMarketingCost <= suggestedCAC) {
      return { status: "مثالي", color: "text-green-600", bgColor: "bg-green-50" }
    } else if (safeMarketingCost <= maxCAC) {
      return { status: "مقبول", color: "text-amber-600", bgColor: "bg-amber-50" }
    } else {
      return { status: "مرتفع", color: "text-red-600", bgColor: "bg-red-50" }
    }
  }

  const cacStatus = getCurrentCACStatus()

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            محلل تكلفة الإعلانات المدفوعة
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">تجريبي</Badge>
        </div>
        <p className="text-xs text-gray-500 mt-1">توصيات مثالية لإدارة ميزانية الإعلانات المدفوعة وتحقيق أفضل عائد استثمار</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* التكلفة المقترحة للاستحواذ */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-800">التكلفة المثالية للاستحواذ</h4>
            <span className="text-lg font-bold text-blue-700">{formatCurrency(suggestedCAC)}</span>
          </div>
          <p className="text-xs text-blue-600">
            هذه هي التكلفة المثالية للحصول على عميل جديد من خلال الإعلانات المدفوعة. تم حسابها بناءً على سعر المنتج، هامش الربح، ومعدلات التحويل المعيارية في القطاع.
          </p>
        </div>

        {/* حدود التكلفة */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-blue-700">الحد الأدنى</span>
              <span className="font-bold text-blue-700">{formatCurrency(minCAC)}</span>
            </div>
            <p className="text-xs text-blue-600">
              قد تشير التكلفة الأقل من هذا الحد إلى استهداف غير دقيق أو جودة منخفضة للإعلانات
            </p>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-amber-700">الحد الأقصى</span>
              <span className="font-bold text-amber-700">{formatCurrency(maxCAC)}</span>
            </div>
            <p className="text-xs text-amber-600">
              لا يُنصح بتجاوز هذا الحد للحفاظ على ربحية مستدامة للمنتج
            </p>
          </div>
        </div>

        {/* مؤشرات الأداء */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-xs text-emerald-700">العائد المتوقع</span>
            </div>
            <div className="text-lg font-bold text-emerald-700">{calculatedROI.toFixed(0)}%</div>
          </div>

          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-1 mb-1">
              <ChartBar className="h-3 w-3 text-indigo-600" />
              <span className="text-xs text-indigo-700">معدل التحويل</span>
            </div>
            <div className="text-lg font-bold text-indigo-700">{(averageConversionRate * 100).toFixed(1)}%</div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-purple-600" />
              <span className="text-xs text-purple-700">تكلفة النقرة</span>
            </div>
            <div className="text-lg font-bold text-purple-700">{formatCurrency(idealCPC)}</div>
          </div>
        </div>

        {/* شريط تقييم التكلفة الحالية */}
        {safeMarketingCost > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-600">تكلفتك الحالية:</span>
                <span className="text-sm font-medium">{formatCurrency(safeMarketingCost)}</span>
              </div>
              <span className={`text-xs ${safeMarketingCost > maxCAC ? "text-red-600" : "text-blue-600"}`}>
                {safeMarketingCost > maxCAC ? "فوق الحد المسموح" : "ضمن النطاق المثالي"}
              </span>
            </div>
            <div className="relative">
              <Progress
                value={Math.min((safeMarketingCost / maxCAC) * 100, 100)}
                className="h-2"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>0</span>
                <span className="text-blue-500">مثالي</span>
                <span className="text-amber-500">الحد الأقصى</span>
              </div>
            </div>
          </div>
        )}

        {/* نصائح عملية */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-700">
              <span className="font-medium">استهدف تكلفة استحواذ {formatCurrency(suggestedCAC)} للحصول على عائد استثمار أمثل</span>
            </div>
          </div>
          <div className="text-[10px] text-gray-500 border-t border-gray-100 pt-1 mt-1 space-y-1">
            <div>• استهدف جمهورك بدقة عالية لتحسين معدلات التحويل</div>
            <div>• اختبر عدة إعلانات لتحديد الأكثر فعالية للتكلفة</div>
            <div>• استخدم استراتيجيات إعادة الاستهداف لتقليل تكلفة الاستحواذ</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
